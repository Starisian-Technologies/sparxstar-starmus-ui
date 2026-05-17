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

import "./starmus-hooks.js";
import { uploadWithPriority } from "./starmus-tus.js";
import { queueSubmission, getPendingCount } from "./starmus-offline.js";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";

const subscribe = window.StarmusHooks?.subscribe || function () {};

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

        const metadata = {
            transcript: source.transcript?.trim() || null,
            calibration: calibration.complete
                ? { gain: calibration.gain, speechLevel: calibration.speechLevel }
                : null,
            env: stateEnv,
            tier: stateEnv.tier || currentEnvData?.tier || "C",
        };

        store.dispatch({ type: "starmus/submit-start" });

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

            store.dispatch({ type: "starmus/submit-complete", payload: result });

            // Fire redirect if server provided one
            if (result && result.success) {
                const redirect = result.data?.redirect_url || result.redirect_url;
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
                                window.parent.jQuery(window.parent.document).trigger(
                                    "starmusRecordingComplete",
                                    [{ audioPostId: result.data.post_id }],
                                );
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
                /OFFLINE_FAST_PATH|network error|timed out|circuit breaker open|HTTP 5\d\d|aborted/i.test(
                    message,
                );

            if (retryableUploadError) {
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
                } catch (queueError) {
                    console.error("[Core] Offline queue failed:", queueError);
                    store.dispatch({
                        type: "starmus/error",
                        error: { message: "Upload failed completely.", retryable: false },
                    });
                }
            } else {
                store.dispatch({
                    type: "starmus/error",
                    error: { message, retryable: false },
                });
            }
        }
    }

    subscribe("submit", (payload, meta) => {
        if (meta && meta.instanceId === instanceId) {
            handleSubmit(payload.formFields || {});
        }
    });

    subscribe("reset", (_p, meta) => {
        if (meta && meta.instanceId === instanceId) {
            store.dispatch({ type: "starmus/reset" });
        }
    });

    subscribe("continue", (_p, meta) => {
        if (meta && meta.instanceId === instanceId) {
            store.dispatch({ type: "starmus/ui/step-continue" });
        }
    });

    return { handleSubmit };
}

if (typeof window !== "undefined") {
    window.initCore = initCore;
}
