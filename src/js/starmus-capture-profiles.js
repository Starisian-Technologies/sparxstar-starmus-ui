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
 * @typedef {Object} CaptureProfile
 * @property {CaptureProfileName} name
 * @property {number|null} sampleRate           Ceiling in Hz, or null to leave unconstrained.
 * @property {number|null} channelCount         Ceiling in channels, or null to leave unconstrained.
 * @property {number|null} audioBitsPerSecond   Encoder bitrate, or null to let the browser choose.
 * @property {boolean} voiceProcessing          Request browser echo cancellation and noise suppression.
 * @property {boolean} allowLossless
 * @property {boolean} transcode
 * @property {boolean} admissibleForMeasurement
 * @property {string} description
 */

/** @type {Record<CaptureProfileName, CaptureProfile>} */
export const CAPTURE_PROFILES = Object.freeze({
    /** Efficient interactive use. The old platform-wide numbers live here, and only here. */
    conversation: Object.freeze({
        name: "conversation",
        sampleRate: 16000,
        channelCount: 1,
        audioBitsPerSecond: 32000,
        // Echo cancellation and noise suppression make conversational speech
        // intelligible at this bitrate. They are voice-telephony processing,
        // so they belong to this profile and to no other.
        voiceProcessing: true,
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
        // Off deliberately. Echo cancellation and noise suppression are
        // non-linear, non-invertible processing applied before the sample
        // reaches this package. Pitch, formant and intensity measurements
        // taken downstream would be measurements of the browser's voice
        // processing, not of the speaker.
        voiceProcessing: false,
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
        voiceProcessing: false,
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
 * Only an absent value (`undefined` or `null`) selects the default. An empty
 * string is an explicit request for a profile that does not exist, and throws.
 *
 * @param {CaptureProfileName|undefined|null} name
 * @returns {CaptureProfile}
 */
export function resolveCaptureProfile(name) {
    if (name === undefined || name === null) {
        return CAPTURE_PROFILES[DEFAULT_CAPTURE_PROFILE];
    }
    const profile = Object.prototype.hasOwnProperty.call(CAPTURE_PROFILES, name)
        ? CAPTURE_PROFILES[name]
        : undefined;
    if (!profile) {
        throw new Error(
            `Unknown capture profile "${String(name)}". Expected one of: ${Object.keys(CAPTURE_PROFILES).join(", ")}.`
        );
    }
    return profile;
}

/**
 * The capture profile for this session, chosen by the calling product.
 *
 * The product sets `window.STARMUS_BOOTSTRAP.captureProfile`; absent that,
 * `conversation` is used, which preserves this package's previous behaviour
 * exactly. `??` rather than `||`: an explicitly supplied empty string is an
 * invalid request and must reach `resolveCaptureProfile()` to be rejected,
 * not be silently upgraded into a working profile.
 *
 * @returns {CaptureProfileName}
 */
export function activeCaptureProfileName() {
    const bootstrap = typeof window !== "undefined" ? window.STARMUS_BOOTSTRAP : null;
    return bootstrap?.captureProfile ?? DEFAULT_CAPTURE_PROFILE;
}

/**
 * Build getUserMedia audio constraints for a profile. Keys the profile does
 * not constrain are omitted entirely rather than sent as a null, so the
 * browser applies its own default instead of failing the request.
 *
 * Numeric limits are sent as `{ ideal: n }`, not as `{ max: n }` or
 * `{ exact: n }`. A mandatory constraint the device cannot meet makes
 * `getUserMedia` reject with `OverconstrainedError`, and the speaker cannot
 * record at all — which ADR-011's unconditional-capture rule forbids. The
 * package therefore asks, then reports what it actually got through
 * `describeAttainment()`; enforcing a ceiling on the resulting asset is the
 * Spoken Audio Node's, where refusing does not cost the recording.
 *
 * @param {CaptureProfileName} [name]
 * @returns {MediaTrackConstraints}
 */
export function getAudioConstraints(name) {
    const profile = resolveCaptureProfile(name);
    /** @type {MediaTrackConstraints} */
    const constraints = {
        echoCancellation: profile.voiceProcessing,
        noiseSuppression: profile.voiceProcessing,
    };
    if (profile.sampleRate !== null) {
        constraints.sampleRate = { ideal: profile.sampleRate };
    }
    if (profile.channelCount !== null) {
        constraints.channelCount = { ideal: profile.channelCount };
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
 * @typedef {Object} CaptureAttainment
 * @property {CaptureProfileName} profile
 * @property {{sampleRate: number|null, channelCount: number|null}} requested
 * @property {{sampleRate?: number, channelCount?: number}} actual
 * @property {boolean|null} attained True only when every constrained value was
 *   verified within its limit; `false` when one was missed; `null` when the
 *   question does not apply, which is the `import` profile's case — nothing was
 *   captured, so nothing was measured, and `false` would claim a constraint was
 *   missed rather than never posed.
 * @property {string[]} exceeded   Constrained values the device delivered above the profile's limit.
 * @property {string[]} unverified Constrained values the device did not report at all.
 */

/**
 * Report what the device actually delivered against what the profile asked
 * for. ADR-035: an unattainable profile is reported to the product, never
 * silently satisfied by substituting a different one.
 *
 * A profile's numbers are ceilings, so a value is within limit when it is at
 * or below the requested one. A value the device does not report is
 * `unverified`, never assumed to be fine — an unreported rate is exactly the
 * case where a 44.1 or 48 kHz stream would otherwise pass unnoticed.
 *
 * @param {CaptureProfileName} name
 * @param {MediaStreamTrack} track
 * @returns {CaptureAttainment}
 */
export function describeAttainment(name, track) {
    const profile = resolveCaptureProfile(name);
    const actual = typeof track?.getSettings === "function" ? track.getSettings() : {};
    const requested = {
        sampleRate: profile.sampleRate,
        channelCount: profile.channelCount,
    };

    /** @type {string[]} */
    const exceeded = [];
    /** @type {string[]} */
    const unverified = [];

    for (const key of /** @type {const} */ (["sampleRate", "channelCount"])) {
        const limit = profile[key];
        if (limit === null) {
            continue;
        }
        const reported = actual[key];
        if (typeof reported !== "number") {
            unverified.push(key);
        } else if (reported > limit) {
            exceeded.push(key);
        }
    }

    return {
        profile: profile.name,
        requested,
        actual,
        attained: exceeded.length === 0 && unverified.length === 0,
        exceeded,
        unverified,
    };
}
