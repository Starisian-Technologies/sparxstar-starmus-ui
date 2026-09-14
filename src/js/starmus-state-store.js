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
 * @file starmus-state-store.js
 * @version 6.1.0
 * @description Redux-style state store for the Starmus audio recorder.
 * Manages complete application state: recording, calibration, submission, environment.
 */

(function (global) {
    "use strict";

    /**
     * Default initial state for new store instances.
     * @type {Object}
     */
    const DEFAULT_INITIAL_STATE = {
        instanceId: null,
        tier: null,
        status: "uninitialized",
        step: 1,
        error: null,
        env: {
            device: {},
            browser: {},
            network: {},
            identifiers: {},
            errors: [],
        },
        source: {
            kind: null,
            blob: null,
            file: null,
            fileName: "",
            title: "",
            language: "",
            recording_type: "",
            transcript: "",
            interimTranscript: "",
            metadata: {
                duration: 0,
                mimeType: "",
                fileSize: 0,
            },
            // ADR-035: the capture profile travels with the asset. The whole
            // attainment record is kept — profile name, what was requested,
            // what the device actually delivered — because a consumer needs
            // all three to judge whether a measurement from this asset is
            // admissible. Two derived booleans would not carry that.
            captureProfile: null,
            captureAttainment: null,
        },
        calibration: {
            phase: null,
            message: "",
            volumePercent: 0,
            complete: false,
            gain: 1.0,
            speechLevel: 0,
        },
        recorder: {
            duration: 0,
            amplitude: 0,
            isPlaying: false,
            isPaused: false,
        },
        submission: {
            progress: 0,
            isQueued: false,
        },
    };

    function shallowClone(obj) {
        const out = {};
        for (const k in obj) {
            if (
                Object.prototype.hasOwnProperty.call(obj, k) &&
                k !== "__proto__" &&
                k !== "constructor" &&
                k !== "prototype"
            ) {
                out[k] = obj[k];
            }
        }
        return out;
    }

    function merge(a, b) {
        const out = shallowClone(a);
        for (const k in b) {
            if (
                Object.prototype.hasOwnProperty.call(b, k) &&
                k !== "__proto__" &&
                k !== "constructor" &&
                k !== "prototype"
            ) {
                out[k] = b[k];
            }
        }
        return out;
    }

    function reducer(state, action) {
        if (!action || !action.type) {
            return state;
        }

        if (!state.instanceId && action.payload && action.payload.instanceId) {
            state = merge(state, { instanceId: action.payload.instanceId });
        }

        switch (action.type) {
            case "starmus/init":
                return merge(state, merge(action.payload || {}, { status: "idle", error: null }));

            case "starmus/env-update": {
                const newEnv = merge(state.env, action.payload || {});
                if (!newEnv.errors) {
                    newEnv.errors = state.env.errors || [];
                }
                return merge(state, { env: newEnv });
            }

            case "starmus/error": {
                const errObj = action.error || action.payload;
                const currentErrors =
                    state.env && state.env.errors ? state.env.errors.slice() : [];
                currentErrors.push({
                    code: errObj.code || "RUNTIME_ERROR",
                    message: errObj.message || "Unknown",
                    timestamp: Date.now(),
                    severity: errObj.retryable === false ? "hard" : "soft",
                });
                const shouldResetStatus =
                    (state.status === "calibrating" || state.status === "recording") &&
                    (errObj.code === "MIC_DENIED" || errObj.code === "MEDIARECORDER_FAILED");
                return merge(state, {
                    status: shouldResetStatus ? "ready" : state.status,
                    error: errObj,
                    env: merge(state.env, { errors: currentErrors }),
                });
            }

            case "starmus/tier-ready":
                return merge(state, { tier: action.payload.tier || state.tier });

            case "starmus/ui/step-continue":
                return merge(state, { step: 2, status: "idle", error: null });

            case "starmus/calibration-start":
                return merge(state, { status: "calibrating" });

            case "starmus/calibration-update":
                return merge(state, {
                    calibration: merge(state.calibration, {
                        message: action.message,
                        volumePercent: action.volumePercent,
                    }),
                });

            case "starmus/calibration-complete":
                return merge(state, {
                    status: "ready",
                    calibration: merge(
                        state.calibration,
                        merge(action.payload.calibration || {}, { complete: true }),
                    ),
                });

            case "starmus/capture-profile":
                return merge(state, {
                    source: merge(state.source, {
                        captureProfile: action.attainment?.profile ?? null,
                        captureAttainment: action.attainment ?? null,
                    }),
                });

            case "starmus/mic-start":
                return merge(state, {
                    status: "recording",
                    error: null,
                    recorder: merge(state.recorder, { duration: 0, isPaused: false }),
                    source: merge(state.source, {
                        // The previous take's draft goes when the microphone
                        // opens, not when the new recording lands.
                        // `handleSubmit()` copies `source.transcript` into the
                        // upload metadata, so a retake used to carry the
                        // *previous* take's words; clearing at stop instead
                        // erased the draft of the take that had just finished.
                        // Here is the one moment when the old words are stale
                        // and no new ones exist yet.
                        transcript: "",
                        interimTranscript: "",
                    }),
                });

            case "starmus/mic-pause":
                return merge(state, {
                    status: "paused",
                    recorder: merge(state.recorder, { isPaused: true }),
                });

            case "starmus/mic-resume":
                return merge(state, {
                    status: "recording",
                    recorder: merge(state.recorder, { isPaused: false }),
                });

            case "starmus/mic-stop":
                return merge(state, { status: "ready_to_submit" });

            case "starmus/recorder-tick":
                return merge(state, {
                    recorder: merge(state.recorder, {
                        duration: action.duration,
                        amplitude: action.amplitude,
                    }),
                });

            case "starmus/recording-available":
                return merge(state, {
                    status: "ready_to_submit",
                    source: merge(state.source, {
                        kind: "blob",
                        blob: action.payload.blob,
                        // A previously attached file is cleared, so `kind` and
                        // the payload cannot disagree. See `file-attached`
                        // below for what leaving the other one set costs.
                        file: null,
                        // The transcript is deliberately NOT cleared here, and
                        // an earlier version of this did clear it — which
                        // erased every recording's own draft.
                        //
                        // `recording-available` is dispatched from
                        // MediaRecorder's `stop` handler, *after* a whole
                        // recording's worth of `transcript-update` actions have
                        // accumulated. Clearing at stop therefore wiped the
                        // draft belonging to the take that had just finished,
                        // before `handleSubmit()` could snapshot it. The retake
                        // leak it was meant to fix is handled at `mic-start`
                        // instead: a new recording clears the previous draft
                        // when the microphone opens, which is before any of the
                        // new one's words exist.
                        //
                        // The capture profile is deliberately NOT cleared here.
                        // `starmus/capture-profile` is dispatched when the
                        // microphone opens and `starmus/recording-available`
                        // when it stops, so clearing at stop would destroy the
                        // profile belonging to the recording that just ended —
                        // and an asset with no profile is the exact failure
                        // ADR-035 and the build check exist to prevent. A stale
                        // `import` profile cannot survive into a recording,
                        // because opening the microphone overwrites it first.
                        fileName: action.payload.fileName,
                        metadata: {
                            duration: state.recorder.duration || 0,
                            mimeType: action.payload.blob.type || "audio/webm",
                            fileSize: action.payload.blob.size || 0,
                        },
                    }),
                });

            case "starmus/transcript-update":
                return merge(state, {
                    source: merge(state.source, { transcript: action.transcript }),
                });

            case "starmus/transcript-interim":
                return merge(state, {
                    source: merge(state.source, { interimTranscript: action.interim }),
                });

            case "starmus/file-attached":
                // A submission already in flight is not interrupted. The file
                // input stays active while `status === "submitting"`, so
                // attaching a file mid-upload used to flip the status back to
                // `ready_to_submit`, re-enabling submit and permitting a second
                // submission to run alongside the first. The attachment is
                // still recorded; only the status is left alone, so the
                // in-flight upload keeps the UI it owns until it settles.
                return merge(state, {
                    status: state.status === "submitting" ? state.status : "ready_to_submit",
                    source: merge(state.source, {
                        kind: "file",
                        file: action.file,
                        // The recorded blob is cleared, not left beside the
                        // file. `handleSubmit()` reads `source.blob || source.file`,
                        // so a contributor who recorded and then attached a
                        // file uploaded the *recording* under the *file's*
                        // name, carrying the file's mime type, size and the
                        // `import` profile. That is a mislabelled contribution
                        // — the wrong audio described as something it is not —
                        // which for an archive is worse than an upload that
                        // fails outright.
                        blob: null,
                        // The live-transcript draft goes with it. It belongs to
                        // the recording that was just replaced, and
                        // `handleSubmit()` copies `source.transcript` into the
                        // upload metadata — so an imported file arrived at
                        // ingestion carrying another take's words, which is the
                        // same mislabelling by a different field.
                        transcript: "",
                        interimTranscript: "",

                        fileName: action.file.name,
                        // An attached file is prerecorded material, which is
                        // exactly what ADR-035 calls the `import` profile:
                        // preserved unchanged, no transcode, resample or
                        // fold-down. Leaving the profile unset here sent a
                        // blank one to ingestion on the Tier C path — the very
                        // condition `AGENTS.md` lists as a build failure.
                        captureProfile: "import",
                        // Nothing was captured, so nothing was measured. The
                        // attainment says so rather than claiming the profile
                        // was met: `attained: null` is "not applicable", which
                        // is different from the `false` a missed constraint
                        // would give. The Spoken Audio Node probes the file
                        // itself and records what it actually is.
                        captureAttainment: {
                            profile: "import",
                            requested: { sampleRate: null, channelCount: null },
                            actual: {},
                            attained: null,
                            exceeded: [],
                            unverified: ["sampleRate", "channelCount"],
                            source: "file-attachment",
                        },
                        metadata: {
                            duration: 0,
                            mimeType: action.file.type,
                            fileSize: action.file.size,
                        },
                    }),
                });

            case "starmus/submit-start":
                return merge(state, { status: "submitting", error: null });

            case "starmus/submit-progress":
                return merge(state, {
                    submission: merge(state.submission, { progress: action.progress }),
                });

            case "starmus/submit-complete":
                return merge(state, {
                    status: "complete",
                    submission: { progress: 1, isQueued: false },
                });

            case "starmus/submit-queued":
                return merge(state, {
                    status: "complete",
                    submission: { progress: 0, isQueued: true },
                });

            case "starmus/reset":
                return merge(shallowClone(DEFAULT_INITIAL_STATE), {
                    instanceId: state.instanceId,
                    env: state.env,
                    tier: state.tier,
                    status: "idle",
                });

            default:
                return state;
        }
    }

    /**
     * Creates a new Redux-style store instance.
     *
     * @param {Object} [initial={}] - Initial state to merge with defaults
     * @returns {Object} Store with getState, dispatch, subscribe
     */
    function createStore(initial) {
        let state = merge(DEFAULT_INITIAL_STATE, initial || {});
        const listeners = [];
        return {
            getState: function () {
                return state;
            },
            dispatch: function (action) {
                state = reducer(state, action);
                for (let i = 0; i < listeners.length; i++) {
                    listeners[i](state);
                }
            },
            subscribe: function (fn) {
                listeners.push(fn);
                return function () {
                    const index = listeners.indexOf(fn);
                    if (index >= 0) {
                        listeners.splice(index, 1);
                    }
                };
            },
        };
    }

    global.StarmusStore = global.StarmusStore || {};
    global.StarmusStore.createStore = createStore;
    global.StarmusStore.DEFAULT_INITIAL_STATE = DEFAULT_INITIAL_STATE;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { createStore, DEFAULT_INITIAL_STATE };
    }
})(typeof window !== "undefined" ? window : globalThis);

const runtimeGlobal = typeof window !== "undefined" ? window : globalThis;

/**
 * @exports createStore
 */
export function createStore(initial) {
    return runtimeGlobal.StarmusStore.createStore(initial);
}

/**
 * Default initial state exported for testing and schema validation.
 * @exports DEFAULT_INITIAL_STATE
 */
export const DEFAULT_INITIAL_STATE =
    runtimeGlobal.StarmusStore.DEFAULT_INITIAL_STATE;
