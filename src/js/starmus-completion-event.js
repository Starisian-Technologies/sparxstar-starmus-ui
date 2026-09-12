/**
 * @file starmus-completion-event.js
 * @summary The single home for the `starmus:complete` event.
 *
 * `starmus:complete` is the boundary between capture and the platform audio
 * lifecycle (ADR-034): nothing server-side begins until it fires. It therefore
 * has to fire on every path that ends in a stored recording — an immediate
 * upload and a queued upload that later drains — and it has to describe the
 * asset that was actually captured.
 *
 * It lives here rather than in `starmus-core.js` so the offline queue can emit
 * the same event without duplicating how it is built, and without a circular
 * import between core and offline.
 */

/**
 * Map a captured MIME type or file extension to the format name the
 * capture-to-ingestion contract uses.
 *
 * @param {string} mimeType
 * @param {string} fileName
 * @returns {string|null} null when the format is not one this package can name.
 */
export function resolveUploadFormat(mimeType, fileName) {
    const type = String(mimeType || "").trim().toLowerCase();
    const name = String(fileName || "").trim().toLowerCase();
    const ext = name.includes(".") ? name.split(".").pop() : "";

    if (
        type.includes("audio/mp4") ||
        type.includes("audio/x-m4a") ||
        type.includes("audio/aac") ||
        type.includes("aac") ||
        type.includes("mp4a") ||
        ext === "m4a" ||
        ext === "mp4" ||
        ext === "aac"
    ) {
        return "aac-lc";
    }

    if (
        type.includes("audio/ogg") ||
        type.includes("audio/opus") ||
        type.includes("opus") ||
        ext === "opus" ||
        ext === "ogg"
    ) {
        return "opus";
    }

    // WAV and MP3 are reported as themselves. ADR-035 holds the container and
    // codec restriction pending OQ-021, so this package does not decide that
    // an arriving format is inadmissible — it names what it has and lets the
    // Spoken Audio Node rule on it. Silently mapping these onto `opus` would
    // be worse: it would misdescribe the asset.
    if (
        type.includes("audio/wav") ||
        type.includes("audio/wave") ||
        type.includes("audio/x-wav") ||
        ext === "wav"
    ) {
        return "wav";
    }

    if (type.includes("audio/mpeg") || type.includes("audio/mp3") || ext === "mp3") {
        return "mp3";
    }

    // WebM with no codec stated. The recorder's own fallback is literally
    // `mimeType || "audio/webm"`, so this arrives in practice rather than in
    // theory — and returning null for it meant a real recording produced no
    // `starmus:complete` at all, which is the one event nothing downstream
    // starts without.
    //
    // Reported as `webm`, not silently resolved to `opus`. Browser WebM audio
    // is usually Opus and sometimes not, and ADR-035 holds the codec question
    // (OQ-021) for someone else to answer. Naming the container this package
    // actually has, and letting the Node identify the codec from the bytes, is
    // the same rule WAV and MP3 already follow above.
    if (type.includes("audio/webm") || ext === "webm") {
        return "webm";
    }

    return null;
}

/**
 * Read the contributor's stored consent record, if any.
 *
 * @returns {{granted?: boolean}|null}
 */
function readContributorConsent() {
    try {
        const raw =
            typeof localStorage !== "undefined"
                ? localStorage.getItem("starmus_contributor_consent")
                : null;
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Pick the upload identifier out of a result, in whichever spelling it
 * arrived, or an empty string when the result carries none.
 *
 * This cannot tell a server-issued identifier from a client-generated one:
 * the upload path resolves `uploadId` to the client's UUID when the server
 * returns no identifier of its own, so by the time a result reaches here the
 * two are indistinguishable. That fallback is deliberate — the same UUID
 * travels as TUS `upload_uuid` metadata, so it is a real correlation handle
 * rather than a guess — but this function does not verify the origin, and
 * callers must not assume it did.
 *
 * @param {Object} result
 * @returns {string}
 */
export function resolveUploadId(result) {
    return (
        [
            result?.uploadId,
            result?.upload_id,
            result?.data?.uploadId,
            result?.data?.upload_id,
        ].find((value) => typeof value === "string" && value.trim() !== "") || ""
    );
}

/**
 * Build the `starmus:complete` detail from an upload result and the metadata
 * that travelled with the asset.
 *
 * Audio details come from the capture attainment record, never from constants:
 * a `documentation` session at 48 kHz stereo must not be announced as 16 kHz
 * mono. `null` means the device did not report the value.
 *
 * @param {Object} input
 * @param {string} input.instanceId
 * @param {Object} input.result       Upload result.
 * @param {Object} input.metadata     Metadata that travelled with the asset.
 * @param {Object} [input.formFields]
 * @param {string} [input.fileName]
 * @param {string} [input.mimeType]
 * @param {string} [input.language]
 * @param {string} [input.contributorId]
 * @param {boolean} [input.calibrationApplied]
 * @param {number} [input.durationMs]
 * @returns {Object|null} null when the format cannot be named.
 */
export function buildCompletionDetail(input) {
    const format = resolveUploadFormat(input.mimeType, input.fileName);
    if (!format) {
        return null;
    }

    const attainment = input.metadata?.captureAttainment || null;
    const consent = readContributorConsent();

    return {
        sessionId: input.instanceId,
        uploadId: resolveUploadId(input.result),
        durationMs: input.durationMs ?? 0,
        sampleRate: attainment?.actual?.sampleRate ?? null,
        channels: attainment?.actual?.channelCount ?? null,
        captureProfile: input.metadata?.captureProfile || null,
        captureProfileAttained: attainment?.attained ?? null,
        format,
        language: input.language || input.formFields?.language || "",
        contributorId: input.contributorId || "",
        consentGranted: !!(consent && consent.granted),
        calibrationApplied: !!input.calibrationApplied,
    };
}

/**
 * Dispatch `starmus:complete`. No-op when the detail could not be built or
 * there is no document to dispatch on.
 *
 * @param {Object|null} detail
 * @returns {boolean} whether the event was dispatched.
 */
export function emitCompletionEvent(detail) {
    if (!detail || typeof document === "undefined") {
        return false;
    }
    document.dispatchEvent(new CustomEvent("starmus:complete", { detail }));
    return true;
}
