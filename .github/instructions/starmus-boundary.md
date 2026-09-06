# Repository role and restructure hold — ADR-034 / ADR-035 / ADR-036

**This repository is the capture UI package** under
[ADR-034](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-034-capture-experience-vs-audio-lifecycle-split.md).

Role assignment lives here; the reason lives in the ADR. Do not restate the
rationale in this repository — cite the ADR number.

## Hold

[ADR-034](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-034-capture-experience-vs-audio-lifecycle-split.md),
[ADR-035](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-035-capture-profiles-not-a-platform-audio-ceiling.md) and
[ADR-036](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-036-elicitation-pacing-is-not-acoustic-prosody.md) are
**Proposed**. They were filed so the boundary
is settled once before either coding agent moves files. **Do not restructure
this repository, and do not change the audio limits in `AGENTS.md`, until they
are Accepted.** Until then the rules currently in `AGENTS.md` still govern this
repository's code.

## What this repository owns once the ADRs are Accepted

Browser recording, the upload client, the offline queue, playback, and
recording-status components — embeddable by any product without inheriting a
CMS.

## What changes on acceptance

- **Reconcile the fifteen duplicated JS files** that also exist in the CMS
  capture product, all fifteen of which have diverged. One home per
  capture-path source file (ADR-034). Where the two copies disagree, read both
  and decide from the code, not from a document.
- **Remove the CMS reach.** No CMS REST call, no CMS nonce, no CMS page global.
  The direct pace-save call in the paced-reader module goes with that module
  (ADR-036).
- **Move the paced reader out** to the elicitation pacing package (ADR-036).
  This repository keeps no acoustic analysis and no prosodic interpretation.
- **Re-express the four audio CI failure conditions** in `AGENTS.md` — sample
  rate above 16 kHz, more than one channel, bitrate above 32 kbps, WAV or
  uncompressed PCM — as `conversation`-profile conditions (ADR-035). They lose
  their platform-wide force. The in-source 16 kHz cap in the recorder and
  calibration modules becomes profile-driven. Numeric floors for the
  `documentation` profile are **not ours to pick**: they are OQ-021, open on
  AIWA and the acoustic-analysis owner.
- **Transcript synchronization is not ours.** The reviewed transcript and any
  translation are ESU's records (ADR-034) — ESU being the platform component
  that holds reviewed transcript, translation and linguistic-interpretation
  records. Its name is deliberately not expanded here: this repository is not
  ESU's home, and a definition kept in two places drifts.
