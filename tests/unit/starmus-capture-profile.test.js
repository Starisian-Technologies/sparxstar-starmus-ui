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

test("a host form field cannot overwrite reserved capture metadata", async () => {
    // `uploadTus` needs a browser; the guarantee is checked at the source level
    // because the failure it prevents is a silent one — a form field named
    // `captureProfile` replacing the validated value with an empty string,
    // satisfying the build check while violating the rule it enforces.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-tus.js", "utf8");

    assert.match(
        source,
        /RESERVED_METADATA_KEYS/,
        "reserved keys are declared",
    );
    for (const key of ["upload_uuid", "captureProfile", "captureAttainment"]) {
        assert.ok(
            new RegExp(`"${key}"`).test(source),
            `${key} is reserved against host form fields`,
        );
    }
    assert.match(
        source,
        /if \(RESERVED_METADATA_KEYS\.has\(key\)\)/,
        "the merge loop skips reserved keys rather than overwriting them",
    );
});

test("holding a recording is a state with a way out, not a slower deletion", async () => {
    // The queue holds entries rather than deleting them (ADR-011). Without a
    // release and an explicit discard, held entries accumulate against the byte
    // budget until `add()` refuses every new recording — which trades one lost
    // recording for the loss of recording itself.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    assert.match(source, /async releaseHold\(/, "a held entry can be put back");
    assert.match(source, /async discardHeld\(/, "a held entry can be deleted deliberately");
    assert.match(
        source,
        /export async function releaseHeldSubmission/,
        "hosts can release a held entry",
    );
    assert.match(
        source,
        /export async function discardHeldSubmission/,
        "hosts can discard a held entry",
    );
    assert.match(
        source,
        /DiscardRefused/,
        "discard refuses anything that is not held, so it cannot become an automatic delete",
    );
});
