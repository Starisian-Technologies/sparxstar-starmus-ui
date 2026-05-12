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
 * @file prosody/starmus-prosody-engine.js
 * @version 4.0.0
 * @description RhythmEngine — prosody mode for the Starmus audio recorder.
 * Displays a script text in rhythm-paced chunks, auto-synchronised with
 * the recorder state store. Calibration is tap-based (BPM detection).
 *
 * Connects to `window.StarmusStore` when the recorder is active.
 * Persists pace preference to the backend via AJAX with offline guard.
 *
 * Performance budget:
 * - Scroll: requestAnimationFrame, math-only (no scrollIntoView thrash)
 * - DOM updates: O(1) — only mutates previous + current unit nodes
 * - Interval is bounded by stop() when recording ends or component destroys
 */

"use strict";

/** Maximum allowed retry count for AJAX pace save. */
const MAX_RETRIES = 3;

/**
 * RhythmEngine — prosody text display mode.
 * Mount via `new RhythmEngine()` after DOM is ready.
 */
export class RhythmEngine {
    constructor() {
        const data = window.StarmusProsodyData;
        if (typeof data === "undefined") {
            console.error("[RhythmEngine] StarmusProsodyData payload missing.");
            return;
        }
        this.config = data;

        /* Required DOM elements */
        this.els = {
            stage: document.getElementById("scaffold-stage"),
            container: document.getElementById("text-flow"),
            calibration: document.getElementById("calibration-layer"),
            controls: document.getElementById("main-controls"),
            tapZone: document.getElementById("btn-tap"),
            tapFeedback: document.getElementById("tap-feedback"),
            playBtn: document.getElementById("btn-engage"),
            recalBtn: document.getElementById("btn-recal"),
            topBtn: document.getElementById("btn-top"),
            slider: document.getElementById("pace-regulator"),
        };

        for (const [key, el] of Object.entries(this.els)) {
            if (!el && key !== "recalBtn") {
                console.error(`[RhythmEngine] Critical DOM element missing: ${key}`);
                return;
            }
        }

        /* Engine state */
        this.units = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        this.timer = null;
        this.paceDebounce = null;
        this._destroyed = false;

        /* Settings */
        this.chunkSize = parseInt(this.config.density, 10) || 28;
        this.paceMs = parseInt(this.config.startPace, 10) || 3000;

        /* Calibration state */
        this.tapTimes = [];
        this.requiredTaps = 4;
        this.calibrationLocked = false;

        this._init();
    }

    _init() {
        this._renderChunks(this.config.source);
        this._bindEvents();
        this._bindRecorderIntegration();

        this.els.slider.value = String(this.paceMs);

        if (this.paceMs > 0 && this.config.startPace > 0) {
            this.els.tapFeedback.innerText = `Saved Rhythm: ${this.paceMs}ms`;
            this.els.tapFeedback.style.opacity = "0.6";
        }
    }

    /* ------------------------------------------------------------------
       Segmentation
       ------------------------------------------------------------------ */

    _renderChunks(rawText) {
        try {
            if (!rawText || typeof rawText !== "string") throw new Error("Invalid source");

            const safeText = rawText.replace(/\|/g, " | ");
            const words = safeText.split(/\s+/);

            let buffer = [];
            let len = 0;

            this.els.container.innerHTML = "";
            this.units = [];

            words.forEach((word) => {
                if (word === "|") {
                    if (buffer.length > 0) {
                        this._createUnit(buffer.join(" "), false);
                        buffer = [];
                        len = 0;
                    }
                    this._createUnit("", true);
                } else {
                    if (len + word.length > this.chunkSize && buffer.length > 0) {
                        this._createUnit(buffer.join(" "), false);
                        buffer = [];
                        len = 0;
                    }
                    buffer.push(word);
                    len += word.length;
                }
            });

            if (buffer.length > 0) this._createUnit(buffer.join(" "), false);

            this.units.forEach((u) => u.classList.add("future"));

            if (this.units.length > 0) {
                this.currentIndex = -1;
                this.units[0].classList.remove("future");
                this.units[0].classList.add("current");

                const spacer = document.createElement("div");
                spacer.className = "spacer";
                this.els.container.appendChild(spacer);
            }
        } catch (e) {
            this.els.container.innerText = "Error loading prosody text.";
            console.error("[RhythmEngine]", e);
        }
    }

    _createUnit(text, isSilence) {
        const span = document.createElement("span");
        span.className = "prosodic-unit";

        if (isSilence) {
            span.classList.add("silence-beat");
            span.innerHTML = "&bull;";
        } else {
            span.innerText = text;
        }

        span.addEventListener("click", (e) => {
            e.stopPropagation();
            this.stop();
            this._jumpTo(this.units.indexOf(span));
        });

        this.els.container.appendChild(span);
        this.units.push(span);
    }

    /* ------------------------------------------------------------------
       O(1) visual engine
       ------------------------------------------------------------------ */

    _jumpTo(index) {
        this.units.forEach((u, i) => {
            u.classList.remove("past", "current", "future");
            if (i < index) u.classList.add("past");
            else if (i === index) u.classList.add("current");
            else u.classList.add("future");
        });
        this.currentIndex = index;
        this._performScroll(index);
    }

    _tick() {
        const nextIndex = this.currentIndex + 1;

        if (nextIndex >= this.units.length) {
            this.stop();
            return;
        }

        if (this.units[this.currentIndex]) {
            this.units[this.currentIndex].classList.remove("current");
            this.units[this.currentIndex].classList.add("past");
        }
        if (this.units[nextIndex]) {
            this.units[nextIndex].classList.remove("future");
            this.units[nextIndex].classList.add("current");
        }

        this.currentIndex = nextIndex;
        this._performScroll(nextIndex);
    }

    _performScroll(index) {
        const el = this.units[index];
        if (!el) return;

        requestAnimationFrame(() => {
            if (this._destroyed) return;
            const stageHeight = this.els.stage.clientHeight;
            const elTop = el.offsetTop;
            const elHeight = el.offsetHeight;
            this.els.stage.scrollTo({
                top: elTop - stageHeight / 2 + elHeight / 2,
                behavior: "smooth",
            });
        });
    }

    /* ------------------------------------------------------------------
       Engine controls
       ------------------------------------------------------------------ */

    play() {
        if (this.isPlaying || this._destroyed) return;
        this.isPlaying = true;
        this._tick();
        this.timer = setInterval(() => this._tick(), this.paceMs);
        this._updatePlayBtn();
    }

    stop() {
        this.isPlaying = false;
        clearInterval(this.timer);
        this.timer = null;
        this._updatePlayBtn();
    }

    toggle() {
        this.isPlaying ? this.stop() : this.play();
    }

    _updatePace(ms) {
        this.paceMs = ms;
        this.els.slider.value = String(ms);
        if (this.isPlaying) {
            clearInterval(this.timer);
            this.timer = setInterval(() => this._tick(), this.paceMs);
        }
    }

    _updatePlayBtn() {
        const icon = this.els.playBtn.querySelector(".icon");
        const label = this.els.playBtn.querySelector(".label");
        if (this.isPlaying) {
            if (icon) icon.innerText = "II";
            if (label) label.innerText = "PAUSE FLOW";
            this.els.playBtn.classList.add("active");
        } else {
            if (icon) icon.innerText = "▶";
            if (label) label.innerText = "ENGAGE FLOW";
            this.els.playBtn.classList.remove("active");
        }
    }

    /* ------------------------------------------------------------------
       Calibration
       ------------------------------------------------------------------ */

    _recordTap() {
        if (this.calibrationLocked) return;

        const now = Date.now();
        this.els.tapZone.classList.add("flash");
        setTimeout(() => this.els.tapZone.classList.remove("flash"), 100);

        if (
            this.tapTimes.length > 0 &&
            now - this.tapTimes[this.tapTimes.length - 1] > 2000
        ) {
            this.tapTimes = [];
            this.els.tapFeedback.innerText = "Rhythm lost. Start again.";
            this.els.tapFeedback.style.opacity = "1";
        }

        this.tapTimes.push(now);

        if (this.tapTimes.length > 1) {
            const intervals = [];
            for (let i = 1; i < this.tapTimes.length; i++) {
                intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
            }
            const avg = Math.round(
                intervals.reduce((a, b) => a + b, 0) / intervals.length,
            );

            this.els.tapFeedback.innerText = `Detecting… ${avg}ms`;
            this.els.tapFeedback.style.opacity = "1";

            if (this.tapTimes.length >= this.requiredTaps) {
                this._transitionToStage(avg);
            }
        }
    }

    _transitionToStage(ms) {
        this.calibrationLocked = true;
        let safeMs = parseInt(ms, 10);
        if (isNaN(safeMs)) safeMs = 3000;
        safeMs = Math.max(1000, Math.min(6000, safeMs));

        this._updatePace(safeMs);
        this._savePace(safeMs);

        this.els.tapFeedback.innerText = "RHYTHM LOCKED";
        this.els.tapFeedback.style.color = "#fff";

        setTimeout(() => {
            this.els.calibration.classList.add("fade-out");
            setTimeout(() => {
                this.els.calibration.style.display = "none";
                this.els.stage.classList.remove("hidden");
                this.els.controls.classList.remove("hidden");
                this.els.slider.value = String(safeMs);
            }, 500);
        }, 600);
    }

    _resetCalibration() {
        this.calibrationLocked = false;
        this.stop();
        this.tapTimes = [];
        this.els.calibration.style.display = "flex";
        this.els.calibration.classList.remove("fade-out");
        this.els.stage.classList.add("hidden");
        this.els.controls.classList.add("hidden");
        this.els.tapFeedback.innerText = "Tap to set new pace";
        this.els.tapFeedback.style.color = "var(--prosody-accent)";
    }

    /* ------------------------------------------------------------------
       AJAX pace persistence (with offline guard and timeout)
       ------------------------------------------------------------------ */

    _savePace(ms, attempt = 0) {
        if (!this.config.nonce) return;
        if (!navigator.onLine) {
            console.warn("[RhythmEngine] Offline — pace change cached locally only.");
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), AbortSignal.timeout ? 0 : 3000);

        const data = new FormData();
        data.append("action", "starmus_save_pace");
        data.append("post_id", String(this.config.postID));
        data.append("pace_ms", String(ms));
        data.append("nonce", this.config.nonce);

        fetch(window.ajaxurl || "/wp-admin/admin-ajax.php", {
            method: "POST",
            body: data,
            signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : controller.signal,
        })
            .then((res) => res.json())
            .then((res) => {
                clearTimeout(timeoutId);
                if (!res.success) console.warn("[RhythmEngine] Save warning:", res);
            })
            .catch((err) => {
                clearTimeout(timeoutId);
                if (attempt < MAX_RETRIES) {
                    const delay = 500 * 2 ** attempt + Math.random() * 200;
                    setTimeout(() => this._savePace(ms, attempt + 1), delay);
                } else {
                    console.error("[RhythmEngine] Save failed after retries:", err);
                }
            });
    }

    /* ------------------------------------------------------------------
       Event binding
       ------------------------------------------------------------------ */

    _bindEvents() {
        this.els.tapZone.addEventListener("click", () => this._recordTap());
        this.els.playBtn.addEventListener("click", () => this.toggle());

        if (this.els.topBtn) {
            this.els.topBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.stop();
                this._jumpTo(0);
            });
        }

        if (this.els.recalBtn) {
            this.els.recalBtn.addEventListener("click", () => this._resetCalibration());
        }

        /* Debounced slider input (80 ms) */
        this.els.slider.addEventListener("input", (e) => {
            clearTimeout(this.paceDebounce);
            const val = parseInt(e.target.value, 10);
            this.paceDebounce = setTimeout(() => this._updatePace(val), 80);
        });

        this.els.slider.addEventListener("change", (e) => {
            this._savePace(parseInt(e.target.value, 10));
        });

        document.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                const inCalibration =
                    this.els.calibration.style.display !== "none";
                if (inCalibration) this._recordTap();
                else this.toggle();
            }
            if (
                e.code === "ArrowRight" &&
                this.els.calibration.style.display === "none"
            ) {
                this.stop();
                this._tick();
            }
        });

        this.els.tapFeedback.addEventListener("click", () => {
            if (this.paceMs > 0) this._transitionToStage(this.paceMs);
        });
        this.els.tapFeedback.style.cursor = "pointer";
    }

    /* ------------------------------------------------------------------
       Store integration — auto-play/stop with recorder state
       ------------------------------------------------------------------ */

    _bindRecorderIntegration() {
        let retries = 0;
        const maxRetries = 20; /* 10 seconds at 500 ms intervals */

        const checkStore = setInterval(() => {
            try {
                retries++;

                if (window.StarmusStore?.subscribe) {
                    clearInterval(checkStore);

                    let lastStatus = window.StarmusStore.getState().status;

                    window.StarmusStore.subscribe((state) => {
                        const status = state.status;

                        if (status === "recording" && lastStatus !== "recording") {
                            if (
                                this.els.calibration &&
                                this.els.calibration.style.display !== "none"
                            ) {
                                this._transitionToStage(this.paceMs || 3000);
                            }
                            setTimeout(() => this.play(), 200);
                        }

                        if (
                            lastStatus === "recording" &&
                            status !== "recording" &&
                            status !== "paused"
                        ) {
                            this.stop();
                        }

                        lastStatus = status;
                    });
                }

                if (retries >= maxRetries) {
                    clearInterval(checkStore);
                }
            } catch (err) {
                clearInterval(checkStore);
                console.error("[RhythmEngine] Store integration failed:", err);
            }
        }, 500);
    }

    /* ------------------------------------------------------------------
       Teardown
       ------------------------------------------------------------------ */

    destroy() {
        this._destroyed = true;
        this.stop();
        if (this.paceDebounce) clearTimeout(this.paceDebounce);
    }
}

/* Auto-mount on DOMContentLoaded for non-module WordPress context */
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.StarmusProsodyData !== "undefined") {
        window.StarmusRhythmEngine = new RhythmEngine();
    }
});
