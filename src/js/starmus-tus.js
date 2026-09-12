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
        retryDelays: [0, 2000, 4000],
        removeFingerprintOnSuccess: true,
        maxChunkRetries: 3,
        // A stall watchdog, not a deadline. The old code aborted the whole
        // upload after 5 s, which on a 2G link ends every upload of a real
        // recording before it finishes and then discards the transferred
        // bytes — the opposite of what a resumable client is for. What is
        // actually a fault is *no progress at all* for this long; a slow but
        // moving transfer is the normal case here and is left alone.
        stallTimeoutMs: 120000,
        endpoint: bootstrap.restUrl
            ? `${bootstrap.restUrl.replace(/\/$/, "")}/${bootstrap.uploadEndpoint || "tus"}`
            : "",
        // Host-injected. ADR-034: this package sends no CMS nonce and knows no
        // CMS header name. Whatever the host's ingestion needs to authorize the
        // transfer, the host supplies here.
        headers: bootstrap.uploadHeaders && typeof bootstrap.uploadHeaders === "object"
            ? bootstrap.uploadHeaders
            : {},
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
    return merged;
}

/* ---- Helpers ---- */

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

function createUploadId() {
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
    const uploadId =
        typeof metadata.uploadId === "string" && metadata.uploadId.trim() !== ""
            ? metadata.uploadId
            : createUploadId();

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
        captureProfile: sanitizeMetadata(metadata.captureProfile || ""),
        captureAttainment: sanitizeMetadata(metadata.captureAttainment || ""),
    };

    // Merge form fields into TUS metadata
    for (const [key, val] of Object.entries(fields)) {
        tusMetadata[key] = sanitizeMetadata(val);
    }

    // Host-injected only (ADR-034). A CMS nonce header used to be set here.
    const headers = Object.assign({}, cfg.headers);

    const stallTimeoutMs = Number.isFinite(cfg.stallTimeoutMs) ? cfg.stallTimeoutMs : 120000;

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
        // A storage read that fails is not a reason to refuse the upload: the
        // recording still needs to go. It starts fresh instead, which is the
        // behaviour there was before, and the contributor is no worse off.
        upload
            .findPreviousUploads()
            .then((previous) => {
                if (Array.isArray(previous) && previous.length > 0) {
                    // The most recent match: an earlier attempt on this exact
                    // submission, since the fingerprint is the submission id.
                    upload.resumeFromPreviousUpload(previous[previous.length - 1]);
                }
            })
            .catch((err) => {
                console.warn("[TUS] Could not read resumable uploads; starting fresh:", err.message);
            })
            .finally(() => {
                if (settled) {
                    return;
                }
                armStallWatchdog();
                upload.start();
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
