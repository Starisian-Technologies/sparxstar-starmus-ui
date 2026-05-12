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
 * @file appmode/starmus-audio.js
 * @version 3.0.0
 * @description SmartAudioPlayer — optimised audio playback for recordings-list
 * views on low-end devices and unstable networks (Africa-first).
 *
 * Features:
 * - Network-aware source selection: Opus 24 kbps on slow networks, MP3 fallback
 * - Hardware-aware tier detection: skips Web Audio API on devices < 4 GB RAM
 * - Lazy AudioContext initialisation (autoplay policy compliance)
 * - Broadcast-safe gentle levelling via DynamicsCompressor
 * - Memory-safe destroy() for SPA contexts
 *
 * Usage:
 *   const player = new SmartAudioPlayer({ debug: false });
 *   await player.play({ opus: 'url.webm', low: 'url_32k.mp3', high: 'url_128k.mp3' });
 *   player.pause();
 *   player.destroy(); // cleanup before unmount
 */

"use strict";

/**
 * @typedef {Object} AudioSources
 * @property {string} [opus] - Opus / WebM URL (most efficient on 2G/3G)
 * @property {string} [low]  - Low-quality MP3 (32 kbps)
 * @property {string} [high] - High-quality MP3 (128 kbps)
 */

/**
 * @typedef {Object} PlayerConfig
 * @property {number}  [lowMemoryLimit=4] - GB of RAM to treat as low-end
 * @property {number}  [lowCoreLimit=4]   - CPU cores to treat as low-end
 * @property {boolean} [debug=false]      - Enable console logging
 */

export class SmartAudioPlayer {
    /**
     * @param {PlayerConfig} [config]
     */
    constructor(config = {}) {
        this._cfg = {
            lowMemoryLimit: 4,
            lowCoreLimit: 4,
            debug: false,
            ...config,
        };

        this._audioContext = null;
        this._sourceNode = null;
        this._compressor = null;
        this._destroyed = false;

        this._el = new Audio();
        this._el.crossOrigin = "anonymous";
        this._el.loop = false;

        this._isLowEnd = this._detectLowEnd();
        this._canOpus =
            this._el
                .canPlayType('audio/webm; codecs="opus"')
                .replace(/^no$/, "") !== "";

        /* Reduce data usage on low-end / data-saver devices */
        this._el.preload = this._isLowEnd ? "none" : "metadata";
    }

    /* ------------------------------------------------------------------
       Device tier detection
       ------------------------------------------------------------------ */

    _detectLowEnd() {
        if (
            navigator.deviceMemory &&
            navigator.deviceMemory < this._cfg.lowMemoryLimit
        ) {
            return true;
        }
        if (
            navigator.hardwareConcurrency &&
            navigator.hardwareConcurrency < this._cfg.lowCoreLimit
        ) {
            return true;
        }
        const conn =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;
        if (conn?.saveData) return true;
        return false;
    }

    /* ------------------------------------------------------------------
       Source selection
       ------------------------------------------------------------------ */

    /**
     * Choose the best URL given current network conditions.
     * @param {AudioSources} sources
     * @returns {string}
     */
    _getOptimalSource(sources) {
        const conn =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        const isSlow =
            conn &&
            (conn.saveData || (conn.effectiveType && /2g/.test(conn.effectiveType)));

        if (isSlow && this._canOpus && sources.opus) return sources.opus;
        if (isSlow && sources.low) return sources.low;
        return sources.high || sources.low || sources.opus || "";
    }

    /* ------------------------------------------------------------------
       Web Audio enhancement (lazy init, capable devices only)
       ------------------------------------------------------------------ */

    _initEnhancedAudio() {
        if (this._audioContext || this._destroyed) return;

        try {
            const AudioCtx =
                window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            this._audioContext = new AudioCtx();
            if (!this._sourceNode) {
                this._sourceNode =
                    this._audioContext.createMediaElementSource(this._el);
            }

            /* Gentle broadcast levelling — preserves dynamic range */
            this._compressor = this._audioContext.createDynamicsCompressor();
            const t = this._audioContext.currentTime;
            this._compressor.threshold.setValueAtTime(-24, t);
            this._compressor.knee.setValueAtTime(30, t);
            this._compressor.ratio.setValueAtTime(4, t);
            this._compressor.attack.setValueAtTime(0.003, t);
            this._compressor.release.setValueAtTime(0.25, t);

            this._sourceNode.connect(this._compressor);
            this._compressor.connect(this._audioContext.destination);

            this._log("Enhanced audio pipeline active.");
        } catch (e) {
            this._log("Web Audio init failed; using standard playback.", e);
        }
    }

    /* ------------------------------------------------------------------
       Public API
       ------------------------------------------------------------------ */

    /**
     * Start playback. Selects the best source automatically.
     * @param {AudioSources} sources
     * @returns {Promise<void>}
     */
    async play(sources) {
        if (this._destroyed) {
            console.warn("[SmartAudioPlayer] Cannot play: player has been destroyed.");
            return;
        }

        const url = this._getOptimalSource(sources);
        if (!url) {
            console.warn("[SmartAudioPlayer] No valid source URL.");
            return;
        }

        if (this._el.src !== url) this._el.src = url;

        try {
            await this._el.play();

            if (!this._isLowEnd) {
                this._initEnhancedAudio();
                if (this._audioContext?.state === "suspended") {
                    await this._audioContext.resume();
                }
            }
        } catch (err) {
            this._log("Primary source failed; attempting fallback…", err);

            const fallback = sources.low || sources.opus;
            if (fallback && this._el.src !== fallback) {
                this._el.src = fallback;
                this._el.load();
                try {
                    await this._el.play();
                } catch (fallbackErr) {
                    console.error("[SmartAudioPlayer] Critical failure:", fallbackErr);
                }
            }
        }
    }

    /** Pause playback and suspend AudioContext to save battery. */
    pause() {
        if (this._destroyed) return;
        this._el.pause();
        if (this._audioContext?.state === "running") {
            this._audioContext.suspend();
        }
    }

    /**
     * Release all resources. Must be called before unmounting in SPA contexts.
     */
    destroy() {
        this._destroyed = true;
        this.pause();

        if (this._audioContext && this._audioContext.state !== "closed") {
            this._audioContext.close();
        }

        this._el.src = "";
        this._el.load();

        try {
            this._sourceNode?.disconnect();
        } catch {
            /* intentionally empty */
        }

        this._audioContext = null;
        this._sourceNode = null;
        this._compressor = null;

        this._log("Player destroyed.");
    }

    /* ------------------------------------------------------------------
       Internal
       ------------------------------------------------------------------ */

    _log(...args) {
        if (this._cfg.debug) console.log("[SmartAudioPlayer]", ...args);
    }
}

/* Global exposure for consuming WordPress themes */
if (typeof window !== "undefined") {
    window.SmartAudioPlayer = SmartAudioPlayer;
}
