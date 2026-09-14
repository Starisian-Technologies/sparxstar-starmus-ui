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

    // A codec, only when the codec is actually stated. `audio/aac`, an `.aac`
    // file and an explicit `mp4a.40.2` codec parameter each name AAC; a bare
    // `audio/mp4` or `.m4a` names a *container*, which may hold HE-AAC, ALAC or
    // something else. Reporting `aac-lc` for those was a codec claim this
    // client cannot establish — the same misdescription the `webm` case was
    // changed to avoid, and the thing ADR-035 holds OQ-021 open about.
    // `mp4a` alone is not AAC-LC. The object-type indicates the profile:
    // `mp4a.40.2` is AAC-LC, `mp4a.40.5` is HE-AAC, `mp4a.40.29` HE-AACv2.
    // Reporting every `mp4a…` as `aac-lc` named a codec profile this client
    // cannot establish — the same overclaim as calling a container its codec,
    // one level down.
    if (type.includes("audio/aac") || type.includes("mp4a.40.2") || ext === "aac") {
        return "aac-lc";
    }

    // The container, named as itself, for the Node to identify the codec from
    // the bytes — exactly as WAV, MP3 and WebM are handled below.
    if (type.includes("audio/mp4") || type.includes("audio/x-m4a") || ext === "m4a" || ext === "mp4") {
        return "mp4";
    }

    // Opus only when Opus is stated. `audio/opus`, a `codecs=opus` parameter and
    // an `.opus` file each name the codec; a bare `audio/ogg` or `.ogg` names a
    // *container*, which may hold Vorbis, FLAC or Speex. This is the same
    // container-for-codec substitution the mp4 branch above was corrected for,
    // and imported material is exactly where it would misdescribe an asset.
    if (type.includes("audio/opus") || type.includes("opus") || ext === "opus") {
        return "opus";
    }

    if (type.includes("audio/ogg") || ext === "ogg") {
        return "ogg";
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
 * @returns {Object} Always a detail object. An accepted upload always gets its
 *          boundary event; see the `format` note below.
 */
export function buildCompletionDetail(input) {
    // An unnameable format reports `unknown` rather than withholding the
    // event. `starmus:complete` is the boundary between recording and
    // processing and nothing server-side begins without it, so returning null
    // here left an asset sitting on the server with no consumer told it
    // exists — the client's inability to name a container silently costing the
    // recording its entire downstream life.
    //
    // Naming it `unknown` is also the only honest option available: ADR-035
    // holds the container/codec question (OQ-021), so this package does not get
    // to rule an arriving format inadmissible, and it must not guess one
    // either. The Spoken Audio Node identifies the codec from the bytes, which
    // is what the named formats already rely on.
    const format = resolveUploadFormat(input.mimeType, input.fileName) || "unknown";

    const attainment = input.metadata?.captureAttainment || null;
    const consent = readContributorConsent();

    return {
        sessionId: input.instanceId,
        // What this event actually witnesses.
        //
        // `transferred` means the media ingest service acknowledged the last
        // chunk. It does **not** mean the Spoken Audio Node accepted the asset:
        // ADR-038 splits transport from acceptance, and no acknowledgement
        // contract exists on that seam yet, so nothing reaching this client can
        // observe acceptance. Consumers that need acceptance must wait for the
        // Node's own signal once that contract is defined; reading this event
        // as acceptance would treat "the bytes arrived" as "the platform has
        // it", which is exactly the confusion the three-party split exists to
        // prevent.
        //
        // The field is present from the start, with one value, so that adding
        // `accepted` later is an extension rather than a breaking change to a
        // shape consumers had to infer.
        stage: "transferred",
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
