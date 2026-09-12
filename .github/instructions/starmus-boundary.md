# Repository role — ADR-034 / ADR-035 / ADR-036 / ADR-038 / ADR-039

**This repository is the capture UI package** under
[ADR-034](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-034-capture-experience-vs-audio-lifecycle-split.md).

Role assignment lives here; the reason lives in the ADR. Do not restate the
rationale in this repository — cite the ADR number.

Two further records from the 2026-09-10 session bind this repository:
[ADR-038](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-038-spoken-audio-node-is-a-node-service.md)
(Spoken Audio Node; the live-transcript slot and asset references) and
[ADR-039](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/blob/main/standards/decisions/ADR-039-archive-never-edits-audio.md)
(the archive never edits audio; pre-submission retake only).

## Decision status

ADR-034, ADR-035 and ADR-036 are on the registry's default branch as of
[registry#41](https://github.com/Starisian-Technologies/sparxstar-architecture-governance-registry/pull/41),
so the links above resolve. The restructure they govern is implemented here.
ADR-038 and ADR-039 were filed to the registry from the 2026-09-10 session.

**All five have Status `Proposed`.** Merging distributed the records; it did not
by itself ratify them. Ratification is the owner's act and is made by a
metadata-only header edit in the registry, which ADR-021 permits.

The rules further down that are marked as binding now bind now, because they
restate limits this repository already had. The rest takes effect on
ratification.

If any of the five is later superseded, this repository's role assignment
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
| Speech/silence boundaries of record (server-side VAD) | Spoken Audio Node |
| Word-level alignment of record | ESU (Yahura) |
| Storage, derivatives, waveform data of a stored recording, release rendering | Spoken Audio Node |

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
- **No audio mutation after submission, and no edit capability at all**
  (ADR-039). Retake and discard are pre-submission and replace a draft; there
  is no trim, splice, cut, or "effective audio"/EDL mechanism here and none may
  be added. Dead air and false starts are handled downstream by segmentation
  and annotation, which are data about the audio, not instructions to change
  it.
- **No full-file upload path** (capture-to-ingestion contract; ADR-038). The
  transfer is chunked and resumable or it does not happen. A failed upload is
  queued and resumed from the last acknowledged offset — never re-sent from
  byte zero, which would discard everything already paid for.
- **No durable storage URL** in any event, record or evidence field (ADR-038).
  Assets are referenced by identifier; short-lived access URLs are requested on
  demand by whoever needs bytes, and this package never does.
- **The live-transcript slot is provider-agnostic and lowest-authority**
  (ADR-038). Its output carries tokens, timestamps on the original timeline,
  and provenance naming the engine and model version — and it is never the
  boundary mechanism of record, never alignment of record, and never a
  measurement. Timings this package did not measure are not written.
- **Client-side waveform computation only on a local, not-yet-uploaded capture
  blob** (ADR-038). A waveform of a stored recording is a Node derivative.

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

## What changed for ADR-038 and ADR-039

- `src/js/starmus-transcript-provider.js` is the live-transcript slot, built as
  its own bundle (`dist/starmus-transcript.js`) so a Tier C device — which has
  no microphone surface — does not download it.
- The full-file upload fallback is gone. It re-sent the whole recording over
  the link that had just failed, which the capture-to-ingestion contract
  forbids on both sides and ADR-038 forbids outright.
- The upload's 5-second total-duration abort is replaced by a no-progress
  watchdog. A deadline on a resumable transfer ended every real upload on a 2G
  link before it finished and then threw the transferred bytes away.
- The capture profile now travels in upload metadata. It was assembled and then
  dropped, so it reached ingestion on no path at all (ADR-035).
- A failed upload is queued on every path, retryable or not. Error
  classification decides what happens next, never whether the recording
  survives (ADR-011).
- `scripts/validate-build.cjs` enforces the rules above rather than leaving
  them to review: no CMS reach, no full-file path, profile present, stall-bound
  watchdog, one home for audio limits, no edit capability.
