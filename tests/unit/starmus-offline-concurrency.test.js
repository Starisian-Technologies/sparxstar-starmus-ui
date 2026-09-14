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

// Derived, not copied. A test that hardcodes the lease keeps passing when the
// constant moves and silently stops testing the boundary it names.
const { UPLOAD_STALL_TIMEOUT_MS } = await import("../../src/js/starmus-tus.js");
const LEASE_MS = UPLOAD_STALL_TIMEOUT_MS + 60 * 1000;

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

test("a metadata write reports whether it landed", async () => {
    // The caller is about to transfer bytes identified by what this persists.
    // Told nothing, a drain that had lost the row uploaded under an id no row
    // recorded — so it and the tab that took the row resumed different
    // server-side resources, and the take arrived twice.
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const mine = await a.queue._claim(id);
    assert.equal(
        await a.queue._setMetadata(id, { ...META, uploadId: "owned" }, mine.token),
        true,
        "the owner's write lands",
    );

    const taken = await atTimeOffset(LEASE_MS + 1000, () => b.queue._claim(id));
    assert.ok(taken.token);

    const landed = await atTimeOffset(LEASE_MS + 1000, () =>
        a.queue._setMetadata(id, { ...META, uploadId: "stale" }, mine.token),
    );
    assert.equal(landed, false, "the write from the lapsed lease is reported as not landing");

    const [row] = await a.queue.getAll();
    assert.equal(row.metadata.uploadId, "owned", "and the new owner's metadata is intact");
});

test("a metadata write to a recording that is gone reports that too", async () => {
    // A row removed by the tab that completed it. There is nothing to upload,
    // and a drain told the write succeeded would transfer it again.
    freshEnvironment();
    const tab = await openTab();
    const id = await seed(tab.queue);
    const claim = await tab.queue._claim(id);
    await tab.queue.remove(id, claim.token);

    assert.equal(await tab.queue._setMetadata(id, { ...META }, claim.token), false);
});

test("a server asking for a retry gets one", async () => {
    // Not every 4xx is final. 429 is a server explicitly requesting the retry
    // that holding the recording refuses to make, and on a shared or
    // rate-limited connection it is ordinary — holding on the first one strands
    // a recording waiting for a person over a wait the queue could sit out.
    const { isNonRetryableUploadFailure } = await import("../../src/js/starmus-offline.js");

    for (const msg of [
        "tus: unexpected response while creating upload (response code: 429)",
        "HTTP 429 Too Many Requests",
        "response code 408",
        "status: 425",
    ]) {
        assert.equal(isNonRetryableUploadFailure(msg), false, `retryable: ${msg}`);
    }

    // The genuinely final ones still are.
    for (const msg of ["response code 413", "HTTP 401 Unauthorized", "status: 422"]) {
        assert.equal(isNonRetryableUploadFailure(msg), true, `not retryable: ${msg}`);
    }
});

test("a renewal distinguishes losing the row from storage not answering", async () => {
    // Reported alike, a storage failure abandoned uploads that had already
    // succeeded: the drain stood down, the row stayed `transferred: false`, and
    // because the resume fingerprint is dropped on success the next drain
    // started a second TUS resource rather than reconciling the accepted one.
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const mine = await a.queue._claim(id);
    assert.equal(await a.queue._renewClaim(id, mine.token), true, "the owner renews");

    // Genuinely no longer ours: a definite answer, and the drain must stand down.
    const taken = await atTimeOffset(LEASE_MS + 1000, () => b.queue._claim(id));
    assert.ok(taken.token);
    assert.equal(
        await a.queue._renewClaim(id, mine.token),
        false,
        "a row owned by another tab reports lost",
    );
    assert.equal(await b.queue._renewClaim("no-such-row", taken.token), false, "as does a gone row");

    // Storage cannot answer. Unknown — never reported as lost.
    b.queue.db.close();
    assert.equal(
        await b.queue._renewClaim(id, taken.token),
        null,
        "a closed connection is unknown, not lost",
    );
});

test("only a definite loss stands the drain down", async () => {
    // The distinction is only worth having if the caller honours it.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    assert.match(
        source,
        /if \(ok === false\) \{/,
        "the renewal result is compared to false, not merely falsy",
    );
    assert.doesNotMatch(
        source.slice(source.indexOf("renewalInFlight = this._renewClaim")),
        /if \(!ok\) \{\n\s+claimLost = true;/,
        "an unknown renewal does not set claimLost",
    );
});

test("deciding when to wake does not load the recordings", async () => {
    // The scheduler needs a retry count and two timestamps. Reading them via
    // `getAll()` deserialised every queued row — the whole retained queue — on
    // every scheduled wake, on the devices least able to spare it.
    freshEnvironment();
    const tab = await openTab();
    const MB = 1024 * 1024;
    await seed(tab.queue, { size: 4 * MB, name: "a.webm" });
    await seed(tab.queue, { size: 4 * MB, name: "b.webm" });

    const rows = await tab.queue._scheduleSnapshot();
    assert.equal(rows.length, 2);
    for (const row of rows) {
        assert.deepEqual(
            Object.keys(row).sort(),
            ["lastAttempt", "leaseUntil", "retryCount"],
            "only the scheduling fields travel",
        );
    }

    // Held rows are dropped, so one held recording cannot reschedule the queue
    // immediately and forever over something it will never retry.
    const stuck = await seed(tab.queue, { size: 1024, name: "stuck.webm" });
    await tab.queue._hold(stuck, "needs attention", false, null);
    assert.equal((await tab.queue._scheduleSnapshot()).length, 2, "held rows are excluded");

    // And the scheduler actually goes through it. Asserting only that the
    // snapshot exists left the test passing with the scheduler still calling
    // `getAll()` — it proved the helper worked, not that anything used it.
    const id = (await tab.queue.getAll()).find((r) => r.fileName === "a.webm").id;
    const claim = await tab.queue._claim(id);
    assert.ok(claim.token);

    const realGetAll = tab.queue.getAll.bind(tab.queue);
    tab.queue.getAll = () => {
        throw new Error("the scheduler must not materialise the queue");
    };
    try {
        assert.equal(typeof (await tab.queue._getNextProcessDelay()), "number");
    } finally {
        tab.queue.getAll = realGetAll;
    }
});

test("the claim lease outlives the stall watchdog", async () => {
    // Renewal happens on progress, so a stalled transfer stops renewing. If the
    // lease could lapse before the watchdog aborts the attempt, another tab
    // would claim a row whose first transfer is still running: two uploads of
    // one recording, the contributor's data spent twice, and the two racing
    // each other's completion. Both constants were 120000 — an exact tie, and
    // losing it costs a contributor their bandwidth.
    const offline = await import("../../src/js/starmus-offline.js?ordering");
    const tus = await import("../../src/js/starmus-tus.js");

    // Read from the queue's own configuration rather than recomputed here.
    freshEnvironment();
    const tab = await openTab();
    const id = await seed(tab.queue);
    const before = Date.now();
    const claim = await tab.queue._claim(id);
    const [row] = await tab.queue.getAll();
    const grantedFor = row.leaseUntil - before;

    assert.ok(claim.token);
    assert.ok(
        grantedFor > tus.UPLOAD_STALL_TIMEOUT_MS,
        `lease ${grantedFor}ms must exceed the ${tus.UPLOAD_STALL_TIMEOUT_MS}ms stall watchdog`,
    );
    assert.ok(
        grantedFor - tus.UPLOAD_STALL_TIMEOUT_MS >= 30 * 1000,
        "with margin, so the ordering holds rather than ties",
    );
    assert.equal(typeof offline.isNonRetryableUploadFailure, "function");
});

test("a transfer that could not be recorded is held, never re-uploaded", async () => {
    // `_markTransferred()` runs after the bytes landed and after the resume
    // fingerprint was dropped. Reading a storage failure as "the row is not
    // ours" left it `transferred: false`, and the next drain created a second
    // TUS resource for a recording the server had already accepted.
    freshEnvironment();
    const a = await openTab();
    const b = await openTab();
    const id = await seed(a.queue);

    const mine = await a.queue._claim(id);
    assert.equal(await a.queue._markTransferred(id, mine.token), true, "the owner's mark lands");

    // A definite loss is still a definite loss.
    const taken = await atTimeOffset(LEASE_MS + 1000, () => b.queue._claim(id));
    assert.ok(taken.token);
    assert.equal(
        await atTimeOffset(LEASE_MS + 1000, () => a.queue._markTransferred(id, mine.token)),
        false,
        "a row owned by another tab reports lost, not unknown",
    );

    // Storage unable to answer is neither success nor loss.
    b.queue.db.close();
    assert.equal(
        await b.queue._markTransferred(id, taken.token),
        null,
        "a closed connection is unknown",
    );
});

test("counting the queue does not load the queue", async () => {
    // Core asks for the pending count immediately after queueing — when the
    // queue is at its fullest — and `getAll()` deserialised every row to
    // produce a number.
    freshEnvironment();
    const tab = await openTab();
    const MB = 1024 * 1024;
    await seed(tab.queue, { size: 4 * MB, name: "a.webm" });
    await seed(tab.queue, { size: 4 * MB, name: "b.webm" });

    // Through the exported entry point, which is what core actually calls —
    // asserting on `_countPending()` alone passed while `getPendingCount()`
    // still loaded every row.
    const realGetAll = tab.queue.getAll.bind(tab.queue);
    tab.queue.getAll = () => {
        throw new Error("counting must not materialise the queue");
    };
    try {
        assert.equal(await tab.module.getPendingCount(), 2);
    } finally {
        tab.queue.getAll = realGetAll;
    }
});

test("every storage failure in the transfer marker answers unknown", async () => {
    // The closed-connection case above covers the synchronous throw. The
    // request- and transaction-level error handlers are the other two ways
    // storage declines to answer, and they are not reachable from
    // fake-indexeddb — but reading either as `false` is the defect this whole
    // distinction exists to prevent, so they are pinned here.
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/js/starmus-offline.js", "utf8");

    const body = source.slice(
        source.indexOf("async _markTransferred(id, token) {"),
        source.indexOf("async _markCompletionEmitted("),
    );
    assert.match(body, /req\.onerror = \(\) => resolve\(null\);/, "request errors are unknown");
    assert.match(body, /tx\.onerror = \(\) => resolve\(null\);/, "transaction errors are unknown");
    assert.doesNotMatch(body, /resolve\(false\)/, "no storage failure reports loss of the row");

    // And the drain acts on the three answers distinctly.
    const drain = source.slice(source.indexOf("const recorded = await this._markTransferred("));
    assert.match(drain.slice(0, 2000), /recorded === false/, "a definite loss stands it down");
    assert.match(drain.slice(0, 2000), /recorded === null/, "an unknown holds the row instead");
});

test("a drain does not load every recording before claiming one", async () => {
    // `getAll()` deserialised every queued row — each with its audio — before
    // the drain had claimed even the first. On a full queue that is the 20 MB
    // cap held at once against the 5 MB in-memory Blob budget AGENTS.md states
    // as a FAIL condition, by the path that runs most often.
    freshEnvironment();
    const tab = await openTab();
    const MB = 1024 * 1024;
    await seed(tab.queue, { size: 4 * MB, name: "a.webm" });
    await seed(tab.queue, { size: 4 * MB, name: "b.webm" });
    await seed(tab.queue, { size: 4 * MB, name: "c.webm" });

    const summaries = await tab.queue._pendingSummaries();
    assert.equal(summaries.length, 3);
    for (const row of summaries) {
        assert.deepEqual(
            Object.keys(row).sort(),
            ["held", "id", "transferred"],
            "the drain's listing carries no recording",
        );
    }

    // And the drain itself goes through it. Asserting only on the helper left
    // this passing with `processQueue()` still calling `getAll()`.
    // Counted rather than thrown from: `processQueue()` catches, so a throwing
    // stub was swallowed and this test passed with the drain still calling
    // `getAll()`.
    const realGetAll = tab.queue.getAll.bind(tab.queue);
    let materialised = 0;
    tab.queue.getAll = (...args) => {
        materialised += 1;
        return realGetAll(...args);
    };
    try {
        // Online, because `processQueue()` returns immediately when offline —
        // which is how this test first passed without the drain ever running.
        // No upload endpoint is configured, so every attempt fails and the rows
        // are retried or held; none of that reaches `getAll()`.
        navigator.onLine = true;
        await tab.queue.processQueue();
    } finally {
        navigator.onLine = false;
        tab.queue.getAll = realGetAll;
    }
    assert.equal(materialised, 0, "the drain never loaded the whole queue");

    assert.equal((await tab.queue.getAll()).length, 3, "and every recording is still here");
});
