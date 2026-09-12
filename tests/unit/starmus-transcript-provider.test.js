/**
 * @file starmus-transcript-provider.test.js
 * @description The live-transcript slot's output contract (ADR-038): tokens,
 * timestamps on the original timeline, and provenance naming engine and model.
 * Run with `pnpm run test:unit` (node:test — no runner dependency).
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
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

test("a slot without a tier is refused rather than guessed either way", () => {
    clearTranscriptProviders();
    stubProvider();
    assert.throws(
        () => openTranscriptSlot({ sessionId: "s1", getElapsedMs: () => 0 }),
        /TRANSCRIPT_SLOT_NO_TIER/,
    );
});

test("the draft says what a token is, and never overclaims word granularity", () => {
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
    slot.stop();

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
    wordSlot.stop();
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
    assert.equal(slot.draft().segments.length, 0, "nothing is accepted afterwards");
});

test("the draft carries provenance and an original-timeline stamp", () => {
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
    assert.equal(draft.segments.length, 1);
    assert.equal(draft.segments[0].endMs, 1500);
    assert.equal(draft.segments[0].startMs, 0);
    // The engine reported no word timings, so the slot does not claim any.
    assert.equal(draft.segments[0].timing, "approximate");
    slot.stop();
});

test("an engine that exposes no model reports null rather than a placeholder", () => {
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
    slot.stop();
});

test("interim results replace the trailing interim and never survive stop", () => {
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
    assert.equal(slot.draft().segments.length, 1);
    assert.equal(slot.draft().segments[0].text, "kori");

    elapsed = 900;
    captured.context.emit({ text: "kori tanante", isFinal: true });
    assert.equal(slot.draft().segments.length, 1);

    elapsed = 1200;
    captured.context.emit({ text: "ib", isFinal: false });
    assert.equal(slot.draft().segments.length, 2);

    const settled = slot.stop();
    assert.equal(settled.segments.length, 1);
    assert.equal(settled.segments[0].isFinal, true);
    assert.equal(slot.text(), "kori tanante");
});

test("segments do not accept text after the slot stops", () => {
    clearTranscriptProviders();
    const captured = stubProvider();
    const slot = openTranscriptSlot({
        sessionId: "s1",
        getElapsedMs: () => 0,
        tier: "A",
    });
    slot.start();
    slot.stop();
    captured.context.emit({ text: "late", isFinal: true });
    assert.equal(slot.draft().segments.length, 0);
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
