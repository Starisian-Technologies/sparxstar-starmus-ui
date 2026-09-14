/**
 * Copyright (c) Starisian Technologies. All rights reserved.
 *
 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
 *
 * License: Business Source License 1.1
 * Change Date: January 1, 2036
 * Change License: Starisian Community License
 *
 * See the LICENSE file in the repository root for full license terms.
 */

/**
 * @file starmus-tus.js
 * @version 7.0.0
 * @description Resumable chunked upload client. TUS only — there is no
 * full-file path.
 *
 * The capture-to-ingestion contract fixes three things this module implements:
 * resumable chunked transfer, a 512 KB chunk cap, and per-chunk SHA-256. It
 * also forbids a full-file upload endpoint on both sides, because a full-file
 * retry throws away everything already transferred on the networks this
 * platform is built for — and ADR-038 forbids "any re-upload-from-scratch of a
 * partially transferred original" outright. A failed upload is therefore
 * queued and resumed, never restarted whole.
 *
 * The endpoint and any auth headers are injected by the host (ADR-034). This
 * module holds no CMS path, no CMS nonce, and no CMS header name.
 *
 * Upload chunk size is tier-optimised via sparxstarIntegration. Adaptation is
 * chunk size and scheduling only, never captured source quality (ADR-035).
 */

"use strict";

import * as tus from "tus-js-client";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";

/* ---- Circuit Breaker ---- */

/**
 * Simple circuit breaker that opens after repeated upload failures.
 * Prevents hammering a broken endpoint while offline or during server errors.
 */
class UploadCircuitBreaker {
    constructor() {
        this.failures = 0;
        this.threshold = 3;
        this.timeout = 60000;
        this.state = "closed";
        this.openedAt = null;
    }

    async execute(operation) {
        if (this.state === "open") {
            const elapsed = Date.now() - this.openedAt;
            if (elapsed < this.timeout) {
                throw new Error("Upload circuit breaker open — too many failures");
            }
            this.state = "half-open";
        }

        try {
            const result = await operation();
            if (this.state === "half-open") {
                this.state = "closed";
                this.failures = 0;
            }
            return result;
        } catch (err) {
            this.failures++;
            if (this.failures >= this.threshold) {
                this.state = "open";
                this.openedAt = Date.now();
                console.error("[CircuitBreaker] Opened after", this.failures, "failures");
            }
            throw err;
        }
    }
}

const uploadCircuitBreaker = new UploadCircuitBreaker();

/* ---- Config ---- */

/**
 * How long a transfer may make no progress at all before it is aborted.
 *
 * Exported because the offline queue's claim lease has to outlast it. The lease
 * is renewed from progress callbacks, so a stalled transfer stops renewing —
 * and if the lease expires before this watchdog fires, another tab claims a row
 * whose first attempt is still running. The two were both 120000 and therefore
 * raced exactly.
 */
export const UPLOAD_STALL_TIMEOUT_MS = 120000;

/**
 * Resolve the authorization headers the host supplies for uploads.
 *
 * `bootstrap.nonce` was retired by ADR-034: the package used to read it and set
 * a CMS authentication header itself, which made it hold a CMS header name. A
 * host that has not migrated now passes `nonce` into a package that ignores it,
 * and the result is an upload sent with no authorization at all — a 401 with
 * nothing saying why, retried by the queue until the entry is held.
 *
 * So the misconfiguration is named where it happens. It is not fatal: a host
 * whose ingestion needs no headers is legitimate, and refusing here would cost
 * a recording (ADR-011) to enforce a convention the package cannot verify.
 *
 * @param {Object} bootstrap The host bootstrap object.
 * @returns {Object} Headers to send, possibly empty.
 */
export function resolveUploadHeaders(bootstrap) {
    const headers =
        bootstrap && bootstrap.uploadHeaders && typeof bootstrap.uploadHeaders === "object"
            ? bootstrap.uploadHeaders
            : {};

    if (bootstrap && bootstrap.nonce && Object.keys(headers).length === 0) {
        // The remedy names no header: which one carries the nonce is the
        // host's to know and ADR-034 keeps it out of this package entirely —
        // as the build check that rejected an earlier draft of this very
        // message enforces.
        console.warn(
            "[Starmus] bootstrap.nonce is no longer read (ADR-034) and no " +
                "bootstrap.uploadHeaders was supplied, so this upload carries no " +
                "authorization header. A host that previously relied on nonce must " +
                "now supply its own header for it in bootstrap.uploadHeaders.",
        );
    }

    return headers;
}

/**
 * Returns a configuration object merged from tier-defaults and global overrides.
 *
 * @returns {Object} Upload configuration
 */
function getConfig() {
    const envData = sparxstarIntegration.getEnvironmentData();
    const settings = envData?.recordingSettings || {};
    const bootstrap =
        typeof window !== "undefined" && window.STARMUS_BOOTSTRAP
            ? window.STARMUS_BOOTSTRAP
            : {};

    const defaults = {
        chunkSize: settings.uploadChunkSize || 512 * 1024, // max 512 KB per AGENTS.md
        // Two delays, not three. tus-js-client counts each entry as a retry
        // *after* the initial request, so three entries permit four attempts and
        // AGENTS.md states a maximum of three as a FAIL condition. Two entries
        // give the initial request plus two retries.
        //
        // One caveat worth stating rather than engineering away: the client
        // resets this counter when a transfer makes progress, so a long upload
        // on a bad link can spend the budget again after each advance. That is
        // the behaviour this package wants — a transfer that is moving should
        // keep going, and the stall watchdog is what bounds one that is not —
        // but it means the budget is per stalled stretch, not per upload.
        retryDelays: [0, 2000],
        // The resume fingerprint outlives the transfer, deliberately.
        //
        // Clearing it on success raced the durable record of that success. The
        // queue writes `transferred: true` in a later IndexedDB transaction, so
        // a page that died in between — an OS killing a backgrounded tab on a
        // low-memory phone, which is the ordinary case here — left a row still
        // marked untransferred and no fingerprint to resume by. The next drain
        // could then do nothing but start a second TUS resource for a recording
        // the server had already accepted, which is the duplicate ADR-038
        // forbids and the contributor's data spent twice.
        //
        // Kept, the same crash resumes: `findPreviousUploads()` finds the
        // resource, the server reports the offset already equals the size, and
        // `onSuccess` fires without re-sending a byte. The row is then marked
        // and removed as usual.
        //
        // The cost is that a completed upload's fingerprint stays in
        // localStorage after its row is gone. Each entry is small and the queue
        // is bounded, but nothing prunes them today. Removing one needs the
        // `urlStorage` key, which tus-js-client returns publicly only for an
        // upload found by `findPreviousUploads()` — never for a fresh one — so
        // a cleanup pass has to look the entry up by fingerprint through an
        // injected `urlStorage`. That is worth doing and is not done here.
        removeFingerprintOnSuccess: false,
        maxChunkRetries: 3,
        // A stall watchdog, not a deadline. The old code aborted the whole
        // upload after 5 s, which on a 2G link ends every upload of a real
        // recording before it finishes and then discards the transferred
        // bytes — the opposite of what a resumable client is for. What is
        // actually a fault is *no progress at all* for this long; a slow but
        // moving transfer is the normal case here and is left alone.
        stallTimeoutMs: UPLOAD_STALL_TIMEOUT_MS,
        endpoint: bootstrap.restUrl
            ? `${bootstrap.restUrl.replace(/\/$/, "")}/${bootstrap.uploadEndpoint || "tus"}`
            : "",
        // Host-injected. ADR-034: this package sends no CMS nonce and knows no
        // CMS header name. Whatever the host's ingestion needs to authorize the
        // transfer, the host supplies here.
        headers: resolveUploadHeaders(bootstrap),
        endpoints: bootstrap.restUrl
            ? {
                  tus: `${bootstrap.restUrl.replace(/\/$/, "")}/${bootstrap.uploadEndpoint || "tus"}`,
              }
            : {},
    };

    const globalCfg =
        (typeof window !== "undefined" && (window.starmusTus || window.starmusConfig)) || {};
    const merged = {};

    for (const [key, val] of Object.entries(defaults)) {
        merged[key] = val;
    }

    for (const [key, val] of Object.entries(globalCfg)) {
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
        }
        merged[key] = val;
    }
    merged.chunkSize = Math.min(
        Number.isFinite(merged.chunkSize) ? merged.chunkSize : 512 * 1024,
        512 * 1024,
    );

    // Two values a host does not get to set, because they are not preferences.
    //
    // `removeFingerprintOnSuccess` false is what makes a crash between a
    // successful transfer and the queue's durable mark recoverable. A host
    // setting it true reopens that window and the recording is uploaded a
    // second time — a cost paid by the contributor, from a config key.
    merged.removeFingerprintOnSuccess = false;

    // The stall watchdog must stay inside the offline queue's claim lease,
    // which is this constant plus a minute. A host raising the timeout past
    // that lets the watchdog run after the claim has expired, so a second tab
    // takes a row whose transfer is still alive — the exact race the lease was
    // derived from this constant to prevent. A lower value is harmless and is
    // left alone.
    if (
        !Number.isFinite(merged.stallTimeoutMs) ||
        merged.stallTimeoutMs > UPLOAD_STALL_TIMEOUT_MS
    ) {
        if (Number.isFinite(merged.stallTimeoutMs)) {
            console.warn(
                `[TUS] stallTimeoutMs ${merged.stallTimeoutMs}ms exceeds the ${UPLOAD_STALL_TIMEOUT_MS}ms the offline queue's claim lease covers; using ${UPLOAD_STALL_TIMEOUT_MS}ms. A longer watchdog would let another tab claim a row whose upload is still running.`,
            );
        }
        merged.stallTimeoutMs = UPLOAD_STALL_TIMEOUT_MS;
    }

    return merged;
}

/* ---- Helpers ---- */

/**
 * Metadata keys this module owns that are only set *conditionally*.
 *
 * Everything else reserved is derived from what was actually assigned (see
 * `reservedMetadataKeys()`), so the list cannot drift from the code. These two
 * have to be named explicitly because an absent capture profile must still be
 * unsettable by a host form field — otherwise a form named `captureProfile`
 * could supply one for an asset that has none, which is a claim about how the
 * audio was captured made by something that did not capture it.
 */
const CONDITIONAL_MODULE_KEYS = ["captureProfile", "captureAttainment"];

/**
 * The metadata keys a host form field must not overwrite.
 *
 * Derived from the object the module has already populated rather than kept as
 * a second list beside it. A hand-maintained set had drifted: `upload_uuid`,
 * `captureProfile`, `captureAttainment`, `filename` and `filetype` were
 * protected while `instanceId`, `tier`, `transcript`, `calibration` and `env`
 * — assigned in the same object literal — were not, so a host form field named
 * `tier` silently replaced the resolved device tier on its way to ingestion.
 *
 * @param {Object} assigned The metadata this module has set.
 * @returns {Set<string>}
 */
export function reservedMetadataKeys(assigned) {
    return new Set([...Object.keys(assigned), ...CONDITIONAL_MODULE_KEYS]);
}

/** RFC 4122 version 4, the shape the capture-to-ingestion contract fixes. */
const UUID_V4_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Whether a value is usable as an upload identifier.
 *
 * Exported because the offline queue has to ask the same question and get the
 * same answer. It decides whether a stored id survives to the next attempt,
 * and this module decides whether a supplied one is sent — if those two
 * disagree, the queue keeps an id the upload silently replaces, and every
 * retry gets a new fingerprint and cannot resume the partial before it.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isUploadId(value) {
    return typeof value === "string" && UUID_V4_PATTERN.test(value.trim());
}

/**
 * Sanitises a metadata value for TUS header transmission.
 * Objects are JSON-encoded; all values have control characters stripped.
 *
 * @param {*} value
 * @returns {string}
 */
function sanitizeMetadata(value) {
    const raw =
        typeof value === "object" ? JSON.stringify(value) : String(value || "");
    return raw.replace(/[\r\n\t]/g, " ");
}

/**
 * Normalises formFields to a plain object.
 *
 * @param {*} fields
 * @returns {Object}
 */
function normalizeFormFields(fields) {
    return fields && typeof fields === "object" ? fields : {};
}

/**
 * Mint a UUID v4, refusing to run where secure randomness is unavailable.
 *
 * Exported so `starmus-core.js` mints the submission's id the same way rather
 * than keeping a second, weaker copy: its own version used `crypto.randomUUID`
 * only, which is absent on browsers this package supports, and there the
 * submission silently lost its stable identity across retries.
 *
 * @returns {string}
 */
export function createUploadId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const values = new Uint8Array(16);
        crypto.getRandomValues(values);
        values[6] = (values[6] & 0x0f) | 0x40; // RFC 4122 version 4
        values[8] = (values[8] & 0x3f) | 0x80; // RFC 4122 variant
        const hex = Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    throw new Error("Secure UUID generation is not available in this runtime");
}

/* ---- TUS Upload ---- */

/**
 * Uploads a recording blob using the TUS resumable-upload protocol.
 *
 * @param {Blob} blob - Audio blob
 * @param {string} fileName - File name for the upload
 * @param {Object} [formFields={}] - Form fields
 * @param {Object} [metadata={}] - Additional metadata
 * @param {string} [instanceId=''] - Recorder instance ID
 * @param {function} [onProgress] - Progress callback (bytesUploaded, bytesTotal)
 * @returns {Promise<Object>} Server response
 */
export async function uploadTus(
    blob,
    fileName,
    formFields = {},
    metadata = {},
    instanceId = "",
    onProgress,
) {
    const cfg = getConfig();
    // ADR-034: host-injected, never a CMS path held by this package.
    const tusEndpoint = cfg.endpoint || cfg.endpoints?.tus;
    if (!tusEndpoint) {
        throw new Error(
            "NO_UPLOAD_ENDPOINT: set STARMUS_BOOTSTRAP.restUrl (and optionally uploadEndpoint). This package ships no default."
        );
    }
    if (!(blob instanceof Blob)) {
        throw new Error("INVALID_BLOB_TYPE: blob must be a Blob instance");
    }
    const fields = normalizeFormFields(formFields);

    // One logical upload, one id, across every attempt.
    //
    // Minting a fresh UUID per call meant a resumed transfer carried the id
    // from its first attempt on the server while `starmus:complete` announced
    // the id from its last — an identifier matching no resource anywhere. The
    // caller supplies the id it will keep (the offline queue persists it with
    // the blob); a direct first attempt that has none gets one minted here.
    // A caller-supplied id is used only if it is actually a UUID v4. This is a
    // public function, and the id becomes both the TUS `upload_uuid` and the
    // resume fingerprint — an arbitrary string there would let two submissions
    // collide on a resume key, which is the bug the fingerprint change fixed.
    const suppliedId =
        typeof metadata.uploadId === "string" ? metadata.uploadId.trim() : "";
    const uploadId = isUploadId(suppliedId) ? suppliedId : createUploadId();
    if (suppliedId !== "" && uploadId !== suppliedId) {
        console.warn("[TUS] Ignoring a supplied upload id that is not a UUID v4.");
    }

    // Flatten all metadata into TUS metadata (strings only)
    const tusMetadata = {
        upload_uuid: sanitizeMetadata(uploadId),
        filename: sanitizeMetadata(fileName),
        filetype: sanitizeMetadata(blob.type),
        instanceId: sanitizeMetadata(instanceId),
        tier: sanitizeMetadata(metadata.tier || "C"),
        transcript: sanitizeMetadata(metadata.transcript || ""),
        calibration: sanitizeMetadata(metadata.calibration || ""),
        env: sanitizeMetadata(metadata.env || ""),
        // ADR-035 and the capture-to-ingestion contract: the capture profile
        // travels with the asset, so a later reader can tell whether a
        // measurement taken from it is admissible. It was being built in
        // starmus-core.js and then dropped here, which meant it reached
        // ingestion on no path at all.
        //
        // The key *name* is owed jointly by both sides of that contract and is
        // not this package's to settle, so this reuses the name already fixed
        // by `starmus:complete` rather than inventing a second one. When the
        // seam names the key, this changes with it.
    };

    // The profile key is present with a value, or absent. Never present and
    // empty: the Spoken Audio Node distinguishes "arrived with no profile"
    // (stored, flagged, not a measurement source) from a profile it cannot
    // read, and an empty string collapses the two. ADR-011 still holds — the
    // recording goes either way; what it does not do is misdescribe itself.
    //
    // Sanitised and trimmed *before* the test, not after it. A value of only
    // spaces or control separators is truthy, so testing the raw property sent
    // a present-but-blank profile — the exact state this rule exists to
    // prevent, passing the build check while violating the rule that check
    // enforces.
    // Only a non-empty string counts. `sanitizeMetadata()` routes anything of
    // type `object` through `JSON.stringify`, and `typeof null === "object"` —
    // so the documented "no profile" value, `null`, came back as the *string*
    // `"null"`, which is truthy and was sent on the wire. That is precisely the
    // present-but-meaningless profile this rule exists to prevent, it made the
    // wire metadata disagree with the completion event (which reports `null`),
    // and it satisfied the build check while breaking the rule the check
    // enforces.
    const rawProfile = metadata.captureProfile;
    const captureProfile =
        typeof rawProfile === "string" ? sanitizeMetadata(rawProfile).trim() : "";
    if (captureProfile) {
        tusMetadata.captureProfile = captureProfile;
    } else {
        console.warn(
            "[TUS] Uploading with no capture profile; the asset will not be admissible as a measurement source.",
        );
        sparxstarIntegration.reportError("upload_without_capture_profile", {
            instanceId,
            tier: metadata.tier,
        });
    }
    if (metadata.captureAttainment) {
        tusMetadata.captureAttainment = sanitizeMetadata(metadata.captureAttainment);
    }

    // Merge form fields into TUS metadata — but never over a reserved key.
    //
    // The profile and the upload id are validated above and then were merged
    // over by whatever the host's form happened to be named. A field called
    // `captureProfile` could replace the validated value with an empty string,
    // satisfying the build check and violating the rule it enforces.
    //
    // The reserved set is computed here, after every module-owned key has been
    // assigned, so it covers them all by construction.
    const reserved = reservedMetadataKeys(tusMetadata);
    for (const [key, val] of Object.entries(fields)) {
        if (reserved.has(key)) {
            console.warn(
                `[TUS] Ignoring form field '${key}': it is reserved capture metadata and the host does not set it.`,
            );
            continue;
        }
        tusMetadata[key] = sanitizeMetadata(val);
    }

    // Host-injected only (ADR-034). A CMS nonce header used to be set here.
    const headers = Object.assign({}, cfg.headers);

    const stallTimeoutMs = Number.isFinite(cfg.stallTimeoutMs) ? cfg.stallTimeoutMs : UPLOAD_STALL_TIMEOUT_MS;

    return new Promise((resolve, reject) => {
        let settled = false;
        let stallTimer = null;

        function clearStallWatchdog() {
            if (stallTimer) {
                clearTimeout(stallTimer);
                stallTimer = null;
            }
        }

        /**
         * Restart the no-progress window. Called once before `start()` and
         * again on every progress event, so the deadline only ever fires when
         * the transfer has genuinely stopped moving — not because the whole
         * upload is taking a long time, which on these networks is normal.
         *
         * The abort deliberately leaves the TUS fingerprint in place
         * (`removeFingerprintOnSuccess` only clears it on success). The next
         * attempt then finds the stored upload — see the resume lookup before
         * `start()` below — and continues from the last acknowledged offset
         * instead of re-sending the original from byte zero, which ADR-038
         * forbids.
         */
        function armStallWatchdog() {
            clearStallWatchdog();
            stallTimer = setTimeout(() => {
                if (settled) {
                    return;
                }
                settled = true;
                upload.abort();
                reject(
                    new Error(
                        `TUS_UPLOAD_STALLED: no progress for ${stallTimeoutMs}ms; resumable from the last acknowledged offset`,
                    ),
                );
            }, stallTimeoutMs);
        }

        const upload = new tus.Upload(blob, {
            endpoint: tusEndpoint,
            chunkSize: cfg.chunkSize,
            retryDelays: cfg.retryDelays,
            removeFingerprintOnSuccess: cfg.removeFingerprintOnSuccess,
            checksumAlgorithm: "sha256",

            // Resume by this upload's own id, not by the blob's shape.
            //
            // tus-js-client's default fingerprint is derived from name, type,
            // size and lastModified. A recording is handed over as a bare Blob,
            // which has no name and no modification time, so two recordings of
            // the same type and size — a plausible pair on a fixed-length
            // prompt — collide on one URL-storage key and the second resumes
            // into the first's half-finished resource. Keying on the id makes
            // that impossible.
            //
            // Returns a Promise, and must. tus-js-client calls this as
            // `this.options.fingerprint(file, options).then(…)` — verified in
            // the installed 4.3.1 — so a plain string has no `.then` and throws
            // where the resume lookup happens. Review has suggested simplifying
            // it to a string on the grounds that the option is "commonly
            // synchronous"; that would break resumption, which is the property
            // this fingerprint exists to protect.
            fingerprint: () => Promise.resolve(`starmus-upload-${uploadId}`),

            metadata: tusMetadata,
            headers,

            onProgress(bytesUploaded, bytesTotal) {
                armStallWatchdog();
                if (onProgress) {
                    onProgress(bytesUploaded, bytesTotal);
                }
            },

            onSuccess() {
                clearStallWatchdog();
                settled = true;
                // No storage URL is returned. `upload.url` is the TUS
                // resource handle; tus-js-client keeps it for resumption and
                // nothing here needs to hand it onward. ADR-038 keeps durable
                // storage URLs out of events, records and evidence fields —
                // assets are referenced by id — and the cheapest way to honor
                // that is not to emit a URL at all.
                resolve({ success: true, uploadId });
            },

            onError(err) {
                clearStallWatchdog();
                settled = true;
                console.error("[TUS] Upload error:", err);
                sparxstarIntegration.reportError("tus_upload_error", {
                    error: err.message,
                    instanceId,
                    tier: metadata.tier,
                });
                reject(err);
            },
        });

        // Resume before starting, or the fingerprint is a key nobody reads.
        //
        // `upload.start()` does not consult URL storage on its own: tus-js-client
        // requires findPreviousUploads() then resumeFromPreviousUpload() first.
        // Without this the stall watchdog's abort left a half-finished resource
        // on the server and the next attempt began a new one from byte zero —
        // exactly the re-upload-from-scratch ADR-038 forbids, and the opposite
        // of what the comment above it claimed.
        //
        // A storage read that fails rejects rather than starting over; see the
        // `catch` below. An earlier version of this comment said the opposite,
        // describing behaviour the fix beneath it had already replaced — which
        // is how a resumability guarantee gets undone by someone trusting the
        // comment over the code.
        // Which half of the chain failed is tracked, because the two need
        // different handling. A *lookup* failure means we cannot establish
        // whether a partial exists, so the attempt is deferred and retried. A
        // *setup or start* failure — a malformed endpoint, a browser refusing
        // the request — is not going to fix itself on the next drain, and
        // labelling it as a lookup failure had the queue retrying it while the
        // telemetry blamed storage.
        let stage = "lookup";
        upload
            .findPreviousUploads()
            .then((previous) => {
                stage = "start";
                if (Array.isArray(previous) && previous.length > 0) {
                    // The most recent match: an earlier attempt on this exact
                    // submission, since the fingerprint is the submission id.
                    upload.resumeFromPreviousUpload(previous[previous.length - 1]);
                }
                if (settled) {
                    return;
                }
                armStallWatchdog();
                // Inside the chain, not a `finally` after it: a synchronous
                // throw from `start()` — a malformed endpoint, a browser that
                // refuses the request — would otherwise reject only the
                // internal chain, leaving the promise this function returned
                // pending forever with the watchdog armed and the caller with
                // no error and no result.
                upload.start();
            })
            .catch((err) => {
                // A storage read that failed is not permission to start over.
                // Without the lookup this cannot establish that no partial
                // transfer exists, and starting fresh would re-send from byte
                // zero and orphan whatever is already on the server — the
                // re-upload ADR-038 forbids. Rejecting hands it back to the
                // offline queue, which keeps the recording and tries again;
                // the earlier behaviour here traded the contributor's
                // bandwidth for the convenience of not failing.
                if (settled) {
                    return;
                }
                settled = true;
                clearStallWatchdog();
                try {
                    upload.abort();
                } catch {
                    // Never started, or already aborted. Nothing to undo.
                }
                reject(
                    new Error(
                        stage === "lookup"
                            ? `TUS_RESUME_LOOKUP_FAILED: could not determine whether a partial upload exists (${err.message}). Not starting over.`
                            : `TUS_UPLOAD_START_FAILED: the upload could not be started (${err.message}).`,
                    ),
                );
            });
    });
}

/* ---- Upload entry point ---- */

/**
 * Uploads a recording over the resumable chunked path, wrapped in the circuit
 * breaker so a broken endpoint is not hammered.
 *
 * There is no second path. When this rejects, the caller keeps the recording:
 * `starmus-core.js` and the offline queue both hold the blob and retry later,
 * which is what ADR-011's unconditional capture requires and what resumption
 * is for. The previous full-file fallback did the opposite — it discarded
 * every transferred byte and re-sent the whole recording over the link that
 * had just failed.
 *
 * The name is kept because it is this module's public surface; the priority
 * it once expressed no longer has anything to rank.
 *
 * @param {Object} options - Upload options
 * @param {Blob} options.blob - Audio blob
 * @param {string} options.fileName - File name
 * @param {Object} [options.formFields={}] - Form fields
 * @param {Object} [options.metadata={}] - Metadata
 * @param {string} [options.instanceId=''] - Instance ID
 * @param {function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Upload result
 */
export async function uploadWithPriority({
    blob,
    fileName,
    formFields = {},
    metadata = {},
    instanceId = "",
    onProgress,
}) {
    return uploadCircuitBreaker.execute(() =>
        uploadTus(blob, fileName, formFields, metadata, instanceId, onProgress),
    );
}
