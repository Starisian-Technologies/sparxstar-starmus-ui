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
 * @deprecated SIRUS_REPLACEMENT_PENDING
 *
 * This file is a transitional shim for environment resolution.
 * It will be replaced by the Sirus context client
 * (starisian/sparxstar-sirus-context) in Phase 3.
 *
 * DO NOT add new functionality to this file.
 * DO NOT extend the API surface of this file.
 * DO NOT import this file from new modules.
 *
 * Existing callers: starmus-integrator.js, starmus-main.js
 * Replacement: SirusClientInterface from sparxstar-sirus-context
 *
 * See: https://github.com/Starisian-Technologies/sparxstar-sirus-context
 */

/**
 * @file starmus-sparxstar-integration.js
 * @version 7.1.5
 * @description Integration layer between Sparxstar UEC and the Starmus recorder.
 * Maps environment profiles to recorder tiers and manages data caching.
 * ACF/WordPress-admin bridge is handled by the consuming plugin, not this package.
 */

"use strict";

/**
 * SPARXSTAR integration object. Provides init, getEnvironmentData, reportError.
 * When the full Sirus/UEC platform is available on `window`, it delegates there.
 * Otherwise falls back to capability detection.
 *
 * @type {Object}
 */
export const sparxstarIntegration = {
    /**
     * Whether the integration layer is active.
     * @type {boolean}
     */
    isAvailable: true,

    /**
     * Cached battery reading for deferred uploads.
     * Updated by _readBattery if Battery API is available.
     * @type {{level: number, charging: boolean}|null}
     * @private
     */
    _battery: null,

    /**
     * Initialises integration and resolves environment data.
     *
     * @returns {Promise<Object>} Resolved environment payload
     */
    init() {
        this._readBattery();
        return Promise.resolve(this.getEnvironmentData());
    },

    /**
     * Returns current environment data.
     * Prefers STARMUS_BOOTSTRAP if injected by the server.
     *
     * @returns {Object} Environment payload with tier, network, recordingSettings
     */
    getEnvironmentData() {
        const bootstrap =
            typeof window !== "undefined" ? window.STARMUS_BOOTSTRAP : undefined;

        if (bootstrap && bootstrap.tier) {
            return {
                tier: bootstrap.tier,
                recordingSettings: bootstrap.tierConfig || { uploadChunkSize: 524288 },
                network: { type: "unknown" },
                device: {},
                browser: {},
            };
        }

        const hasMediaRecorder = typeof MediaRecorder !== "undefined";
        const hasGetUserMedia =
            typeof navigator !== "undefined" &&
            navigator.mediaDevices &&
            typeof navigator.mediaDevices.getUserMedia === "function";
        const hasAudioContext =
            typeof window !== "undefined" &&
            (typeof window.AudioContext === "function" ||
                typeof window.webkitAudioContext === "function");

        const fallbackTier = !hasMediaRecorder || !hasGetUserMedia ? "C" : hasAudioContext ? "A" : "B";

        return {
            tier: fallbackTier,
            recordingSettings: { uploadChunkSize: 524288 },
            network: { type: "unknown" },
            device: {},
            browser: {},
        };
    },

    /**
     * Reports integration errors to the console (and to Sirus when available).
     *
     * @param {string} msg - Error identifier
     * @param {Object} data - Supplemental error context
     * @returns {void}
     */
    reportError(msg, data) {
        console.warn("[SparxstarIntegration] Error:", msg, data);
        if (typeof window !== "undefined" && window.SirusError) {
            window.SirusError.report(msg, data);
        }
    },

    /**
     * Returns true when battery is below 20% and not charging.
     * Used by offline queue to defer uploads.
     *
     * @returns {boolean}
     */
    isBatteryCritical() {
        const b = this._battery;
        return b !== null && b.level < 0.2 && !b.charging;
    },

    /**
     * Reads battery status using the Battery API when available.
     * Result is cached in this._battery.
     *
     * @private
     * @returns {void}
     */
    _readBattery() {
        if (
            typeof navigator === "undefined" ||
            typeof navigator.getBattery !== "function"
        ) {
            return;
        }
        navigator.getBattery().then((battery) => {
            this._battery = { level: battery.level, charging: battery.charging };
            battery.addEventListener("levelchange", () => {
                this._battery = { level: battery.level, charging: battery.charging };
            });
            battery.addEventListener("chargingchange", () => {
                this._battery = { level: battery.level, charging: battery.charging };
            });
        });
    },
};

if (typeof window !== "undefined") {
    window.SparxstarIntegration = sparxstarIntegration;
}
