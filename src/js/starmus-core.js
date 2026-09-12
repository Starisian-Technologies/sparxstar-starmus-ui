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
 * @file starmus-core.js
 * @version 6.3.0
 * @description Core submission and upload handling for the Starmus audio recorder.
 * Manages tier detection, submission flow, and offline fallback.
 */

"use strict";

import { CommandBus } from "./starmus-hooks.js";
import { createUploadId, uploadWithPriority } from "./starmus-tus.js";
import { buildCompletionDetail, emitCompletionEvent } from "./starmus-completion-event.js";
import { queueSubmission, getPendingCount } from "./starmus-offline.js";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";

/**
 * Mutable capability flags populated after tier resolution.
 * Sirus will overwrite these values at runtime in Phase 3.
 * Do not hardcode feature logic outside of this object.
 *
 * @type {{ tier: string, allowRecording: boolean, allowCalibration: boolean, allowCanvas: boolean, allowLiveTranscript: boolean }}
 */
export const starmusCapabilities = {
    tier: "A",
    allowRecording: true,
    allowCalibration: true,
    allowCanvas: true,
    allowLiveTranscript: true,
};

/**
 * Converts a server-provided redirect into a safe same-origin HTTP(S) URL.
 *
 * @param {unknown} candidate - Redirect value returned by the upload service
 * @returns {string|null} Safe redirect URL, or null when the value is unsafe
 */
function getSafeRedirect(candidate) {
    if (typeof candidate !== "string" || candidate.length === 0) {
        return null;
    }

    try {
        const redirect = new URL(candidate, window.location.href);
        const isHttp = redirect.protocol === "https:" || redirect.protocol === "http:";
        return isHttp && redirect.origin === window.location.origin ? redirect.href : null;
    } catch {
        return null;
    }
}

/**
 * Detects browser capability tier.
 * Prefers the tier provided by SPARXSTAR environment data.
 *
 * @param {Object|null} [environmentData=null] - SPARXSTAR environment data
 * @returns {'A'|'B'|'C'} Tier classification
 */
function detectTier(environmentData = null) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return "C";
    }
    if (typeof MediaRecorder === "undefined") {
        return "C";
    }

    if (environmentData && environmentData.tier) {
        return environmentData.tier;
    }

    if (!window.AudioContext && !window.webkitAudioContext) {
        return "B";
    }
    return "A";
}

/**
 * Initialises the core Starmus submission and tier-detection logic.
 *
 * @param {Object} store - Redux-style state store
 * @param {string} instanceId - Unique recorder instance identifier
 * @param {Object} env - Environment data (may be partial on first call)
 * @returns {{ handleSubmit: function }}
 */
export function initCore(store, instanceId, env) {
    sparxstarIntegration
        .init()
        .then((environmentData) => {
            const tier = detectTier(environmentData);
            const enhancedEnv = {
                ...env,
                ...environmentData,
                tier,
                sparxstar_available: sparxstarIntegration.isAvailable,
            };

            // Populate mutable capabilities — Sirus will overwrite these in Phase 3
            starmusCapabilities.tier = tier;
            starmusCapabilities.allowRecording = tier !== "C";
            starmusCapabilities.allowCalibration = tier !== "C";
            starmusCapabilities.allowCanvas = tier !== "C";
            starmusCapabilities.allowLiveTranscript = tier !== "C";

            store.dispatch({
                type: "starmus/tier-ready",
                payload: { tier },
            });

            store.dispatch({
                type: "starmus/env-update",
                payload: enhancedEnv,
            });

            window.dispatchEvent(
                new CustomEvent("starmus-ready", {
                    detail: { instanceId, tier, environment: enhancedEnv },
                }),
            );

            console.log("[Core] Environment ready:", {
                tier,
                sparxstar: sparxstarIntegration.isAvailable,
                network: enhancedEnv.network?.type,
            });
        })
        .catch((error) => {
            console.error("[Core] Environment initialisation failed:", error);
            const tier = detectTier();

            // Populate mutable capabilities on the error path so consumers
            // never observe stale Tier A defaults when init() rejects.
            starmusCapabilities.tier = tier;
            starmusCapabilities.allowRecording = tier !== "C";
            starmusCapabilities.allowCalibration = tier !== "C";
            starmusCapabilities.allowCanvas = tier !== "C";
            starmusCapabilities.allowLiveTranscript = tier !== "C";

            store.dispatch({ type: "starmus/tier-ready", payload: { tier } });
            window.dispatchEvent(
                new CustomEvent("starmus-ready", { detail: { instanceId, tier } }),
            );
        });

    /**
     * Handles audio submission: attempts upload, falls back to offline queue.
     *
     * @param {Object} formFields - Form data from the recorder form
     * @returns {Promise<void>}
     */
    async function handleSubmit(formFields) {
        const state = store.getState();
        const source = state.source || {};
        const calibration = state.calibration || {};
        const currentEnvData = sparxstarIntegration.getEnvironmentData();

        const stateEnv = {
            ...state.env,
            ...env,
            ...currentEnvData,
            submission_timestamp: Date.now(),
        };

        const audioBlob = source.blob || source.file;
        const fileName =
            source.fileName || (source.file ? source.file.name : `rec-${Date.now()}.webm`);

        if (!audioBlob) {
            console.error("[Core] No audio recording found.");
            return;
        }

        // ADR-035 / capture-to-ingestion contract: the capture profile travels
        // with the asset. This object is what the upload serializes and what
        // the offline queue persists for later retry, so the profile has to be
        // in it here or it reaches ingestion on no path at all. A recorded
        // session carries the profile the recorder attained; an attached file
        // carries `import`. `null` is left for a source that reported no
        // profile at all, which is itself information the consumer needs — the
        // Node stores such an asset and marks it inadmissible for measurement
        // rather than refusing it.
        const captureAttainment = source.captureAttainment || null;
        // Minted once per submission and carried into both the immediate
        // attempt and the queued retry, so a recording that is resumed hours
        // later still reports the identifier the server knows it by.
        //
        // Through the upload module's helper rather than `crypto.randomUUID`
        // directly: that API is missing on browsers this package supports, and
        // reaching for it alone left the id unset on exactly those devices —
        // where a retry over a bad link is likeliest and a stable identity
        // matters most.
        const metadata = {
            uploadId: createUploadId(),
            transcript: source.transcript?.trim() || null,
            calibration: calibration.complete
                ? { gain: calibration.gain, speechLevel: calibration.speechLevel }
                : null,
            captureProfile: source.captureProfile || null,
            captureAttainment,
            // Persisted so a queued upload that drains hours later can still
            // describe the asset it sent. The store state it came from is long
            // gone by then.
            durationMs: Math.round((source.metadata?.duration || 0) * 1000),
            mimeType: source.metadata?.mimeType || audioBlob.type || "",
            env: stateEnv,
            tier: stateEnv.tier || currentEnvData?.tier || "C",
        };

        store.dispatch({ type: "starmus/submit-start" });

        // Whether the bytes reached the server. Everything after that point —
        // naming the format, building the completion detail, notifying the
        // host — can still fail, and none of those failures mean the recording
        // needs sending again.
        let transferred = false;

        try {
            if (!navigator.onLine) {
                throw new Error("OFFLINE_FAST_PATH");
            }

            const result = await uploadWithPriority({
                blob: audioBlob,
                fileName,
                formFields,
                metadata,
                instanceId,
                onProgress: (uploaded, total) =>
                    store.dispatch({
                        type: "starmus/submit-progress",
                        progress: uploaded / total,
                    }),
            });

            if (result && result.success) {
                transferred = true;
            }

            store.dispatch({ type: "starmus/submit-complete", payload: result });

            // Emit starmus:complete — boundary between recording and server-side processing.
            // Nothing downstream triggers until this event fires.
            if (result && result.success) {
                const completedState = store.getState();
                const completedSource = completedState.source || {};
                const completedCalibration = completedState.calibration || {};

                const detail = buildCompletionDetail({
                    instanceId,
                    result,
                    metadata,
                    formFields,
                    fileName,
                    mimeType: completedSource.metadata?.mimeType || audioBlob.type || "",
                    durationMs: Math.round((completedSource.metadata?.duration || 0) * 1000),
                    language: completedSource.language,
                    contributorId: completedState.env?.identifiers?.visitorId || "",
                    calibrationApplied: !!completedCalibration.complete,
                });

                if (!detail) {
                    throw new Error("UNSUPPORTED_UPLOAD_FORMAT");
                }
                emitCompletionEvent(detail);

                const redirect = getSafeRedirect(result.data?.redirect_url || result.redirect_url);
                if (redirect) {
                    setTimeout(() => {
                        window.location.href = redirect;
                    }, 1500);
                }

                // Notify parent frame (modal context) safely
                if (result.data?.post_id) {
                    try {
                        if (window.parent && window.parent !== window) {
                            void window.parent.location.href; // Throws if cross-origin
                            if (window.parent.jQuery) {
                                window.parent
                                    .jQuery(window.parent.document)
                                    .trigger("starmusRecordingComplete", [
                                        { audioPostId: result.data.post_id },
                                    ]);
                            }
                        }
                    } catch {
                        // Cross-origin — silently skip
                    }
                }
            }
        } catch (error) {
            console.error("[Core] Upload failed:", error.message);

            sparxstarIntegration.reportError("upload_failed", {
                error: error.message,
                instanceId,
                tier: stateEnv.tier,
                network: stateEnv.network,
                fileSize: audioBlob.size,
            });

            const message = error && error.message ? error.message : String(error);
            const retryableUploadError =
                !navigator.onLine ||
                /OFFLINE_FAST_PATH|TUS_UPLOAD_STALLED|TUS_RESUME_LOOKUP_FAILED|network error|timed out|circuit breaker open|HTTP 5\d\d|aborted/i.test(
                    message,
                );

            if (transferred) {
                // The upload succeeded and something after it did not —
                // `UNSUPPORTED_UPLOAD_FORMAT` is the one that throws here.
                // Queueing now would send the same recording a second time,
                // which costs the contributor bandwidth they have already
                // spent and leaves the platform holding two copies of one
                // take. The asset is on the server; what failed is this
                // client's ability to describe it, and that is reported
                // rather than retried.
                console.error("[Core] Uploaded, but could not complete:", message);
                sparxstarIntegration.reportError("post_upload_failure", {
                    error: message,
                    instanceId,
                    tier: stateEnv.tier,
                });
                store.dispatch({
                    type: "starmus/error",
                    error: { message, retryable: false },
                });
                return;
            }

            // The recording is queued on every *transfer* failure, retryable or
            // not. Whether an error is worth retrying soon decides what the
            // queue does next and what the contributor is told — it does not
            // decide whether their recording survives. It used to: a
            // misconfigured endpoint (`NO_UPLOAD_ENDPOINT`) classified as
            // non-retryable dropped the blob on the floor with an error
            // message. ADR-011 keeps the material unconditionally, and ADR-038
            // forbids re-sending an original from scratch — both need the bytes
            // still to be here.
            try {
                const submissionId = await queueSubmission(
                    instanceId,
                    audioBlob,
                    fileName,
                    formFields,
                    metadata,
                );
                store.dispatch({ type: "starmus/submit-queued", submissionId });
                const pending = await getPendingCount();
                if (window.CommandBus) {
                    window.CommandBus.dispatch("starmus/offline/queue_updated", {
                        count: pending,
                    });
                }
                if (!retryableUploadError) {
                    // Held, but not something the queue will clear on its own.
                    store.dispatch({
                        type: "starmus/error",
                        error: { message, retryable: false },
                    });
                }
            } catch (queueError) {
                console.error("[Core] Offline queue failed:", queueError);
                store.dispatch({
                    type: "starmus/error",
                    error: { message: "Upload failed completely.", retryable: false },
                });
            }
        }
    }

    CommandBus.subscribe("submit", (payload, meta) => {
        if (meta && meta.instanceId === instanceId) {
            handleSubmit(payload.formFields || {});
        }
    });

    CommandBus.subscribe("reset", (_p, meta) => {
        if (meta && meta.instanceId === instanceId) {
            store.dispatch({ type: "starmus/reset" });
        }
    });

    CommandBus.subscribe("continue", (_p, meta) => {
        if (meta && meta.instanceId === instanceId) {
            store.dispatch({ type: "starmus/ui/step-continue" });
        }
    });

    return { handleSubmit };
}

if (typeof window !== "undefined") {
    window.initCore = initCore;
}
