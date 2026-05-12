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
 * @file starmus-integrator.js
 * @version 7.0.0
 * @description Bridges Sparxstar UEC environment events into the Starmus store.
 * Normalises the raw UEC payload to the strict schema expected by the backend.
 * Also sets up the SpeechRecognition compatibility shim and an AudioContext
 * watchdog that resumes a suspended context on first user gesture.
 *
 * No Peaks.js dependency. Pure store integration.
 */

"use strict";

/**
 * Normalise a raw Sparxstar UEC payload into the schema expected by the
 * Starmus backend (`_starmus_env` field).
 *
 * @param {Object} raw  - Raw event detail from `sparxstar:environment-ready`
 * @returns {Object}    - Normalised environment object
 */
export function normaliseEnv(raw) {
    const tech = raw.technical || {};
    const rawTech = tech.raw || {};
    const profile = tech.profile || {};
    const idents = raw.identifiers || {};

    return {
        device: {
            ...(rawTech.device || {}),
            class: profile.deviceClass || "unknown",
            os: idents.deviceDetails?.os || {},
            userAgent: navigator.userAgent,
        },
        browser: {
            ...(rawTech.browser || {}),
            ...(idents.deviceDetails?.client || {}),
        },
        network: {
            ...(rawTech.network || {}),
            profile: profile.networkProfile || "unknown",
        },
        identifiers: {
            sessionId: idents.sessionId || raw.sessionId || "unknown",
            visitorId: idents.visitorId || raw.visitorId || "unknown",
            ip: idents.ipAddress || "0.0.0.0",
        },
        features: {
            battery: rawTech.battery || {},
            performance: rawTech.performance || {},
        },
        errors: [],
        fingerprint:
            raw.fingerprint || idents.fingerprint || idents.visitorId || "unknown",
    };
}

/**
 * Set up the SpeechRecognition cross-browser shim.
 * Logs availability so callers can gate speech-to-text UI.
 *
 * @returns {void}
 */
function setupSpeechRecognition() {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
        console.log("[StarmusIntegrator] Speech API missing (Tier B/C)");
        return;
    }
    window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
}

/**
 * Resume a suspended AudioContext on the first user gesture.
 * Complies with browser autoplay policies. Runs at most once.
 *
 * @returns {void}
 */
function setupAudioContextWatchdog() {
    document.addEventListener(
        "click",
        () => {
            try {
                const ctx = window.StarmusAudioContext;
                if (ctx && ctx.state === "suspended") {
                    ctx.resume();
                }
            } catch {
                /* intentionally empty */
            }
        },
        { once: true },
    );
}

/**
 * Listen for the Sparxstar UEC environment-ready event, normalise the
 * payload, and dispatch it into the Starmus store.
 *
 * @returns {void}
 */
function listenForEnvironmentReady() {
    window.addEventListener("sparxstar:environment-ready", (e) => {
        if (!window.StarmusStore) {
            return;
        }

        const normalised = normaliseEnv(e.detail || {});

        window.StarmusStore.dispatch({
            type: "starmus/env-update",
            payload: normalised,
        });
    });
}

/**
 * Initialise the Starmus integrator.
 * Must be called once at page load, after the Starmus store is ready.
 *
 * @returns {void}
 */
export function initIntegrator() {
    setupSpeechRecognition();
    setupAudioContextWatchdog();
    listenForEnvironmentReady();
}
