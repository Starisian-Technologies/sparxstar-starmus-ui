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
 * @file starmus-main.js
 * @version 7.2.0
 * @description Entry point for the Starmus audio recorder UI package.
 * Bootstraps the recorder: state store, UEC integration, core submission logic,
 * UI bindings, recorder engine, offline queue, and metadata sync.
 *
 * The prosody engine, transcript controller, and Peaks.js waveform are NOT
 * bundled here — they are loaded separately by the consuming plugin.
 */

"use strict";

import "./starmus-hooks.js";
import { createStore } from "./starmus-state-store.js";
import { initCore } from "./starmus-core.js";
import { initInstance as initUI } from "./starmus-ui.js";
import { initRecorder } from "./starmus-recorder.js";
import { initOffline, queueSubmission, getOfflineQueue } from "./starmus-offline.js";
import { initAutoMetadata } from "./starmus-metadata-auto.js";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";
import "./starmus-integrator.js";

/* --- Global error capture (Africa first: surface runtime errors clearly) --- */
(function () {
    const log = (type, data) => console.warn("[STARMUS RUNTIME]", type, data);

    window.addEventListener("error", (e) => {
        log("window.error", {
            message: e.message,
            file: e.filename,
            line: e.lineno,
            col: e.colno,
        });
    });

    window.addEventListener("unhandledrejection", (e) => {
        log("unhandledrejection", e.reason);
    });
})();

/**
 * Initialises a recorder instance from a form element.
 *
 * @param {Object} store - Runtime state store
 * @param {HTMLFormElement} recorderForm - Form with data-starmus-instance attribute
 * @param {string} instanceId - Instance identifier
 * @returns {void}
 */
function initRecorderInstance(store, recorderForm, instanceId) {
    console.log("[StarmusMain] Booting recorder for ID:", instanceId);

    recorderForm.addEventListener("submit", (e) => e.preventDefault());

    sparxstarIntegration
        .init()
        .then((environmentData) => {
            initCore(store, instanceId, environmentData);
            initUI(store, {}, instanceId);
            initRecorder(store, instanceId);
            initAutoMetadata(store, recorderForm, {});
        })
        .catch((error) => {
            console.warn("[StarmusMain] SPARXSTAR init failed, using fallback:", error);
            initCore(store, instanceId, {});
            initUI(store, {}, instanceId);
            initRecorder(store, instanceId);
            initAutoMetadata(store, recorderForm, {});
        });
}

/* --- Bootstrap on DOM ready --- */
document.addEventListener("DOMContentLoaded", () => {
    const bootstrap =
        typeof window !== "undefined" ? window.STARMUS_BOOTSTRAP : undefined;

    if (!bootstrap || typeof bootstrap !== "object") {
        console.warn("[StarmusMain] STARMUS_BOOTSTRAP missing. Runtime not initialised.");
        return;
    }

    try {
        const recorderForms = document.querySelectorAll("form[data-starmus-instance]");

        if (!recorderForms.length) {
            console.warn("[StarmusMain] No Starmus recorder form found.");
            return;
        }

        /* --- Store --- */
        const store = createStore();
        window.__STARMUS_RUNTIME_INSTANCE__ = store;
        window.StarmusStoreInstance = store;
        window.StarmusRuntime = window.StarmusRuntime || {};
        window.StarmusRuntime.store = store;

        initOffline().catch((error) => {
            console.warn("[StarmusMain] Offline queue unavailable, continuing:", error);
        });

        recorderForms.forEach((recorderForm, index) => {
            const rawInstanceId = recorderForm.getAttribute("data-starmus-instance");
            const instanceId = rawInstanceId || `starmus-instance-${index + 1}`;
            initRecorderInstance(store, recorderForm, instanceId);
        });
    } catch (e) {
        console.error("[StarmusMain] Boot failed:", e);
    }
});

/* --- Global API exports --- */
window.StarmusRecorder = window.StarmusRecorder || {};
window.StarmusRecorder.initRecorder = initRecorder;
window.StarmusTus = { queueSubmission };
window.StarmusOfflineQueue = getOfflineQueue;
window.SparxstarIntegration = sparxstarIntegration;
