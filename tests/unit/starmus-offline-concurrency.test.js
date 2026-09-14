/**
 * Concurrency behaviour of the offline queue.
 *
 * The queue's claim/lease model is what stops two tabs uploading one recording
 * twice, and what stops a drain whose lease lapsed from overwriting the state
 * of whichever tab took the row next. Those are claims about IndexedDB's
 * transaction semantics, so they are tested against an implementation of the
 * specification rather than a stub — see `offline-harness.mjs`.
 *
 * Every test here describes a way a contributor loses a recording.
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
    freshEnvironment,
    openTab,
    atTimeOffset,
    fakeBlob,
    META,
} from "./offline-harness.mjs";

const LEASE_MS = 2 * 60 * 1000;

/** Queues one recording and returns its id, from a single tab. */
async function seed(queue, { size = 2048, name = "take.webm" } = {}) {
    return queue.add("inst-1", fakeBlob(size), name, { language: "wo" }, { ...META });
}

test("two tabs cannot both take the same queued recording", async () => {
    // Both tabs drain on reconnect. Without an atomic claim they both read the
    // row as unclaimed, both uploaded it, and the platform received the same
    // take twice — paid for twice out of the contributor's data.
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const [first, second] = await Promise.all([a.queue._claim(id), b.queue._claim(id)]);

    const winners = [first, second].filter((c) => c && c.token);
    assert.equal(winners.length, 1, "exactly one tab holds the claim");
    assert.ok(winners[0].row, "and the winner is handed the row it claimed");
    assert.equal(winners[0].row.id, id);
});

test("a second claim is refused for as long as the lease runs", async () => {
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const held = await a.queue._claim(id);
    assert.ok(held.token, "the first tab claims it");

    // Just short of expiry, the row is still the first tab's.
    const early = await atTimeOffset(LEASE_MS - 1000, () => b.queue._claim(id));
    assert.ok(!early || !early.token, "the second tab is refused while the lease runs");
});

test("a lapsed lease releases the recording to another tab", async () => {
    // A tab that was closed mid-upload, or a phone that died, leaves its claim
    // behind. Without expiry the recording is stranded: claimed forever by a
    // tab that no longer exists, and never uploaded by any other.
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const abandoned = await a.queue._claim(id);
    assert.ok(abandoned.token);

    const taken = await atTimeOffset(LEASE_MS + 1000, () => b.queue._claim(id));
    assert.ok(taken && taken.token, "the next tab can take it once the lease lapses");
    assert.notEqual(taken.token, abandoned.token, "under its own token");
});

test("a write from a lapsed lease cannot overwrite the new owner's state", async () => {
    // The dangerous case: the original tab was not dead, only slow. It returns
    // after its lease expired and writes the outcome of an attempt that is no
    // longer its to record — over the state of the tab now uploading the row.
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const stale = await a.queue._claim(id);
    const fresh = await atTimeOffset(LEASE_MS + 1000, () => b.queue._claim(id));
    assert.ok(fresh.token);

    await atTimeOffset(LEASE_MS + 1000, async () => {
        await a.queue._hold(id, "stale tab decided to hold it", false, stale.token);
        await a.queue._updateRetry(id, 99, new Error("stale retry"), stale.token);
        const marked = await a.queue._markTransferred(id, stale.token);
        assert.equal(marked, false, "a stale tab is told its mark did not land");
    });

    const [row] = await a.queue.getAll();
    assert.equal(row.held, false, "the stale hold did not land");
    assert.notEqual(row.retryCount, 99, "nor the stale retry count");
    assert.notEqual(row.transferred, true, "nor the stale transfer mark");
    assert.equal(row.leaseOwner, fresh.token, "the row still belongs to the tab holding it");
});

test("a recording survives the tab that was uploading it disappearing", async () => {
    // Crash and reload. The bytes are the contribution; nothing about a lost
    // page may cost them. ADR-011 keeps the material unconditionally.
    freshEnvironment();
    const first = await openTab();
    const id = await seed(first.queue, { size: 4096, name: "field-recording.webm" });
    await first.queue._claim(id);

    // The page goes away mid-claim: no release, no completion, nothing tidied.
    const reloaded = await openTab();
    const rows = await reloaded.queue.getAll();

    assert.equal(rows.length, 1, "the recording is still queued after the reload");
    assert.equal(rows[0].audioBlob.size, 4096, "with its bytes intact");
    assert.equal(rows[0].fileName, "field-recording.webm", "and its name");
    assert.equal(rows[0].metadata.language, "wo", "and the metadata ingestion needs");

    const recovered = await atTimeOffset(LEASE_MS + 1000, () => reloaded.queue._claim(id));
    assert.ok(recovered && recovered.token, "and the reloaded page can take it up again");
});

test("marking a transfer twice does not report two transfers", async () => {
    // `starmus:complete` is emitted before the row is marked, deliberately: a
    // duplicate event is dedupable by `uploadId`, a lost one is not. That makes
    // repeated marking a normal occurrence, and it has to settle the same way.
    freshEnvironment();
    const tab = await openTab();
    const id = await seed(tab.queue);
    const claim = await tab.queue._claim(id);

    assert.equal(await tab.queue._markTransferred(id, claim.token), true, "the mark lands once");
    assert.equal(await tab.queue._markTransferred(id, claim.token), true, "and again, idempotently");
    await tab.queue._markCompletionEmitted(id, claim.token);
    await tab.queue._markCompletionEmitted(id, claim.token);

    const [row] = await tab.queue.getAll();
    assert.equal(row.transferred, true);
    assert.equal(row.completionEmitted, true);
    assert.equal((await tab.queue.getAll()).length, 1, "and there is still one recording");
});

test("a tab that lost its claim is told, rather than reporting success", async () => {
    // The caller decides what to do about it; it can only decide if the write
    // reports what actually happened. `_markTransferred` returning true for a
    // write that never landed is the failure that makes every other guard moot.
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const stale = await a.queue._claim(id);
    await atTimeOffset(LEASE_MS + 1000, () => b.queue._claim(id));

    const landed = await atTimeOffset(LEASE_MS + 1000, () =>
        a.queue._markTransferred(id, stale.token),
    );
    assert.equal(landed, false);
});

test("a full device refuses the recording instead of deleting another one", async () => {
    // The platform standard says LRU. LRU here means deleting the oldest
    // recording to make room, which is exactly what ADR-011 forbids — and the
    // decision about whose material is expendable is not this module's to make.
    //
    // Filled with recordings that each fit on their own, so the refusal comes
    // from the queue's total budget and not from the per-recording cap. An
    // earlier version of this test used one oversized blob, which the cap
    // rejected before the budget was ever consulted: it passed while the
    // budget was broken.
    freshEnvironment();
    const tab = await openTab();

    const MB = 1024 * 1024;
    const queued = [];
    for (let i = 0; i < 5; i += 1) {
        queued.push(await seed(tab.queue, { size: 4 * MB, name: `take-${i}.webm` }));
    }
    const usageBefore = await tab.queue.usage();
    assert.equal(usageBefore.count, 5, "the queue is full to its budget");
    assert.equal(usageBefore.totalBytes, 20 * MB);

    let refusal = null;
    try {
        await seed(tab.queue, { size: 4 * MB, name: "one-too-many.webm" });
    } catch (err) {
        refusal = err;
    }

    assert.ok(refusal, "the recording that does not fit is refused");
    assert.match(refusal.message, /QueueFull/, "named so the caller can report it");
    assert.match(
        refusal.message,
        /Nothing is deleted to make room/,
        "and the refusal says what it did not do",
    );

    const after = await tab.queue.getAll();
    assert.equal(after.length, 5, "nothing already queued was evicted to fit it");
    assert.deepEqual(
        after.map((r) => r.id).sort(),
        [...queued].sort(),
        "and every recording held before the refusal is still held",
    );
    assert.ok(
        after.every((r) => r.audioBlob.size === 4 * MB),
        "with their bytes untouched",
    );
});

test("a refusal names the held recordings that are occupying the space", async () => {
    // The contributor is present and can act — but only on information they
    // are given. A bare "queue full" leaves them with a device that refuses
    // recordings for a reason nothing on screen explains.
    freshEnvironment();
    const tab = await openTab();
    const MB = 1024 * 1024;

    const stuck = await seed(tab.queue, { size: 4 * MB, name: "stuck.webm" });
    await tab.queue._hold(stuck, "needs attention", false, null);
    for (let i = 0; i < 4; i += 1) {
        await seed(tab.queue, { size: 4 * MB, name: `take-${i}.webm` });
    }

    let refusal = null;
    try {
        await seed(tab.queue, { size: 4 * MB, name: "one-too-many.webm" });
    } catch (err) {
        refusal = err;
    }

    assert.ok(refusal);
    assert.match(refusal.message, /1 held recording\(s\) occupy 4\.00 MB/, refusal.message);
});

test("a stalled transfer is retried, never held", async () => {
    // The 2G case. A recording stalls because the link is slow, which is the
    // ordinary condition this platform is built for — not a rejection. Held on
    // the first stall, a recording stops being retried and waits for a person
    // who may never come.
    const { isNonRetryableUploadFailure } = await import("../../src/js/starmus-offline.js");

    for (const msg of [
        // The exact message that was misread: `/400/` matched "4000ms".
        "TUS_UPLOAD_STALLED: no progress for 4000ms",
        "TUS_UPLOAD_STALLED: no progress for 40000ms",
        "TUS_RESUME_LOOKUP_FAILED: could not reach the server",
        "OFFLINE_FAST_PATH",
        "network error",
        "socket hang up",
        "HTTP 503 Service Unavailable",
        "response code 500",
    ]) {
        assert.equal(isNonRetryableUploadFailure(msg), false, `retryable: ${msg}`);
    }
});

test("a rejection the server will repeat is held rather than retried forever", async () => {
    const { isNonRetryableUploadFailure } = await import("../../src/js/starmus-offline.js");

    for (const msg of [
        "tus: unexpected response while creating upload, originated from request (response code: 413)",
        "response code 400",
        "HTTP 401 Unauthorized",
        "status: 422",
        "Invalid JSON in response",
        "QuotaExceededError: storage is full",
    ]) {
        assert.equal(isNonRetryableUploadFailure(msg), true, `not retryable: ${msg}`);
    }
});

test("an unrecognised failure is retried, not held", async () => {
    // The default matters: holding needs a person, and guessing wrong in that
    // direction strands a recording over a message nobody anticipated.
    const { isNonRetryableUploadFailure } = await import("../../src/js/starmus-offline.js");

    for (const msg of ["", "something went wrong", "undefined", "Error: 40"]) {
        assert.equal(isNonRetryableUploadFailure(msg), false, `retryable by default: ${msg}`);
    }
    assert.equal(isNonRetryableUploadFailure(null), false, "including no message at all");
    assert.equal(isNonRetryableUploadFailure(undefined), false);
});
