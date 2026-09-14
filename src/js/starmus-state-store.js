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

                // A submission that failed terminally has to give the UI back.
                //
                // `starmus/error` left `status` alone, so a queue failure while
                // submitting — the queue full, IndexedDB unavailable — left the
                // contributor on "Uploading…" with the submit control disabled,
                // their recording still in state, and no way to retry it. The
                // upload is over; pretending it is still running helps nobody.
                //
                // Not when the bytes already landed. A post-transfer failure
                // carries `uploadId`, and returning that to a submittable state
                // would invite a second upload of an asset the server has.
                const submissionFailed =
                    state.status === "submitting" &&
                    errObj.retryable === false &&
                    !errObj.uploadId;

                // The transfer succeeded and the handling after it did not.
                //
                // Left as `submitting`, this was the same trap by another door:
                // "Uploading…" forever over an upload that finished minutes
                // ago, with no request running and no control enabled. The
                // asset is on the server, so the honest terminal state is the
                // delivered one — and it is the one that does not invite a
                // second upload. The error travels with it, carrying the upload
                // id the two sides are reconciled by.
                //
                // Not when the source has been replaced. A post-transfer
                // failure still carries the *old* upload id, so this branch
                // read it as a valid delivery and marked the replacement
                // `complete` — disabling submission for bytes that were never
                // uploaded, which is the same defect the superseded state was
                // added to prevent, arriving through the error path instead of
                // the completion path.
                const deliveredThenFailed =
                    state.status === "submitting" &&
                    Boolean(errObj.uploadId) &&
                    state.submission?.superseded !== true;

                // The replaced source goes back to submittable, exactly as it
                // does when a superseded upload completes normally.
                const supersededThenFailed =
                    state.status === "submitting" &&
                    Boolean(errObj.uploadId) &&
                    state.submission?.superseded === true;
                return merge(state, {
                    status: shouldResetStatus
                        ? "ready"
                        : submissionFailed
                          ? "ready_to_submit"
                          : deliveredThenFailed
                            ? "complete"
                            : supersededThenFailed
                              ? "ready_to_submit"
                              : state.status,
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
                    // An upload in flight keeps the UI it owns, exactly as in
                    // `file-attached`. Flipping to `ready_to_submit` here
                    // re-enabled submit during a running transfer and allowed a
                    // second one alongside it; the superseded handling returns
                    // this take to submittable once the first upload settles.
                    status: state.status === "submitting" ? state.status : "ready_to_submit",
                    // As in `file-attached`: a recording that arrives while an
                    // upload is still running replaces the source under it, so
                    // that upload's result no longer describes what is here.
                    submission:
                        state.status === "submitting"
                            ? merge(state.submission, { superseded: true })
                            : state.submission,
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
                    // The in-flight upload no longer describes what is on
                    // screen. It carries the bytes of a source that has just
                    // been replaced, so whatever it reports back cannot be
                    // said about this attachment.
                    submission:
                        state.status === "submitting"
                            ? merge(state.submission, { superseded: true })
                            : state.submission,
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
                            // Kept identical to `describeAttainment("import",
                            // …)`, field for field. This module is an IIFE
                            // rather than an ES module, so it cannot call that
                            // helper; a test compares the two records instead,
                            // and fails if either moves.
                            //
                            // They had disagreed: this listed sampleRate and
                            // channelCount as unverified, while the helper
                            // reports neither — the import profile constrains
                            // neither, so there is nothing about it that went
                            // unchecked. A consumer read an unconstrained
                            // import as one whose constraints could not be
                            // verified, which is a different claim.
                            profile: "import",
                            requested: {
                                sampleRate: null,
                                channelCount: null,
                                audioBitsPerSecond: null,
                            },
                            actual: {},
                            attained: null,
                            exceeded: [],
                            unverified: [],
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
                return merge(state, {
                    status: "submitting",
                    error: null,
                    // Which submission is in flight. The file input stays usable
                    // during an upload, so without this a completion could land
                    // on a source it never uploaded.
                    //
                    // Replaced outright rather than merged. A `superseded` flag
                    // left over from a previous submission made the *next* one
                    // settle down the superseded path: a contributor whose first
                    // upload could not be queued, who then attached another file
                    // and submitted it successfully, was told it was still
                    // waiting to be sent. The progress and queued markers belong
                    // to the finished attempt for the same reason.
                    submission: {
                        progress: 0,
                        isQueued: false,
                        activeId: action.submissionId || null,
                        superseded: false,
                    },
                });

            case "starmus/submit-progress":
                return merge(state, {
                    submission: merge(state.submission, { progress: action.progress }),
                });

            case "starmus/submit-complete": {
                // Ignored when it does not belong to the submission in flight.
                //
                // A contributor who attaches a file while an upload is running
                // replaces `source`; the earlier upload then finished and set
                // *that* source to `complete`, disabling submit for a file
                // which was never uploaded. The upload that started is the only
                // one allowed to complete.
                // Once a submission has announced itself, only that submission
                // completes. An unidentified completion is not waved through
                // either: it is indistinguishable from the stale one this
                // guard exists to reject. A completion is only unconditional
                // when nothing named itself as being in flight.
                const active = state.submission?.activeId ?? null;
                const finished = action.submissionId ?? null;
                if (active !== null && active !== finished) {
                    return state;
                }

                // A submission whose source was replaced under it settles, but
                // it does not settle *this* source. The upload that finished
                // sent the earlier recording; marking the attachment that
                // replaced it `complete` disabled submit for a file nothing
                // had ever uploaded — the contributor was shown a delivery
                // that never happened and given no way to send the real one.
                // The UI goes back to submittable so the attachment can go.
                if (state.submission?.superseded === true) {
                    return merge(state, {
                        status: "ready_to_submit",
                        submission: { progress: 0, isQueued: false, activeId: null },
                    });
                }
                return merge(state, {
                    status: "complete",
                    submission: { progress: 1, isQueued: false, activeId: null },
                });
            }

            case "starmus/submit-queued":
                // The recording that was queued is the one that was in flight,
                // which is not what is on screen when the source has been
                // replaced. Reporting "Queued" over the new attachment claimed
                // the platform was holding a file it had never been given, and
                // disabled the control that would have sent it. The queue entry
                // for the earlier recording stands either way.
                if (state.submission?.superseded === true) {
                    return merge(state, {
                        status: "ready_to_submit",
                        submission: { progress: 0, isQueued: false, activeId: null },
                    });
                }
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
