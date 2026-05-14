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
 * @file starmus-tus.js
 * @version 6.7.0
 * @description TUS resumable-upload client with direct-upload fallback.
 * Integrates with the SPARXSTAR/WordPress REST API.
 * Upload chunk size is tier-optimised via sparxstarIntegration.
 */

"use strict";

import * as tus from "tus-js-client";
import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";

/* ---- Circuit Breaker ---- */

/**
 * Simple circuit breaker that opens after repeated upload failures.
 * Prevents hammering a broken endpoint while offline or during server errors.
 */
class UploadCircuitBreaker {
    constructor() {
        this.failures = 0;
        this.threshold = 3;
        this.timeout = 60000;
        this.state = "closed";
        this.openedAt = null;
    }

    async execute(operation) {
        if (this.state === "open") {
            const elapsed = Date.now() - this.openedAt;
            if (elapsed < this.timeout) {
                throw new Error("Upload circuit breaker open — too many failures");
            }
            this.state = "half-open";
        }

        try {
            const result = await operation();
            if (this.state === "half-open") {
                this.state = "closed";
                this.failures = 0;
            }
            return result;
        } catch (err) {
            this.failures++;
            if (this.failures >= this.threshold) {
                this.state = "open";
                this.openedAt = Date.now();
                console.error("[CircuitBreaker] Opened after", this.failures, "failures");
            }
            throw err;
        }
    }
}

const uploadCircuitBreaker = new UploadCircuitBreaker();

/* ---- Config ---- */

/**
 * Returns a configuration object merged from tier-defaults and global overrides.
 *
 * @returns {Object} Upload configuration
 */
function getConfig() {
    const envData = sparxstarIntegration.getEnvironmentData();
    const settings = envData?.recordingSettings || {};

    const defaults = {
        chunkSize: settings.uploadChunkSize || 512 * 1024, // max 512 KB per AGENTS.md
        retryDelays: [0, 5000, 10000],
        removeFingerprintOnSuccess: true,
        maxChunkRetries: 3,
        requestTimeoutMs: 5000,
        endpoint: "",
        nonce: "",
    };

    const globalCfg =
        (typeof window !== "undefined" && (window.starmusTus || window.starmusConfig)) || {};

    return Object.assign({}, defaults, globalCfg);
}

/* ---- Helpers ---- */

/**
 * Sanitises a metadata value for TUS header transmission.
 * Objects are JSON-encoded; all values have control characters stripped.
 *
 * @param {*} value
 * @returns {string}
 */
function sanitizeMetadata(value) {
    const raw =
        typeof value === "object" ? JSON.stringify(value) : String(value || "");
    return raw.replace(/[\r\n\t]/g, " ");
}

/**
 * Normalises formFields to a plain object.
 *
 * @param {*} fields
 * @returns {Object}
 */
function normalizeFormFields(fields) {
    return fields && typeof fields === "object" ? fields : {};
}

function createUploadId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `starmus-upload-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/* ---- Direct Upload (fallback) ---- */

/**
 * Uploads a recording blob directly to the WordPress REST API using FormData.
 * Used when TUS is unavailable or the endpoint is not configured.
 *
 * @param {Blob} blob - Audio blob
 * @param {string} fileName - File name for the upload
 * @param {Object} [formFields={}] - Form fields (language, consent, etc.)
 * @param {Object} [metadata={}] - Additional metadata
 * @param {string} [instanceId=''] - Recorder instance ID
 * @param {function} [onProgress] - Progress callback (loaded, total)
 * @returns {Promise<Object>} Server response
 */
export async function uploadDirect(
    blob,
    fileName,
    formFields = {},
    metadata = {},
    instanceId = "",
    onProgress,
) {
    const cfg = getConfig();
    const nonce = cfg.nonce || "";
    const endpoint =
        cfg.endpoints?.directUpload ||
        "/wp-json/star-starmus-audio-recorder/v1/upload-fallback";
    const fields = normalizeFormFields(formFields);

    if (!(blob instanceof Blob)) {
        throw new Error("INVALID_BLOB_TYPE: blob must be a Blob instance");
    }

    const fd = new FormData();
    const uploadId = createUploadId();
    fd.append("audio_file", blob, fileName);
    fd.append("upload_uuid", uploadId);

    for (const [key, val] of Object.entries(fields)) {
        fd.append(key, String(val));
    }

    if (metadata.transcript) {
        fd.append("transcription", metadata.transcript);
    }
    if (metadata.calibration) {
        fd.append("_starmus_calibration", JSON.stringify(metadata.calibration));
    }
    if (metadata.env) {
        fd.append("_starmus_env", JSON.stringify(metadata.env));
    }
    if (metadata.tier) {
        fd.append("tier", metadata.tier);
    }
    if (instanceId) {
        fd.append("instanceId", instanceId);
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const timeout = setTimeout(() => {
            xhr.abort();
            reject(new Error(`Direct upload timed out after ${cfg.requestTimeoutMs}ms`));
        }, cfg.requestTimeoutMs);

        xhr.upload.addEventListener("progress", (e) => {
            if (onProgress && e.lengthComputable) {
                onProgress(e.loaded, e.total);
            }
        });

        xhr.addEventListener("load", () => {
            clearTimeout(timeout);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    resolve({ success: true, raw: xhr.responseText });
                }
            } else {
                reject(new Error(`Direct upload failed: HTTP ${xhr.status} — ${xhr.responseText}`));
            }
        });

        xhr.addEventListener("error", () => {
            clearTimeout(timeout);
            reject(new Error("Direct upload network error"));
        });
        xhr.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new Error("Direct upload aborted"));
        });

        xhr.open("POST", endpoint);
        if (nonce) {
            xhr.setRequestHeader("X-WP-Nonce", nonce);
        }
        xhr.send(fd);
    });
}

/* ---- TUS Upload ---- */

/**
 * Uploads a recording blob using the TUS resumable-upload protocol.
 *
 * @param {Blob} blob - Audio blob
 * @param {string} fileName - File name for the upload
 * @param {Object} [formFields={}] - Form fields
 * @param {Object} [metadata={}] - Additional metadata
 * @param {string} [instanceId=''] - Recorder instance ID
 * @param {function} [onProgress] - Progress callback (bytesUploaded, bytesTotal)
 * @returns {Promise<Object>} Server response
 */
export async function uploadTus(
    blob,
    fileName,
    formFields = {},
    metadata = {},
    instanceId = "",
    onProgress,
) {
    const cfg = getConfig();
    const nonce = cfg.nonce || "";
    const tusEndpoint =
        cfg.endpoint ||
        cfg.endpoints?.tus ||
        "/wp-json/star-starmus-audio-recorder/v1/tus";
    const fields = normalizeFormFields(formFields);
    const uploadId = createUploadId();

    // Flatten all metadata into TUS metadata (strings only)
    const tusMetadata = {
        upload_uuid: sanitizeMetadata(uploadId),
        filename: sanitizeMetadata(fileName),
        filetype: sanitizeMetadata(blob.type),
        instanceId: sanitizeMetadata(instanceId),
        tier: sanitizeMetadata(metadata.tier || "C"),
        transcript: sanitizeMetadata(metadata.transcript || ""),
        calibration: sanitizeMetadata(metadata.calibration || ""),
        env: sanitizeMetadata(metadata.env || ""),
    };

    // Merge form fields into TUS metadata
    for (const [key, val] of Object.entries(fields)) {
        tusMetadata[key] = sanitizeMetadata(val);
    }

    const headers = {};
    if (nonce) {
        headers["X-WP-Nonce"] = nonce;
    }

    return new Promise((resolve, reject) => {
        const upload = new tus.Upload(blob, {
            endpoint: tusEndpoint,
            chunkSize: cfg.chunkSize,
            retryDelays: cfg.retryDelays,
            removeFingerprintOnSuccess: cfg.removeFingerprintOnSuccess,
            checksumAlgorithm: "sha1",
            metadata: tusMetadata,
            headers,

            onProgress(bytesUploaded, bytesTotal) {
                if (onProgress) {
                    onProgress(bytesUploaded, bytesTotal);
                }
            },

            onSuccess() {
                resolve({ success: true, url: upload.url });
            },

            onError(err) {
                console.error("[TUS] Upload error:", err);
                sparxstarIntegration.reportError("tus_upload_error", {
                    error: err.message,
                    instanceId,
                    tier: metadata.tier,
                });
                reject(err);
            },
        });

        upload.start();
    });
}

/* ---- Priority Upload (TUS → Direct fallback) ---- */

/**
 * Attempts TUS upload first; falls back to direct upload on failure.
 * Wrapped in circuit breaker to prevent repeated hammering.
 *
 * @param {Object} options - Upload options
 * @param {Blob} options.blob - Audio blob
 * @param {string} options.fileName - File name
 * @param {Object} [options.formFields={}] - Form fields
 * @param {Object} [options.metadata={}] - Metadata
 * @param {string} [options.instanceId=''] - Instance ID
 * @param {function} [options.onProgress] - Progress callback
 * @returns {Promise<Object>} Upload result
 */
export async function uploadWithPriority({
    blob,
    fileName,
    formFields = {},
    metadata = {},
    instanceId = "",
    onProgress,
}) {
    const cfg = getConfig();
    const hasTusEndpoint = !!(cfg.endpoint || cfg.endpoints?.tus);

    return uploadCircuitBreaker.execute(async () => {
        if (hasTusEndpoint) {
            try {
                return await uploadTus(blob, fileName, formFields, metadata, instanceId, onProgress);
            } catch (tusErr) {
                console.warn("[TUS] Falling back to direct upload:", tusErr.message);
                sparxstarIntegration.reportError("tus_fallback_to_direct", {
                    error: tusErr.message,
                    instanceId,
                });
            }
        }

        return uploadDirect(blob, fileName, formFields, metadata, instanceId, onProgress);
    });
}
