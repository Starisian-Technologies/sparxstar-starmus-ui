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
import { uploadWithPriority } from "./starmus-tus.js";
import sparxstarIntegration from "./starmus-sparxstar-integration.js";

/** @type {Object} Queue configuration constants */
const CONFIG = {
    dbName: "StarmusSubmissions",
    storeName: "pendingSubmissions",
    dbVersion: 1,
    maxRetries: 10,
    retryDelays: [0, 5000, 10000, 30000, 60000, 120000, 300000, 600000, 1200000, 1800000],
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

/** @private */
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
            id: `starmus-offline-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            instanceId,
            fileName,
            timestamp: Date.now(),
            audioBlob: safeBlob,
            formFields,
            metadata,
            retryCount: 0,
            lastAttempt: null,
            error: null,
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

                if (retryCount >= CONFIG.maxRetries) {
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
                    await uploadWithPriority({
                        blob: audioBlob,
                        fileName,
                        formFields,
                        metadata,
                        instanceId,
                    });
                    await this.remove(id);
                } catch (err) {
                    const msg = err && err.message ? err.message : String(err);
                    const nonRetryable = /400|Invalid JSON|QuotaExceeded/i.test(msg);
                    if (!nonRetryable) {
                        await this._updateRetry(id, retryCount + 1, msg);
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
 * @returns {Promise<number>}
 */
export async function getPendingCount() {
    const q = await getOfflineQueue();
    const list = await q.getAll();
    return list.length;
}

/**
 * Initialises the offline queue. Alias of getOfflineQueue.
 *
 * @returns {Promise<OfflineQueue>}
 */
export function initOffline() {
    return getOfflineQueue();
}

export default offlineQueue;

if (typeof window !== "undefined") {
    window.initOffline = initOffline;
    window.StarmusOfflineQueue = getOfflineQueue;
}
