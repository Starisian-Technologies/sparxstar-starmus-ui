/**
 * @file starmus-capture-profiles.js
 * @summary Named capture profiles. Audio constraints belong to a profile the
 *          calling product chooses — never to a platform-wide ceiling.
 *
 * Governed by ADR-035. The 16 kHz / mono / 32 kbps limits that used to be
 * applied to every recording in this package are a low-bandwidth
 * conversational transport profile; held platform-wide they destroy the source
 * material that documentation, sound-to-IPA, tone and prosody work depend on.
 *
 * The profile travels with the asset. A consumer reads it to decide whether a
 * measurement taken from that asset is admissible.
 *
 * The numeric floor for `documentation` is deliberately NOT set here. It is
 * OQ-021 in the governance registry, owned by AIWA and the acoustic-analysis
 * owner. `null` means "do not constrain" — the device's own default is used
 * and the real capability is reported back, rather than this package inventing
 * a floor it has no authority to set.
 */

/** @typedef {"conversation"|"documentation"|"import"} CaptureProfileName */

/**
 * @type {Record<CaptureProfileName, {
 *   name: CaptureProfileName,
 *   sampleRate: number|null,
 *   channelCount: number|null,
 *   audioBitsPerSecond: number|null,
 *   allowLossless: boolean,
 *   transcode: boolean,
 *   admissibleForMeasurement: boolean,
 *   description: string
 * }>}
 */
export const CAPTURE_PROFILES = Object.freeze({
    /** Efficient interactive use. The old platform-wide numbers live here, and only here. */
    conversation: Object.freeze({
        name: "conversation",
        sampleRate: 16000,
        channelCount: 1,
        audioBitsPerSecond: 32000,
        allowLossless: false,
        transcode: true,
        admissibleForMeasurement: false,
        description: "Low-bandwidth conversational capture for interactive use.",
    }),

    /**
     * Highest quality the device can safely sustain, for material that will be
     * measured. Not downsampled to a transport ceiling; not denied a lossless
     * container. Floors are OQ-021 and not set in this package.
     */
    documentation: Object.freeze({
        name: "documentation",
        sampleRate: null,
        channelCount: null,
        audioBitsPerSecond: null,
        allowLossless: true,
        transcode: false,
        admissibleForMeasurement: true,
        description: "Highest safe source quality for material that will be measured.",
    }),

    /** Prerecorded material, preserved unchanged. No transcode, resample or fold-down. */
    import: Object.freeze({
        name: "import",
        sampleRate: null,
        channelCount: null,
        audioBitsPerSecond: null,
        allowLossless: true,
        transcode: false,
        admissibleForMeasurement: true,
        description: "Prerecorded material preserved byte-for-byte.",
    }),
});

/** @type {CaptureProfileName} */
export const DEFAULT_CAPTURE_PROFILE = "conversation";

/**
 * Resolve a profile by name. An unknown name is a caller error and is not
 * silently coerced into a different profile — ADR-035 forbids satisfying a
 * request with something other than what was asked for.
 *
 * @param {CaptureProfileName|undefined|null} name
 * @returns {typeof CAPTURE_PROFILES[CaptureProfileName]}
 */
export function resolveCaptureProfile(name) {
    if (name === undefined || name === null) {
        return CAPTURE_PROFILES[DEFAULT_CAPTURE_PROFILE];
    }
    const profile = CAPTURE_PROFILES[name];
    if (!profile) {
        throw new Error(
            `Unknown capture profile "${String(name)}". Expected one of: ${Object.keys(CAPTURE_PROFILES).join(", ")}.`
        );
    }
    return profile;
}

/**
 * Build getUserMedia audio constraints for a profile. Keys the profile does
 * not constrain are omitted entirely rather than sent as a null, so the
 * browser applies its own default instead of failing the request.
 *
 * @param {CaptureProfileName} [name]
 * @returns {MediaTrackConstraints}
 */
export function getAudioConstraints(name) {
    const profile = resolveCaptureProfile(name);
    /** @type {MediaTrackConstraints} */
    const constraints = {
        echoCancellation: true,
        noiseSuppression: true,
    };
    if (profile.sampleRate !== null) {
        constraints.sampleRate = profile.sampleRate;
    }
    if (profile.channelCount !== null) {
        constraints.channelCount = profile.channelCount;
    }
    return constraints;
}

/**
 * MediaRecorder options for a profile. An unconstrained bitrate lets the
 * browser choose, which is what `documentation` and `import` want.
 *
 * @param {CaptureProfileName} [name]
 * @param {string} [mimeType]
 * @returns {MediaRecorderOptions}
 */
export function getRecorderOptions(name, mimeType) {
    const profile = resolveCaptureProfile(name);
    /** @type {MediaRecorderOptions} */
    const options = {};
    if (mimeType) {
        options.mimeType = mimeType;
    }
    if (profile.audioBitsPerSecond !== null) {
        options.audioBitsPerSecond = profile.audioBitsPerSecond;
    }
    return options;
}

/**
 * Report what the device actually delivered against what the profile asked
 * for. ADR-035: an unattainable profile is reported to the product, never
 * silently satisfied by substituting a different one.
 *
 * @param {CaptureProfileName} name
 * @param {MediaStreamTrack} track
 * @returns {{ profile: CaptureProfileName, requested: object, actual: object, attained: boolean }}
 */
export function describeAttainment(name, track) {
    const profile = resolveCaptureProfile(name);
    const actual = typeof track?.getSettings === "function" ? track.getSettings() : {};
    const requested = {
        sampleRate: profile.sampleRate,
        channelCount: profile.channelCount,
    };
    const attained =
        (profile.sampleRate === null || actual.sampleRate === undefined || actual.sampleRate >= profile.sampleRate) &&
        (profile.channelCount === null ||
            actual.channelCount === undefined ||
            actual.channelCount === profile.channelCount);

    return { profile: profile.name, requested, actual, attained };
}
