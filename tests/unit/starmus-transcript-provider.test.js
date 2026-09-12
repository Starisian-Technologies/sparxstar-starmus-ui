/**
 * @file starmus-transcript-provider.test.js
 * @description The live-transcript slot's output contract (ADR-038): tokens,
 * timestamps on the original timeline, and provenance naming engine and model.
 * Run with `pnpm run test:unit` (node:test — no runner dependency).
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
    MAX_PROVIDER_RESTARTS,
    TRANSCRIPT_AUTHORITY,
    clearTranscriptProviders,
    openTranscriptSlot,
    registerTranscriptProvider,
} from "../../src/js/starmus-transcript-provider.js";

/**
 * A provider that hands its emit context back to the test.
 *
 * @param {Object} [options]
 * @returns {{provider: Object, captured: Object}}
 */
function stubProvider({
    engine = "stub-engine",
    model = "stub-1.2",
    tokenGranularity,
    throwOnStart = false,
} = {}) {
    const captured = { context: null, started: 0, stopped: 0 };
    registerTranscriptProvider("stub", () => ({
        engine,
        model,
        ...(tokenGranularity === undefined ? {} : { tokenGranularity }),
        start(context) {
            captured.context = context;
            captured.started += 1;
            if (throwOnStart) {
                throw new Error("provider blew up on the way up");
            }
        },
        stop() {
            captured.stopped += 1;
            // A real engine reports `end` after being asked to stop, usually
            // after one last final result. The stub does the same so the tests
            // exercise the path production takes.
            if (captured.context && !captured.suppressEnd) {
                captured.context.ended("stopped");
            }
        },
    }));
    return captured;
}

test("Tier C opens no slot — no microphone means no live draft", () => {
    clearTranscriptProviders();
    stubProvider();
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "C",
    });
    assert.equal(slot, null);
});

test("no registered provider is not an error — the slot is simply absent", () => {
    clearTranscriptProviders();
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    assert.equal(slot, null);
});

test("a slot without a recording clock is refused", () => {
    clearTranscriptProviders();
    stubProvider();
    assert.throws(
        () => openTranscriptSlot({ sessionId: "s1", tier: "A" }),
        /TRANSCRIPT_SLOT_NO_CLOCK/,
    );
});

test("a tier outside the model is refused, not interpreted", () => {
    clearTranscriptProviders();
    stubProvider();
    for (const tier of [undefined, "", "c", "D", "tier-a", 1]) {
        assert.throws(
            () => openTranscriptSlot({ sessionId: "s1", getElapsedMs: () => 0, tier }),
            /TRANSCRIPT_SLOT_BAD_TIER/,
            `${JSON.stringify(tier)} must not open a slot`,
        );
    }
    // Lowercase 'c' must not sneak past the Tier C guard and open a provider.
    assert.throws(
        () => openTranscriptSlot({ sessionId: "s1", getElapsedMs: () => 0, tier: "c" }),
        /TRANSCRIPT_SLOT_BAD_TIER/,
    );
});

test("the draft says what a token is, and never overclaims word granularity", async () => {
    clearTranscriptProviders();
    const captured = stubProvider();
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    slot.start();
    captured.context.emit({ text: "kori tanante", isFinal: true });
    assert.equal(
        slot.draft().tokenGranularity,
        "utterance",
        "an engine that does not claim word tokens must not be reported as producing them",
    );
    await slot.stop();

    clearTranscriptProviders();
    const worded = stubProvider({ tokenGranularity: "word" });
    const wordSlot = openTranscriptSlot({
        sessionId: "s2",
        getElapsedMs: () => 0,
        tier: "A",
    });
    wordSlot.start();
    worded.context.emit({ text: "kori", isFinal: true });
    assert.equal(wordSlot.draft().tokenGranularity, "word");
    await wordSlot.stop();
});

test("a provider that throws on start leaves the slot stopped, not stuck running", () => {
    clearTranscriptProviders();
    const captured = stubProvider({ throwOnStart: true });
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    assert.doesNotThrow(() => slot.start());
    assert.equal(captured.stopped, 1, "the failed provider is stopped");
    captured.context.emit({ text: "late", isFinal: true });
    assert.equal(slot.draft().tokens.length, 0, "nothing is accepted afterwards");
});

test("the draft carries provenance and an original-timeline stamp", async () => {
    clearTranscriptProviders();
    const captured = stubProvider();
    let elapsed = 0;
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => elapsed,
        tier: "A",
        language: "mnk",
    });

    slot.start();
    elapsed = 1500;
    captured.context.emit({ text: "kori tanante", confidence: 0.8, isFinal: true });

    const draft = slot.draft();
    assert.equal(draft.sessionId, "s1");
    assert.equal(draft.authority, TRANSCRIPT_AUTHORITY);
    assert.equal(draft.timeline, "original");
    assert.equal(draft.language, "mnk");
    assert.deepEqual(draft.provenance, { engine: "stub-engine", model: "stub-1.2" });
    assert.equal(draft.tokens.length, 1);
    assert.equal(draft.tokens[0].endMs, 1500);
    assert.equal(draft.tokens[0].startMs, 0);
    // The engine reported no word timings, so the slot does not claim any.
    assert.equal(draft.tokens[0].timing, "approximate");
    await slot.stop();
});

test("an engine that exposes no model reports null rather than a placeholder", async () => {
    clearTranscriptProviders();
    const captured = stubProvider({ model: null });
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    slot.start();
    captured.context.emit({ text: "hello", isFinal: true });
    assert.equal(slot.draft().provenance.model, null);
    await slot.stop();
});

test("interim results replace the trailing interim and never survive stop", async () => {
    clearTranscriptProviders();
    const captured = stubProvider();
    let elapsed = 0;
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => elapsed,
        tier: "A",
    });

    slot.start();
    elapsed = 400;
    captured.context.emit({ text: "ko", isFinal: false });
    elapsed = 700;
    captured.context.emit({ text: "kori", isFinal: false });
    assert.equal(slot.draft().tokens.length, 1);
    assert.equal(slot.draft().tokens[0].text, "kori");

    elapsed = 900;
    captured.context.emit({ text: "kori tanante", isFinal: true });
    assert.equal(slot.draft().tokens.length, 1);

    elapsed = 1200;
    captured.context.emit({ text: "ib", isFinal: false });
    assert.equal(slot.draft().tokens.length, 2);

    const settled = await slot.stop();
    assert.equal(settled.tokens.length, 1);
    assert.equal(settled.tokens[0].isFinal, true);
    assert.equal(slot.text(), "kori tanante");
});

test("tokens do not accept text after the slot stops", async () => {
    clearTranscriptProviders();
    const captured = stubProvider();
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    slot.start();
    await slot.stop();
    captured.context.emit({ text: "late", isFinal: true });
    assert.equal(slot.draft().tokens.length, 0);
});

test("a provider failure ends the draft without throwing", () => {
    clearTranscriptProviders();
    const captured = stubProvider();
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    slot.start();
    captured.context.fail(new Error("SPEECH_RECOGNITION_ERROR: network"));
    assert.equal(captured.stopped, 1);
});

test("the auto-disable bound stops a provider that is never stopped", async () => {
    clearTranscriptProviders();
    const captured = stubProvider();
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
        maxDurationMs: 5,
    });
    slot.start();
    await new Promise((resolve) => setTimeout(resolve, 25));
    assert.equal(captured.stopped, 1);
});

test("the most recently registered provider is preferred", () => {
    clearTranscriptProviders();
    registerTranscriptProvider("first", () => ({
        engine: "first",
        model: null,
        start() {},
        stop() {},
    }));
    registerTranscriptProvider("second", () => ({
        engine: "second",
        model: null,
        start() {},
        stop() {},
    }));
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    assert.equal(slot.draft().provenance.engine, "second");
});

test("a factory that cannot run in this environment is skipped", () => {
    clearTranscriptProviders();
    registerTranscriptProvider("usable", () => ({
        engine: "usable",
        model: null,
        start() {},
        stop() {},
    }));
    registerTranscriptProvider("unavailable", () => null);
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    assert.equal(slot.draft().provenance.engine, "usable");
});

test("the engine's closing result is kept, not dropped on stop", async () => {
    clearTranscriptProviders();
    const captured = { context: null, stopped: 0 };
    registerTranscriptProvider("closing", () => ({
        engine: "closing-engine",
        model: null,
        start(context) {
            captured.context = context;
        },
        stop() {
            captured.stopped += 1;
            // What a real speech engine does: one last final result for the
            // audio it already heard, then `end`.
            captured.context.emit({ text: "the last thing said", isFinal: true });
            captured.context.ended("stopped");
        },
    }));

    let elapsed = 0;
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => elapsed,
        tier: "A",
    });
    slot.start();
    elapsed = 500;
    captured.context.emit({ text: "something earlier", isFinal: true });
    elapsed = 900;

    const settled = await slot.stop();
    assert.equal(settled.tokens.length, 2, "the closing utterance survives");
    assert.equal(settled.tokens[1]?.text, "the last thing said");
    assert.equal(slot.text(), "something earlier the last thing said");
});

test("an engine that ends on its own is restarted, within a bound", async () => {
    clearTranscriptProviders();
    const captured = { context: null, starts: 0, stopped: 0 };
    registerTranscriptProvider("flaky", () => ({
        engine: "flaky-engine",
        model: null,
        start(context) {
            captured.context = context;
            captured.starts += 1;
        },
        stop() {
            captured.stopped += 1;
            captured.context.ended("stopped");
        },
    }));

    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    slot.start();
    assert.equal(captured.starts, 1);

    // The engine ends by itself; the slot puts it back.
    captured.context.ended("engine-ended");
    assert.equal(captured.starts, 2, "an engine that ended on its own is restarted");

    // Keep ending. The slot gives up rather than looping forever, and settles
    // the draft instead of sitting marked running with nothing arriving.
    for (let i = 0; i < MAX_PROVIDER_RESTARTS + 2; i += 1) {
        captured.context.ended("engine-ended");
    }
    assert.equal(
        captured.starts,
        MAX_PROVIDER_RESTARTS + 1,
        "restarts are bounded",
    );

    const settled = await slot.stop();
    assert.ok(settled, "the draft settles rather than hanging");
});

test("every stop() caller gets a promise that resolves, not just the last", async () => {
    clearTranscriptProviders();
    const captured = { context: null, stopped: 0 };
    registerTranscriptProvider("slow-stop", () => ({
        engine: "slow-stop",
        model: null,
        start(context) {
            captured.context = context;
        },
        stop() {
            captured.stopped += 1;
            // Terminal event arrives later, as a real engine's does.
            setTimeout(() => captured.context.ended("stopped"), 5);
        },
    }));

    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    slot.start();

    // Two callers race — a host stop and the auto-disable timer, say.
    const first = slot.stop();
    const second = slot.stop();

    const [a, b] = await Promise.all([first, second]);
    assert.ok(a, "the first caller's promise resolves");
    assert.ok(b, "the second caller's promise resolves");
    assert.equal(a, b, "both get the same settled draft");
    assert.equal(captured.stopped, 1, "the provider is stopped once");
});

test("settling does not leave a timer that can reach into the next run", async () => {
    clearTranscriptProviders();
    const captured = { context: null, starts: 0, stopped: 0 };
    registerTranscriptProvider("ends-itself", () => ({
        engine: "ends-itself",
        model: null,
        start(context) {
            captured.context = context;
            captured.starts += 1;
        },
        stop() {
            captured.stopped += 1;
            captured.context.ended("stopped");
        },
    }));

    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
        // Short enough that a leaked timer would fire during this test.
        maxDurationMs: 15,
    });

    slot.start();
    // Exhaust the restarts so `settle()` is reached from `ended()` rather than
    // from `stop()` — the path that used to leave the auto-disable timer armed.
    for (let i = 0; i < MAX_PROVIDER_RESTARTS + 2; i += 1) {
        captured.context.ended("engine-ended");
    }

    const startsAfterSettle = captured.starts;
    const stoppedAfterSettle = captured.stopped;

    slot.start();
    await new Promise((resolve) => setTimeout(resolve, 40));

    assert.equal(
        captured.starts,
        startsAfterSettle + 1,
        "the new run started exactly once",
    );
    assert.ok(
        captured.stopped >= stoppedAfterSettle,
        "a stale timer from the settled run did not stop the new one early",
    );
});

test("the draft carries tokens, under a name that cannot be read as VAD output", async () => {
    // ADR-038 uses "segments" for the speech/silence boundaries of record,
    // computed server-side by the Node's VAD. This slot is explicitly not that
    // mechanism, so its lowest-authority output must not share the word.
    const { openTranscriptSlot, registerTranscriptProvider, clearTranscriptProviders } =
        await import("../../src/js/starmus-transcript-provider.js");

    clearTranscriptProviders();
    registerTranscriptProvider("fake", () => ({
        engine: "fake",
        model: null,
        start(context) {
            context.emit({ text: "kori", isFinal: true, startMs: 0, endMs: 100 });
        },
        stop() {},
    }));

    const slot = openTranscriptSlot({
        sessionId: "s1",
        tier: "A",
        language: "mnk",
        getElapsedMs: () => 0,
    });
    slot.start();
    const draft = slot.draft();

    assert.ok(Array.isArray(draft.tokens), "tokens is the field ADR-038 names");
    assert.equal(
        Object.prototype.hasOwnProperty.call(draft, "segments"),
        false,
        "and `segments` is not also present, which would invite the conflation",
    );
    assert.equal(draft.tokenGranularity, "utterance", "granularity says what a token is here");
    await slot.stop();
    clearTranscriptProviders();
});
