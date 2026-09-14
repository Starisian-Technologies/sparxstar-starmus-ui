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
        /const reserved = reservedMetadataKeys\(tusMetadata\);/,
        "the reserved set is derived from what the module actually assigned",
    );
    assert.match(
        source,
        /if \(reserved\.has\(key\)\)/,
        "the merge loop skips reserved keys rather than overwriting them",
    );

    // The rule itself, not its spelling. A hand-kept list had drifted:
    // `upload_uuid` and the profile keys were protected while `tier`,
    // `instanceId`, `transcript`, `calibration` and `env` — assigned in the
    // same object literal — were not, so a host form field named `tier`
    // silently replaced the resolved device tier on its way to ingestion.
    const { reservedMetadataKeys } = await import("../../src/js/starmus-tus.js");
    const assigned = {
        upload_uuid: "x",
        filename: "x",
        filetype: "x",
        instanceId: "x",
        tier: "x",
        transcript: "x",
        calibration: "x",
        env: "x",
    };
    const reserved = reservedMetadataKeys(assigned);

    for (const key of Object.keys(assigned)) {
        assert.ok(reserved.has(key), `${key} is reserved because the module assigns it`);
    }
    // Absent from `assigned` on purpose: a profile that was not set must still
    // be unsettable by a host, or a form field could claim how audio was
    // captured for an asset that has no profile at all.
    assert.ok(reserved.has("captureProfile"));
    assert.ok(reserved.has("captureAttainment"));
    assert.equal(reserved.has("language"), false, "an ordinary host field still passes through");
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

test("an accepted upload always gets its boundary event, even unnameable", async () => {
    // `starmus:complete` is the boundary between recording and processing;
    // AGENTS.md says nothing downstream triggers until it fires. Returning null
    // for a format this client cannot name left the asset on the server with no
    // consumer told it existed. ADR-035 holds the container/codec question
    // (OQ-021), so refusing is not this package's call either.
    const { buildCompletionDetail, resolveUploadFormat } = await import(
        "../../src/js/starmus-completion-event.js"
    );

    assert.equal(
        resolveUploadFormat("audio/amr", "field-note.amr"),
        null,
        "the format really is unnameable here — otherwise this test proves nothing",
    );

    const detail = buildCompletionDetail({
        instanceId: "session-1",
        result: { success: true, uploadId: "11111111-2222-4333-8444-555555555555" },
        metadata: { captureProfile: "documentation" },
        formFields: {},
        fileName: "field-note.amr",
        mimeType: "audio/amr",
        durationMs: 9000,
    });

    assert.ok(detail, "a detail is built rather than withheld");
    assert.equal(detail.format, "unknown", "the gap is reported, not guessed at");
    assert.equal(detail.captureProfile, "documentation", "the rest of the record survives");
    assert.equal(detail.durationMs, 9000);
});

test("a container is named as a container, and a codec only when stated", async () => {
    const { buildCompletionDetail, resolveUploadFormat } = await import(
        "../../src/js/starmus-completion-event.js"
    );
    const detail = buildCompletionDetail({
        instanceId: "session-2",
        result: { success: true },
        metadata: {},
        formFields: {},
        fileName: "take.m4a",
        mimeType: "audio/mp4",
    });
    assert.equal(
        detail.format,
        "mp4",
        "a bare mp4 container may hold HE-AAC or ALAC; claiming aac-lc would misdescribe it",
    );

    assert.equal(resolveUploadFormat("audio/aac", "take.aac"), "aac-lc", "a stated codec is named");
    assert.equal(
        resolveUploadFormat('audio/mp4; codecs="mp4a.40.2"', "take.m4a"),
        "aac-lc",
        "and so is an explicit codec parameter",
    );
    assert.equal(resolveUploadFormat("audio/webm", "take.webm"), "webm", "webm stays the container");
});

test("a host still passing the retired nonce is told, not silently unauthorized", async () => {
    // ADR-034 retired `bootstrap.nonce`. A host that has not migrated now sends
    // no authorization header at all, which surfaces as a 401 with nothing
    // saying why — retried by the queue until the entry is held.
    const { resolveUploadHeaders } = await import("../../src/js/starmus-tus.js");

    const warnings = [];
    const realWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(" "));
    try {
        assert.deepEqual(resolveUploadHeaders({ nonce: "abc123" }), {});
        assert.equal(warnings.length, 1, "the misconfiguration is named where it happens");
        assert.match(warnings[0], /uploadHeaders/, "and it says what to do instead");

        warnings.length = 0;
        assert.deepEqual(
            resolveUploadHeaders({ nonce: "abc123", uploadHeaders: { "X-Host-Auth": "abc123" } }),
            { "X-Host-Auth": "abc123" },
            "a migrated host passes it itself",
        );
        assert.equal(warnings.length, 0, "and is not scolded for it");

        warnings.length = 0;
        assert.deepEqual(resolveUploadHeaders({}), {}, "no auth at all is a legitimate host");
        assert.equal(warnings.length, 0);
    } finally {
        console.warn = realWarn;
    }
});

test("attaching a file clears the recorded blob, and recording clears the file", () => {
    // `handleSubmit()` reads `source.blob || source.file`. Leaving both set
    // meant a contributor who recorded and then attached a file uploaded the
    // *recording* under the *file's* name, carrying the file's mime type and
    // the `import` profile — a mislabelled contribution, which for an archive
    // is worse than an upload that fails outright.
    const store = createStore();

    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    assert.ok(store.getState().source.blob, "the recording is there");

    store.dispatch({ type: "starmus/file-attached", file: fakeFile });
    const afterFile = store.getState().source;
    assert.equal(afterFile.blob, null, "the recorded blob does not survive the attachment");
    assert.equal(afterFile.kind, "file");
    assert.equal(afterFile.fileName, "interview.m4a");

    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 4096 }, fileName: "take-2.webm" },
    });
    const afterRecord = store.getState().source;
    assert.equal(afterRecord.file, null, "and the attached file does not survive a recording");
    assert.equal(afterRecord.kind, "blob");
});

test("a capture profile of only whitespace is absent, not present and blank", async () => {
    // The contract is present-with-a-value or absent. A blank value collapses
    // "arrived with no profile" and "a profile the Node could not read" into
    // one state, and whitespace is truthy — so testing the raw value passed the
    // build check while breaking the rule it enforces.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-tus.js", "utf8");

    assert.match(
        source,
        /const captureProfile = sanitizeMetadata\(metadata\.captureProfile\)\.trim\(\);/,
        "the value is sanitized and trimmed before it is tested",
    );
    assert.match(
        source,
        /if \(captureProfile\) \{\s*\n\s*tusMetadata\.captureProfile = captureProfile;/,
        "and the trimmed value is what gets sent",
    );
});

test("discarding a held recording requires a stated reason", async () => {
    // `OfflineQueue` is not exported and `discardHeld` needs IndexedDB, so the
    // guarantee is checked at the source level — the same reason the reserved-
    // metadata test above does. What matters is that the refusal happens before
    // anything is read or deleted: this is the only deletion in the module that
    // is not a successful upload, and the reason is what makes it a decision
    // someone took rather than something that happened.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    // Bounded to the method. Slicing to end-of-file let `firstRead` match an
    // unrelated `getAll()` further down the file, so the test would have passed
    // even if the discard had touched IndexedDB before validating the reason.
    const from = source.indexOf("async discardHeld(id, reason)");
    const to = source.indexOf("\n    async ", from + 10);
    assert.ok(from > -1 && to > from, "the method body is locatable");
    const body = source.slice(from, to);

    const guard = body.indexOf("needs a reason");
    const firstRead = body.search(/this\.db\.transaction|await this\.getAll\(\)/);

    assert.ok(guard > -1, "a blank reason is refused");
    assert.ok(firstRead > -1, "and the method does go on to touch the store");
    assert.ok(
        guard < firstRead,
        "the refusal comes before the store is touched, so no reasonless discard can begin",
    );
    assert.match(
        body.slice(0, guard),
        /typeof reason === "string" \? reason\.trim\(\) : ""/,
        "whitespace is not a reason either",
    );
});

test("the upload id is minted where a failure is caught, not outside it", async () => {
    // `createUploadId()` throws on a runtime with no secure randomness — an
    // insecure origin on an old Android is exactly that, and exactly the device
    // this package exists for. Minting outside the try rejected the submit with
    // the captured blob never queued and no error dispatched.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-core.js", "utf8");

    assert.match(source, /uploadId: null,/, "the record is built without the id");
    assert.match(
        source,
        /try \{\s*\n\s*metadata\.uploadId = createUploadId\(\);/,
        "and the id is minted as the first thing inside the handled path",
    );
});

test("a stored upload id that the upload layer would reject is re-minted, not kept", async () => {
    // `uploadTus()` replaces any id that is not a UUID v4 with a fresh one. A
    // queue that only asked "is something there" kept a non-empty invalid id,
    // so every attempt was silently re-identified — a different fingerprint
    // each time, never able to resume the partial the last attempt left.
    const { isUploadId } = await import("../../src/js/starmus-tus.js");

    assert.equal(isUploadId("11111111-2222-4333-8444-555555555555"), true);
    assert.equal(isUploadId("legacy-id-from-an-older-build"), false, "the case that used to survive");
    assert.equal(isUploadId(""), false);
    assert.equal(isUploadId(undefined), false);
    assert.equal(
        isUploadId("11111111-2222-3333-8444-555555555555"),
        false,
        "version 3 is not version 4",
    );

    const { readFileSync } = await import("node:fs");
    const queue = readFileSync("src/js/starmus-offline.js", "utf8");
    assert.match(
        queue,
        /if \(!isUploadId\(metadata\?\.uploadId\)\)/,
        "and the queue asks the module that decides, rather than keeping a second answer",
    );
});

test("releasing a hold refuses an entry that is not held", async () => {
    // Releasing clears retryCount, lastAttempt and error and schedules an
    // immediate drain. On an entry merely waiting out its backoff that discards
    // the backoff, pushing a failing upload straight back onto a bad link at the
    // contributor's expense. `discardHeld()` guards the same way.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");
    const body = source.slice(source.indexOf("async releaseHold(id)"));

    assert.match(body.slice(0, 2000), /ReleaseRefused/, "a non-held entry is refused");
    const guard = body.indexOf("item.held !== true");
    const mutate = body.indexOf("item.held = false;");
    assert.ok(guard > -1 && mutate > -1);
    assert.ok(guard < mutate, "and the refusal comes before anything is changed");
});

test("queue usage is summed without materialising every recording", async () => {
    // Each record holds its audio Blob. Reading them all to add up sizes
    // materialised the whole queued set — up to the 20 MB cap — to produce a
    // single number, against a package budget that keeps far less in memory.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");
    const body = source.slice(source.indexOf("async usage()"), source.indexOf("async usage()") + 2500);

    assert.match(body, /store\.openCursor\(\)/, "usage walks a cursor");
    assert.doesNotMatch(body, /this\.getAll\(\)/, "and never loads the whole queue to count it");
});

test("attaching a file does not carry the previous recording's transcript", () => {
    // `handleSubmit()` copies `source.transcript` into the upload metadata, so a
    // live transcript collected before the file was chosen would arrive at
    // ingestion paired with the imported asset — another take's words attached
    // to somebody else's audio.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 1024 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/transcript-update", transcript: "kori kuta" });
    assert.equal(store.getState().source.transcript, "kori kuta");

    store.dispatch({ type: "starmus/file-attached", file: fakeFile });
    const source = store.getState().source;
    assert.equal(source.transcript, "", "the draft does not follow the file");
    assert.equal(source.interimTranscript, "");
});

test("the local queue key survives a runtime with no secure randomness", async () => {
    // `createUploadId()` refuses in that runtime, correctly — it is the
    // `upload_uuid` the ingestion contract fixes. The offline submission id is
    // only an IndexedDB key: it never leaves the device and nothing downstream
    // reads it. Throwing for it meant `queueSubmission()` threw and the
    // recording was lost, which ADR-011 forbids.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");
    const body = source.slice(
        source.indexOf("function createOfflineSubmissionId"),
        source.indexOf("class OfflineQueue"),
    );

    assert.doesNotMatch(
        body,
        /throw new Error/,
        "the local key falls back rather than refusing",
    );
    assert.match(body, /starmus-offline-local-/, "and says in the id that it is the fallback");

    const upload = readFileSync("src/js/starmus-tus.js", "utf8");
    const uploadBody = upload.slice(upload.indexOf("export function createUploadId"));
    assert.match(
        uploadBody.slice(0, 900),
        /throw new Error\("Secure UUID generation is not available/,
        "while the contract identifier still refuses to be invented",
    );
});

test("an entry whose bytes already landed is reconciled, never re-uploaded", async () => {
    // `removeFingerprintOnSuccess` deletes the resume fingerprint when a
    // transfer completes, so an entry held *after* that has no resume identity.
    // Releasing it used to start a new TUS resource — a second copy of a
    // recording the platform had already accepted.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    assert.match(source, /if \(item\.transferred === true\) \{/, "the drain recognises the state");
    const branch = source.slice(source.indexOf("if (item.transferred === true) {"));
    const emit = branch.indexOf("emitCompletionEvent(detail)");
    const upload = branch.indexOf("uploadWithPriority");
    assert.ok(emit > -1, "it emits the completion that never fired");
    assert.ok(emit < upload, "and reaches that before any upload call");
    // Both post-transfer holds pass the `transferred` flag. Matched on the
    // argument rather than the whole call, so threading a claim token through
    // later does not break a test that is about something else.
    for (const reason of ["completion handling failed", "local cleanup failed"]) {
        const call = source.slice(source.indexOf(`Uploaded; ${reason}`));
        assert.match(
            call.slice(0, 200),
            /`,\s*true[,)]/,
            `the hold for "${reason}" records that the bytes landed`,
        );
    }
});

test("a drain claims a row before uploading it", async () => {
    // `isProcessing` is in-memory, so it says nothing about the tab next door.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    const claim = source.indexOf("const claimToken = await this._claim(id);");
    const upload = source.indexOf("await uploadWithPriority({");
    const backfill = source.indexOf("const backfilled = createUploadId();");

    assert.ok(claim > -1, "rows are claimed");
    assert.ok(claim < upload, "claimed before the transfer starts");
    assert.ok(
        claim < backfill,
        "and before the id backfill, so two tabs cannot mint competing identifiers",
    );

    // The claim carries an owner token and is renewed while bytes move. A fixed
    // lease cannot be sized correctly here: a capture may run to
    // MAX_DURATION_SECONDS and a progressing upload is deliberately unbounded.
    assert.match(source, /_renewClaim\(id, claimToken\)/, "the claim is renewed on progress");
    assert.match(
        source,
        /item\.leaseOwner !== token/,
        "renewal only extends a claim this drain still owns",
    );
    assert.match(
        source,
        /if \(item && item\.leaseOwner === token\)/,
        "and release only clears a claim this drain still owns",
    );
});

test("listing held recordings does not load their audio", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");
    const body = source.slice(source.indexOf("async getHeld()"), source.indexOf("async getHeld()") + 2600);

    assert.match(body, /store\.openCursor\(\)/, "it walks a cursor");
    assert.doesNotMatch(body, /this\.getAll\(\)/, "rather than materialising every record");
    assert.doesNotMatch(body, /audioBlob: /, "and no Blob travels in the summary");
    assert.match(body, /sizeBytes: item\.audioBlob\?\.size/, "only its size does");
});

test("a recording keeps the profile set when its microphone opened", () => {
    // The recorder dispatches `capture-profile` when the mic opens and
    // `recording-available` when it stops. Clearing the profile on
    // `recording-available` — to defend against a stale `import` profile from
    // an earlier file attachment — would destroy the profile belonging to the
    // recording that just ended, which is the failure ADR-035 and the build
    // check exist to prevent. The attachment case is already covered: opening
    // the microphone overwrites `import` before any recording exists.
    const store = createStore();

    store.dispatch({ type: "starmus/file-attached", file: fakeFile });
    assert.equal(store.getState().source.captureProfile, "import");

    store.dispatch({
        type: "starmus/capture-profile",
        attainment: { profile: "conversation", attained: true, exceeded: [], unverified: [] },
    });
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });

    const source = store.getState().source;
    assert.equal(source.captureProfile, "conversation", "the recording's own profile survives");
    assert.equal(source.captureAttainment.profile, "conversation");
    assert.equal(source.file, null, "while the stale file does not");
    assert.equal(source.transcript, "", "nor the stale draft");
});
