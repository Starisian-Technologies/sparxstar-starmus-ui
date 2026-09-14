/**
 * Copyright (c) Starisian Technologies. All rights reserved.
 *
 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
 *
 * License: Business Source License 1.1
 * Change Date: January 1, 2036
 * Change License: Starisian Community License
 *
 * See the LICENSE file in the repository root for full license terms.
 */

/**
 * @file starmus-offline.js
 * @version 1.5.0
 * @description Offline-first submission queue using IndexedDB.
 * Provides automatic retry with exponential backoff, network monitoring,
 * and tier-based blob size limits for African market conditions.
 */

"use strict";

import { debugLog } from "./starmus-hooks.js";
import { buildCompletionDetail, emitCompletionEvent } from "./starmus-completion-event.js";
import { createUploadId, isUploadId, uploadWithPriority } from "./starmus-tus.js";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";

/** @type {Object} Queue configuration constants */
/**
 * Whether an upload failure is one that retrying cannot fix.
 *
 * A stall is not such a failure. This is the decision that most directly
 * decides whether a recording made on a slow link survives, so it is a named
 * function rather than an expression buried in the drain: it can be stated,
 * read, and tested against the message families that actually occur.
 *
 * The status match is structured — `response code 404`, `HTTP 413`, `status:
 * 400` — and not a bare number. `/400/` matched any message containing those
 * digits, "TUS_UPLOAD_STALLED: no progress for 4000ms" among them, so a stall
 * was read as a server rejection and held on its first occurrence instead of
 * being retried. Stalls are the normal case on the links this platform exists
 * for, which makes that the worst possible thing to misread.
 *
 * Nothing here decides whether the recording is *kept*: it is kept either way
 * (ADR-011). This decides only whether the queue keeps trying.
 *
 * @param {string} message Failure message from the transfer attempt.
 * @returns {boolean} True when the queue should stop retrying and hold it.
 */
export function isNonRetryableUploadFailure(message) {
    const msg = typeof message === "string" ? message : String(message ?? "");

    // Transient by nature: a stalled transfer, a resume lookup that failed, a
    // device that went offline before the attempt began.
    const stalled = /TUS_UPLOAD_STALLED|TUS_RESUME_LOOKUP_FAILED|OFFLINE_FAST_PATH/i.test(msg);
    if (stalled) {
        return false;
    }

    const status = /(?:response code|status|HTTP)\D{0,3}(4\d\d)/i.exec(msg);
    if (status) {
        // Not every 4xx is the server's final word. 408 Request Timeout and 425
        // Too Early describe a request that did not complete in time, and 429
        // Too Many Requests is a server explicitly asking for the retry this
        // would refuse to make — on a shared or rate-limited connection it is
        // an ordinary occurrence, and holding a recording on the first one
        // strands it waiting for a person over a wait the queue could have sat
        // out on its own.
        const transient = new Set([408, 425, 429]);
        return !transient.has(Number(status[1]));
    }

    return /Invalid JSON|QuotaExceeded/i.test(msg);
}

const CONFIG = {
    dbName: "StarmusSubmissions",
    storeName: "pendingSubmissions",
    dbVersion: 1,
    maxRetries: 3,
    retryDelays: [0, 5000, 10000],
    maxBlobSizes: {
        A: 20 * 1024 * 1024, // 20 MB — Tier A
        B: 10 * 1024 * 1024, // 10 MB — Tier B
        C: 5 * 1024 * 1024, // 5 MB  — Tier C (default)
    },
    defaultMaxBlobSize: 5 * 1024 * 1024,
    /**
     * Total queue budget, from the platform's IndexedDB standard (20 MB).
     *
     * How it is spent is the part that needed deciding. The standard also says
     * LRU, and LRU here means silently deleting the oldest recording to make
     * room — which is the behaviour ADR-011 exists to prevent, and the one this
     * queue was just changed to stop doing.
     *
     * So the budget is enforced at the door, not by eviction. When a new
     * recording will not fit, the add is refused with an error naming what is
     * occupying the space. The contributor is present and can act; a held
     * recording from last week cannot advocate for itself.
     *
     * **Which recording loses when storage is genuinely full is not this
     * module's call to make** — it is a sovereignty question about whose
     * material is expendable, and it routes to the platform owner. Until it is
     * ruled on, nothing is deleted automatically.
     */
    maxTotalBytes: 20 * 1024 * 1024,
    /**
     * How long a drain's claim on a row stays valid without renewal.
     *
     * `isProcessing` is an in-memory flag, so it says nothing about the tab
     * next door: two tabs read the same rows and both start uploading. Because
     * the TUS fingerprint is the submission id, the second tab *resumes* the
     * same resource rather than creating a second one — so the server does not
     * end up with two copies — but both tabs still spend the contributor's
     * bandwidth on one recording, both fire `starmus:complete`, and both race
     * to delete the row.
     *
     * A fixed lease cannot be sized out of this problem, and an earlier version
     * of this comment claimed otherwise. The recorder permits captures of
     * `MAX_DURATION_SECONDS` (20 minutes), and the stall watchdog deliberately
     * lets any *continuously progressing* upload run as long as it needs — so
     * on the links this platform exists for, a legitimate transfer outlives any
     * lease short enough to be useful when a tab dies.
     *
     * So the claim is **renewed while the transfer progresses** and carries an
     * **owner token**: every mutation checks that this drain still owns the row
     * before writing. A lease that lapses hands the row over cleanly; it never
     * lets a late failure from the previous owner overwrite the new one's work.
     */
    leaseMs: 2 * 60 * 1000,
    /** Renew no more often than this, so progress does not hammer IndexedDB. */
    leaseRenewMs: 30 * 1000,
};

/** Tracks whether the singleton queue has installed its network listener. */
let networkListenerInstalled = false;
/** Tracks whether the singleton queue has installed its battery listener. */
let batteryListenerInstalled = false;

/**
 * Resolves the maximum blob size permitted for the given metadata's tier.
 *
 * @param {Object} [metadata={}] - Submission metadata with optional tier property
 * @returns {number} Maximum blob size in bytes
 */
function getMaxBlobSize(metadata = {}) {
    const rawTier =
        metadata && typeof metadata === "object"
            ? (metadata.tier ?? metadata.env?.tier)
            : undefined;

    if (
        typeof rawTier === "string" &&
        Object.prototype.hasOwnProperty.call(CONFIG.maxBlobSizes, rawTier)
    ) {
        return CONFIG.maxBlobSizes[rawTier];
    }
    return CONFIG.defaultMaxBlobSize;
}

/** Monotonic within a page, so the fallback below cannot collide with itself. */
let offlineIdCounter = 0;

function createOfflineSubmissionId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `starmus-offline-${crypto.randomUUID()}`;
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const values = new Uint8Array(16);
        crypto.getRandomValues(values);
        values[6] = (values[6] & 0x0f) | 0x40;
        values[8] = (values[8] & 0x3f) | 0x80;
        const hex = Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
        const suffix = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
        return `starmus-offline-${suffix}`;
    }
    // No secure randomness. This id is a **local IndexedDB key** — it has to be
    // unique within one device's queue and nothing more. It is not the
    // `upload_uuid` the ingestion contract fixes (that is `createUploadId()`,
    // which still refuses rather than invent one), it never leaves the device,
    // and nothing downstream reads it.
    //
    // So it falls back rather than throwing. Throwing here meant that on a
    // runtime without `crypto` — an insecure origin on an old Android, which is
    // exactly this package's device — `queueSubmission()` threw, the catch in
    // `starmus-core.js` dispatched an error, and the recording was gone. ADR-011
    // keeps the material unconditionally: a device that cannot generate a
    // strong key can still hold a contributor's recording until it can be sent.
    offlineIdCounter += 1;
    const entropy = Math.floor(Math.random() * 0xffffffff).toString(16);
    return `starmus-offline-local-${Date.now().toString(36)}-${offlineIdCounter}-${entropy}`;
}

/**
 * @private
 * Offline submission queue backed by IndexedDB.
 *
 * Eviction policy (currently implemented):
 * - Entries are removed on successful upload, and only on successful upload.
 * - An entry that exhausts {@link CONFIG.maxRetries}, or fails with an error
 *   retrying cannot fix, is marked `held` rather than deleted. It stops being
 *   retried and starts needing a person. ADR-011 keeps the material
 *   unconditionally: a contributor does not lose a recording because the
 *   server said 400 four times, and the bytes are the only copy once the page
 *   is closed.
 * - Held is a state, not a slower deletion: `releaseHold()` puts an entry back
 *   in the queue and `discardHeld()` removes it on an explicit instruction.
 *   Without those a device fills with entries nobody can clear until `add()`
 *   refuses every new recording — trading one lost recording for the loss of
 *   recording itself.
 *
 * - The queue as a whole is capped at {@link CONFIG.maxTotalBytes}. The cap is
 *   enforced at `add()`: a recording that will not fit is refused with an error
 *   naming what is occupying the space. Nothing is evicted to make room.
 *
 * That last point is a deliberate departure from the platform standard's "LRU".
 * LRU here means deleting a contributor's older recording so a newer one fits,
 * which is the behaviour ADR-011 forbids and the one this queue was changed to
 * stop. Whose material is expendable when a device is genuinely full is a
 * sovereignty question for the platform owner, not a default this module picks.
 * Until it is ruled on, the person standing in front of the device is told, and
 * nothing already recorded is lost without someone deciding so.
 *
 * Storage: IndexedDB, database "StarmusSubmissions", store "pendingSubmissions".
 */
class OfflineQueue {
    constructor() {
        /** @type {IDBDatabase|null} */
        this.db = null;
        /** @type {boolean} */
        this.isProcessing = false;
        /** @type {number|null} */
        this.processQueueTimeoutId = null;
        /** @type {number|null} */
        this.processQueueDueAt = null;
    }

    /**
     * Opens (or creates) the IndexedDB database.
     *
     * @returns {Promise<void>}
     */
    async init() {
        if (!window.indexedDB) {
            const error = new Error("IndexedDB not supported");
            console.error("[Offline] CRITICAL:", error.message);
            this._reportStorageFailure("no_indexeddb", error);
            throw error;
        }

        return new Promise((resolve, reject) => {
            const req = indexedDB.open(CONFIG.dbName, CONFIG.dbVersion);

            req.onerror = (e) => {
                const error = e.target.error;
                console.error("[Offline] CRITICAL: DB open failed:", error);
                this._reportStorageFailure("db_open_failed", error, {
                    name: error.name,
                    message: error.message,
                    userAgent: navigator.userAgent,
                });
                reject(error);
            };

            req.onblocked = () => {
                const error = new Error("DB open blocked — close other tabs");
                console.error("[Offline] CRITICAL:", error.message);
                this._reportStorageFailure("db_blocked", error);
                reject(error);
            };

            req.onsuccess = () => {
                this.db = req.result;

                this.db.onversionchange = () => {
                    this.db.close();
                    console.warn("[Offline] DB version changed — connection closed");
                };

                this.db.onerror = (event) => {
                    console.error("[Offline] DB runtime error:", event.target.error);
                    this._reportStorageFailure("db_runtime_error", event.target.error);
                };

                debugLog("[Offline] DB ready");
                resolve();
            };

            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(CONFIG.storeName)) {
                    const store = db.createObjectStore(CONFIG.storeName, { keyPath: "id" });
                    store.createIndex("timestamp", "timestamp", { unique: false });
                    store.createIndex("retryCount", "retryCount", { unique: false });
                }
            };
        });
    }

    /**
     * Adds a submission to the queue.
     *
     * @param {string} instanceId
     * @param {Blob} audioBlob
     * @param {string} fileName
     * @param {Object} [formFields={}]
     * @param {Object} [metadata={}]
     * @returns {Promise<string>} Submission ID
     */
    async add(instanceId, audioBlob, fileName, formFields = {}, metadata = {}) {
        if (!this.db) {
            throw new Error("OfflineQueue: DB not initialised");
        }

        const maxAllowedSize = getMaxBlobSize(metadata);
        if (audioBlob.size > maxAllowedSize) {
            throw new Error(
                `Audio too large (${(audioBlob.size / 1024 / 1024).toFixed(2)} MB); limit ${(maxAllowedSize / 1024 / 1024).toFixed(2)} MB`,
            );
        }

        const safeBlob = new Blob([audioBlob], { type: audioBlob.type });

        const item = {
            id: createOfflineSubmissionId(),
            instanceId,
            fileName,
            timestamp: Date.now(),
            audioBlob: safeBlob,
            formFields,
            metadata,
            retryCount: 0,
            lastAttempt: null,
            error: null,
            held: false,
            heldReason: null,
        };

        // The whole-queue budget is counted and the record inserted inside one
        // readwrite transaction.
        //
        // Per-blob was the only bound before; the platform standard also caps
        // the queue as a whole, and without that, repeated failures accumulate
        // held entries until IndexedDB refuses the transaction — a quota error
        // at `add()` loses the recording being made right now, which is the
        // worst possible moment to find out.
        //
        // Counting in a separate transaction and inserting in another let two
        // adds each see room and then both insert. A promise chain fixed that
        // only within one tab's queue instance; a second tab has its own, reads
        // the same store, and the 20 MB cap is exceeded anyway. IndexedDB
        // serializes overlapping readwrite transactions on a store across every
        // tab of the origin, so doing both here is the guarantee itself rather
        // than an approximation of it — and it is the only mechanism, so there
        // is no question which one is load-bearing.
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);

            let totalBytes = 0;
            let heldBytes = 0;
            let heldCount = 0;
            /** @type {Error|null} Set when the queue is full, to reject with. */
            let refusal = null;
            let settled = false;

            /**
             * @param {Error} error
             * @returns {void}
             */
            const fail = (error) => {
                if (settled) {
                    return;
                }
                settled = true;
                reject(error);
            };

            const cursorReq = store.openCursor();
            cursorReq.onerror = (ev) => fail(ev.target.error);
            cursorReq.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const size = cursor.value?.audioBlob?.size || 0;
                    totalBytes += size;
                    if (cursor.value?.held === true) {
                        heldBytes += size;
                        heldCount += 1;
                    }
                    cursor.continue();
                    return;
                }

                // The store is counted and this transaction still holds it.
                if (totalBytes + safeBlob.size > CONFIG.maxTotalBytes) {
                    const heldNote =
                        heldCount > 0
                            ? ` ${heldCount} held recording(s) occupy ${(heldBytes / 1024 / 1024).toFixed(2)} MB and need attention before more will fit.`
                            : "";
                    refusal = new Error(
                        `QueueFull: the offline queue holds ${(totalBytes / 1024 / 1024).toFixed(2)} MB of ` +
                            `${(CONFIG.maxTotalBytes / 1024 / 1024).toFixed(2)} MB and this recording needs ` +
                            `${(safeBlob.size / 1024 / 1024).toFixed(2)} MB.${heldNote} ` +
                            "Nothing is deleted to make room.",
                    );
                    tx.abort();
                    return;
                }

                store.add(item);
            };

            tx.oncomplete = () => {
                if (settled) {
                    return;
                }
                settled = true;
                debugLog("[Offline] Queued:", item.id);
                this._notifyQueueUpdate();
                if (navigator.onLine) {
                    this._scheduleProcessQueue(0);
                }
                resolve(item.id);
            };

            tx.onabort = (ev) =>
                fail(
                    refusal ||
                        ev.target.error ||
                        new Error("OfflineQueue: the add transaction was aborted."),
                );
            tx.onerror = (ev) => fail(refusal || ev.target.error);
        });
    }

    /**
     * Retrieves all pending submissions.
     *
     * @returns {Promise<Array<Object>>}
     */
    async getAll() {
        if (!this.db) {
            return [];
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readonly");
            const req = tx.objectStore(CONFIG.storeName).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Removes a submission from the queue.
     *
     * @param {string} id
     * @returns {Promise<void>}
     */
    async remove(id, token = null) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);

            if (token === null) {
                // An unclaimed removal, for callers that never took a claim.
                store.delete(id);
            } else {
                // Read and delete in the same transaction, so a drain whose
                // lease lapsed cannot delete a row another tab has since
                // claimed and may be uploading. An unconditional delete here
                // was the last place an expired owner could still destroy the
                // new owner's work.
                const req = store.get(id);
                req.onsuccess = () => {
                    const item = req.result;
                    if (item && item.leaseOwner === token) {
                        store.delete(id);
                    }
                };
                req.onerror = (ev) => reject(ev.target.error);
            }

            tx.oncomplete = () => {
                this._notifyQueueUpdate();
                resolve();
            };
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /**
     * Record that the server has accepted these bytes.
     *
     * Written under the claim, before any completion handling, so that a tab
     * which dies afterwards leaves a row the next drain *reconciles* rather
     * than uploads again.
     *
     * @private
     * @param {string} id
     * @param {string} token The claim this drain holds.
     * @returns {Promise<boolean>} Whether the marker was actually written. False
     *   means the row is no longer this drain's, and nothing after the transfer
     *   belongs to it.
     */
    async _markTransferred(id, token) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            let committed = false;

            req.onsuccess = () => {
                const item = req.result;
                if (item && item.leaseOwner === token) {
                    item.transferred = true;
                    store.put(item);
                    committed = true;
                }
            };

            // Resolves with whether the marker was actually written. Resolving
            // identically either way let the caller continue into the
            // completion event and cleanup after losing the row — emitting a
            // duplicate boundary event while another tab owned it — and left a
            // `transferred: false` row behind after `removeFingerprintOnSuccess`
            // had already dropped the resume key, so the next drain uploaded
            // the same accepted recording again.
            req.onerror = () => resolve(false);
            tx.oncomplete = () => resolve(committed);
            tx.onerror = () => resolve(false);
        });
    }

    /**
     * Record that `starmus:complete` has been announced for this submission.
     *
     * Written *after* the event is emitted, and the ordering is deliberate. The
     * marker is what stops a second boundary event for one upload; writing it
     * first traded a duplicate event for a lost one, because a page that died
     * between the write and the dispatch left the row recorded as announced and
     * the next drain removed it without ever emitting the event — an asset on
     * the server that nothing downstream was told about. A duplicate carries the
     * same `uploadId` and is dedupable by the consumer; a missing one is not.
     *
     * The JSDoc here used to describe the opposite order. That is worth saying
     * plainly: a future change made against the comment rather than the code
     * would reintroduce exactly the lost-event window the code is arranged to
     * avoid.
     *
     * @private
     * @param {string} id
     * @param {string} token The claim this drain holds.
     * @returns {Promise<void>}
     */
    async _markCompletionEmitted(id, token) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            req.onsuccess = () => {
                const item = req.result;
                if (item && item.leaseOwner === token) {
                    item.completionEmitted = true;
                    store.put(item);
                }
            };

            req.onerror = () => resolve();
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    }

    async _hold(id, reason, transferred = false, token = null) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            req.onsuccess = () => {
                const item = req.result;
                // The *whole* mutation is gated on ownership, not only the
                // lease clear below. Guarding just the clear meant a late hold
                // from a drain whose lease had lapsed could still mark the new
                // owner's active attempt held — or mark it transferred — while
                // that upload was running.
                if (token !== null && item && item.leaseOwner !== token) {
                    return;
                }
                if (item) {
                    item.held = true;
                    item.heldReason = reason;
                    item.lastAttempt = Date.now();
                    // Whether the server already has these bytes.
                    //
                    // It matters because `removeFingerprintOnSuccess` deletes
                    // the resume fingerprint the moment a transfer completes.
                    // An entry held *after* that — completion handling threw,
                    // or the local delete failed — has no resume identity left,
                    // so releasing it would not resume anything: it would start
                    // a new TUS resource and hand the platform a second copy of
                    // a recording it had already accepted. Recorded here so the
                    // drain can finish the job instead of redoing it.
                    if (transferred) {
                        item.transferred = true;
                    }
                    // Holding ends this drain's interest in the row, so the
                    // claim goes with it — otherwise a held entry stays
                    // unclaimable until the lease lapses, for no purpose. Only
                    // this drain's own claim is cleared.
                    if (token !== null && item.leaseOwner === token) {
                        item.leaseOwner = null;
                        item.leaseUntil = null;
                    }
                    store.put(item);
                }
            };

            tx.oncomplete = () => {
                console.warn("[Offline] Held:", id, reason);
                sparxstarIntegration.reportError("submission_held", {
                    submissionId: id,
                    reason,
                });
                this._notifyQueueUpdate();
                resolve();
            };
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /**
     * What the queue is currently holding, in bytes and in entries.
     *
     * Exported through `getQueueUsage()` so a host can show the contributor how
     * full the device is before they find out by being refused.
     *
     * @returns {Promise<{totalBytes: number, count: number, heldBytes: number, heldCount: number, maxTotalBytes: number}>}
     */
    async usage() {
        if (!this.db) {
            return {
                totalBytes: 0,
                count: 0,
                heldBytes: 0,
                heldCount: 0,
                maxTotalBytes: CONFIG.maxTotalBytes,
            };
        }

        // A cursor, not `getAll()`. Every record holds its audio Blob, so
        // reading them all to add up sizes materialised the entire queued set
        // — up to the 20 MB cap — against a package budget that keeps blobs in
        // memory to a fraction of that. A host polling `getQueueUsage()` to
        // show remaining space was the worst case: repeatedly paying for the
        // whole queue to learn a single number. The cursor visits records one
        // at a time and keeps only the running totals.
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readonly");
            const store = tx.objectStore(CONFIG.storeName);
            let totalBytes = 0;
            let heldBytes = 0;
            let heldCount = 0;
            let count = 0;

            const req = store.openCursor();
            req.onerror = (ev) => reject(ev.target.error);
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (!cursor) {
                    return;
                }
                const size = cursor.value?.audioBlob?.size || 0;
                totalBytes += size;
                count += 1;
                if (cursor.value?.held === true) {
                    heldBytes += size;
                    heldCount += 1;
                }
                cursor.continue();
            };

            tx.oncomplete = () =>
                resolve({
                    totalBytes,
                    count,
                    heldBytes,
                    heldCount,
                    maxTotalBytes: CONFIG.maxTotalBytes,
                });
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /**
     * Put a held submission back in the queue.
     *
     * The counterpart to `_hold()`, and the reason holding is a state rather
     * than a slow deletion. Without a way out, held entries accumulate against
     * the queue's byte budget until `add()` refuses every new recording — which
     * would trade "lose one old recording" for "lose the ability to record at
     * all", a worse outcome than the deletion holding replaced.
     *
     * The retry count resets, because a person releasing an entry is saying the
     * condition that stopped it has changed.
     *
     * @param {string} id
     * @returns {Promise<void>}
     */
    async releaseHold(id) {
        if (!this.db) {
            return;
        }
        await new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);
            /** @type {Error|null} */
            let refusal = null;

            req.onsuccess = () => {
                const item = req.result;
                if (!item) {
                    return;
                }
                // Only a held entry. Releasing clears `retryCount`,
                // `lastAttempt` and `error` and schedules an immediate drain,
                // so calling it on an entry that is merely waiting out its
                // backoff discarded that backoff — a host with a stale id
                // could push a failing upload straight back onto a bad link,
                // repeatedly, at the contributor's expense. `discardHeld()`
                // guards the same way; this is the same state machine.
                if (item.held !== true) {
                    refusal = new Error(
                        `ReleaseRefused: ${id} is not held. Only a held submission can be released; the queue manages its own retries.`,
                    );
                    tx.abort();
                    return;
                }
                item.held = false;
                item.heldReason = null;
                item.retryCount = 0;
                item.lastAttempt = null;
                item.error = null;
                // And the drain claim from whatever attempt led to the hold, so
                // the next drain can pick this up now rather than waiting out a
                // lease left by an attempt that is long over. Both fields:
                // clearing only the expiry left the old owner token in place,
                // so a late `_renewClaim()` from that drain could renew a row
                // it no longer had any business holding.
                item.leaseOwner = null;
                item.leaseUntil = null;
                store.put(item);
            };

            req.onerror = (ev) => reject(ev.target.error);
            tx.oncomplete = () => {
                this._notifyQueueUpdate();
                resolve();
            };
            tx.onabort = (ev) => reject(refusal || ev.target.error);
            tx.onerror = (ev) => reject(refusal || ev.target.error);
        });
        this._scheduleProcessQueue(0);
    }

    /**
     * Delete a held submission, on a person's explicit instruction.
     *
     * The only deletion in this module that is not a successful upload, and it
     * exists because the alternative is a device that fills with recordings
     * nobody can clear. It is deliberately not reachable from any automatic
     * path: ADR-011 forbids this module deciding a contributor's material is
     * expendable, and nothing here decides. Someone does, and says why.
     *
     * @param {string} id
     * @param {string} reason Required, and recorded before the entry goes.
     * @returns {Promise<void>}
     */
    async discardHeld(id, reason) {
        // Required, not merely recorded. This is the one deletion here that is
        // not a successful upload, and the reason is what makes it a decision
        // someone took rather than something that happened. Accepting a blank
        // one and logging "(no reason given)" left the only non-upload
        // deletion path in the module able to run with no rationale at all —
        // the audit trail this method exists to produce, absent from the one
        // event that needs it.
        const given = typeof reason === "string" ? reason.trim() : "";
        if (given === "") {
            throw new Error(
                `DiscardRefused: ${id} needs a reason. Deleting a contributor's recording is an explicit decision and is recorded as one.`,
            );
        }

        if (!this.db) {
            return;
        }

        // The held check and the delete are one readwrite transaction.
        //
        // Reading with `getAll()` and deleting afterwards left a window: a
        // concurrent `releaseHold()` could clear `held` in between, and the
        // delete then went ahead on an entry that was no longer held — the one
        // thing this method exists to make impossible. The same
        // check-then-act split was what let two `add()` calls both see room.
        const heldReason = await new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);
            /** @type {Error|null} */
            let refusal = null;
            let found = null;

            req.onsuccess = () => {
                const item = req.result;
                if (!item) {
                    // Nothing was deleted, so nothing is reported as deleted.
                    // Falling through here logged the discard and emitted the
                    // `submission_discarded` audit event for a row that did not
                    // exist — an audit trail recording a deletion that never
                    // happened is worse than one with a gap.
                    refusal = new Error(
                        `DiscardRefused: ${id} is not in the queue.`,
                    );
                    tx.abort();
                    return;
                }
                if (item.held !== true) {
                    refusal = new Error(
                        `DiscardRefused: ${id} is not held. Only a held submission can be discarded, and only on an explicit instruction.`,
                    );
                    tx.abort();
                    return;
                }
                found = item.heldReason || null;
                store.delete(id);
            };

            req.onerror = (ev) => reject(ev.target.error);
            tx.oncomplete = () => resolve(found);
            tx.onabort = (ev) => reject(refusal || ev.target.error);
            tx.onerror = (ev) => reject(refusal || ev.target.error);
        });

        // Reported after the delete commits, not before. An audit line for a
        // deletion that then failed to happen is a different kind of wrong
        // record from no line at all.
        console.warn("[Offline] Discarded on instruction:", id, given);
        sparxstarIntegration.reportError("submission_discarded", {
            submissionId: id,
            reason: given,
            heldReason,
        });
        this._notifyQueueUpdate();
    }

    /**
     * Submissions that are kept but will not be retried without intervention.
     *
     * Surfaced so a host can show them rather than let them sit invisibly: a
     * held recording that nobody is told about is a lost one with extra steps.
     *
     * Summaries, not records. `getAll()` materialises every queued entry
     * *including its audio Blob*, so a host listing held items to draw a panel
     * pulled the whole queue — up to the 20 MB cap — into memory to render a
     * few lines of text, on devices with far less headroom than that. Nothing a
     * host needs in order to describe a held recording lives in the bytes, so
     * the bytes do not come along. A cursor visits the rows; only the fields
     * that describe them are kept.
     *
     * @returns {Promise<Array<Object>>} One summary per held submission.
     */
    async getHeld() {
        if (!this.db) {
            return [];
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readonly");
            const store = tx.objectStore(CONFIG.storeName);
            const held = [];

            const req = store.openCursor();
            req.onerror = (ev) => reject(ev.target.error);
            req.onsuccess = (event) => {
                const cursor = event.target.result;
                if (!cursor) {
                    return;
                }
                const item = cursor.value;
                if (item?.held === true) {
                    held.push({
                        id: item.id,
                        instanceId: item.instanceId,
                        fileName: item.fileName,
                        timestamp: item.timestamp,
                        heldReason: item.heldReason || null,
                        retryCount: item.retryCount ?? 0,
                        lastAttempt: item.lastAttempt ?? null,
                        error: item.error ?? null,
                        sizeBytes: item.audioBlob?.size || 0,
                        mimeType: item.audioBlob?.type || item.metadata?.mimeType || "",
                        captureProfile: item.metadata?.captureProfile || null,
                        // Whether the server already has these bytes. A host
                        // showing this entry needs to know that releasing it
                        // finishes the job rather than sending it again.
                        transferred: item.transferred === true,
                    });
                }
                cursor.continue();
            };

            tx.oncomplete = () => resolve(held);
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /**
     * Replace a submission's metadata in place.
     *
     * @private
     * @param {string} id
     * @param {Object} metadata
     * @returns {Promise<void>}
     */
    async _setMetadata(id, metadata, token = null) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            let wrote = false;

            req.onsuccess = () => {
                const item = req.result;
                // Claim-checked like every other write. A drain suspended after
                // claiming, whose lease then lapsed and whose row another tab
                // took, could otherwise overwrite the new owner's metadata —
                // its upload UUID included, which is the fingerprint its
                // in-flight transfer resumes against.
                if (token !== null && item && item.leaseOwner !== token) {
                    return;
                }
                if (item) {
                    item.metadata = metadata;
                    store.put(item);
                    wrote = true;
                }
            };

            req.onerror = (ev) => reject(ev.target.error);
            // Whether the metadata is actually stored, resolved after the
            // transaction commits. The caller is about to transfer bytes
            // identified by what this was asked to persist; told nothing, it
            // proceeded under an id no row records.
            tx.oncomplete = () => resolve(wrote);
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /** @private */
    /**
     * Claim a row for this drain, or report that someone else holds it.
     *
     * One readwrite transaction, so two tabs cannot both see the row free. The
     * returned token identifies this claim: every later mutation presents it,
     * and a mutation from a drain that no longer owns the row does nothing.
     *
     * `held` is re-checked here rather than trusted from the caller's snapshot,
     * which was taken before this transaction and may be stale — another tab
     * can put a row on hold in that gap, and claiming it anyway would upload a
     * submission a person had explicitly stopped.
     *
     * Returns the row as it stands *inside* the claiming transaction, not as
     * the caller's snapshot had it. `processQueue()` reads its rows with
     * `getAll()` and claims them one at a time, so by the time a row is claimed
     * another tab may have recorded a failed attempt against it and released
     * it. Working from the snapshot then used a stale `retryCount` and
     * `lastAttempt` — bypassing the backoff and overwriting the newer state —
     * and a stale `metadata`, which is where the upload identity lives.
     *
     * @private
     * @param {string} id
     * @returns {Promise<{token: string, row: Object}|null>} Null if not claimable.
     */
    async _claim(id) {
        if (!this.db) {
            return null;
        }
        const token = createOfflineSubmissionId();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);
            /** @type {Object|null} */
            let claimed = null;

            req.onsuccess = () => {
                const item = req.result;
                if (!item) {
                    // Gone since the snapshot — another drain finished it.
                    return;
                }
                if (item.held === true) {
                    return;
                }
                const now = Date.now();
                if (typeof item.leaseUntil === "number" && item.leaseUntil > now) {
                    return;
                }
                item.leaseOwner = token;
                item.leaseUntil = now + CONFIG.leaseMs;
                store.put(item);
                claimed = item;
            };

            req.onerror = (ev) => reject(ev.target.error);
            tx.oncomplete = () => resolve(claimed ? { token, row: claimed } : null);
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /**
     * Extend a claim this drain still owns.
     *
     * Called as the transfer reports progress. A transfer that is moving keeps
     * its row; one that has stopped moving lets the lease lapse, and another
     * tab — or this one, later — can pick it up.
     *
     * @private
     * Three outcomes, not two. A storage failure is not evidence that the row
     * changed hands, and reporting it as such was how a *successful* upload got
     * abandoned: the drain saw `false`, stood down, and left the row
     * `transferred: false` — while `removeFingerprintOnSuccess` had already
     * dropped the resume fingerprint, so the next drain started a second TUS
     * resource instead of reconciling the one the server had accepted. That is
     * the duplicate this whole mechanism exists to prevent, produced by the
     * mechanism itself.
     *
     * Nothing here is authoritative about ownership. `_markTransferred()` runs a
     * claim-checked write after the transfer and reports what actually landed,
     * so an unknown answer costs a renewal, not a recording.
     *
     * @private
     * @param {string} id
     * @param {string} token
     * @returns {Promise<boolean|null>} True renewed, false the row is no longer
     *   this drain's, null when storage could not answer.
     */
    async _renewClaim(id, token) {
        if (!this.db) {
            return null;
        }
        return new Promise((resolve) => {
            let tx;
            let store;
            try {
                tx = this.db.transaction([CONFIG.storeName], "readwrite");
                store = tx.objectStore(CONFIG.storeName);
            } catch {
                // A closed or unusable connection. Unknown, not lost.
                resolve(null);
                return;
            }
            const req = store.get(id);
            let renewed = false;

            req.onsuccess = () => {
                const item = req.result;
                if (!item || item.leaseOwner !== token) {
                    return;
                }
                item.leaseUntil = Date.now() + CONFIG.leaseMs;
                store.put(item);
                renewed = true;
            };

            // Storage could not answer. Distinct from an answer of "not yours".
            req.onerror = () => resolve(null);
            tx.oncomplete = () => resolve(renewed);
            tx.onerror = () => resolve(null);
        });
    }

    /**
     * Give up a claim, so the row is retryable before the lease would lapse.
     *
     * Only if this drain still owns it. Clearing unconditionally meant that a
     * drain whose lease had already lapsed — and whose row another tab had
     * since claimed — could release the *new* owner's claim on its way out,
     * and then overwrite the state of an upload that was actively running.
     *
     * @private
     * @param {string} id
     * @param {string} token
     * @returns {Promise<void>}
     */
    async _releaseClaim(id, token) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            req.onsuccess = () => {
                const item = req.result;
                if (item && item.leaseOwner === token) {
                    item.leaseOwner = null;
                    item.leaseUntil = null;
                    store.put(item);
                }
            };

            // A claim that cannot be released is not an error worth failing a
            // drain over: the lease lapses on its own.
            req.onerror = () => resolve();
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
        });
    }

    async _updateRetry(id, retryCount, error, token = null) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            req.onsuccess = () => {
                const item = req.result;
                // Ownership gates the whole write, as in `_hold()`: a late
                // failure from an expired drain must not rewrite the retry
                // state of an attempt another tab now owns.
                if (token !== null && item && item.leaseOwner !== token) {
                    return;
                }
                if (item) {
                    item.retryCount = retryCount;
                    item.lastAttempt = Date.now();
                    item.error = error || null;
                    // The backoff state and the claim release are one write.
                    // Releasing first left a window in which the row was
                    // claimable while still carrying the *previous* attempt's
                    // retryCount and lastAttempt — so another tab could take it
                    // immediately, with no backoff, and race this update.
                    if (token !== null && item.leaseOwner === token) {
                        item.leaseOwner = null;
                        item.leaseUntil = null;
                    }
                    store.put(item);
                }
            };

            req.onerror = (ev) => reject(ev.target.error);
            tx.oncomplete = () => resolve();
        });
    }

    /**
     * Processes all pending submissions, skipping items that have hit retry limits
     * or are within their backoff window.
     *
     * @returns {Promise<void>}
     */
    async processQueue() {
        if (this.isProcessing || !navigator.onLine) {
            return;
        }

        this._clearScheduledProcessQueue();
        const pending = await this.getAll();
        if (pending.length === 0) {
            return;
        }

        if (sparxstarIntegration.isBatteryCritical?.()) {
            debugLog("[Offline] Battery critical — deferring queue processing");
            return;
        }

        this.isProcessing = true;

        try {
            debugLog(`[Offline] Processing ${pending.length} items`);

            for (const item of pending) {
                const { id, audioBlob, fileName, formFields, instanceId } = item;
                // Reassigned from the claimed row below, which is the
                // authoritative copy for this attempt.
                let { retryCount } = item;
                // Not destructured as a `const`: the backfill below has to be
                // able to replace it wholesale for a row that has no metadata
                // object at all.
                let { metadata } = item;
                // Whether the bytes reached the server on this attempt.
                let uploaded = false;

                if (item.held) {
                    // Already held for a person. Retrying it on every drain
                    // would burn the contributor's bandwidth to no effect.
                    //
                    // Checked before the backfill below, not after it: an entry
                    // nobody is going to upload does not need an identifier
                    // minted for it, and minting is the one step here that can
                    // fail outright.
                    continue;
                }

                if (item.transferred === true) {
                    // Claimed like any other row. Two tabs both seeing
                    // `transferred` and racing to finish it would emit the
                    // boundary event twice for one upload.
                    const reconcileClaim = await this._claim(id);
                    if (!reconcileClaim) {
                        continue;
                    }
                    const reconcileToken = reconcileClaim.token;
                    // The row as the claim transaction saw it, not the snapshot.
                    const row = reconcileClaim.row;
                    if (row.transferred !== true) {
                        // It was reconciled or reset between the snapshot and
                        // the claim. Let the normal path handle it next drain.
                        await this._releaseClaim(id, reconcileToken);
                        continue;
                    }
                    metadata = row.metadata;
                    // The server already has these bytes; what failed was
                    // afterwards. Uploading again would hand the platform a
                    // second copy of a recording it accepted — and it could not
                    // even resume the first, because `removeFingerprintOnSuccess`
                    // deleted the resume fingerprint when the transfer
                    // completed. So this entry is finished rather than resent:
                    // the completion event that never fired is emitted now, and
                    // the entry goes.
                    //
                    // Reached only after a release, since holding is what put
                    // the flag here. Before this existed, releasing such an
                    // entry duplicated the recording.
                    const detail = buildCompletionDetail({
                        instanceId,
                        result: { success: true, uploadId: metadata?.uploadId },
                        metadata,
                        formFields,
                        fileName,
                        mimeType: metadata?.mimeType || audioBlob.type || "",
                        durationMs: metadata?.durationMs ?? 0,
                        language: metadata?.language || formFields?.language,
                        contributorId: metadata?.env?.identifiers?.visitorId || "",
                        calibrationApplied: !!metadata?.calibration,
                    });
                    // At-least-once, and the ordering says so: the event is
                    // emitted first and the marker written after. An earlier
                    // revision did the reverse and this comment still described
                    // it. Marking first traded a duplicate for a *lost* event —
                    // a page dying in between left the entry recorded as
                    // announced and the next drain removed it without ever
                    // emitting the boundary. A duplicate carries the same
                    // `uploadId` and is dedupable; a missing one is not.
                    if (row.completionEmitted !== true) {
                        // Emit, then mark — see the success path for why
                        // at-least-once is the right side to err on.
                        emitCompletionEvent(detail);
                        await this._markCompletionEmitted(id, reconcileToken);
                    } else {
                        debugLog("[Offline] Completion already announced; not re-emitting:", id);
                    }
                    try {
                        await this.remove(id, reconcileToken);
                        debugLog("[Offline] Reconciled an already-transferred entry:", id);
                    } catch (cleanupError) {
                        const msg =
                            cleanupError && cleanupError.message
                                ? cleanupError.message
                                : String(cleanupError);
                        await this._hold(id, `Reconciled; local cleanup failed: ${msg}`, true, reconcileToken);
                    }
                    continue;
                }

                // Claimed before *anything* is written for this row, and
                // released on every exit that leaves it in the queue.
                //
                // Without this, a second tab — with its own `isProcessing` flag
                // and its own view of the same store — uploaded the same row in
                // parallel, spending a contributor's bandwidth twice on one
                // recording and firing `starmus:complete` twice for it.
                //
                // Before the retry-limit hold as well as the backfill and the
                // upload: holding is a mutation like any other, and an unclaimed
                // hold could mark a row that another tab was actively uploading.
                // Two tabs reaching an id-less row together would likewise each
                // mint a different UUID, one persisting over the other, leaving
                // the tab that uploaded with a fingerprint the stored row no
                // longer matches — unable to resume its own partial.
                const claim = await this._claim(id);
                if (!claim) {
                    debugLog("[Offline] Another drain holds this entry; skipping:", id);
                    continue;
                }
                const claimToken = claim.token;

                // From here on the row is the one the claim transaction read,
                // not the `getAll()` snapshot this loop is iterating. Another
                // tab can record a failed attempt and release a row between the
                // two, and continuing from the snapshot then reused a stale
                // `retryCount` and `lastAttempt` — skipping the backoff — and a
                // stale `metadata`, which carries the upload identity.
                const current = claim.row;
                retryCount = current.retryCount ?? 0;
                metadata = current.metadata;

                if (current.transferred === true) {
                    // Marked transferred between the snapshot and the claim.
                    // Uploading now would send an asset the server already has;
                    // the reconciliation path handles it on the next drain,
                    // which is one tick away.
                    await this._releaseClaim(id, claimToken);
                    continue;
                }

                if (retryCount >= CONFIG.maxRetries) {
                    // Held, not removed. Exhausting the retries says the queue
                    // cannot fix this on its own; it does not say the recording
                    // is worth less than the storage it occupies (ADR-011).
                    await this._hold(
                        id,
                        `Upload failed ${retryCount} times; the recording is held here and needs attention.`,
                        false,
                        claimToken,
                    );
                    continue;
                }

                if (current.lastAttempt !== null && current.lastAttempt !== undefined) {
                    const delay =
                        CONFIG.retryDelays[Math.min(retryCount, CONFIG.retryDelays.length - 1)];
                    if (Date.now() - current.lastAttempt < delay) {
                        // Still inside its backoff. The claim goes back rather
                        // than being held for the lease: the backoff is seconds
                        // and the lease is minutes, so keeping it would block
                        // the row long after it became eligible.
                        await this._releaseClaim(id, claimToken);
                        continue;
                    }
                }

                // Entries queued before the submission id existed have no
                // `metadata.uploadId`, so every retry would mint a new one and
                // start a new TUS resource instead of resuming the partial it
                // already has. Backfilled once and persisted, so the
                // one-id-per-submission rule reaches recordings already sitting
                // on devices rather than only new ones.
                //
                // The test is the one the upload module applies, not merely "is
                // something there": `uploadTus()` replaces any id that is not a
                // UUID v4, so an entry carrying a non-empty invalid id was left
                // alone here and then silently re-identified on every attempt —
                // a different fingerprint each time, never able to resume the
                // partial the previous attempt left on the server.
                // Set when the upload id could not be written back, because
                // this drain no longer holds the row. Named for what it means
                // rather than for the lease, so it cannot be confused with
                // `claimLost` below, which tracks ownership during the transfer
                // itself — two similarly named booleans in one function is how
                // the next edit goes wrong.
                let uploadIdUnrecorded = false;

                try {
                    // Canonicalised, not merely accepted. `isUploadId()` allows
                    // surrounding whitespace and `uploadTus()` trims before
                    // deriving the fingerprint and `upload_uuid` — so an id
                    // stored with whitespace made the reconciliation path
                    // announce a different string from the one the server knows
                    // the resource by.
                    const storedId = metadata?.uploadId;
                    if (isUploadId(storedId) && storedId !== storedId.trim()) {
                        metadata = { ...metadata, uploadId: storedId.trim() };
                        if (!(await this._setMetadata(id, metadata, claimToken))) {
                            uploadIdUnrecorded = true;
                        }
                    }

                    if (!isUploadId(metadata?.uploadId)) {
                        const backfilled = createUploadId();
                        // The local variable is replaced, not just the stored
                        // row. Guarding this on `metadata` being truthy left a
                        // row with no metadata at all still passing `undefined`
                        // into this first attempt, which then minted a
                        // *different* id — so the next drain, reading the
                        // persisted one, could not resume the partial that
                        // first attempt had left on the server.
                        metadata = { ...(metadata || {}), uploadId: backfilled };
                        if (!(await this._setMetadata(id, metadata, claimToken))) {
                            uploadIdUnrecorded = true;
                        }
                        debugLog("[Offline] Backfilled upload id for legacy entry:", id);
                    }
                } catch (err) {
                    // `createUploadId()` throws where there is no secure
                    // randomness. Unguarded, that threw out of the whole loop:
                    // the drain stopped, every later entry went untried, and
                    // the `finally` below rescheduled with this item's retry
                    // state untouched — so the next delay was zero and the
                    // queue span the same failure for as long as the page
                    // lived. One unusable row must cost one row.
                    const msg = err && err.message ? err.message : String(err);
                    console.error("[Offline] Could not assign an upload id:", id, msg);
                    await this._hold(id, `No upload identifier could be assigned: ${msg}`, false, claimToken);
                    continue;
                }

                // The upload id could not be recorded, because the lease lapsed
                // and another tab took the row. That tab is uploading it now.
                //
                // Continuing anyway was the failure the lease exists to
                // prevent, in its worst form: this drain would transfer under
                // an id no row holds, so the two tabs would resume *different*
                // server-side resources rather than the same one, and the
                // platform would receive the same take twice — paid for twice
                // out of the contributor's data. The row is left to its owner.
                if (uploadIdUnrecorded) {
                    debugLog("[Offline] Lease lapsed before the upload id was stored:", id);
                    continue;
                }

                try {
                    // The claim is renewed as bytes move, not sized to outlast
                    // the upload. A capture may run to MAX_DURATION_SECONDS and
                    // a progressing transfer is deliberately unbounded, so no
                    // fixed lease is both long enough for a real upload and
                    // short enough to free a row from a tab that died.
                    let lastRenewal = Date.now();
                    /** @type {Promise<boolean>|null} The renewal still in flight. */
                    let renewalInFlight = null;
                    // Set when a renewal reports that this drain no longer owns
                    // the row. Ignoring the result meant a drain kept going
                    // after another tab had taken over: it would emit the
                    // completion event and run cleanup against a row it did not
                    // own, which is what made every stale-owner race below
                    // reachable in the first place.
                    let claimLost = false;
                    const result = await uploadWithPriority({
                        blob: audioBlob,
                        fileName,
                        formFields,
                        metadata,
                        instanceId,
                        onProgress: () => {
                            const now = Date.now();
                            if (now - lastRenewal < CONFIG.leaseRenewMs) {
                                return;
                            }
                            lastRenewal = now;
                            renewalInFlight = this._renewClaim(id, claimToken).then((ok) => {
                                // Only an actual "not yours" stands the drain
                                // down. A null — storage could not answer — is
                                // left to `_markTransferred()`, which checks the
                                // claim as it writes and cannot be wrong about
                                // it. Treating the two alike abandoned uploads
                                // that had already succeeded.
                                if (ok === false) {
                                    claimLost = true;
                                }
                                return ok;
                            });
                            void renewalInFlight;
                        },
                    });

                    // Set here, the moment the bytes are known to have landed —
                    // not at the end of the block. Setting it last made the
                    // `if (uploaded)` guard below unreachable: everything that
                    // can throw between here and there threw first, so the
                    // protection against re-uploading an accepted asset did
                    // nothing at all.
                    uploaded = true;

                    // The last renewal is allowed to land before ownership is
                    // judged. It is an IndexedDB round-trip started from a
                    // progress callback, so it could still be pending — or
                    // resolve false moments after `onSuccess` — leaving this
                    // drain to emit the boundary event and run cleanup for a row
                    // another tab had already taken.
                    if (renewalInFlight) {
                        try {
                            await renewalInFlight;
                        } catch {
                            // A renewal that could not be read says nothing
                            // about who owns the row. `_markTransferred()`
                            // below is claim-checked and authoritative; standing
                            // down here instead would discard a transfer that
                            // may already have landed.
                        }
                    }

                    if (claimLost) {
                        // Another tab owns this row now. Everything after a
                        // transfer — the boundary event, the removal — belongs
                        // to whoever holds the claim, and doing it here would
                        // double the event and race the owner's cleanup. The
                        // bytes are not wasted: the fingerprint is the
                        // submission id, so the owner resumes the same TUS
                        // resource rather than starting a second one.
                        console.warn(
                            "[Offline] Lost the claim during transfer; leaving completion to the current owner:",
                            id,
                        );
                        continue;
                    }

                    // Persisted before any completion handling. `uploaded` is a
                    // local variable: a tab closed between the transfer landing
                    // and the cleanup finishing left the row `transferred:
                    // false`, and because `removeFingerprintOnSuccess` has
                    // already dropped the resume fingerprint, the next drain
                    // started a *second* upload instead of reconciling the one
                    // the server had accepted.
                    if (!(await this._markTransferred(id, claimToken))) {
                        // The row is not ours any more. Everything after a
                        // transfer belongs to whoever holds the claim.
                        console.warn(
                            "[Offline] Lost the claim before the transfer could be recorded; leaving completion to the current owner:",
                            id,
                        );
                        continue;
                    }

                    // `starmus:complete` is the boundary before any
                    // server-side processing (ADR-034). A queued upload that
                    // drains is as complete as an immediate one, so it fires
                    // here too — and it fires before `remove()`, because
                    // removal destroys the metadata the event is built from.
                    const detail = buildCompletionDetail({
                        instanceId,
                        result,
                        metadata,
                        formFields,
                        fileName,
                        mimeType: metadata?.mimeType || audioBlob.type || "",
                        durationMs: metadata?.durationMs ?? 0,
                        language: metadata?.language || formFields?.language,
                        contributorId: metadata?.env?.identifiers?.visitorId || "",
                        calibrationApplied: !!metadata?.calibration,
                    });

                    // Always emitted. A format this client cannot name is
                    // reported as `unknown` rather than suppressing the event:
                    // `starmus:complete` is the boundary before any server-side
                    // processing (ADR-034), and withholding it left the asset on
                    // the server with nobody told it existed, recoverable only
                    // by a person noticing a held entry. The Node rules on the
                    // format, where refusing does not cost the recording.
                    // Emitted first, then marked. At-least-once, deliberately.
                    //
                    // Marking first traded a duplicate event for a *lost* one:
                    // a page that died between the write and the dispatch left
                    // the entry recorded as announced, so the next drain removed
                    // it without ever emitting the boundary — an asset on the
                    // server that nothing downstream was told about, which is
                    // unrecoverable. A duplicate `starmus:complete` carries the
                    // same `uploadId` and is dedupable by the consumer; a
                    // missing one is not. Losing the event is the worse failure,
                    // so the ordering favours repeating it.
                    emitCompletionEvent(detail);
                    await this._markCompletionEmitted(id, claimToken);
                    if (detail.format === "unknown") {
                        sparxstarIntegration.reportError("upload_format_unnamed", {
                            submissionId: id,
                            instanceId,
                            fileName,
                            mimeType: metadata?.mimeType || audioBlob.type || "",
                            captureProfile: metadata?.captureProfile || null,
                        });
                    }
                } catch (err) {
                    if (uploaded) {
                        // Reaching here after a successful transfer means the
                        // completion handling threw, not the upload. Re-queuing
                        // or retrying would send an asset the server already
                        // has. Hold it instead, so a person can see it and the
                        // next drain does not upload it again.
                        const msg = err && err.message ? err.message : String(err);
                        console.error("[Offline] Uploaded, but completion failed:", id, msg);
                        await this._hold(id, `Uploaded; completion handling failed: ${msg}`, true, claimToken);
                        continue;
                    }
                    const msg = err && err.message ? err.message : String(err);
                    // The claim is dropped by the same write that records the
                    // outcome, below — never before it. A separate release
                    // first made the row claimable while it still carried the
                    // previous attempt's backoff state.
                    if (isNonRetryableUploadFailure(msg)) {
                        // Retrying will not help, so stop retrying — and keep
                        // the recording. Deleting it here was the queue
                        // quietly deciding a contributor's material was
                        // disposable because a server rejected its shape.
                        await this._hold(id, `Upload rejected and not retryable: ${msg}`, false, claimToken);
                    } else {
                        const nextRetryCount = Math.min(retryCount + 1, CONFIG.maxRetries);
                        await this._updateRetry(id, nextRetryCount, msg, claimToken);
                    }
                    continue;
                }

                // Cleanup, outside the transfer's try. An IndexedDB delete that
                // fails is a storage problem, not an upload one; recorded as an
                // upload failure it left the entry retryable and the next drain
                // uploaded the same recording again.
                try {
                    await this.remove(id, claimToken);
                } catch (cleanupError) {
                    const msg =
                        cleanupError && cleanupError.message
                            ? cleanupError.message
                            : String(cleanupError);
                    console.error("[Offline] Uploaded but could not clear the entry:", id, msg);
                    await this._hold(id, `Uploaded; local cleanup failed: ${msg}`, true, claimToken);
                }
            }
        } catch (fatal) {
            console.error("[Offline] Queue fatal:", fatal);
        } finally {
            this.isProcessing = false;
            try {
                const nextDelay = await this._getNextProcessDelay();
                if (nextDelay !== null) {
                    this._scheduleProcessQueue(nextDelay);
                }
            } catch (error) {
                console.error("[Offline] Failed to schedule next queue processing:", error);
            }
        }
    }

    /**
     * Sets up the connectivity-restored listener once for the singleton queue.
     *
     * @returns {void}
     */
    setupNetworkListeners() {
        if (networkListenerInstalled) {
            return;
        }

        networkListenerInstalled = true;
        window.addEventListener("online", () => {
            this._scheduleProcessQueue(0);
        });
        this._setupBatteryListeners();

        // Flush pending items on startup when already online.
        if (navigator.onLine) {
            this._scheduleProcessQueue(0);
        }
    }
    /** @private */
    _setupBatteryListeners() {
        if (
            batteryListenerInstalled ||
            typeof navigator === "undefined" ||
            typeof navigator.getBattery !== "function"
        ) {
            return;
        }

        batteryListenerInstalled = true;
        navigator.getBattery().then((battery) => {
            const handleBatteryChange = () => {
                if (!sparxstarIntegration.isBatteryCritical?.()) {
                    this._scheduleProcessQueue(0);
                }
            };

            battery.addEventListener("levelchange", handleBatteryChange);
            battery.addEventListener("chargingchange", handleBatteryChange);
        });
    }
    /** @private */
    _clearScheduledProcessQueue() {
        if (this.processQueueTimeoutId !== null) {
            window.clearTimeout(this.processQueueTimeoutId);
            this.processQueueTimeoutId = null;
        }
        this.processQueueDueAt = null;
    }
    /** @private */
    _scheduleProcessQueue(delayMs) {
        if (!navigator.onLine) {
            return;
        }
        const safeDelay = Math.max(0, typeof delayMs === "number" ? delayMs : 0);
        const dueAt = Date.now() + safeDelay;

        if (
            this.processQueueTimeoutId !== null &&
            this.processQueueDueAt !== null &&
            this.processQueueDueAt <= dueAt
        ) {
            return;
        }

        this._clearScheduledProcessQueue();
        this.processQueueDueAt = dueAt;
        this.processQueueTimeoutId = window.setTimeout(() => {
            this.processQueueTimeoutId = null;
            this.processQueueDueAt = null;
            void this.processQueue();
        }, safeDelay);
    }
    /**
     * The scheduling fields of every row that is still retryable.
     *
     * A cursor, and four scalars per row, because deciding *when* to wake needs
     * no audio. `getAll()` deserialises whole rows — every queued recording —
     * to read a retry count and a timestamp, and this runs on every scheduled
     * wake rather than once per drain. On the devices this package is built
     * for, spending the queue's entire retained size to compute a delay is the
     * wrong trade at the worst moment: a phone low enough on memory to care is
     * exactly the one with recordings still waiting to go.
     *
     * Held rows are dropped here, where the cursor already has them. `_hold()`
     * leaves `retryCount` at the limit and the caller returns 0 for anything at
     * the limit, so a single held recording rescheduled the queue immediately,
     * forever, waking the device to look at something it will never retry.
     *
     * @private
     * @returns {Promise<Array<{leaseUntil: number|null, retryCount: number,
     *   lastAttempt: number|null}>>}
     */
    async _scheduleSnapshot() {
        if (!this.db) {
            return [];
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readonly");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.openCursor();
            /** @type {Array<Object>} */
            const rows = [];

            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) {
                    return;
                }
                const value = cursor.value;
                if (value && value.held !== true) {
                    rows.push({
                        leaseUntil: typeof value.leaseUntil === "number" ? value.leaseUntil : null,
                        retryCount: typeof value.retryCount === "number" ? value.retryCount : 0,
                        lastAttempt: typeof value.lastAttempt === "number" ? value.lastAttempt : null,
                    });
                }
                cursor.continue();
            };

            req.onerror = (ev) => reject(ev.target.error);
            tx.oncomplete = () => resolve(rows);
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /** @private */
    async _getNextProcessDelay() {
        // Held entries are excluded. `_hold()` leaves `retryCount` at the
        // limit, and the branch below returns 0 for anything at the limit — so
        // a single held recording made the queue reschedule itself immediately,
        // forever, waking the device to look at an item it will never retry.
        // On a phone with a failing upload and a low battery that is the worst
        // possible loop to leave running.
        const now = Date.now();
        const live = await this._scheduleSnapshot();

        // Leased rows are excluded from the immediate work, but their expiry
        // still has to wake somebody.
        //
        // Including them meant a tab that had just failed to claim read the
        // untouched retryCount, computed zero, and rescheduled at once — a
        // tight drain loop for as long as the other tab held the lease.
        // Excluding them entirely was the opposite failure: when every
        // remaining row was leased this returned null, no wake-up was
        // scheduled, and if the owning tab then crashed its lease expired with
        // nothing left to notice. The recording sat there until a reload.
        /** @type {number|null} */
        let earliestLease = null;
        /** @type {Array<Object>} */
        const pending = [];
        for (const item of live) {
            if (typeof item.leaseUntil === "number" && item.leaseUntil > now) {
                const untilExpiry = item.leaseUntil - now;
                if (earliestLease === null || untilExpiry < earliestLease) {
                    earliestLease = untilExpiry;
                }
                continue;
            }
            pending.push(item);
        }

        if (pending.length === 0) {
            // Nothing claimable now. Wake when the first lease lapses, so a row
            // orphaned by a closed tab is picked up rather than stranded.
            return earliestLease;
        }

        let nextDelay = null;

        for (const item of pending) {
            if (item.retryCount >= CONFIG.maxRetries) {
                return 0;
            }

            const retryDelay =
                CONFIG.retryDelays[Math.min(item.retryCount, CONFIG.retryDelays.length - 1)];
            const remainingDelay =
                item.lastAttempt === null ? 0 : Math.max(0, retryDelay - (now - item.lastAttempt));

            if (nextDelay === null || remainingDelay < nextDelay) {
                nextDelay = remainingDelay;
            }
        }

        return nextDelay;
    }
    /** @private */
    _notifyQueueUpdate() {
        const BUS = window.CommandBus || window.StarmusHooks;
        if (!BUS || typeof BUS.dispatch !== "function") {
            return;
        }
        this.getAll().then((queue) => {
            BUS.dispatch("starmus/offline/queue_updated", {
                count: queue.length,
                queue: queue.map((item) => ({
                    id: item.id,
                    retryCount: item.retryCount,
                    error: item.error,
                })),
            });
        });
    }

    /** @private */
    _reportStorageFailure(type, error, details = {}) {
        const errorData = {
            type: `offline_storage_${type}`,
            error: error.message,
            details: { ...details, timestamp: Date.now() },
        };

        if ("storage" in navigator && "estimate" in navigator.storage) {
            navigator.storage.estimate().then((estimate) => {
                errorData.details.storageEstimate = {
                    usage: estimate.usage,
                    quota: estimate.quota,
                };
                sparxstarIntegration.reportError(errorData.type, errorData);
            });
        } else {
            sparxstarIntegration.reportError(errorData.type, errorData);
        }

        this._showUserError(type);
    }

    /** @private */
    _showUserError(type) {
        const messages = {
            no_indexeddb:
                "Your browser doesn't support offline storage. Recordings will upload immediately.",
            db_open_failed: "Storage initialisation failed. Please check your browser settings.",
            db_blocked: "Please close other tabs and try again.",
            quota_exceeded: "Storage full. Please free up space or upload pending recordings.",
        };

        const message = messages[type] || "Storage error occurred.";
        console.error("[Offline] User message:", message);

        if (window.CommandBus) {
            window.CommandBus.dispatch("starmus/storage-error", { type, message });
        }
    }
}

const offlineQueue = new OfflineQueue();

/**
 * Returns the initialised OfflineQueue instance.
 * Initialises database and network listeners on first call.
 *
 * @returns {Promise<OfflineQueue>}
 */
export async function getOfflineQueue() {
    if (!offlineQueue.db) {
        await offlineQueue.init();
        offlineQueue.setupNetworkListeners();
    }
    return offlineQueue;
}

/**
 * Queues an audio submission for later upload.
 *
 * @param {string} instanceId
 * @param {Blob} audioBlob
 * @param {string} fileName
 * @param {Object} formFields
 * @param {Object} metadata
 * @returns {Promise<string>} Unique submission ID
 */
export async function queueSubmission(instanceId, audioBlob, fileName, formFields, metadata) {
    const q = await getOfflineQueue();
    return q.add(instanceId, audioBlob, fileName, formFields, metadata);
}

/**
 * Returns the count of pending offline submissions.
 *
 * Counts held submissions too: they are still recordings this device is
 * holding that the platform has not received.
 *
 * @returns {Promise<number>}
 */
export async function getPendingCount() {
    const q = await getOfflineQueue();
    const list = await q.getAll();
    return list.length;
}

/**
 * Returns the submissions that are kept but will not be retried on their own.
 *
 * A host shows these so someone can act. They are never deleted by the queue.
 *
 * Each entry is a summary — id, file name, timestamp, held reason, retry count,
 * size, mime type, capture profile, and whether the bytes already reached the
 * server — and carries no audio Blob. Listing held recordings is a thing hosts
 * do to draw a panel, and it must not cost the memory of the whole queue.
 *
 * @returns {Promise<Array<Object>>}
 */
export async function getHeldSubmissions() {
    const q = await getOfflineQueue();
    return q.getHeld();
}

/**
 * How full the offline queue is.
 *
 * A host shows this so a contributor learns the device is nearly full before a
 * recording is refused, rather than at the moment they finish speaking.
 *
 * @returns {Promise<{totalBytes: number, count: number, heldBytes: number, heldCount: number, maxTotalBytes: number}>}
 */
export async function getQueueUsage() {
    const q = await getOfflineQueue();
    return q.usage();
}

/**
 * Put a held submission back in the queue and try it again.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function releaseHeldSubmission(id) {
    const q = await getOfflineQueue();
    return q.releaseHold(id);
}

/**
 * Delete a held submission, on a person's explicit instruction.
 *
 * The only deletion here that is not a successful upload. Nothing automatic
 * reaches it.
 *
 * @param {string} id
 * @param {string} reason
 * @returns {Promise<void>}
 */
export async function discardHeldSubmission(id, reason) {
    const q = await getOfflineQueue();
    return q.discardHeld(id, reason);
}

/**
 * Initialises the offline queue. Alias of getOfflineQueue.
 *
 * @returns {Promise<OfflineQueue>}
 */
export function initOffline() {
    return getOfflineQueue();
}

if (typeof window !== "undefined") {
    window.initOffline = initOffline;
    window.StarmusOfflineQueue = getOfflineQueue;
    window.StarmusHeldSubmissions = getHeldSubmissions;
    window.StarmusQueueUsage = getQueueUsage;
    window.StarmusReleaseHeldSubmission = releaseHeldSubmission;
    window.StarmusDiscardHeldSubmission = discardHeldSubmission;
}
