# Repository role — ADR-034 / ADR-035 / ADR-036

**This repository is the capture UI package** under
[ADR-034](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-034-capture-experience-vs-audio-lifecycle-split.md).

Role assignment lives here; the reason lives in the ADR. Do not restate the
rationale in this repository — cite the ADR number.

## Decision status

ADR-034, ADR-035 and ADR-036 are on the registry's default branch as of
[registry#41](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/pull/41),
so the links above resolve. The restructure they govern is implemented here.

Their recorded **Status is still `Proposed`**. Merging distributed the records;
it did not by itself ratify them. Ratification is the owner's act and is made
by a metadata-only header edit in the registry, which ADR-021 permits.

If any of the three is later superseded, this repository's role assignment
changes with it — a superseding ADR is the only thing that moves this boundary,
not a decision taken inside this repository.

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
