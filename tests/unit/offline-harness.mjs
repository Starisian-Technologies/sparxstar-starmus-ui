/**
 * Test substrate for the offline queue's concurrency behaviour.
 *
 * The queue's safety claims are claims about IndexedDB's transaction model:
 * that a claim is atomic, that a write from a lapsed lease cannot land, that
 * two tabs cannot both take the same row. A hand-written stub would only prove
 * the queue agrees with whatever model the stub encodes — which is the author's
 * own, and therefore proves nothing. `fake-indexeddb` implements the IndexedDB
 * specification, so the semantics under test are the ones a browser enforces.
 *
 * A tab is a module instance. The queue keeps its connection and its in-memory
 * state per module, so importing the module twice under different query strings
 * gives two independent queues over one shared database — which is what two
 * browser tabs are.
 */
import { IDBFactory } from "fake-indexeddb";

/** Installs the browser globals the queue reads, over a fresh empty database. */
export function freshEnvironment() {
    const factory = new IDBFactory();
    globalThis.indexedDB = factory;
    const nav = {
        // Offline by default: `getOfflineQueue()` starts a drain when the device
        // is online, and a background drain racing the scenario under test
        // would make these tests report on whichever won.
        onLine: false,
        userAgent: "node-test",
        storage: { estimate: async () => ({ quota: 50 * 1024 * 1024, usage: 0 }) },
    };
    // Node ships a real `navigator` whose properties are getter-only, so it is
    // replaced rather than assigned to.
    Object.defineProperty(globalThis, "navigator", {
        value: nav,
        configurable: true,
        writable: true,
    });
    globalThis.window = {
        indexedDB: factory,
        navigator: nav,
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {},
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
    };
    return factory;
}

let tabCounter = 0;

/**
 * Opens another tab over the current database.
 *
 * @returns {Promise<{queue: object, module: object}>}
 */
export async function openTab() {
    tabCounter += 1;
    const module = await import(`../../src/js/starmus-offline.js?tab=${tabCounter}`);
    const queue = await module.getOfflineQueue();
    return { queue, module };
}

/**
 * Runs `fn` with the clock advanced by `ms`, then restores it.
 *
 * The lease is two minutes of real time. Waiting it out would make the suite
 * useless on the devices it describes, and shortening the lease in production
 * to suit a test would be the test dictating the behaviour it checks.
 */
export async function atTimeOffset(ms, fn) {
    const realNow = Date.now;
    Date.now = () => realNow.call(Date) + ms;
    try {
        return await fn();
    } finally {
        Date.now = realNow;
    }
}

/** A recording of a given size, as the queue stores it. */
export function fakeBlob(size = 1024, type = "audio/webm") {
    return new Blob([new Uint8Array(size)], { type });
}

export const META = {
    uploadId: null,
    language: "wo",
    captureProfile: "conversation",
    durationMs: 4000,
    mimeType: "audio/webm",
    env: { tier: "C", identifiers: { visitorId: "visitor-1" } },
};
