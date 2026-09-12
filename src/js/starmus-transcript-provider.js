/**
 * @file starmus-transcript-provider.js
 * @summary The live-transcript slot: provider-agnostic, one output contract.
 *
 * Governed by ADR-038. The capture UI does not own a transcription engine — it
 * owns a *slot* with a fixed output shape, so that swapping the engine behind
 * it is not a UI change. Browser speech recognition is the first provider
 * (Tier A, content in SR-supported languages); a future Yahura live provider
 * for African languages fills the same slot without rework here.
 *
 * Three things the output always carries, per ADR-038:
 *
 *   1. tokens;
 *   2. timestamps on the **original timeline** — there is exactly one timeline,
 *      the recording's own, and every downstream result maps to it (ADR-039);
 *   3. provenance naming the engine and the model version.
 *
 * And three things it is not:
 *
 *   - **Not the boundary mechanism of record.** Speech/silence boundaries are
 *     computed server-side by the Spoken Audio Node's VAD, for every recording,
 *     language and device tier. No provider here ever replaces that, and a
 *     provider being unavailable never means a recording has no boundaries.
 *   - **Not word-level alignment of record.** That is ESU's, from Yahura.
 *   - **Not acoustic analysis.** No pitch, formant, intensity or duration
 *     measurement happens in this package (ADR-036).
 *
 * What leaves here is a **lowest-authority machine draft**. It is a starting
 * point for human correction in ESU and is never treated as the transcript.
 *
 * The field names below are this package's own output shape, which ADR-038
 * assigns to the capture UI. They are not the Starmus<->ESU wire schema: that
 * seam's key names are owed jointly by both builders and are not guessed here.
 */

"use strict";

/**
 * Authority label carried on every draft. A consumer that cannot honour the
 * lowest-authority rule should ignore the draft rather than promote it.
 *
 * @type {string}
 */
export const TRANSCRIPT_AUTHORITY = "machine-draft";

/**
 * Default auto-disable bound for a running provider, in milliseconds.
 *
 * This is a sensor-safety bound — a provider left running because `stop()` was
 * never reached must not hold the microphone pipeline open indefinitely. It is
 * not an audio constraint and answers nothing in OQ-021.
 *
 * @type {number}
 */
export const DEFAULT_MAX_PROVIDER_MS = 3600000;

/**
 * Registered provider factories, in preference order.
 *
 * @type {Array<{name: string, create: Function}>}
 */
const providerFactories = [];

/**
 * Register a live-transcript provider.
 *
 * A factory returns a provider object:
 *
 *   {
 *     engine: string,          // e.g. 'browser-speech-recognition'
 *     model: string|null,      // engine's model/version identifier, or null
 *                              // when the engine does not expose one
 *     start(context): void,    // context.emit(segment), context.fail(error)
 *     stop(): void,
 *   }
 *
 * The factory returns `null` when it cannot run in the current environment.
 * Registering does not start anything.
 *
 * @param {string} name
 * @param {function(Object): (Object|null)} create
 * @returns {void}
 */
export function registerTranscriptProvider(name, create) {
    if (typeof create !== "function") {
        throw new Error("TRANSCRIPT_PROVIDER_INVALID: create must be a function");
    }
    const existing = providerFactories.findIndex((entry) => entry.name === name);
    if (existing >= 0) {
        providerFactories.splice(existing, 1);
    }
    providerFactories.unshift({ name, create });
}

/**
 * Remove every registered provider. Test and host-teardown helper.
 *
 * @returns {void}
 */
export function clearTranscriptProviders() {
    providerFactories.length = 0;
}

/* ---- Built-in provider: browser speech recognition (Tier A) ---- */

/**
 * Build a provider backed by the browser's SpeechRecognition API.
 *
 * The API reports no word timings, so this provider does not invent any. Each
 * segment is stamped from the recorder clock at the moment the result arrived
 * and marked `timing: 'approximate'`. Precise word boundaries are ESU's
 * (alignment) and speech/silence boundaries are the Node's (VAD); a plausible
 * looking number written here would be read downstream as measurement.
 *
 * @param {Object} options
 * @param {string} [options.language] BCP-47 tag passed to the engine.
 * @returns {Object|null} null when the API is unavailable.
 */
export function createBrowserSpeechProvider({ language } = {}) {
    if (typeof window === "undefined") {
        return null;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
        return null;
    }

    let recognition = null;

    return {
        engine: "browser-speech-recognition",
        // The Web Speech API exposes no model identifier. Reporting null is the
        // honest answer; a placeholder string would read as provenance.
        model: null,

        start(context) {
            recognition = new Recognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            if (language) {
                recognition.lang = language;
            }

            recognition.addEventListener("result", (event) => {
                for (let i = event.resultIndex; i < event.results.length; i += 1) {
                    const result = event.results[i];
                    const alternative = result[0];
                    if (!alternative || !alternative.transcript) {
                        continue;
                    }
                    context.emit({
                        text: alternative.transcript.trim(),
                        confidence:
                            typeof alternative.confidence === "number" &&
                            Number.isFinite(alternative.confidence)
                                ? alternative.confidence
                                : null,
                        isFinal: !!result.isFinal,
                    });
                }
            });

            recognition.addEventListener("error", (event) => {
                // `no-speech` and `aborted` are ordinary during a recording and
                // are not failures of the slot.
                if (event.error === "no-speech" || event.error === "aborted") {
                    return;
                }
                context.fail(new Error(`SPEECH_RECOGNITION_ERROR: ${event.error}`));
            });

            recognition.start();
        },

        stop() {
            if (!recognition) {
                return;
            }
            try {
                recognition.stop();
            } catch {
                // Already stopped by the engine; nothing to undo.
            }
            recognition = null;
        },
    };
}

registerTranscriptProvider("browser-speech-recognition", createBrowserSpeechProvider);

/* ---- The slot ---- */

/**
 * Open a live-transcript slot for one recording.
 *
 * @param {Object} options
 * @param {string} options.sessionId          Recorder instance id.
 * @param {function(): number} options.getElapsedMs
 *        Milliseconds since recording start — the original timeline. The slot
 *        never reads a wall clock: a client-supplied absolute timestamp is not
 *        an ordering authority, and the only timeline that exists here is the
 *        recording's own.
 * @param {string} [options.tier='C']         Resolved device tier.
 * @param {string} [options.language]         BCP-47 tag.
 * @param {number} [options.maxDurationMs]    Provider auto-disable bound.
 * @param {function(Object): void} [options.onUpdate] Called with the draft
 *        after every segment.
 * @returns {Object|null} The slot, or null when no provider can run — which is
 *          not an error: a recording without a live draft is complete.
 */
export function openTranscriptSlot({
    sessionId,
    getElapsedMs,
    tier = "C",
    language,
    maxDurationMs = DEFAULT_MAX_PROVIDER_MS,
    onUpdate,
}) {
    // Tier C is file upload only — no microphone, and so no live transcript.
    if (tier === "C") {
        return null;
    }
    if (typeof getElapsedMs !== "function") {
        throw new Error("TRANSCRIPT_SLOT_NO_CLOCK: getElapsedMs is required");
    }

    let provider = null;
    for (const factory of providerFactories) {
        provider = factory.create({ language, tier, sessionId });
        if (provider) {
            break;
        }
    }
    if (!provider) {
        return null;
    }

    const segments = [];
    let stopTimer = null;
    let running = false;
    let lastStartMs = 0;

    /**
     * @returns {Object} The draft in its current state.
     */
    function draft() {
        return {
            sessionId,
            authority: TRANSCRIPT_AUTHORITY,
            // Timestamps are offsets into the recording, never wall-clock.
            timeline: "original",
            language: language || null,
            provenance: { engine: provider.engine, model: provider.model },
            segments: segments.slice(),
        };
    }

    const context = {
        emit(segment) {
            if (!running) {
                return;
            }
            const endMs = Math.max(0, Math.round(getElapsedMs()));
            const tail = segments[segments.length - 1];
            // A trailing interim is provisional text for the utterance still
            // being spoken. Both a revised interim and the final result for
            // that same utterance replace it — appending instead would leave
            // the draft holding two readings of one stretch of speech, and the
            // interim one would carry a start time the final one needs.
            const supersedesInterim = !!tail && !tail.isFinal;
            const entry = {
                text: String(segment.text || ""),
                startMs: supersedesInterim ? tail.startMs : Math.min(lastStartMs, endMs),
                endMs,
                // The browser engine reports no word timings; the Node's VAD
                // holds boundaries of record and ESU holds alignment.
                timing: "approximate",
                confidence: segment.confidence ?? null,
                isFinal: !!segment.isFinal,
            };
            if (supersedesInterim) {
                segments[segments.length - 1] = entry;
            } else {
                segments.push(entry);
            }
            if (entry.isFinal) {
                lastStartMs = endMs;
            }
            if (onUpdate) {
                onUpdate(draft());
            }
        },

        fail(error) {
            // A provider failure ends the draft and nothing else. The recording
            // continues, and the Node still produces boundaries and — through
            // ESU — a transcript of record.
            console.warn("[Transcript] Provider failed:", error.message);
            stop();
        },
    };

    /**
     * Stop the provider and settle the draft.
     *
     * @returns {Object} The final draft.
     */
    function stop() {
        if (stopTimer) {
            clearTimeout(stopTimer);
            stopTimer = null;
        }
        if (running) {
            running = false;
            provider.stop();
        }
        // Interim text is not a draft; drop a trailing interim on settle.
        while (segments.length > 0 && !segments[segments.length - 1].isFinal) {
            segments.pop();
        }
        return draft();
    }

    return {
        /**
         * Start the provider.
         *
         * @returns {void}
         */
        start() {
            if (running) {
                return;
            }
            running = true;
            lastStartMs = Math.max(0, Math.round(getElapsedMs()));
            stopTimer = setTimeout(stop, maxDurationMs);
            provider.start(context);
        },
        stop,
        draft,
        /**
         * @returns {string} The concatenated final text, for display.
         */
        text() {
            return segments
                .filter((segment) => segment.isFinal)
                .map((segment) => segment.text)
                .join(" ")
                .trim();
        },
    };
}

/* ---- Browser global (separate bundle entry) ---- */

if (typeof window !== "undefined") {
    window.StarmusTranscript = {
        openTranscriptSlot,
        registerTranscriptProvider,
        clearTranscriptProviders,
        createBrowserSpeechProvider,
        TRANSCRIPT_AUTHORITY,
    };
}
