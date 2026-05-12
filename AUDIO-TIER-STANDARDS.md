Starmus Audio Recorder: Tier System and Audio Standards Specification (v1.0)
============================================================================

Purpose of Tier Classification
-------------------------------

The Starmus audio recorder uses a three‑tier system to classify device capability and determine which features the user interface should enable. The tier is computed by Sparxstar UEC's environment optimizer and passed to Starmus via environment data; Starmus **must not** compute the tier itself. Inputs used for cross‑validation include device memory, number of logical processors, effective network type, MediaRecorder support, speech‑recognition capability, storage quota and microphone permission. The optimizer assigns a fixed tier before the session begins---once set, **tier never changes mid‑session** and is not downgraded by network or system changes (e.g., network switching or battery saver).

Tier Definitions and Feature Matrix
------------------------------------

The tiers define which recorder components and enhancements are available. A summary from the cross‑validation protocol shows the role of each tier:

| Tier | Device class and features | UI behavior |
| --- | --- | --- |
| **A** | Fully capable devices (e.g., desktop browsers or modern smartphones). Support MediaRecorder, speech recognition and waveform rendering. | Provides the full multi‑stage recorder: waveform visualization, microphone calibration, noise suppression and real‑time speech‑to‑text. Tier A devices can save recordings to the offline queue. |
| **B** | Moderately capable devices that support recording but may lack stability or advanced processing. Waveform and speech recognition are disabled. | Presents a basic recorder without waveform or speech‑to‑text; offline queue is available. |
| **C** | Low‑capability or unsupported devices where MediaRecorder fails or is unavailable. Only file upload fallback is allowed. | The UI disables recording and shows a file upload control; no waveform, speech recognition or offline queue. |

### Dynamic Behavior Rules

- **No mid‑session tier change**: Once the tier is assigned at session start, it remains constant
  throughout the session; the system warns rather than changing tier when network quality degrades.
  Battery-saver mode or iOS audio freeze also do not demote the tier.
- **No computation in Starmus**: Starmus uses the provided `env.tier` from Sparxstar; fallback
  detection is used only when environment data is missing. The `detectTier` fallback returns **'C'**
  when MediaRecorder or `getUserMedia` is unsupported, returns **'B'** if no `AudioContext` is
  available, and defaults to **'A'** otherwise.
- **Fallback default**: `starmus-sparxstar-integration.js` returns `tier: 'C'` and an upload chunk
  size of 524 288 bytes when no Sparxstar optimizer is present. This forces all devices into Tier C
  unless capability detection is implemented.

Audio Settings per Tier
-----------------------

### Calibration Parameters

| Tier | Calibration duration | Sample rate | FFT size | Smoothing | Gain range | Auto gain |
| --- | --- | --- | --- | --- | --- | --- |
| **A** | 15 s (three phases) | 44.1 kHz | 2048 | 0.8 | 0.5 -- 2.0 | **Enabled** |
| **B** | 10 s (two phases) | 22.05 kHz | 1024 | 0.6 | 0.7 -- 1.5 | **Enabled** |
| **C** | 5 s (single phase) | 16 kHz | 512 | 0.4 | 0.8 -- 1.2 | **Disabled** |

### Offline Queue Limits

- Tier A: 20 MB maximum blob size
- Tier B: 10 MB maximum blob size
- Tier C: 5 MB maximum blob size (default)

### SPARXSTAR Optimization Profiles

- **Very Low Spec** (slow-2G): sample rate 8 kHz, bitrate 16 kbps.
- **Low Spec** (3G/mobile): sample rate 16 kHz, bitrate 32 kbps.
- **Default** (4G+/desktop): sample rate 16 kHz, bitrate 32 kbps.

Progressive Enhancement and UI Behaviour
-----------------------------------------

The recorder implements progressive enhancement: Tier A devices benefit from the full feature set---calibration, noise suppression and real‑time speech‑to‑text---while Tier B devices degrade gracefully to a basic recorder without waveform or speech recognition. Tier C devices skip recording altogether and show only file upload.

Summary and Recommendations
----------------------------

- **Do not compute tiers in Starmus**; rely on Sparxstar UEC's environment data.
- **Implement capability detection** in `starmus-sparxstar-integration.js` to avoid defaulting all devices to Tier C.
- **Ensure JavaScript uses the correct data attributes** for DOM binding.
- Maintain the **tier‑specific calibration settings**, offline queue limits and SPARXSTAR profiles documented above.
- Use the **progressive enhancement model** to deliver the best possible experience on capable devices while providing a reliable fallback for low‑capability devices.

This document serves as an authoritative specification for the tier system and audio standards of the Starmus audio recorder.
