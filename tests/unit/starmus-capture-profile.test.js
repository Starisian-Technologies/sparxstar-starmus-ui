/**
 * @file starmus-capture-profile.test.js
 * @description The capture profile has to travel with every asset, on every
 * path — including the Tier C file-upload path, which is the one that had no
 * recorder to set it. ADR-035 and the capture-to-ingestion contract; AGENTS.md
 * lists "an asset uploaded without its capture profile recorded" as a failure.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { createStore, DEFAULT_INITIAL_STATE } from "../../src/js/starmus-state-store.js";
import { CAPTURE_PROFILES } from "../../src/js/starmus-capture-profiles.js";

/** A stand-in for the File a Tier C device hands over. */
const fakeFile = {
    name: "interview.m4a",
    type: "audio/mp4",
    size: 4096,
};

test("a recording session starts with no profile claimed", () => {
    assert.equal(DEFAULT_INITIAL_STATE.source.captureProfile, null);
});

test("an attached file is recorded as the import profile", () => {
    const store = createStore();
    store.dispatch({ type: "starmus/file-attached", file: fakeFile });

    const source = store.getState().source;
    assert.equal(source.captureProfile, "import");
    assert.ok(
        Object.prototype.hasOwnProperty.call(CAPTURE_PROFILES, source.captureProfile),
        "the profile named must be one that exists",
    );
});

test("an attached file reports that nothing was measured, rather than claiming attainment", () => {
    const store = createStore();
    store.dispatch({ type: "starmus/file-attached", file: fakeFile });

    const attainment = store.getState().source.captureAttainment;
    assert.ok(attainment, "an attainment record travels with the asset");
    assert.equal(attainment.profile, "import");
    assert.equal(
        attainment.attained,
        null,
        "null is 'not applicable'; false would claim a constraint was missed",
    );
    assert.deepEqual(attainment.exceeded, []);
    assert.deepEqual(attainment.requested, { sampleRate: null, channelCount: null });
    assert.ok(
        attainment.unverified.includes("sampleRate"),
        "nothing was measured, and the record says so",
    );
});

test("the import profile preserves material rather than reshaping it", () => {
    const profile = CAPTURE_PROFILES.import;
    assert.equal(profile.sampleRate, null, "import must not carry a resample target");
    assert.equal(profile.channelCount, null, "import must not fold channels down");
    assert.equal(profile.audioBitsPerSecond, null, "import must not re-encode to a bitrate");
});

test("webm with no codec stated is named, not dropped", async () => {
    const { resolveUploadFormat } = await import("../../src/js/starmus-completion-event.js");
    // The recorder's own fallback is `mimeType || "audio/webm"`, so this is the
    // real path, not a hypothetical one. Returning null here meant a recording
    // produced no `starmus:complete` at all.
    assert.equal(resolveUploadFormat("audio/webm", "take.webm"), "webm");
    assert.equal(
        resolveUploadFormat("audio/webm;codecs=opus", "take.webm"),
        "opus",
        "a stated codec is still preferred over the container",
    );
});
