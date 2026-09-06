# Repository role — ADR-034 / ADR-035 / ADR-036

**This repository is the capture UI package** under
[ADR-034](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-034-capture-experience-vs-audio-lifecycle-split.md).

Role assignment lives here; the reason lives in the ADR. Do not restate the
rationale in this repository — cite the ADR number.

## Merge gate

ADR-034, ADR-035 and ADR-036 are **Proposed**, on
[registry#41](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/pull/41).
They are not yet on the registry's default branch, so the links above will 404
until that PR merges.

The restructure they govern is implemented in this repository's
`claude/starmus-repo-split-cleanup-uxbw74` branch. **That branch must not merge
before registry#41 merges.** Code that implements a Proposed decision is a
proposal; code that ships one is the decision. The gate is the merge, not the
writing — writing the change is how the ADR gets reviewed against something
real rather than against a description of itself.

If registry#41 is rejected or materially altered, this branch is revised or
abandoned with it. It carries no independent authority.

## What this repository owns

Browser microphone capture, local and offline handling, the chunked-upload
client, playback, recording-status components, and capture UX — embeddable by
any product without inheriting a CMS.

## What it does not own

| Concern | Owner |
| --- | --- |
| Server-side ingestion, validation, integrity, immutable storage, derivatives, processing jobs | Spoken Audio Node |
| Acoustic measurement — pitch, formant, intensity, duration | Spoken Audio Node |
| Canonical transcription, translation, linguistic interpretation, human correction | ESU |
| Elicitation script presentation, pacing, reader position | elicitation pacing package |

## Rules that bind this repository now

These hold regardless of the ADRs' status, because they restate limits this
repository already had:

- **No acoustic analysis, and no prosodic interpretation.** Neither has ever
  lived here and neither may arrive.
- **No CMS reach.** No CMS REST call, no CMS nonce, no CMS page global. The
  upload endpoint is injected by the host.
- **One home per capture-path source file.** Where a file here also exists in
  the CMS capture product, the two have diverged; read both and decide from the
  code, not from a document (ADR-034).

## What changed on this branch

- The paced reader and its stylesheet moved out to the elicitation pacing
  package (ADR-036); the transcript-sync controller went with them, since the
  reviewed transcript is ESU's.
- The four audio CI failure conditions — sample rate above 16 kHz, more than
  one channel, bitrate above 32 kbps, WAV or uncompressed PCM — are re-expressed
  in `AGENTS.md`. The three numeric conditions now bind the `conversation`
  profile only. **The format condition binds no profile** until OQ-021 is ruled
  on; re-scoping it to `conversation` would smuggle in an answer to the open
  question (ADR-035).
- `src/js/starmus-capture-profiles.js` is the one home for capture constraints.
  No other module may hold an audio limit.
