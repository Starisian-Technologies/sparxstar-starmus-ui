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
 * @file starmus-recorder.js
 * @version 6.4.0
 * @description Audio recording using the MediaRecorder API with calibration,
 * amplitude metering, and speech recognition. Implements the Africa-first
 * performance model: no heavy computation during recording on Tier C.
 */

"use strict";

import { CommandBus } from "./starmus-hooks.js";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";
import { EnhancedCalibration } from "./starmus-enhanced-calibration.js";
import {
    activeCaptureProfileName,
    describeAttainment,
    getAudioConstraints,
    getRecorderOptions,
} from "./starmus-capture-profiles.js";

/**
 * Registry of active recorder instances, keyed by instanceId.
 * @type {Map<string, Object>}
 */
const recorderRegistry = new Map();

/**
 * Shared AudioContext reused across instances.
 * @type {AudioContext|null}
 */
let sharedAudioContext = null;

/**
 * Preferred MIME types in priority order.
 * WebM/Opus is strongly preferred for Africa-first bandwidth constraints.
 *
 * @type {string[]}
 */
const PREFERRED_MIME_TYPES = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
];

/**
 * Returns the first MIME type supported by MediaRecorder.
 *
 * @returns {string} Supported MIME type
 */
function getSupportedMimeType() {
    for (const mimeType of PREFERRED_MIME_TYPES) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            return mimeType;
        }
    }
    return "";
}

/**
 * Maximum recording duration in seconds (20 minutes).
 * Enforced by a timeout to prevent orphaned recordings.
 * @type {number}
 */
const MAX_DURATION_SECONDS = 1200;

/**
 * Initialises a recorder instance for a given store and instance ID.
 * Subscribes to the CommandBus for mic-start, mic-pause, mic-resume, and mic-stop.
 *
 * @param {Object} store - Redux-style state store
 * @param {string} instanceId - Unique recorder instance identifier
 * @returns {void}
 */
export function initRecorder(store, instanceId) {
    const state = store.getState();
    const tier = state.tier || "C";

    /**
     * Starts microphone calibration then transitions to recording-ready state.
     *
     * @returns {Promise<void>}
     */
    async function startCalibration() {
        store.dispatch({ type: "starmus/calibration-start" });

        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: getAudioConstraints(activeCaptureProfileName()),
            });
        } catch (err) {
            console.error("[Recorder] Microphone access denied:", err);
            store.dispatch({
                type: "starmus/error",
                error: { code: "MIC_DENIED", message: err.message, retryable: true },
            });
            return;
        }

        const calibration = new EnhancedCalibration();
        await calibration.init();

        try {
            // ADR-035: calibration analyses at the profile's rate. Forcing a
            // 16 kHz AudioContext here would reintroduce the platform-wide
            // ceiling for documentation and import sessions.
            const result = await calibration.performCalibration(
                stream,
                (msg, vol, done, data) => {
                    if (done) {
                        store.dispatch({
                            type: "starmus/calibration-complete",
                            payload: { calibration: data },
                        });
                    } else {
                        store.dispatch({
                            type: "starmus/calibration-update",
                            message: msg,
                            volumePercent: vol,
                        });
                    }
                },
                { captureProfile: activeCaptureProfileName() }
            );

            // Store the calibrated stream for recording
            recorderRegistry.set(instanceId, {
                ...(recorderRegistry.get(instanceId) || {}),
                calibrationResult: result,
                stream,
            });
        } catch (calErr) {
            console.error("[Recorder] Calibration failed:", calErr);
            // Fallback: mark calibration complete with defaults
            store.dispatch({
                type: "starmus/calibration-complete",
                payload: {
                    calibration: {
                        complete: true,
                        gain: 1.0,
                        speechLevel: 50,
                    },
                },
            });
            recorderRegistry.set(instanceId, {
                ...(recorderRegistry.get(instanceId) || {}),
                stream,
            });
        }

        // Stop calibration stream tracks — a new stream is opened at record start
        stream.getTracks().forEach((t) => t.stop());
    }

    /**
     * Opens a fresh microphone stream and starts MediaRecorder.
     *
     * @returns {Promise<void>}
     */
    async function startRecording() {
        let stream;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: getAudioConstraints(activeCaptureProfileName()),
            });
        } catch (err) {
            console.error("[Recorder] Cannot open microphone for recording:", err);
            store.dispatch({
                type: "starmus/error",
                error: { code: "MIC_DENIED", message: err.message, retryable: true },
            });
            return;
        }

        const mimeType = getSupportedMimeType();
        const captureProfile = activeCaptureProfileName();
        let mediaRecorder;

        try {
            // ADR-035: the profile's encoder options are applied here, not
            // merely declared. Constructing with only { mimeType } left
            // `conversation`'s 32 kbps ceiling as dead configuration.
            mediaRecorder = new MediaRecorder(stream, getRecorderOptions(captureProfile, mimeType));
        } catch (err) {
            console.error("[Recorder] MediaRecorder creation failed:", err);
            store.dispatch({
                type: "starmus/error",
                error: { code: "MEDIARECORDER_FAILED", message: err.message, retryable: false },
            });
            stream.getTracks().forEach((t) => t.stop());
            return;
        }

        // ADR-035: an unattainable profile is reported to the product, never
        // silently satisfied by substituting a different one. The capture
        // profile travels with the asset so a consumer can tell whether a
        // measurement taken from it is admissible.
        const attainment = describeAttainment(captureProfile, stream.getAudioTracks()[0]);
        store.dispatch({ type: "starmus/capture-profile", attainment });
        if (!attainment.attained) {
            console.warn(
                `[Recorder] Capture profile "${attainment.profile}" not attained by this device.`,
                attainment
            );
        }

        store.dispatch({ type: "starmus/mic-start" });

        const chunks = [];
        let startTime = Date.now();
        let elapsedBeforePause = 0;
        let rafId = null;

        // Amplitude meter — uses AudioContext only on Tier A/B
        let analyser = null;
        let analyserData = null;

        if (tier !== "C") {
            try {
                if (!sharedAudioContext) {
                    // The meter must not force a rate the capture profile did not ask
                    // for; let the context follow the device for unconstrained profiles.
                    const meterConstraints = getAudioConstraints(activeCaptureProfileName());
                    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)(
                        meterConstraints.sampleRate ? { sampleRate: meterConstraints.sampleRate } : {}
                    );
                } else if (sharedAudioContext.state === "suspended") {
                    await sharedAudioContext.resume();
                }
                const source = sharedAudioContext.createMediaStreamSource(stream);
                analyser = sharedAudioContext.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.6;
                source.connect(analyser);
                analyserData = new Uint8Array(analyser.fftSize);
            } catch {
                // Non-critical — amplitude meter is optional
            }
        }

        /**
         * Calculates RMS amplitude as a 0–100 percentage.
         * @returns {number}
         */
        function getAmplitude() {
            if (!analyser || !analyserData) {
                return 0;
            }
            analyser.getByteTimeDomainData(analyserData);
            let sumSq = 0;
            for (let i = 0; i < analyserData.length; i++) {
                const v = (analyserData[i] - 128) / 128;
                sumSq += v * v;
            }
            return Math.min(100, Math.sqrt(sumSq / analyserData.length) * 200);
        }

        /**
         * RAF loop — dispatches recorder-tick actions to update UI.
         */
        function tick() {
            const now = store.getState();
            if (now.status !== "recording") {
                return;
            }

            const elapsed = elapsedBeforePause + (Date.now() - startTime) / 1000;
            const amplitude = getAmplitude();

            store.dispatch({ type: "starmus/recorder-tick", duration: elapsed, amplitude });

            // Enforce max duration
            if (elapsed >= MAX_DURATION_SECONDS) {
                stopRecording();
                return;
            }

            rafId = requestAnimationFrame(tick);
        }

        mediaRecorder.addEventListener("dataavailable", (e) => {
            if (e.data && e.data.size > 0) {
                chunks.push(e.data);
            }
        });

        mediaRecorder.addEventListener("stop", () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            stream.getTracks().forEach((t) => t.stop());

            const finalMime = mimeType || "audio/webm";
            const blob = new Blob(chunks, { type: finalMime });
            const fileName = `starmus-${instanceId}-${Date.now()}.webm`;

            store.dispatch({
                type: "starmus/recording-available",
                payload: { blob, fileName },
            });
        });

        mediaRecorder.start(1000); // 1-second chunks
        startTime = Date.now();
        rafId = requestAnimationFrame(tick);

        // Max-duration safety timeout
        const maxDurationTimeout = setTimeout(() => stopRecording(), MAX_DURATION_SECONDS * 1000);

        recorderRegistry.set(instanceId, {
            ...(recorderRegistry.get(instanceId) || {}),
            mediaRecorder,
            stream,
            getAmplitude,
            stopFn: stopRecording,
            maxDurationTimeout,
        });

        function pauseRecording() {
            if (mediaRecorder.state === "recording") {
                elapsedBeforePause += (Date.now() - startTime) / 1000;
                mediaRecorder.pause();
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                store.dispatch({ type: "starmus/mic-pause" });
            }
        }

        function resumeRecording() {
            if (mediaRecorder.state === "paused") {
                startTime = Date.now();
                mediaRecorder.resume();
                rafId = requestAnimationFrame(tick);
                store.dispatch({ type: "starmus/mic-resume" });
            }
        }

        function stopRecording() {
            clearTimeout(maxDurationTimeout);
            if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }
            store.dispatch({ type: "starmus/mic-stop" });
        }

        // Override CommandBus subscriptions for this session
        const paused = CommandBus.subscribe("starmus/mic-pause", (_p, meta) => {
            if (meta && meta.instanceId === instanceId) {
                pauseRecording();
            }
        });

        const resumed = CommandBus.subscribe("starmus/mic-resume", (_p, meta) => {
            if (meta && meta.instanceId === instanceId) {
                resumeRecording();
            }
        });

        const stopped = CommandBus.subscribe("starmus/mic-stop", (_p, meta) => {
            if (meta && meta.instanceId === instanceId) {
                stopRecording();
                paused();
                resumed();
                stopped();
            }
        });
    }

    // Subscribe to setup-mic and record commands

    /**
     * Dispatches a TIER_C_NO_MIC error and returns true when the current tier
     * is "C", blocking any microphone command before the recorder runs.
     *
     * @returns {boolean} true if the command was blocked (Tier C), false otherwise
     */
    function blockIfTierC() {
        if (store.getState().tier !== "C") {
            return false;
        }
        store.dispatch({
            type: "starmus/error",
            error: {
                code: "TIER_C_NO_MIC",
                message: "Recording is not available on this device. Please upload a file.",
                retryable: false,
            },
        });
        return true;
    }

    CommandBus.subscribe("starmus/setup-mic", (_p, meta) => {
        if (meta && meta.instanceId === instanceId) {
            if (!blockIfTierC()) {
                startCalibration();
            }
        }
    });

    CommandBus.subscribe("starmus/mic-start", (_p, meta) => {
        if (meta && meta.instanceId === instanceId) {
            if (!blockIfTierC()) {
                startRecording();
            }
        }
    });

    // Report environment data
    const envData = sparxstarIntegration.getEnvironmentData();
    if (envData && envData.tier) {
        store.dispatch({ type: "starmus/tier-ready", payload: { tier: envData.tier } });
    }
}

if (typeof window !== "undefined") {
    window.StarmusRecorder = { initRecorder };
}
