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
 * How many times the slot restarts an engine that ended on its own.
 *
 * Browser speech recognition ends spontaneously, so some restarting is
 * ordinary. An unbounded loop against an engine that will never work is not:
 * it holds the microphone pipeline open and produces nothing. After this many
 * the draft settles and says so.
 *
 * @type {number}
 */
export const MAX_PROVIDER_RESTARTS = 5;

/**
 * The device tiers this package knows.
 *
 * A value outside this set is a caller error, not a tier to interpret.
 *
 * @type {readonly string[]}
 */
export const SUPPORTED_TIERS = Object.freeze(["A", "B", "C"]);

/**
 * How long `stop()` waits for the engine's closing result before settling.
 *
 * The engine delivers a final result for audio it already heard after being
 * asked to stop. This bounds the wait so an engine that never reports ending
 * does not hold the draft open.
 *
 * @type {number}
 */
export const SETTLE_GRACE_MS = 2000;

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
 *     tokenGranularity?: 'word'|'utterance',  // defaults to 'utterance'
 *     start(context): void,    // context.emit(segment)
 *                              // context.fail(error)
 *                              // context.ended(reason) — the engine stopped
 *                              //   producing, whether asked to or not
 *     stop(): void,            // ask the engine to finish; it may still
 *                              //   deliver one last final result afterwards
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
    let stopping = false;

    return {
        engine: "browser-speech-recognition",
        // The Web Speech API exposes no model identifier. Reporting null is the
        // honest answer; a placeholder string would read as provenance.
        model: null,
        // The engine emits whole utterances, not words.
        tokenGranularity: "utterance",

        start(context) {
            stopping = false;
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
                // are not failures of the slot. The `end` that follows them is
                // handled below, so the slot is never left believing a dead
                // engine is still listening.
                if (event.error === "no-speech" || event.error === "aborted") {
                    return;
                }
                context.fail(new Error(`SPEECH_RECOGNITION_ERROR: ${event.error}`));
            });

            // The engine ends on its own — after a silence, after an error it
            // recovered from, and on some platforms simply after a while. It
            // also ends because we asked. Only the slot can tell those apart,
            // so both are reported and it decides.
            recognition.addEventListener("end", () => {
                context.ended(stopping ? "stopped" : "engine-ended");
            });

            recognition.start();
        },

        stop() {
            if (!recognition) {
                return;
            }
            stopping = true;
            try {
                // `stop()` rather than `abort()`: it asks the engine to finish
                // and deliver a final result for what it has already heard.
                // `abort()` would discard the last utterance of the recording.
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
 * @param {string} options.tier              Resolved device tier. Required, and
 *        deliberately without a default: `'C'` would silently deny the slot to
 *        a caller that forgot to pass one, and `'A'` would silently open the
 *        microphone pipeline for one. The tier is resolved at initialization
 *        and the caller knows it.
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
    tier,
    language,
    maxDurationMs = DEFAULT_MAX_PROVIDER_MS,
    onUpdate,
}) {
    // Validated against the model, not merely checked for emptiness. Rejecting
    // only `""` let `'c'` or `'D'` past the Tier C guard below and open a
    // provider for a tier that does not exist — failing open on the one
    // decision that says whether a microphone surface is permitted at all.
    if (!SUPPORTED_TIERS.includes(tier)) {
        throw new Error(
            `TRANSCRIPT_SLOT_BAD_TIER: tier must be one of ${SUPPORTED_TIERS.join(", ")}; received ${JSON.stringify(tier)}. ` +
                "It decides whether a microphone surface exists at all, and this slot does not guess it.",
        );
    }
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

    // ADR-038 says the output carries tokens. What a token *is* depends on the
    // engine: browser speech recognition emits whole utterances, and a future
    // Yahura live provider is expected to emit words. Calling an utterance a
    // word token would misdescribe it, and dropping the field would leave a
    // consumer unable to tell which it received — so the granularity travels
    // with the draft and defaults to the weaker claim.
    const tokenGranularity = provider.tokenGranularity === "word" ? "word" : "utterance";

    const segments = [];
    let stopTimer = null;
    let settleTimer = null;
    let running = false;
    let stopping = false;
    let restarts = 0;
    let lastStartMs = 0;
    /** @type {Function|null} Resolves the promise `stop()` handed out. */
    let resolveSettled = null;
    /** @type {Promise<Object>|null} The one promise every `stop()` caller gets. */
    let pendingStop = null;

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
            tokenGranularity,
            segments: segments.slice(),
        };
    }

    const context = {
        emit(segment) {
            // Accepted while stopping as well as while running: the engine
            // delivers a final result for the audio it already heard *after*
            // being asked to stop, and refusing it here dropped the last
            // utterance of every recording.
            if (!running && !stopping) {
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
            void stop();
        },

        /**
         * The engine stopped producing.
         *
         * @param {string} reason 'stopped' when it was asked to, anything else
         *        when it ended on its own.
         */
        ended(reason) {
            if (stopping) {
                // The final result, if there was one, has arrived by now.
                settle();
                return;
            }
            if (!running) {
                return;
            }

            // Browser speech recognition ends by itself — after a silence,
            // after a recovered error, or just after a while. Left unhandled
            // the slot sat marked running with nothing arriving until the
            // one-hour sensor bound fired, which looks exactly like a
            // recording with no speech in it.
            if (restarts < MAX_PROVIDER_RESTARTS) {
                restarts += 1;
                try {
                    provider.start(context);
                    return;
                } catch (error) {
                    console.warn("[Transcript] Provider would not restart:", error.message);
                }
            }

            console.warn(
                `[Transcript] Provider ended (${reason}) and will not be restarted; settling the draft.`,
            );
            stopping = true;
            settle();
        },
    };

    /**
     * Finish: drop any trailing interim, and hand the draft to whoever is
     * waiting on `stop()`.
     *
     * @returns {void}
     */
    function settle() {
        if (settleTimer) {
            clearTimeout(settleTimer);
            settleTimer = null;
        }
        // The auto-disable timer as well. `settle()` is reachable from
        // `ended()` without going through `stop()`, and a timer left armed
        // there outlives the run: start the slot again and the old callback
        // stops the new provider and clears the new timer.
        if (stopTimer) {
            clearTimeout(stopTimer);
            stopTimer = null;
        }
        running = false;
        stopping = false;
        // Interim text is not a draft; drop a trailing interim on settle.
        while (segments.length > 0 && !segments[segments.length - 1].isFinal) {
            segments.pop();
        }
        if (resolveSettled) {
            const resolve = resolveSettled;
            resolveSettled = null;
            pendingStop = null;
            resolve(draft());
        }
    }

    /**
     * Stop the provider and settle the draft.
     *
     * Asynchronous because the engine's last final result arrives after it is
     * asked to stop. Settling synchronously discarded the closing utterance of
     * every recording. The wait is bounded: an engine that never reports it has
     * ended does not hold the draft open.
     *
     * @returns {Promise<Object>} The final draft.
     */
    function stop() {
        if (stopTimer) {
            clearTimeout(stopTimer);
            stopTimer = null;
        }
        if (!running && !stopping) {
            return Promise.resolve(draft());
        }

        // One promise for however many callers ask to stop. Minting a new one
        // per call overwrote `resolveSettled`, so an earlier caller — the
        // auto-disable timer racing a host's stop, say — was left holding a
        // promise nothing would ever resolve.
        if (pendingStop) {
            // A stop is already in flight. Hand back the same promise and do
            // not ask the provider to stop twice: a second `stop()` on a
            // browser engine mid-shutdown is at best ignored and at worst
            // discards the closing result the first one is waiting for.
            return pendingStop;
        }
        pendingStop = new Promise((resolve) => {
            resolveSettled = resolve;
        });
        const settled = pendingStop;

        stopping = true;
        running = false;
        try {
            provider.stop();
        } catch (error) {
            console.warn("[Transcript] Provider would not stop cleanly:", error.message);
            settle();
            return settled;
        }

        // Only if the provider has not already settled us. A provider may call
        // `context.ended()` synchronously from `stop()`, and arming the grace
        // timer afterwards left a stale timer that would settle the *next* run.
        if (resolveSettled !== null && settleTimer === null) {
            settleTimer = setTimeout(settle, SETTLE_GRACE_MS);
        }
        return settled;
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
            stopping = false;
            restarts = 0;
            pendingStop = null;
            resolveSettled = null;
            lastStartMs = Math.max(0, Math.round(getElapsedMs()));
            stopTimer = setTimeout(() => void stop(), maxDurationMs);
            try {
                provider.start(context);
            } catch (error) {
                // A provider that throws on the way up would otherwise leave
                // the slot marked running with its auto-disable timer armed:
                // every later start() would no-op and the sensor bound would
                // fire against a provider that never started.
                void stop();
                console.warn("[Transcript] Provider failed to start:", error.message);
            }
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
