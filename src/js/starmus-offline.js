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
import { createUploadId, uploadWithPriority } from "./starmus-tus.js";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";

/** @type {Object} Queue configuration constants */
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
    throw new Error("Secure UUID generation is not available in this runtime");
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
        /** @type {Promise<void>} Serializes `add()` so the budget check holds. */
        this._addChain = Promise.resolve();
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
        // Serialized. The budget check reads the store and the insert writes it
        // in two separate transactions, so two concurrent adds could each see
        // room and then both insert — two 12 MB Tier A recordings landing in a
        // 20 MB queue. Chaining them makes check-then-insert effectively
        // atomic without holding an IndexedDB transaction across an await.
        const previous = this._addChain;
        let release;
        this._addChain = new Promise((resolve) => {
            release = resolve;
        });
        try {
            await previous;
            return await this._add(instanceId, audioBlob, fileName, formFields, metadata);
        } finally {
            release();
        }
    }

    /** @private */
    async _add(instanceId, audioBlob, fileName, formFields = {}, metadata = {}) {
        if (!this.db) {
            throw new Error("OfflineQueue: DB not initialised");
        }

        const maxAllowedSize = getMaxBlobSize(metadata);
        if (audioBlob.size > maxAllowedSize) {
            throw new Error(
                `Audio too large (${(audioBlob.size / 1024 / 1024).toFixed(2)} MB); limit ${(maxAllowedSize / 1024 / 1024).toFixed(2)} MB`,
            );
        }

        // Per-blob was the only bound; the platform standard also caps the
        // queue as a whole. Without that, repeated failures accumulate held
        // entries until IndexedDB refuses the transaction — and a quota error
        // at `add()` loses the recording being made right now, which is the
        // worst possible moment to find out.
        const usage = await this.usage();
        if (usage.totalBytes + audioBlob.size > CONFIG.maxTotalBytes) {
            const heldNote =
                usage.heldCount > 0
                    ? ` ${usage.heldCount} held recording(s) occupy ${(usage.heldBytes / 1024 / 1024).toFixed(2)} MB and need attention before more will fit.`
                    : "";
            throw new Error(
                `QueueFull: the offline queue holds ${(usage.totalBytes / 1024 / 1024).toFixed(2)} MB of ` +
                    `${(CONFIG.maxTotalBytes / 1024 / 1024).toFixed(2)} MB and this recording needs ` +
                    `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB.${heldNote} ` +
                    "Nothing is deleted to make room.",
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

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            store.add(item);

            tx.oncomplete = () => {
                debugLog("[Offline] Queued:", item.id);
                this._notifyQueueUpdate();
                if (navigator.onLine) {
                    this._scheduleProcessQueue(0);
                }
                resolve(item.id);
            };

            tx.onerror = (ev) => reject(ev.target.error);
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
    async remove(id) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            tx.objectStore(CONFIG.storeName).delete(id);
            tx.oncomplete = () => {
                this._notifyQueueUpdate();
                resolve();
            };
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /**
     * Mark a submission as held: kept, no longer retried, needing a person.
     *
     * @private
     * @param {string} id
     * @param {string} reason
     * @returns {Promise<void>}
     */
    async _hold(id, reason) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            req.onsuccess = () => {
                const item = req.result;
                if (item) {
                    item.held = true;
                    item.heldReason = reason;
                    item.lastAttempt = Date.now();
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
        const all = await this.getAll();
        let totalBytes = 0;
        let heldBytes = 0;
        let heldCount = 0;
        for (const item of all) {
            const size = item.audioBlob?.size || 0;
            totalBytes += size;
            if (item.held === true) {
                heldBytes += size;
                heldCount += 1;
            }
        }
        return {
            totalBytes,
            count: all.length,
            heldBytes,
            heldCount,
            maxTotalBytes: CONFIG.maxTotalBytes,
        };
    }

    /**
     * Submissions that are kept but will not be retried without intervention.
     *
     * Surfaced so a host can show them rather than let them sit invisibly: a
     * held recording that nobody is told about is a lost one with extra steps.
     *
     * @returns {Promise<Array<Object>>}
     */
    async getHeld() {
        const all = await this.getAll();
        return all.filter((item) => item.held === true);
    }

    /**
     * Replace a submission's metadata in place.
     *
     * @private
     * @param {string} id
     * @param {Object} metadata
     * @returns {Promise<void>}
     */
    async _setMetadata(id, metadata) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            req.onsuccess = () => {
                const item = req.result;
                if (item) {
                    item.metadata = metadata;
                    store.put(item);
                }
            };

            req.onerror = (ev) => reject(ev.target.error);
            tx.oncomplete = () => resolve();
            tx.onerror = (ev) => reject(ev.target.error);
        });
    }

    /** @private */
    async _updateRetry(id, retryCount, error) {
        if (!this.db) {
            return;
        }
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            const req = store.get(id);

            req.onsuccess = () => {
                const item = req.result;
                if (item) {
                    item.retryCount = retryCount;
                    item.lastAttempt = Date.now();
                    item.error = error || null;
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
                const { id, audioBlob, fileName, formFields, metadata, retryCount, instanceId } =
                    item;
                // Whether the bytes reached the server on this attempt.
                let uploaded = false;

                // Entries queued before the submission id existed have no
                // `metadata.uploadId`, so every retry would mint a new one and
                // start a new TUS resource instead of resuming the partial it
                // already has. Backfilled once and persisted, so the
                // one-id-per-submission rule reaches recordings already sitting
                // on devices rather than only new ones.
                if (typeof metadata?.uploadId !== "string" || metadata.uploadId === "") {
                    const backfilled = createUploadId();
                    await this._setMetadata(id, { ...(metadata || {}), uploadId: backfilled });
                    if (metadata) {
                        metadata.uploadId = backfilled;
                    }
                    debugLog("[Offline] Backfilled upload id for legacy entry:", id);
                }

                if (item.held) {
                    // Already held for a person. Retrying it on every drain
                    // would burn the contributor's bandwidth to no effect.
                    continue;
                }

                if (retryCount >= CONFIG.maxRetries) {
                    // Held, not removed. Exhausting the retries says the queue
                    // cannot fix this on its own; it does not say the recording
                    // is worth less than the storage it occupies (ADR-011).
                    await this._hold(
                        id,
                        `Upload failed ${retryCount} times; the recording is held here and needs attention.`,
                    );
                    continue;
                }

                if (item.lastAttempt !== null) {
                    const delay =
                        CONFIG.retryDelays[Math.min(retryCount, CONFIG.retryDelays.length - 1)];
                    if (Date.now() - item.lastAttempt < delay) {
                        continue;
                    }
                }

                try {
                    const result = await uploadWithPriority({
                        blob: audioBlob,
                        fileName,
                        formFields,
                        metadata,
                        instanceId,
                    });

                    // Set here, the moment the bytes are known to have landed —
                    // not at the end of the block. Setting it last made the
                    // `if (uploaded)` guard below unreachable: everything that
                    // can throw between here and there threw first, so the
                    // protection against re-uploading an accepted asset did
                    // nothing at all.
                    uploaded = true;

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
                        language: formFields?.language,
                        contributorId: metadata?.env?.identifiers?.visitorId || "",
                        calibrationApplied: !!metadata?.calibration,
                    });

                    if (detail) {
                        emitCompletionEvent(detail);
                    } else {
                        // The upload succeeded but the format cannot be named,
                        // so `starmus:complete` cannot be built — and nothing
                        // server-side begins without it (ADR-034). The asset is
                        // on the server with no consumer told it exists.
                        //
                        // Held, not removed. Removing it made the orphan
                        // invisible: the recording was gone from the device and
                        // stalled on the server with nobody able to see either
                        // half. A held entry is not retried, so it costs no
                        // bandwidth, and it is the only remaining evidence that
                        // this recording needs a person.
                        console.error(
                            "[Offline] Uploaded but could not build starmus:complete:",
                            { id, fileName, mimeType: metadata?.mimeType || audioBlob.type || "" }
                        );
                        sparxstarIntegration.reportError("completion_detail_unbuildable", {
                            submissionId: id,
                            instanceId,
                            fileName,
                            mimeType: metadata?.mimeType || audioBlob.type || "",
                            captureProfile: metadata?.captureProfile || null,
                        });
                        await this._hold(
                            id,
                            `Uploaded, but the format could not be named (${metadata?.mimeType || audioBlob.type || "unknown"}), so no completion event was emitted.`,
                        );
                        continue;
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
                        await this._hold(id, `Uploaded; completion handling failed: ${msg}`);
                        continue;
                    }
                    const msg = err && err.message ? err.message : String(err);
                    const nonRetryable = /400|Invalid JSON|QuotaExceeded/i.test(msg);
                    if (nonRetryable) {
                        // Retrying will not help, so stop retrying — and keep
                        // the recording. Deleting it here was the queue
                        // quietly deciding a contributor's material was
                        // disposable because a server rejected its shape.
                        await this._hold(id, `Upload rejected and not retryable: ${msg}`);
                    } else {
                        const nextRetryCount = Math.min(retryCount + 1, CONFIG.maxRetries);
                        await this._updateRetry(id, nextRetryCount, msg);
                    }
                    continue;
                }

                // Cleanup, outside the transfer's try. An IndexedDB delete that
                // fails is a storage problem, not an upload one; recorded as an
                // upload failure it left the entry retryable and the next drain
                // uploaded the same recording again.
                try {
                    await this.remove(id);
                } catch (cleanupError) {
                    const msg =
                        cleanupError && cleanupError.message
                            ? cleanupError.message
                            : String(cleanupError);
                    console.error("[Offline] Uploaded but could not clear the entry:", id, msg);
                    await this._hold(id, `Uploaded; local cleanup failed: ${msg}`);
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
    /** @private */
    async _getNextProcessDelay() {
        // Held entries are excluded. `_hold()` leaves `retryCount` at the
        // limit, and the branch below returns 0 for anything at the limit — so
        // a single held recording made the queue reschedule itself immediately,
        // forever, waking the device to look at an item it will never retry.
        // On a phone with a failing upload and a low battery that is the worst
        // possible loop to leave running.
        const pending = (await this.getAll()).filter((item) => item.held !== true);
        if (pending.length === 0) {
            return null;
        }

        let nextDelay = null;
        const now = Date.now();

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
}
