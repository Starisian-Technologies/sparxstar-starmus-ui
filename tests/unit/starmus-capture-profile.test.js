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
    assert.deepEqual(attainment.requested, {
        sampleRate: null,
        channelCount: null,
        // Present and null: the bitrate was explicitly unconstrained, which is
        // a different statement from the field being absent. Both producers of
        // a `CaptureAttainment` emit the same shape, so a consumer reads one
        // contract whether the asset was recorded or attached.
        audioBitsPerSecond: null,
    });
    // `unverified` names constrained values the device did not report — not
    // values nobody asked for. The import profile constrains nothing, so there
    // is nothing unverified about it; `attained: null` above is what says
    // nothing was measured. Listing sampleRate here described an unconstrained
    // import as one whose constraints could not be checked.
    assert.deepEqual(attainment.unverified, [], "nothing was constrained, so nothing is unverified");
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
        /typeof rawProfile === "string" \? sanitizeMetadata\(rawProfile\)\.trim\(\) : ""/,
        "a non-string profile is absent rather than stringified",
    );

    // The bug this guards: `sanitizeMetadata()` routes anything of type
    // `object` through `JSON.stringify`, and `typeof null === "object"`, so the
    // documented "no profile" value serialized to the truthy string `"null"`
    // and was transmitted — while the completion event reported `null`, leaving
    // the wire metadata and the event disagreeing about the same asset.
    const sanitize = (value) => {
        const raw = typeof value === "object" ? JSON.stringify(value) : String(value || "");
        return raw.replace(/[\r\n\t]/g, " ");
    };
    assert.equal(sanitize(null).trim(), "null", "this is why the type test is needed");
    assert.ok(sanitize(null).trim(), "and why trimming alone did not catch it");
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
    // An entry held *after* a completed transfer must not be uploaded again
    // when someone releases it: the platform already has the bytes. Releasing
    // it used to start a new TUS resource — a second copy of a recording that
    // had been accepted — which was unavoidable back when the resume
    // fingerprint was dropped the moment a transfer succeeded.
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

    const claim = source.indexOf("const claim = await this._claim(id);");
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

    // The attempt proceeds from the row the claim transaction read, not from
    // the `getAll()` snapshot: another tab can record a failed attempt and
    // release a row between the two, and continuing from the snapshot reused a
    // stale retryCount (skipping the backoff) and a stale metadata (which
    // carries the upload identity).
    assert.match(
        source,
        /const current = claim\.row;\s*\n\s*retryCount = current\.retryCount/,
        "the claimed row replaces the snapshot for the rest of the attempt",
    );
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

test("the boundary event is emitted before the store dispatch that can throw", async () => {
    // Store listeners run without isolation. Dispatching first meant one of
    // them throwing aborted `handleSubmit()` before `starmus:complete` fired —
    // and by then `transferred` is true, so the catch deliberately does not
    // queue. An accepted upload lost its boundary event and its local record
    // together, over a UI listener's bug.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-core.js", "utf8");

    const emit = source.indexOf("emitCompletionEvent(detail);");
    // Matched on the action type, not on the call's formatting: this guards an
    // ordering, and a reflow of the dispatch must not read as the guard failing.
    const dispatch = source.indexOf('"starmus/submit-complete"');
    assert.ok(emit > -1 && dispatch > -1, "both are present");
    assert.equal(
        source.split('"starmus/submit-complete"').length - 1,
        1,
        "and the dispatch is the only mention, so the index is the dispatch",
    );
    assert.ok(emit < dispatch, "the boundary event does not depend on the dispatch succeeding");
});

test("every write to a queued row happens under a claim", async () => {
    // Holding, retrying and backfilling are all mutations. An unclaimed hold
    // could mark a row another tab was actively uploading, and a late write
    // from a drain whose lease had lapsed could rewrite the new owner's state.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    const claim = source.indexOf("const claimToken = await this._claim(id);");
    for (const [label, needle] of [
        ["the retry-limit hold", "`Upload failed ${retryCount} times"],
        ["the id backfill", "const backfilled = createUploadId();"],
        ["the transfer", "await uploadWithPriority({"],
    ]) {
        const at = source.indexOf(needle);
        assert.ok(at > -1, `${label} is present`);
        assert.ok(claim < at, `${label} happens after the claim`);
    }

    // And the mutation itself is gated on still owning the row — not merely the
    // lease clear that follows it.
    const holdBody = source.slice(source.indexOf("async _hold(id, reason"));
    const gate = holdBody.indexOf("item.leaseOwner !== token");
    const mutate = holdBody.indexOf("item.held = true;");
    assert.ok(gate > -1 && mutate > -1 && gate < mutate, "_hold checks ownership before writing");

    const retryBody = source.slice(source.indexOf("async _updateRetry(id, retryCount"));
    const rGate = retryBody.indexOf("item.leaseOwner !== token");
    const rMutate = retryBody.indexOf("item.retryCount = retryCount;");
    assert.ok(rGate > -1 && rMutate > -1 && rGate < rMutate, "_updateRetry does too");
});

test("an unconstrained profile reports not-applicable, never attained", async () => {
    // `import` constrains nothing, so the loop found no violations and returned
    // `attained: true` — claiming attainment of a profile that asks for
    // nothing. The documented contract is `null`: not applicable.
    const { describeAttainment } = await import("../../src/js/starmus-capture-profiles.js");
    const track = { getSettings: () => ({ sampleRate: 16000, channelCount: 1 }) };

    assert.equal(describeAttainment("import", track).attained, null);
    assert.equal(
        describeAttainment("conversation", null).attained,
        null,
        "and so does a profile whose constraints could not be verified at all",
    );
});

test("a bitrate the profile applies is accounted for, not invisible", async () => {
    // `audioBitsPerSecond` is declared by `conversation` and applied by
    // `getRecorderOptions()`, but it is a MediaRecorder option rather than a
    // track setting, so `getSettings()` never reports it. Leaving it out of the
    // record let `attained: true` quietly cover a constraint nobody checked.
    const { describeAttainment, CAPTURE_PROFILES } = await import(
        "../../src/js/starmus-capture-profiles.js"
    );
    assert.equal(CAPTURE_PROFILES.conversation.audioBitsPerSecond, 32000);

    const track = { getSettings: () => ({ sampleRate: 16000, channelCount: 1 }) };
    const attainment = describeAttainment("conversation", track);

    assert.equal(attainment.requested.audioBitsPerSecond, 32000, "it travels in the record");
    assert.ok(
        attainment.unverified.includes("audioBitsPerSecond"),
        "and is named as unverified rather than silently counted as met",
    );
});

test("a container is never reported as the codec it might contain", async () => {
    const { resolveUploadFormat } = await import("../../src/js/starmus-completion-event.js");

    // Ogg may hold Vorbis, FLAC or Speex; mp4 may hold HE-AAC or ALAC.
    assert.equal(resolveUploadFormat("audio/ogg", "take.ogg"), "ogg");
    assert.equal(resolveUploadFormat("audio/mp4", "take.m4a"), "mp4");

    // A stated codec is still named.
    assert.equal(resolveUploadFormat("audio/opus", "take.opus"), "opus");
    assert.equal(resolveUploadFormat('audio/ogg; codecs="opus"', "take.ogg"), "opus");
    assert.equal(resolveUploadFormat("audio/aac", "take.aac"), "aac-lc");
});

test("a stalled upload is retried, not mistaken for a server rejection", async () => {
    // The classifier matched a bare `400`, so "TUS_UPLOAD_STALLED: no progress
    // for 4000ms" read as an HTTP 400 and the recording was held on its first
    // stall instead of retried. Stalls are the normal case on the links this
    // platform exists for, which makes that the worst thing to misread.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    const stalledRe = /TUS_UPLOAD_STALLED|TUS_RESUME_LOOKUP_FAILED|OFFLINE_FAST_PATH/i;
    const fourRe = /(?:response code|status|HTTP)\D{0,3}4\d\d|Invalid JSON|QuotaExceeded/i;
    const nonRetryable = (msg) => !stalledRe.test(msg) && fourRe.test(msg);

    assert.equal(nonRetryable("TUS_UPLOAD_STALLED: no progress for 4000ms"), false);
    assert.equal(nonRetryable("network error"), false);
    assert.equal(nonRetryable("HTTP 503 Service Unavailable"), false);
    assert.equal(nonRetryable("HTTP 400 Bad Request"), true);
    assert.equal(nonRetryable("tus: unexpected response, response code: 400"), true);
    assert.equal(nonRetryable("QuotaExceededError"), true);

    // And the shipped classifier is the one just exercised.
    assert.ok(source.includes(String(stalledRe).slice(1, -2)), "the stall guard is in the source");
    assert.doesNotMatch(
        source,
        /const nonRetryable = \/400\|/,
        "the bare numeric substring is gone",
    );
});

test("a queue whose rows are all leased still schedules a wake-up", async () => {
    // Excluding leased rows stopped the zero-delay spin, but returning null when
    // every row was leased meant that if the owning tab crashed, its lease
    // expired with nothing left to notice — the recording sat until a reload.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");
    const body = source.slice(source.indexOf("async _getNextProcessDelay()"));

    assert.match(body.slice(0, 2200), /earliestLease/, "the earliest expiry is tracked");
    assert.match(
        body.slice(0, 2200),
        /return earliestLease;/,
        "and it is what the drain waits for when nothing is claimable",
    );
});

test("a finished recording keeps its own transcript", () => {
    // `recording-available` is dispatched from MediaRecorder's stop handler,
    // after a whole recording's worth of transcript updates. Clearing the draft
    // there erased the take that had just finished, before `handleSubmit()`
    // could snapshot it — so every recording uploaded with an empty transcript.
    // The retake leak it was meant to fix belongs at mic-start instead.
    const store = createStore();

    store.dispatch({ type: "starmus/mic-start" });
    store.dispatch({ type: "starmus/transcript-update", transcript: "kori kuta" });
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    assert.equal(
        store.getState().source.transcript,
        "kori kuta",
        "the draft survives to the submission that carries it",
    );

    // And a retake still does not inherit the previous take's words.
    store.dispatch({ type: "starmus/mic-start" });
    assert.equal(store.getState().source.transcript, "", "cleared when the mic reopens");
});

test("the attainment record carries no device identifiers", async () => {
    // MediaTrackSettings includes deviceId and groupId — stable identifiers for
    // the contributor's microphone — and this record is serialized into TUS
    // metadata, so keeping it wholesale attached a device fingerprint to every
    // asset a contributor uploaded.
    const { describeAttainment } = await import("../../src/js/starmus-capture-profiles.js");
    const track = {
        getSettings: () => ({
            sampleRate: 16000,
            channelCount: 1,
            deviceId: "a-stable-device-identifier",
            groupId: "a-stable-group-identifier",
            echoCancellation: true,
        }),
    };

    const { actual } = describeAttainment("conversation", track);
    assert.deepEqual(Object.keys(actual).sort(), ["channelCount", "sampleRate"]);
    assert.equal(actual.deviceId, undefined, "no device identifier travels with the asset");
    assert.equal(actual.groupId, undefined);
});

test("attaching a file does not re-arm a submission already in flight", () => {
    // The file input stays active while `status === "submitting"`, so flipping
    // the status back to ready_to_submit re-enabled submit and permitted a
    // second submission alongside the first.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start" });
    assert.equal(store.getState().status, "submitting");

    store.dispatch({ type: "starmus/file-attached", file: fakeFile });
    assert.equal(store.getState().status, "submitting", "the in-flight upload keeps the UI");
    assert.equal(store.getState().source.kind, "file", "while the attachment is still recorded");
});

test("a completion from a superseded submission does not mark the new source complete", () => {
    // The file input stays usable during an upload. A contributor who attaches
    // a different file mid-transfer replaces `source`, and the earlier upload
    // then completed against it: the new file was set `complete`, submit was
    // disabled, and a recording nothing had ever uploaded looked delivered.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-first" });

    store.dispatch({ type: "starmus/file-attached", file: fakeFile });
    store.dispatch({ type: "starmus/submit-complete", submissionId: "upload-first" });

    const state = store.getState();
    assert.equal(
        state.status,
        "ready_to_submit",
        "the attachment is offered for submission instead of being marked delivered",
    );
    assert.equal(state.source.kind, "file", "and it is the attachment that is waiting");
    assert.equal(state.submission.isQueued, false);
});

test("a completion naming a submission that is not the one in flight is ignored", () => {
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-current" });

    store.dispatch({ type: "starmus/submit-complete", submissionId: "upload-earlier" });
    assert.equal(store.getState().status, "submitting", "a foreign id does not complete");

    store.dispatch({ type: "starmus/submit-complete", submissionId: null });
    assert.equal(store.getState().status, "submitting", "nor does an unidentified one");

    store.dispatch({ type: "starmus/submit-complete", submissionId: "upload-current" });
    assert.equal(store.getState().status, "complete", "the submission in flight completes");
});

test("a submission that could not be queued returns the recording to the contributor", () => {
    // `starmus/error` left `status` untouched, so a queue failure — storage
    // full, IndexedDB unavailable — left "Uploading…" on screen forever with
    // the blob still in state, submit disabled, and no way to retry.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-1" });
    assert.equal(store.getState().status, "submitting");

    store.dispatch({
        type: "starmus/error",
        error: { message: "QueueFull: 4 held recordings", retryable: false },
    });

    assert.equal(store.getState().status, "ready_to_submit", "submit is offered again");
    assert.equal(store.getState().source.blob.size, 2048, "with the recording still held");
});

test("a failure after the bytes landed does not offer the upload again", () => {
    // The post-transfer path reports with `uploadId`, because the asset is on
    // the server and only this client's handling afterwards failed. Returning
    // that to a submittable state would invite a second upload of an asset the
    // platform already holds — bandwidth the contributor has already spent.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-2" });

    store.dispatch({
        type: "starmus/error",
        error: { message: "redirect resolution failed", retryable: false, uploadId: "upload-2" },
    });

    const state = store.getState();
    assert.equal(state.status, "complete", "the asset is delivered, and said to be");
    assert.notEqual(state.status, "submitting", "not left uploading over a finished transfer");
    assert.equal(state.error.uploadId, "upload-2", "with the id the two sides reconcile by");
});

test("a new submission does not inherit the last one's superseded flag", () => {
    // The first upload could not be queued, so the contributor attached another
    // file and sent it. That upload settled down the superseded path and was
    // reported as still waiting — because nothing had cleared the flag the
    // replacement set.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-1" });
    store.dispatch({ type: "starmus/file-attached", file: fakeFile });
    assert.equal(store.getState().submission.superseded, true, "the first upload is superseded");

    store.dispatch({
        type: "starmus/error",
        error: { message: "QueueFull", retryable: false },
    });
    assert.equal(store.getState().status, "ready_to_submit");

    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-2" });
    assert.equal(store.getState().submission.superseded, false, "the new submission starts clean");
    store.dispatch({ type: "starmus/submit-complete", submissionId: "upload-2" });
    assert.equal(store.getState().status, "complete", "and it completes normally");
});

test("queueing a superseded upload does not mark the new source queued", () => {
    // The recording that went to the queue is the one that was in flight, not
    // the file on screen. Reporting "Queued" over the attachment claimed the
    // platform held a file it had never been given, and disabled the control
    // that would have sent it.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-1" });
    store.dispatch({ type: "starmus/file-attached", file: fakeFile });

    store.dispatch({ type: "starmus/submit-queued", submissionId: "queued-1" });

    const state = store.getState();
    assert.equal(state.status, "ready_to_submit", "the attachment can still be sent");
    assert.equal(state.submission.isQueued, false, "and is not claimed to be queued");
    assert.equal(state.source.kind, "file");
});

test("a recording made during an upload does not re-arm submit", () => {
    // Same rule as `file-attached`: the transfer in flight keeps the UI it
    // owns. Re-arming submit permitted a second transfer alongside the first.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "first.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-1" });

    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 4096 }, fileName: "second.webm" },
    });

    assert.equal(store.getState().status, "submitting", "the upload in flight keeps the UI");
    assert.equal(store.getState().submission.superseded, true, "and is marked superseded");
});

test("a retryable failure while submitting leaves the queue to it", () => {
    // A retryable error means the queue is expected to carry the recording. The
    // status belongs to the queue path then, not to the contributor.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-3" });

    store.dispatch({ type: "starmus/error", error: { message: "network error", retryable: true } });

    assert.equal(store.getState().status, "submitting");
});

test("the announced submission id is the real one, not a placeholder", async () => {
    // `metadata.uploadId` is null until `createUploadId()` runs, and that call
    // sits inside the try because it throws on an insecure origin. Dispatching
    // submit-start above it announced a null id, so every later completion
    // compared null against a real id and the guard rejected nothing.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-core.js", "utf8");

    const created = source.indexOf("metadata.uploadId = createUploadId();");
    const announced = source.indexOf('"starmus/submit-start"');
    assert.ok(created > -1 && announced > -1, "both are present");
    assert.ok(created < announced, "the id exists before the submission is announced");
});

test("a recording made while an upload runs also supersedes it", () => {
    // Same replacement as `file-attached`, by the other route: the completion
    // of the upload that was running describes bytes this state no longer
    // holds, and must not be reported as this recording's delivery.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "first.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-first" });

    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 4096 }, fileName: "second.webm" },
    });
    store.dispatch({ type: "starmus/submit-complete", submissionId: "upload-first" });

    const state = store.getState();
    assert.equal(state.status, "ready_to_submit", "the second take is still waiting to be sent");
    assert.equal(state.source.blob.size, 4096, "and it is the second take that is held");
});

test("the attainment record documents every value it reports", async () => {
    // The typedef described `requested` as sample rate and channel count while
    // the code had been setting a bitrate too. A consumer written against the
    // documented shape does not know to look for an applied constraint.
    const { readFileSync } = await import("node:fs");
    const { describeAttainment } = await import("../../src/js/starmus-capture-profiles.js");
    const source = readFileSync("src/js/starmus-capture-profiles.js", "utf8");

    const typedef = source.slice(
        source.indexOf("@typedef {Object} CaptureAttainment"),
        source.indexOf("@returns {CaptureAttainment}"),
    );
    assert.match(typedef, /audioBitsPerSecond/, "the bitrate is part of the documented shape");

    // And every key the implementation puts in `requested` is one of them.
    const attainment = describeAttainment("conversation", {
        getSettings: () => ({ sampleRate: 16000, channelCount: 1 }),
    });
    for (const key of Object.keys(attainment.requested)) {
        assert.match(typedef, new RegExp(key), `${key} is documented`);
    }
});

test("HE-AAC is not reported as AAC-LC", async () => {
    // `audio/aacp` is HE-AAC — the profile the codec-token fix was written to
    // keep out. The media type was still matched by substring, so `audio/aac`
    // matched `audio/aacp` and readmitted it through the other half of the
    // same condition.
    const { resolveUploadFormat } = await import("../../src/js/starmus-completion-event.js");

    assert.notEqual(resolveUploadFormat("audio/aacp", "take.m4a"), "aac-lc");
    assert.notEqual(resolveUploadFormat("audio/aacp", ""), "aac-lc");
    assert.notEqual(resolveUploadFormat('audio/mp4; codecs="mp4a.40.29"', ""), "aac-lc");

    // A stated AAC-LC is still named, including with parameters attached.
    assert.equal(resolveUploadFormat("audio/aac", "take.aac"), "aac-lc");
    assert.equal(resolveUploadFormat("audio/aac; profile=lc", ""), "aac-lc");
    assert.equal(resolveUploadFormat('audio/mp4; codecs="mp4a.40.2"', ""), "aac-lc");
});

test("both producers of an attainment record emit the same shape", async () => {
    // One is `describeAttainment()`, the other the file-attachment reducer's
    // literal. They had drifted: an imported asset carried no
    // `audioBitsPerSecond` key at all, so a consumer could not read one
    // contract across both, and an import could not distinguish "explicitly
    // unconstrained" from "this record does not mention it".
    const { describeAttainment } = await import("../../src/js/starmus-capture-profiles.js");

    const recorded = describeAttainment("conversation", {
        getSettings: () => ({ sampleRate: 16000, channelCount: 1 }),
    });

    const store = createStore();
    store.dispatch({ type: "starmus/file-attached", file: fakeFile });
    const imported = store.getState().source.captureAttainment;

    assert.deepEqual(
        Object.keys(imported.requested).sort(),
        Object.keys(recorded.requested).sort(),
        "the requested record has the same fields either way",
    );
    assert.equal(imported.requested.audioBitsPerSecond, null, "unconstrained, and said so");

    // And field for field against the helper's own output for the same
    // profile. The state store is an IIFE and cannot call `describeAttainment()`,
    // so this comparison is what keeps the hand-written record honest. They had
    // disagreed on `unverified`: the literal listed sampleRate and channelCount
    // while the helper lists neither, because the import profile constrains
    // neither — "not constrained" and "constrained but unverifiable" are
    // different claims about an asset, and only one of them was true.
    const fromHelper = describeAttainment("import", null);
    const { source, ...importedWithoutSource } = imported;
    assert.equal(source, "file-attachment", "the literal adds only its provenance");
    assert.deepEqual(
        importedWithoutSource,
        fromHelper,
        "the file-attachment record matches describeAttainment('import') exactly",
    );
});

test("a capture profile the wire omits is not announced by the event", async () => {
    // `uploadTus()` trims and drops an empty profile, so a legacy queue row
    // carrying whitespace — or a number — travelled with no profile while the
    // completion event reported one. Two records of a single upload disagreeing
    // is worse than neither carrying it.
    const { buildCompletionDetail } = await import("../../src/js/starmus-completion-event.js");

    const base = {
        instanceId: "i-1",
        result: {},
        formFields: {},
        fileName: "take.webm",
        mimeType: "audio/webm",
        durationMs: 1000,
    };

    for (const profile of ["   ", "", null, undefined, 42, {}]) {
        const detail = buildCompletionDetail({ ...base, metadata: { captureProfile: profile } });
        assert.equal(detail.captureProfile, null, `no profile announced for ${typeof profile}`);
    }

    const real = buildCompletionDetail({
        ...base,
        metadata: { captureProfile: "  conversation  " },
    });
    assert.equal(real.captureProfile, "conversation", "a real one is announced, trimmed");
});

test("a stated HE-AAC profile is not reported as AAC-LC", async () => {
    // `audio/aac; codecs=mp4a.40.5` matched the base `audio/aac` branch and
    // returned `aac-lc` — so the parameter that identifies HE-AAC was read as
    // confirmation of the profile it rules out.
    const { resolveUploadFormat } = await import("../../src/js/starmus-completion-event.js");

    for (const type of [
        'audio/aac; codecs="mp4a.40.5"',
        'audio/aac; codecs="mp4a.40.29"',
        'audio/mp4; codecs="mp4a.40.5"',
    ]) {
        assert.notEqual(resolveUploadFormat(type, ""), "aac-lc", type);
    }

    // An explicitly stated AAC-LC profile still is one.
    assert.equal(resolveUploadFormat('audio/aac; codecs="mp4a.40.2"', ""), "aac-lc");
    assert.equal(resolveUploadFormat("audio/aac", "take.aac"), "aac-lc");
});

test("both submission paths agree about a server error", async () => {
    // tus-js-client reports `response code: 503`. Core recognised only
    // `HTTP 5xx`, so it told the contributor the failure was final and returned
    // the UI to submittable while the queue was still retrying the same
    // recording — and a retry from the button queued it a second time.
    const { readFileSync } = await import("node:fs");
    const { isNonRetryableUploadFailure } = await import("../../src/js/starmus-offline.js");
    const core = readFileSync("src/js/starmus-core.js", "utf8");

    const retryableInCore = core.slice(
        core.indexOf("const retryableUploadError ="),
        core.indexOf("if (transferred) {"),
    );
    assert.match(
        retryableInCore,
        /response code\|status\|HTTP/,
        "core recognises the structured server-error forms the queue does",
    );

    for (const msg of ["tus: response code: 503", "HTTP 500", "status: 502"]) {
        assert.equal(isNonRetryableUploadFailure(msg), false, `the queue retries: ${msg}`);
    }
});

test("a superseded upload that fails after transfer does not complete the new source", () => {
    // The post-transfer error carries the *old* upload id, so the
    // delivered-then-failed branch read it as a valid delivery and marked the
    // replacement `complete` — disabling submission for bytes never uploaded.
    // The same defect the superseded state exists to prevent, arriving through
    // the error path rather than the completion path.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-old" });
    store.dispatch({ type: "starmus/file-attached", file: fakeFile });

    store.dispatch({
        type: "starmus/error",
        error: { message: "redirect failed", retryable: false, uploadId: "upload-old" },
    });

    const state = store.getState();
    assert.equal(state.status, "ready_to_submit", "the attachment can still be sent");
    assert.equal(state.source.kind, "file");
});

test("an unsuperseded post-transfer failure still settles as delivered", () => {
    // The branch above must not swallow the ordinary case: the bytes are on the
    // server, and re-offering the upload would spend the contributor's data
    // twice.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-1" });

    store.dispatch({
        type: "starmus/error",
        error: { message: "redirect failed", retryable: false, uploadId: "upload-1" },
    });

    assert.equal(store.getState().status, "complete");
});

test("an unverifiable constraint is not reported as a failed capture", async () => {
    // `attained` is a tri-state and `null` is not a failure. The recorder tested
    // it for truthiness, so every ordinary `conversation` capture logged that
    // the device had not met the profile — the bitrate is a MediaRecorder
    // option a track never reports, so it is always unverified. A warning that
    // fires on the normal case teaches people to ignore it.
    const { readFileSync } = await import("node:fs");
    const { describeAttainment } = await import("../../src/js/starmus-capture-profiles.js");
    const source = readFileSync("src/js/starmus-recorder.js", "utf8");

    const ordinary = describeAttainment("conversation", {
        getSettings: () => ({ sampleRate: 16000, channelCount: 1 }),
    });
    assert.equal(ordinary.attained, null, "an ordinary capture is not a failure");
    assert.ok(ordinary.unverified.includes("audioBitsPerSecond"));

    assert.match(
        source,
        /if \(attainment\.attained === false\) \{/,
        "the warning is gated on an actual failure, not on falsiness",
    );
    assert.doesNotMatch(source, /if \(!attainment\.attained\) \{/, "not on truthiness");
});

test("the resume fingerprint outlives the record of the transfer", async () => {
    // Cleared on success, the fingerprint raced the durable mark: the queue
    // writes `transferred: true` in a later IndexedDB transaction, and a page
    // that died in between left a row marked untransferred with no resume
    // identity. The next drain could only start a second TUS resource for a
    // recording the server had already accepted.
    //
    // On the devices this package exists for, a backgrounded tab being killed
    // is the ordinary case, not the exotic one.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-tus.js", "utf8");

    assert.match(
        source,
        /removeFingerprintOnSuccess: false,/,
        "the fingerprint survives a crash between the transfer and its record",
    );
    assert.doesNotMatch(source, /removeFingerprintOnSuccess: true,/);

    // And it is still what the resume path looks for.
    assert.match(source, /findPreviousUploads\(\)/, "the next attempt resumes by it");
});

test("a submission that ended leaves no record of itself", async () => {
    // These branches moved `status` out of `submitting` while `submission` kept
    // the finished attempt's `activeId`. A late completion naming that id then
    // matched and drove the UI back to `complete` over a submission that had
    // already failed.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-1" });
    store.dispatch({
        type: "starmus/error",
        error: { message: "QueueFull", retryable: false },
    });

    const afterFailure = store.getState();
    assert.equal(afterFailure.status, "ready_to_submit");
    assert.equal(afterFailure.submission.activeId, null, "the failed attempt is not still in flight");
    assert.equal(afterFailure.submission.superseded, false);
    assert.equal(afterFailure.submission.isQueued, false);

    // The late completion of that failed attempt does not resurrect it.
    //
    // This assertion previously expected `complete`, on the reasoning that a
    // cleared `activeId` means "nothing named itself, so accept". That was
    // wrong and it was encoding the defect: after a terminal failure there is
    // no submission in flight, and a completion arriving late for the attempt
    // that just failed must not mark the recording delivered.
    store.dispatch({ type: "starmus/submit-complete", submissionId: "upload-1" });
    assert.equal(
        store.getState().status,
        "ready_to_submit",
        "a completion for a failed attempt does not resurrect it",
    );
});

test("tus fingerprint stays a Promise, because the client requires one", async () => {
    // tus-js-client 4.3.1 calls `options.fingerprint(file, options).then(...)`.
    // A plain string has no `.then` and throws exactly where the resume lookup
    // happens — so "simplifying" this breaks resumption, which is the property
    // the custom fingerprint exists to provide.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-tus.js", "utf8");

    assert.match(
        source,
        /fingerprint: \(\) => Promise\.resolve\(/,
        "the fingerprint resolves rather than returning a bare string",
    );

    const client = readFileSync(
        "node_modules/tus-js-client/lib.es5/upload.js",
        "utf8",
    );
    assert.match(
        client,
        /this\.options\.fingerprint\(this\.file, this\.options\)\.then\(/,
        "and the installed client is what requires it",
    );
});

test("a queue result from an older submission does not mark the current one queued", () => {
    // `queueSubmission()` is asynchronous. A slow result from an earlier
    // attempt could mark whatever is on screen as queued — and the match has to
    // be on the upload id, because the queue's own row id is a different
    // identifier and would never equal the one `submit-start` recorded.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-current" });

    store.dispatch({
        type: "starmus/submit-queued",
        submissionId: "starmus-offline-row-1",
        uploadId: "upload-earlier",
    });
    assert.equal(store.getState().status, "submitting", "a foreign upload id is ignored");

    store.dispatch({
        type: "starmus/submit-queued",
        submissionId: "starmus-offline-row-2",
        uploadId: "upload-current",
    });
    const state = store.getState();
    assert.equal(state.status, "complete", "the submission in flight queues normally");
    assert.equal(state.submission.isQueued, true);
});

test("a post-transfer failure from an older upload does not complete the current one", () => {
    // The error carries the old upload id. Checking only that *some* id exists
    // let it mark a newer submission delivered.
    const store = createStore();
    store.dispatch({
        type: "starmus/recording-available",
        payload: { blob: { type: "audio/webm", size: 2048 }, fileName: "take.webm" },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: "upload-new" });

    store.dispatch({
        type: "starmus/error",
        error: { message: "redirect failed", retryable: false, uploadId: "upload-old" },
    });
    assert.equal(store.getState().status, "submitting", "the stale delivery is not applied");

    store.dispatch({
        type: "starmus/error",
        error: { message: "redirect failed", retryable: false, uploadId: "upload-new" },
    });
    assert.equal(store.getState().status, "complete", "the current one still settles");
});

test("both submission paths treat a transient 4xx the same way", async () => {
    // The queue retries 408, 425 and 429; core called them final, so the UI
    // reported a hard failure while the queue went on retrying the recording.
    const { readFileSync } = await import("node:fs");
    const { isNonRetryableUploadFailure } = await import("../../src/js/starmus-offline.js");
    const core = readFileSync("src/js/starmus-core.js", "utf8");

    const classifier = core.slice(
        core.indexOf("const retryableUploadError ="),
        core.indexOf("if (transferred) {"),
    );
    assert.match(classifier, /4\(\?:08\|25\|29\)/, "core recognises the transient 4xx");

    for (const msg of ["HTTP 429 Too Many Requests", "response code 408", "status: 425"]) {
        assert.equal(isNonRetryableUploadFailure(msg), false, `the queue retries: ${msg}`);
    }
});

test("Opus is named only when Opus is named", async () => {
    const { resolveUploadFormat } = await import("../../src/js/starmus-completion-event.js");

    assert.notEqual(resolveUploadFormat("audio/ogg; codecs=notopus", ""), "opus");
    assert.equal(resolveUploadFormat("audio/ogg", "take.ogg"), "ogg", "the container names itself");
    assert.equal(resolveUploadFormat('audio/ogg; codecs="opus"', ""), "opus");
    assert.equal(resolveUploadFormat("audio/opus", ""), "opus");
});

test("the transport's attempt budget is the one AGENTS.md states", async () => {
    // tus-js-client counts each `retryDelays` entry as a retry after the
    // initial request, so three entries permit four attempts while AGENTS.md
    // names three as the maximum and calls exceeding it a FAIL.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-tus.js", "utf8");
    const agents = readFileSync("AGENTS.md", "utf8");

    const match = /retryDelays: \[([^\]]*)\]/.exec(source);
    assert.ok(match, "a retry schedule is configured");
    const entries = match[1].split(",").filter((part) => part.trim() !== "");
    assert.equal(entries.length + 1, 3, "initial request plus retries is three attempts");

    assert.match(agents, /[Mm]ax 3 attempts/, "and three is what the rule says");
});

test("host configuration cannot reopen the duplicate-upload window", async () => {
    // `removeFingerprintOnSuccess: false` is what makes a crash between a
    // successful transfer and the queue's durable mark recoverable, and the
    // stall watchdog has to stay inside the claim lease derived from it. Both
    // were merged from `window.starmusTus` like ordinary preferences, so a
    // config key could reintroduce a second upload of an accepted recording,
    // or let another tab claim a row whose transfer is still running.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-tus.js", "utf8");

    const afterMerge = source.slice(source.indexOf("for (const [key, val] of Object.entries(globalCfg))"));
    assert.match(
        afterMerge,
        /merged\.removeFingerprintOnSuccess = false;/,
        "the fingerprint setting is re-asserted after the host merge",
    );
    assert.match(
        afterMerge,
        /merged\.stallTimeoutMs = UPLOAD_STALL_TIMEOUT_MS;/,
        "and an over-long watchdog is clamped to what the lease covers",
    );
});
