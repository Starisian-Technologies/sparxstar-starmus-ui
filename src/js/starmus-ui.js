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
 * @file starmus-ui.js
 * @version 6.4.0
 * @description UI rendering and interaction management for the Starmus audio recorder.
 * Binds DOM elements, dispatches CommandBus events, and subscribes to store state.
 * Implements Africa-first touch targets and single-column layout assumptions.
 */

"use strict";

/**
 * Currently playing Audio instance for review playback.
 * @type {Audio|null}
 */
let currentAudio = null;

/**
 * Formats seconds to MM'm SS's string.
 *
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "00m 00s";
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? "0" + m : m}m ${s < 10 ? "0" + s : s}s`;
}

/**
 * Binds an event handler to an element, preventing duplicate bindings.
 * Prevents default on cancelable events and respects disabled state.
 *
 * @param {HTMLElement|null} element
 * @param {string} eventName
 * @param {function} handler
 * @returns {void}
 */
function safeBind(element, eventName, handler) {
    if (!element || element._starmusBound) {
        return;
    }
    element.addEventListener(eventName, function (e) {
        if (e.cancelable) {
            e.preventDefault();
        }
        e.stopPropagation();
        if (!element.disabled) {
            handler(e);
        }
    });
    element._starmusBound = true;
}

/**
 * Renders UI state to DOM elements based on current store state.
 * All state transitions are driven by this function; no direct DOM
 * mutations outside of it.
 *
 * @param {Object} state - Current application state
 * @param {Object} elements - DOM element references
 * @returns {void}
 */
function render(state, elements, i18n) {
    if (!elements) {
        return;
    }

    const { status, step, tier } = state;
    const recorder = state.recorder || {};
    const calibration = state.calibration || {};
    const submission = state.submission || {};

    /* --- Tier C: show file upload fallback, hide recorder UI --- */
    if (tier === "C") {
        if (elements.recorderContainer) {
            elements.recorderContainer.style.display = "none";
        }
        if (elements.setupContainer) {
            elements.setupContainer.style.display = "none";
        }
        const fallback = document.querySelector("[data-starmus-fallback-container]");
        if (fallback) {
            fallback.style.display = "block";
        }
        return;
    }

    /* --- Amplitude meter --- */
    const vol =
        status === "calibrating"
            ? calibration.volumePercent || 0
            : status === "recording"
              ? recorder.amplitude || 0
              : 0;

    if (elements.volumeMeter) {
        elements.volumeMeter.style.setProperty("--starmus-audio-level", `${vol}%`);
    }

    /* --- Timer --- */
    if (elements.timerElapsed) {
        elements.timerElapsed.textContent = formatTime(recorder.duration || 0);
    }

    /* --- Duration progress bar --- */
    if (elements.durationProgress) {
        const maxDuration = 1200;
        const pct = Math.min(100, ((recorder.duration || 0) / maxDuration) * 100);
        elements.durationProgress.style.setProperty(
            "--starmus-recording-progress",
            `${pct}%`,
        );
    }

    /* --- Step visibility --- */
    if (elements.step1 && elements.step2) {
        const activeStatuses = [
            "recording",
            "paused",
            "processing",
            "ready_to_submit",
            "submitting",
            "calibrating",
            "ready",
            "complete",
        ];
        const showStep2 = step === 2 || activeStatuses.includes(status);
        elements.step1.style.display = showStep2 ? "none" : "block";
        elements.step2.style.display = showStep2 ? "block" : "none";
    }

    /* --- Calibration / setup container --- */
    const isCalibrated = calibration.complete === true;

    if (elements.setupContainer) {
        elements.setupContainer.style.display =
            !isCalibrated || status === "calibrating" ? "block" : "none";

        if (elements.setupMicBtn) {
            if (status === "calibrating") {
                elements.setupMicBtn.textContent =
                    calibration.message || i18n("setupAdjusting", "Adjusting...");
                elements.setupMicBtn.disabled = true;
            } else {
                elements.setupMicBtn.textContent = i18n("setupMicrophone", "Setup Microphone");
                elements.setupMicBtn.disabled = false;
            }
        }
    }

    if (elements.recorderContainer) {
        elements.recorderContainer.style.display = isCalibrated ? "block" : "none";
    }

    /* --- Recording control buttons --- */
    const isRec = status === "recording";
    const isPaused = status === "paused";
    const isDone = status === "ready_to_submit";
    const isReady =
        (status === "ready" || status === "ready_to_record" || status === "idle") && isCalibrated;

    if (elements.recordBtn) {
        elements.recordBtn.style.display =
            isReady && !isRec && !isPaused && !isDone ? "inline-flex" : "none";
    }
    if (elements.pauseBtn) {
        elements.pauseBtn.style.display = isRec ? "inline-flex" : "none";
    }
    if (elements.resumeBtn) {
        elements.resumeBtn.style.display = isPaused ? "inline-flex" : "none";
    }
    if (elements.stopBtn) {
        elements.stopBtn.style.display = isRec || isPaused ? "inline-flex" : "none";
    }

    if (elements.reviewControls) {
        elements.reviewControls.style.display = isDone ? "flex" : "none";
    } else {
        if (elements.playBtn) {
            elements.playBtn.style.display = isDone ? "inline-flex" : "none";
        }
        if (elements.resetBtn) {
            elements.resetBtn.style.display = isDone ? "inline-flex" : "none";
        }
    }

    /* --- Offline indicator --- */
    if (elements.offlineBanner) {
        elements.offlineBanner.style.display = !navigator.onLine ? "block" : "none";
    }

    /* --- Submit button --- */
    if (elements.submitBtn) {
        if (status === "submitting") {
            elements.submitBtn.textContent =
                `${i18n("uploading", "Uploading...")} ${Math.round((submission.progress || 0) * 100)}%`;
            elements.submitBtn.disabled = true;
        } else if (status === "complete") {
            elements.submitBtn.textContent = submission.isQueued
                ? i18n("queuedUploading", "Queued — uploading when online")
                : i18n("submitted", "Submitted!");
            elements.submitBtn.disabled = true;
        } else {
            elements.submitBtn.textContent = i18n("submitRecording", "Submit Recording");
            elements.submitBtn.disabled = status !== "ready_to_submit";
        }
    }

    /* --- Mode indicator text --- */
    if (elements.modeIndicator) {
        const modeLabels = {
            uninitialized: i18n("modeLoading", "Loading…"),
            idle: i18n("modeReady", "Ready"),
            calibrating: i18n("modeCalibrating", "Calibrating microphone…"),
            ready: i18n("modeReadyToRecord", "Ready to record"),
            recording: i18n("modeRecording", "Recording"),
            paused: i18n("modePaused", "Paused"),
            ready_to_submit: i18n("modeReview", "Review your recording"),
            submitting: i18n("modeUploading", "Uploading…"),
            complete: submission.isQueued
                ? i18n("modeQueued", "Queued for upload")
                : i18n("modeComplete", "Complete"),
        };
        elements.modeIndicator.textContent = modeLabels[status] || status;
        elements.modeIndicator.dataset.starmusStatus = status;
    }
}

/**
 * Initialises the UI for a recorder instance.
 * Binds all interactive elements and sets up state subscription.
 *
 * @param {Object} store - Redux-style state store
 * @param {Object} [_incomingElements] - Reserved
 * @param {string} [forcedInstanceId] - Instance ID override
 * @returns {function} Unsubscribe function
 */
export function initInstance(store, _incomingElements, forcedInstanceId) {
    const instId = forcedInstanceId || store.getState().instanceId;
    let root = document;

    if (instId) {
        const found = document.querySelector(`form[data-starmus-instance="${instId}"]`);
        if (found) {
            root = found;
        }
    }

    const BUS = window.CommandBus;
    const bootstrapI18n = window.STARMUS_BOOTSTRAP?.i18n || {};
    const i18n = (key, fallback) => {
        const value = bootstrapI18n[key];
        return typeof value === "string" && value.trim() !== "" ? value : fallback;
    };

    const el = {
        step1: root.querySelector('[data-starmus-step="1"]'),
        step2: root.querySelector('[data-starmus-step="2"]'),
        setupContainer: root.querySelector("[data-starmus-setup-container]"),
        timer: root.querySelector("[data-starmus-timer]"),
        timerElapsed: root.querySelector(".starmus-timer-elapsed"),
        volumeMeter: root.querySelector("[data-starmus-volume-meter]"),
        durationProgress: root.querySelector("[data-starmus-duration-progress]"),
        recorderContainer: root.querySelector("[data-starmus-recorder-container]"),
        reviewControls: root.querySelector(".starmus-review-controls"),
        messageBox: root.querySelector("[data-starmus-message-box]"),
        modeIndicator: root.querySelector("[data-starmus-mode]"),
        offlineBanner: root.querySelector("[data-starmus-offline-banner]"),
        continueBtn: root.querySelector('[data-starmus-action="next"]'),
        setupMicBtn: root.querySelector('[data-starmus-action="setup-mic"]'),
        recordBtn: root.querySelector('[data-starmus-action="record"]'),
        pauseBtn: root.querySelector('[data-starmus-action="pause"]'),
        resumeBtn: root.querySelector('[data-starmus-action="resume"]'),
        stopBtn: root.querySelector('[data-starmus-action="stop"]'),
        playBtn: root.querySelector('[data-starmus-action="play"]'),
        resetBtn: root.querySelector('[data-starmus-action="reset"]'),
        submitBtn: root.querySelector('[data-starmus-action="submit"]'),
    };

    /* --- Continue button (step 1 → step 2) --- */
    safeBind(el.continueBtn, "click", function () {
        const inputs = el.step1 ? el.step1.querySelectorAll("[required]") : [];
        let valid = true;

        if (el.messageBox) {
            el.messageBox.style.display = "none";
            el.messageBox.textContent = "";
        }

        for (const input of inputs) {
            const isCheckbox = input.type === "checkbox" || input.type === "radio";
            const isValid = isCheckbox ? input.checked : input.value.trim() !== "";
            if (!isValid) {
                valid = false;
                input.style.outlineColor = "var(--sparxstar-danger, #d63638)";
            } else {
                input.style.outlineColor = "";
            }
        }

        if (valid) {
            store.dispatch({ type: "starmus/ui/step-continue" });
        } else if (el.messageBox) {
            el.messageBox.textContent = i18n(
                "requiredFieldsError",
                "Please fill in all required fields.",
            );
            el.messageBox.style.display = "block";
        }
    });

    /* --- Setup microphone --- */
    safeBind(el.setupMicBtn, "click", function () {
        if (BUS) {
            BUS.dispatch("starmus/setup-mic", {}, { instanceId: instId });
        }
    });

    /* --- Record --- */
    safeBind(el.recordBtn, "click", function () {
        if (BUS) {
            BUS.dispatch("starmus/mic-start", {}, { instanceId: instId });
        }
    });

    /* --- Pause --- */
    safeBind(el.pauseBtn, "click", function () {
        if (BUS) {
            BUS.dispatch("starmus/mic-pause", {}, { instanceId: instId });
        }
    });

    /* --- Resume --- */
    safeBind(el.resumeBtn, "click", function () {
        if (BUS) {
            BUS.dispatch("starmus/mic-resume", {}, { instanceId: instId });
        }
    });

    /* --- Stop --- */
    safeBind(el.stopBtn, "click", function () {
        if (BUS) {
            BUS.dispatch("starmus/mic-stop", {}, { instanceId: instId });
        }
    });

    /* --- Play review audio --- */
    safeBind(el.playBtn, "click", function () {
        const state = store.getState();
        const blob = state.source?.blob;
        if (!blob) {
            return;
        }

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
            el.playBtn.textContent = i18n("play", "Play");
            return;
        }

        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        el.playBtn.textContent = i18n("stop", "Stop");

        currentAudio.addEventListener("ended", () => {
            URL.revokeObjectURL(url);
            currentAudio = null;
            el.playBtn.textContent = i18n("play", "Play");
        });

        currentAudio.play().catch((err) => {
            console.error("[UI] Playback error:", err);
            URL.revokeObjectURL(url);
            currentAudio = null;
            el.playBtn.textContent = i18n("play", "Play");
        });
    });

    /* --- Reset --- */
    safeBind(el.resetBtn, "click", function () {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        if (BUS) {
            BUS.dispatch("reset", {}, { instanceId: instId });
        }
    });

    /* --- Submit --- */
    safeBind(el.submitBtn, "click", function () {
        const formRoot =
            root instanceof HTMLFormElement ? root : root.querySelector("form");
        const formData = formRoot ? new FormData(formRoot) : new FormData();
        const fields = {};
        for (const [key, val] of formData.entries()) {
            fields[key] = val;
        }

        if (BUS) {
            BUS.dispatch("submit", { formFields: fields }, { instanceId: instId });
        }
    });

    /* --- File input (Tier C fallback) --- */
    const fileInput = root.querySelector('[data-starmus-file-input]');
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            const file = fileInput.files[0];
            if (file) {
                store.dispatch({ type: "starmus/file-attached", file });
            }
        });
    }

    /* --- Offline banner dismiss --- */
    const dismissOfflineBtn = root.querySelector("[data-starmus-offline-dismiss]");
    if (dismissOfflineBtn) {
        dismissOfflineBtn.addEventListener("click", function () {
            if (el.offlineBanner) {
                el.offlineBanner.style.display = "none";
            }
        });
    }

    /* --- Offline queue badge --- */
    if (BUS) {
        BUS.subscribe("starmus/offline/queue_updated", (payload) => {
            const badge = root.querySelector("[data-starmus-queue-count]");
            if (badge) {
                badge.textContent = payload.count > 0 ? `${payload.count} queued` : "";
                badge.style.display = payload.count > 0 ? "inline" : "none";
            }
        });
    }

    /* --- Online/offline DOM events --- */
    window.addEventListener("online", () => render(store.getState(), el, i18n));
    window.addEventListener("offline", () => render(store.getState(), el, i18n));

    /* --- State subscription --- */
    store.dispatch({
        type: "starmus/init",
        payload: { instanceId: instId },
    });

    const unsubscribe = store.subscribe((state) => render(state, el, i18n));
    render(store.getState(), el, i18n);

    return unsubscribe;
}
