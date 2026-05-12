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
 * @file starmus-transcript-controller.js
 * @version 2.0.0
 * @description Karaoke-style transcript panel that synchronises word highlighting
 * with audio playback provided by a Peaks.js instance. Requires Peaks.js to be
 * loaded by the consuming plugin / editor page — this module only integrates with it.
 *
 * Features:
 * - Real-time word highlighting synchronised with audio playback
 * - Click-to-seek on individual word tokens
 * - Auto-scroll with intelligent user-scroll detection (1 s cooldown)
 * - Confidence indicators for low-accuracy transcription
 * - Binary search for O(log n) time-based word lookup
 * - Clean destroy() for memory management in SPA contexts
 */

"use strict";

/**
 * @typedef {Object} TranscriptToken
 * @property {string} text        - Word text content
 * @property {number} start       - Start time in seconds
 * @property {number} end         - End time in seconds
 * @property {number} [confidence] - Confidence score 0–1
 */

/**
 * Synchronised transcript controller.
 * Consumes a Peaks.js instance — does NOT load Peaks.js itself.
 */
export class StarmusTranscript {
    /**
     * @param {Object}            peaksInstance             - Peaks.js instance
     * @param {Object}            peaksInstance.player      - Peaks audio player
     * @param {function}          peaksInstance.player.seek - Seek to time (seconds)
     * @param {function}          peaksInstance.player.getMediaElement - Returns HTMLMediaElement
     * @param {string}            peaksInstance.instanceId  - Instance ID for event bus
     * @param {string}            containerId               - DOM element ID for transcript
     * @param {TranscriptToken[]} transcriptData            - Word timing array
     */
    constructor(peaksInstance, containerId, transcriptData) {
        this.peaks = peaksInstance;
        this.container = document.getElementById(containerId);
        this.data = Array.isArray(transcriptData) ? transcriptData : [];

        this.activeTokenIndex = -1;
        this.isUserScrolling = false;
        this.scrollTimeout = null;

        this.boundOnTimeUpdate = null;
        this.boundOnSeeked = null;
        this.boundOnClick = null;
        this.boundOnScroll = null;

        this._init();
    }

    /* ------------------------------------------------------------------
       Initialisation
       ------------------------------------------------------------------ */

    _init() {
        if (!this.container) {
            console.warn("[StarmusTranscript] Container not found — transcript sync disabled.");
            return;
        }
        this._render();
        this._bindEvents();
    }

    /* ------------------------------------------------------------------
       DOM rendering
       ------------------------------------------------------------------ */

    _render() {
        const frag = document.createDocumentFragment();
        this.data.forEach((token, idx) => {
            const span = document.createElement("span");
            span.textContent = token.text;
            span.className = "starmus-word";
            span.dataset.index = String(idx);
            span.dataset.start = String(token.start);
            span.dataset.end = String(token.end);

            if ("confidence" in token && token.confidence < 0.8) {
                span.dataset.confidence = "low";
                span.title = `Low confidence: ${Math.round(token.confidence * 100)}%`;
            }

            frag.appendChild(span);
            if (idx < this.data.length - 1) {
                frag.appendChild(document.createTextNode(" "));
            }
        });

        this.container.innerHTML = "";
        this.container.appendChild(frag);
        this.activeTokenIndex = -1;
    }

    /* ------------------------------------------------------------------
       Event binding
       ------------------------------------------------------------------ */

    _bindEvents() {
        /* Click-to-seek */
        this.boundOnClick = (e) => {
            const w = e.target;
            if (w.classList.contains("starmus-word")) {
                const start = parseFloat(w.dataset.start);
                if (this.peaks?.player?.seek) {
                    this.peaks.player.seek(start);

                    const bus = window.CommandBus || window.StarmusHooks;
                    if (bus?.dispatch) {
                        bus.dispatch(
                            "starmus/transcript/seek",
                            { time: start },
                            { instanceId: this.peaks.instanceId },
                        );
                    }
                }
            }
        };
        this.container.addEventListener("click", this.boundOnClick);

        /* Scroll detection — pause auto-scroll when user scrolls manually */
        this.boundOnScroll = () => {
            this.isUserScrolling = true;
            if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.isUserScrolling = false;
            }, 1000);
        };
        this.container.addEventListener("scroll", this.boundOnScroll);

        /* Audio sync via media element events */
        const media = this.peaks?.player?.getMediaElement?.();
        if (media?.addEventListener) {
            this.boundOnTimeUpdate = () => {
                if (typeof media.currentTime === "number" && !isNaN(media.currentTime)) {
                    this._syncHighlight(media.currentTime);
                }
            };
            this.boundOnSeeked = () => {
                if (typeof media.currentTime === "number" && !isNaN(media.currentTime)) {
                    this._syncHighlight(media.currentTime);
                }
            };
            media.addEventListener("timeupdate", this.boundOnTimeUpdate);
            media.addEventListener("seeked", this.boundOnSeeked);
        }
    }

    /* ------------------------------------------------------------------
       Highlight logic — binary search then O(1) DOM mutation
       ------------------------------------------------------------------ */

    /**
     * Binary search for the token active at `time`.
     * @param {number} time - Current playback position (seconds)
     * @returns {number} Index, or -1
     */
    _findTokenIndex(time) {
        if (typeof time !== "number" || this.data.length === 0) return -1;

        let low = 0;
        let high = this.data.length - 1;

        while (low <= high) {
            const mid = (low + high) >> 1;
            const token = this.data[mid];
            if (time >= token.start && time <= token.end) return mid;
            if (time < token.start) high = mid - 1;
            else low = mid + 1;
        }
        return -1;
    }

    _syncHighlight(currentTime) {
        const newIndex = this._findTokenIndex(currentTime);
        if (newIndex === -1) {
            this._clearHighlight();
        } else if (newIndex !== this.activeTokenIndex) {
            this._updateDOM(newIndex);
        }
    }

    _updateDOM(newIndex) {
        const words = this.container.querySelectorAll(".starmus-word");
        if (this.activeTokenIndex >= 0 && words[this.activeTokenIndex]) {
            words[this.activeTokenIndex].classList.remove("is-active");
        }
        this.activeTokenIndex = newIndex;
        const el = words[newIndex];
        if (el) {
            el.classList.add("is-active");
            if (!this.isUserScrolling) this._scrollToWord(el);
        }
    }

    _clearHighlight() {
        const prev = this.container.querySelector(".starmus-word.is-active");
        if (prev) prev.classList.remove("is-active");
        this.activeTokenIndex = -1;
    }

    _scrollToWord(el) {
        if (el.scrollIntoView) {
            el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }

    /* ------------------------------------------------------------------
       Public API
       ------------------------------------------------------------------ */

    /**
     * Replace transcript data and re-render the panel.
     * @param {TranscriptToken[]} newData
     */
    updateData(newData) {
        this.data = Array.isArray(newData) ? newData : [];
        this._render();
        this._unbindEvents();
        this._bindEvents();
    }

    /** Remove all event listeners. */
    _unbindEvents() {
        if (!this.container) return;
        if (this.boundOnClick) this.container.removeEventListener("click", this.boundOnClick);
        if (this.boundOnScroll) this.container.removeEventListener("scroll", this.boundOnScroll);

        const media = this.peaks?.player?.getMediaElement?.();
        if (media?.removeEventListener) {
            if (this.boundOnTimeUpdate)
                media.removeEventListener("timeupdate", this.boundOnTimeUpdate);
            if (this.boundOnSeeked)
                media.removeEventListener("seeked", this.boundOnSeeked);
        }
    }

    /**
     * Destroy instance: unbind all events, clear timeouts, empty DOM.
     */
    destroy() {
        this._unbindEvents();
        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        if (this.container) this.container.innerHTML = "";
        this.data = [];
        this.activeTokenIndex = -1;
        this.isUserScrolling = false;
    }
}

/**
 * Factory function.
 * @param {Object}            peaksInstance
 * @param {string}            containerId
 * @param {TranscriptToken[]} transcriptData
 * @returns {StarmusTranscript}
 */
export function init(peaksInstance, containerId, transcriptData) {
    return new StarmusTranscript(peaksInstance, containerId, transcriptData);
}

/* Global exposure for non-module contexts (WordPress wp_enqueue_script) */
if (typeof window !== "undefined") {
    window.StarmusTranscript = StarmusTranscript;
    window.StarmusTranscriptController = { StarmusTranscript, init };
}
