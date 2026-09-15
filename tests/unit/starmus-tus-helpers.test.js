/**
 * @file starmus-tus-helpers.test.js
 * @description The exported helpers in starmus-tus.js are the contract this
 * module shares with the offline queue and with the host page, and none of
 * them had a test. Two of the four decide whether a transfer can resume:
 * `isUploadId()` decides whether a stored id survives to the next attempt, and
 * `createUploadId()` mints the one that becomes the resume fingerprint. The
 * third, `sanitizeHeaders()`, decides what leaves the device as a header.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
    createUploadId,
    isUploadId,
    reservedMetadataKeys,
    resolveUploadHeaders,
    sanitizeHeaders,
} from "../../src/js/starmus-tus.js";

/** Silence the deliberate warnings so a rejection under test is not noise. */
function withoutWarnings(run) {
    const original = console.warn;
    const warnings = [];
    console.warn = (...args) => warnings.push(args.join(" "));
    try {
        return { result: run(), warnings };
    } finally {
        console.warn = original;
    }
}

test("sanitizeHeaders keeps ordinary string headers", () => {
    const { result } = withoutWarnings(() =>
        sanitizeHeaders({ Authorization: "Bearer abc", "X-Trace": "7" }),
    );
    assert.deepEqual({ ...result }, { Authorization: "Bearer abc", "X-Trace": "7" });
});

test("sanitizeHeaders returns a null-prototype bag", () => {
    // Not cosmetic. With Object.prototype in the chain, a later
    // `Object.assign({}, headers)` routes a `__proto__` key through the
    // accessor instead of copying it, so the bag both loses the entry and
    // changes shape. Removing the accessor is what makes that impossible.
    const { result } = withoutWarnings(() => sanitizeHeaders({ "X-A": "1" }));
    assert.equal(Object.getPrototypeOf(result), null);
});

test("sanitizeHeaders drops __proto__ and friends, and the copy keeps its shape", () => {
    // `__proto__` carries a *string* here deliberately: an object value
    // would be dropped by the value filter, and the test would then pass
    // without the name ever being refused.
    const hostile = JSON.parse('{"__proto__": "v", "constructor": "c", "prototype": "p", "X-Keep": "y"}');
    const { result, warnings } = withoutWarnings(() => sanitizeHeaders(hostile));

    assert.deepEqual(Object.keys(result), ["X-Keep"]);
    assert.equal(Object.getPrototypeOf(Object.assign({}, result)), Object.prototype);
    assert.equal({}.x, undefined, "Object.prototype must be untouched");
    assert.equal(warnings.length, 3);
});

test("sanitizeHeaders refuses non-string values instead of stringifying them", () => {
    // `[object Object]` in the authorization header is a request that fails at
    // ingestion with nothing in it to say why.
    const { result } = withoutWarnings(() =>
        sanitizeHeaders({ "X-Obj": { a: 1 }, "X-Arr": ["a"], "X-Num": 7, "X-Null": null }),
    );
    assert.deepEqual(Object.keys(result), []);
});

test("sanitizeHeaders refuses CR/LF values rather than rewriting them", () => {
    const { result } = withoutWarnings(() =>
        sanitizeHeaders({ "X-Split": "ok\r\nX-Injected: evil" }),
    );
    assert.deepEqual(Object.keys(result), []);
});

test("sanitizeHeaders refuses names that are not field-name tokens", () => {
    const { result } = withoutWarnings(() =>
        sanitizeHeaders({ "X Space": "1", "X:Colon": "1", "": "1", "X-Fine": "1" }),
    );
    assert.deepEqual(Object.keys(result), ["X-Fine"]);
});

test("sanitizeHeaders tolerates absent and non-object sources", () => {
    for (const source of [undefined, null, "str", 7, []]) {
        assert.deepEqual(Object.keys(sanitizeHeaders(source)), []);
    }
});

test("resolveUploadHeaders warns when a nonce is supplied but no header is (ADR-034)", () => {
    const { result, warnings } = withoutWarnings(() =>
        resolveUploadHeaders({ nonce: "abc123" }),
    );
    assert.deepEqual(Object.keys(result), []);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /uploadHeaders/);
});

test("resolveUploadHeaders stays silent when the host supplied a header", () => {
    const { result, warnings } = withoutWarnings(() =>
        resolveUploadHeaders({ nonce: "abc123", uploadHeaders: { Authorization: "Bearer x" } }),
    );
    assert.deepEqual({ ...result }, { Authorization: "Bearer x" });
    assert.equal(warnings.length, 0);
});

test("resolveUploadHeaders sanitizes what the host supplied", () => {
    const { result } = withoutWarnings(() =>
        resolveUploadHeaders({ uploadHeaders: { "X-Ok": "1", "X-Bad": ["nope"] } }),
    );
    assert.deepEqual({ ...result }, { "X-Ok": "1" });
});

test("isUploadId accepts a UUID v4 and trims first", () => {
    const id = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
    assert.equal(isUploadId(id), true);
    assert.equal(isUploadId(`  ${id}\n`), true, "surrounding whitespace must not reject a valid id");
    assert.equal(isUploadId(id.toUpperCase()), true);
});

test("isUploadId rejects anything that is not a UUID v4", () => {
    const cases = [
        "",
        "not-a-uuid",
        "3f2504e0-4f89-11d3-9a0c-0305e82c3301", // version 1
        "3f2504e0-4f89-41d3-1a0c-0305e82c3301", // bad variant
        "3f2504e0-4f89-41d3-9a0c-0305e82c3301-extra",
        null,
        undefined,
        123,
        { toString: () => "3f2504e0-4f89-41d3-9a0c-0305e82c3301" },
    ];
    for (const value of cases) {
        assert.equal(isUploadId(value), false, `expected rejection: ${String(value)}`);
    }
});

test("createUploadId mints ids isUploadId accepts, and distinct ones", () => {
    const ids = new Set();
    for (let i = 0; i < 200; i += 1) {
        const id = createUploadId();
        assert.equal(isUploadId(id), true, `minted an id its own check rejects: ${id}`);
        ids.add(id);
    }
    assert.equal(ids.size, 200);
});

test("createUploadId refuses to run without secure randomness", async () => {
    // A weaker fallback here would hand two submissions the same resume
    // fingerprint. Throwing is the documented behaviour; assert it holds.
    const original = globalThis.crypto;
    try {
        Object.defineProperty(globalThis, "crypto", {
            value: { subtle: {} },
            configurable: true,
            writable: true,
        });
        assert.throws(() => createUploadId(), /Secure UUID generation is not available/);
    } finally {
        Object.defineProperty(globalThis, "crypto", {
            value: original,
            configurable: true,
            writable: true,
        });
    }
});

test("reservedMetadataKeys covers what was assigned plus the conditional keys", () => {
    const reserved = reservedMetadataKeys({ filename: "a.webm", uploadId: "x" });
    assert.equal(reserved.has("filename"), true);
    assert.equal(reserved.has("uploadId"), true);
    // Conditional module keys must be reserved even when absent from the
    // assigned bag — that absence is exactly when a form field could shadow one.
    assert.equal(reserved.has("captureProfile"), true);
    assert.equal(reserved.has("hostField"), false);
});
