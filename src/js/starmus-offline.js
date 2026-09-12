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
import { uploadWithPriority } from "./starmus-tus.js";
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
};

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
 * Target eviction policy (Phase 3 — not yet implemented):
 * - LRU, 20 MB maximum total queue size.
 * - Entries older than 7 days are eligible for automatic eviction.
 * - Eviction will run on queue initialization and after each successful upload.
 *
 * Storage: IndexedDB, database "StarmusSubmissions", store "pendingSubmissions".
 */
class OfflineQueue {
    constructor() {
        /** @type {IDBDatabase|null} */
        this.db = null;
        /** @type {boolean} */
        this.isProcessing = false;
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

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction([CONFIG.storeName], "readwrite");
            const store = tx.objectStore(CONFIG.storeName);
            store.add(item);

            tx.oncomplete = () => {
                debugLog("[Offline] Queued:", item.id);
                this._notifyQueueUpdate();
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

        if (sparxstarIntegration.isBatteryCritical?.()) {
            debugLog("[Offline] Battery critical — deferring queue processing");
            return;
        }

        this.isProcessing = true;

        try {
            const pending = await this.getAll();
            if (pending.length === 0) {
                return;
            }

            debugLog(`[Offline] Processing ${pending.length} items`);

            for (const item of pending) {
                const { id, audioBlob, fileName, formFields, metadata, retryCount, instanceId } =
                    item;

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
                        // so no consumer can be told this asset exists. The
                        // entry is still removed — the asset is on the server
                        // and re-uploading it on every future drain would burn
                        // bandwidth the contributor is paying for without ever
                        // producing a nameable format. What must not happen is
                        // this passing in silence, so it is reported.
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
                    }

                    await this.remove(id);
                } catch (err) {
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
                }
            }
        } catch (fatal) {
            console.error("[Offline] Queue fatal:", fatal);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Sets up online/offline event listeners and a polling interval.
     *
     * @returns {void}
     */
    setupNetworkListeners() {
        window.addEventListener("online", () => this.processQueue());
        setInterval(() => {
            if (navigator.onLine) {
                this.processQueue().catch(() => {});
            }
        }, 60 * 1000);
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
}
