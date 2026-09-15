/**
 * @file starmus-submission-shape.test.js
 * @description `submission` is replaced wholesale, never merged, so a branch
 * that leaves a key out sets it to `undefined` rather than leaving it alone.
 * Every terminal transition therefore has to write the same key set. This is
 * pinned rather than left to review because the failure is invisible: the
 * branch looks right, the key is simply absent, and the reading code only
 * misbehaves once someone writes `=== null` instead of `?? null`.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { createStore, DEFAULT_INITIAL_STATE } from "../../src/js/starmus-state-store.js";

const SETTLED_KEYS = ["activeId", "completedId", "isQueued", "progress", "superseded"];

function keysOf(submission) {
    return Object.keys(submission).sort();
}

const UPLOAD_A = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

/** A store that has reached `submitting` with `UPLOAD_A` in flight. */
function submittingStore() {
    const store = createStore({ instanceId: "t" });
    store.dispatch({ type: "starmus/init", payload: { instanceId: "t", tier: "A" } });
    store.dispatch({
        type: "starmus/recording-available",
        payload: { instanceId: "t", blob: { size: 1 } },
    });
    store.dispatch({ type: "starmus/submit-start", submissionId: UPLOAD_A });
    assert.equal(store.getState().status, "submitting", "precondition: submitting");
    assert.equal(store.getState().submission.activeId, UPLOAD_A);
    return store;
}

test("the initial state carries the full submission shape", () => {
    assert.deepEqual(keysOf(DEFAULT_INITIAL_STATE.submission), SETTLED_KEYS);
});

test("submit-start writes the full shape", () => {
    const store = submittingStore();
    assert.deepEqual(keysOf(store.getState().submission), SETTLED_KEYS);
});

test("a completion writes the full shape and records which upload settled", () => {
    const store = submittingStore();
    store.dispatch({ type: "starmus/submit-complete", submissionId: UPLOAD_A });
    const { status, submission } = store.getState();
    assert.equal(status, "complete");
    assert.deepEqual(keysOf(submission), SETTLED_KEYS);
    assert.equal(submission.completedId, UPLOAD_A);
    assert.equal(submission.activeId, null);
    assert.equal(submission.superseded, false);
    assert.equal(submission.progress, 1);
});

test("a queued result writes the full shape", () => {
    const store = submittingStore();
    store.dispatch({ type: "starmus/submit-queued", uploadId: UPLOAD_A, submissionId: "row-1" });
    const { submission } = store.getState();
    assert.deepEqual(keysOf(submission), SETTLED_KEYS);
    // Previously omitted here, so `activeId` read `undefined` after a queue and
    // `null` after a completion — the same settled state answering differently.
    assert.equal(submission.activeId, null);
    assert.equal(submission.isQueued, true);
});

test("a superseded completion writes the full shape and clears superseded", () => {
    const store = submittingStore();
    store.dispatch({ type: "starmus/file-attached", file: { name: "a.wav", size: 2 } });
    assert.equal(store.getState().submission.superseded, true, "precondition: superseded");

    store.dispatch({ type: "starmus/submit-complete", submissionId: UPLOAD_A });
    const { status, submission } = store.getState();
    assert.equal(status, "ready_to_submit", "the attachment is still sendable");
    assert.deepEqual(keysOf(submission), SETTLED_KEYS);
    // Stated, not left to omission: the flag must be false because this branch
    // sets it false, not because the key happens to be missing.
    assert.equal(submission.superseded, false);
    assert.equal(submission.completedId, null, "the replaced upload settled nothing here");
});

test("a superseded queue result writes the full shape and clears superseded", () => {
    const store = submittingStore();
    store.dispatch({ type: "starmus/file-attached", file: { name: "a.wav", size: 2 } });

    store.dispatch({ type: "starmus/submit-queued", uploadId: UPLOAD_A, submissionId: "row-1" });
    const { status, submission } = store.getState();
    assert.equal(status, "ready_to_submit");
    assert.deepEqual(keysOf(submission), SETTLED_KEYS);
    assert.equal(submission.superseded, false);
    assert.equal(submission.isQueued, false, "the attachment is not the thing that was queued");
});

test("a terminal submission error writes the full shape", () => {
    const store = submittingStore();
    store.dispatch({
        type: "starmus/error",
        // `retryable: false` is what makes this terminal; a retryable error
        // deliberately leaves the submission in flight.
        error: { code: "QUEUE_FULL", message: "no room", attemptId: UPLOAD_A, retryable: false },
    });
    const { status, submission } = store.getState();
    assert.equal(status, "ready_to_submit", "the UI is given back");
    assert.deepEqual(keysOf(submission), SETTLED_KEYS);
    assert.equal(submission.activeId, null);
    assert.equal(submission.superseded, false);
});

test("a post-transfer error keeps the delivery but still writes the full shape", () => {
    const store = submittingStore();
    store.dispatch({
        type: "starmus/error",
        error: {
            code: "NOTIFY_FAILED",
            message: "host refused",
            attemptId: UPLOAD_A,
            uploadId: UPLOAD_A,
        },
    });
    const { status, submission } = store.getState();
    assert.equal(status, "complete", "the bytes landed; do not invite a second upload");
    assert.deepEqual(keysOf(submission), SETTLED_KEYS);
    assert.equal(submission.progress, 1);
});
