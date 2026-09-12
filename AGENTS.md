# sparxstar-starmus-ui — Package Identity

## @sparxstar/starmus-audio — Vanilla JS+CSS Audio Capture Package

**This is not a React app. This is not a WordPress plugin.**
This is a vanilla JS+CSS npm package for audio recording, calibration,
consent capture, resumable chunked upload, and the live-transcript slot.

---

## What This Package IS

- Audio recorder with device and acoustic calibration
- Resumable chunked upload client, offline-tolerant — TUS, and only TUS
- Offline recording queue (IndexedDB via starmus-offline.js)
- Consent capture (hookable — see Consent Contract below)
- State store for recorder lifecycle
- Live-transcript **slot** — provider-agnostic, its own bundle
  (`dist/starmus-transcript.js`), output is a lowest-authority machine draft
  (ADR-038; see Live-Transcript Slot below)
- File upload of prerecorded material on the Tier C path, recorded as the
  `import` capture profile — preserved unchanged, with an attainment record
  stating that nothing was measured rather than claiming the profile was met

## What This Package Is NOT

- Not a waveform viewer or audio player
- Not a post-processing tool (waveform analysis, trim, noise reduction, spectrogram
  are server-side after upload — never in this package)
- Not a paced reader. The paced reader, its stylesheet and the transcript-sync
  controller moved to the elicitation pacing package under ADR-036. Nothing
  here paces, and nothing here interprets prosody.
- Not an audio editor. There is no trim, splice, cut, or "effective audio"/EDL
  capability anywhere in this package, before or after submission (ADR-039).
  Retake and discard are pre-submission, and they replace a draft rather than
  edit one.
- Not a React component
- Not a WordPress plugin
- Not a Sky ability — it is a capability that Sky surfaces consume

## Where This Package Sits in the Platform

```
@sparxstar/starmus-audio (THIS PACKAGE)
    ↓ emits starmus:* events
Consuming surface (e.g. sparxstar-esu-ui, sparxstar-starmus-ui React PWA)
    ↓ invokes ability
@sparxstar/sky → SkyOrchestrator → Yahura (transcription)
```

The package emits DOM events. Consuming surfaces listen and route through Sky.
This package never calls Sky, Yahura, Behistun, or any AI runtime directly.

---

## Tier Model — MANDATORY ENFORCEMENT

Three tiers. Copilot must check the tier before enabling any feature.

| Feature | Tier A | Tier B | Tier C |
|---|---|---|---|
| Live recording | ✅ | ✅ | ❌ |
| Device calibration | ✅ | ✅ | ❌ |
| Acoustic calibration | ✅ | ✅ | ❌ |
| Canvas / signature pad | ✅ | ✅ | ❌ |
| Live transcript slot | ✅ | ✅ | ❌ |
| File upload (fallback) | ✅ | ✅ | ✅ |

**Tier C = file upload only.** No recorder. No microphone access. No canvas.
No calibration. No live transcript. The upload UI is the entire surface — and a
Tier C device does not download the transcript bundle either.

Paced reading is not in this table because it is not in this package (ADR-036).

Tier is resolved at initialization via Sirus (see Sirus Integration below).
Until Sirus is integrated, tier defaults to Tier A for development.

---

## Calibration Contract — LOCKED

Two-phase calibration. Phase order is mandatory. Never run acoustic before device.

**Phase 1 — Device Calibration**
- Purpose: characterize the recording device (microphone hardware, OS gain)
- Storage: localStorage, keyed by device ID
- Key pattern: `starmus_device_cal_{deviceId}`
- Persistence: survives sessions — once calibrated per device, not repeated
- Result: gain normalization factor

**Phase 2 — Acoustic Calibration**
- Purpose: characterize the recording environment (room, ambient noise)
- Storage: sessionStorage, keyed by session ID
- Key pattern: `starmus_acoustic_cal_{sessionId}`
- Persistence: session only — repeated each recording session
- Result: noise floor and EQ profile

Do not merge these into a single calibration step.
Do not persist acoustic calibration to localStorage.
Do not run any recording without completing both phases (Tier A/B only).

---

## Consent Contract — HOOKABLE

Two consent hooks. Both must fire before recording starts. Both are hookable
so consuming surfaces can implement their own consent UI.

**contributorConsent**
- Scope: once ever per contributor (per device/browser)
- Storage: localStorage
- Key: `starmus_contributor_consent`
- Value: `{ granted: boolean, timestamp: number, version: string }`
- Hook: `starmus.on('consent:contributor:required', callback)`

**sessionConsent**
- Scope: once per operator session
- Storage: sessionStorage
- Key: `starmus_session_consent`
- Value: `{ granted: boolean, sessionId: string, timestamp: number }`
- Hook: `starmus.on('consent:session:required', callback)`

Default behavior (no hook registered): block recording and show built-in consent UI.
Hooked behavior: consuming surface implements consent UI, calls `starmus.grantConsent(type)`.

---

## starmus:complete Event — REQUIRED

The `starmus:complete` event MUST be emitted before extraction triggers.
This event signals that a recording session is complete and the audio is
ready for processing.

**Shape:**

```javascript
document.dispatchEvent(new CustomEvent('starmus:complete', {
  detail: {
    sessionId: string,
    // The server's identifier when it returns one; otherwise the
    // client-generated UUID that was sent as TUS `upload_uuid` metadata.
    // Empty only when neither is present. Consumers cannot tell which they
    // received, so do not treat this as proof the server acknowledged.
    uploadId: string,
    durationMs: number,
    // What the device actually delivered, not what the profile asked for.
    // null means the device did not report it. ADR-035: never a constant.
    sampleRate: number | null,
    channels: number | null,
    captureProfile: string | null,  // 'conversation' | 'documentation' | 'import'
    captureProfileAttained: boolean | null,
    // Named as captured. ADR-035 holds the container/codec restriction
    // pending OQ-021, so this package reports the format it has rather than
    // deciding an arriving format is inadmissible. The Spoken Audio Node
    // rules on admissibility, where refusing does not cost the recording.
    // `webm` covers a WebM container whose codec was not stated — the
    // recorder's own fallback produces it. Named rather than resolved to
    // `opus`, for the reason the other formats are: the Node identifies the
    // codec from the bytes, and OQ-021 owns the codec question.
    format: 'opus' | 'aac-lc' | 'wav' | 'mp3' | 'webm',
    language: string,               // BCP-47 e.g. 'mnk' for Mandinka
    contributorId: string,
    consentGranted: boolean,
    calibrationApplied: boolean,
  }
}));
```

This event is the boundary between recording and processing. Nothing downstream
triggers until this event fires. If extraction runs before this event, it is a bug.

---

## starmus-sparxstar-integration.js — DEPRECATED

`src/js/starmus-sparxstar-integration.js` is a shim for environment resolution
that will be replaced by Sirus (`sparxstar-sirus-context`). It must NOT be
extended or deepened.

---

## Upload Constraints — CI FAIL CONDITIONS

Audio constraints are **not** listed here. They belong to a named capture
profile and are stated once, under *Audio — CI Fail Conditions* further down.
This section used to restate a platform-wide 16 kHz / mono / Opus-or-AAC
ceiling, which ADR-035 removed and which contradicted the profile rules in the
same file — a second home for the same fact, giving opposite answers.

Run `node scripts/validate-build.cjs` (it also runs as `prebuild`).

| Constraint | Enforced By | Value |
| --- | --- | --- |
| TUS chunk size | validate-build.cjs | ≤ 512 KB, clamped at runtime |
| TUS checksum | validate-build.cjs | SHA-256 per chunk |
| TUS UUID | starmus-tus.js | UUID v4 per upload; refuses to run without secure generation |
| No full-file path | validate-build.cjs | The function may not exist, not merely be unexported |
| Capture profile sent | validate-build.cjs | Present in upload metadata |
| Upload watchdog | validate-build.cjs | No-progress (stall) bound only — never a total-duration deadline |
| No CMS reach | validate-build.cjs | No CMS route, nonce, or page global in `src/js/` |
| Auth headers | starmus-tus.js | Host-injected via `STARMUS_BOOTSTRAP.uploadHeaders`; this package names no header |
| Stable upload identity | starmus-tus.js | One id per submission, reused across retries, and the TUS resume fingerprint |
| One home for limits | validate-build.cjs | No audio-limit literal outside `starmus-capture-profiles.js` |
| No edit capability | validate-build.cjs | No EDL, offline render, or trim/splice/cut helper |

---

## JavaScript Constraints — CI FAIL CONDITIONS

These are enforced by ESLint (.eslintrc.json `no-var: "error"`).
Run `pnpm run lint:js` and fix all violations before merge.

| Constraint | Check |
| --- | --- |
| No `var` | ESLint: `no-var: "error"` already in .eslintrc.json |
| Named exports only | No `export default` anywhere |
| AbortSignal.timeout(5000) | On all fetch calls in starmus-tus.js and starmus-offline.js |
| No continuous interval without bound | Check starmus-recorder.js and starmus-ui.js |
| No infinite retry | Max 3 attempts with exponential backoff in starmus-tus.js |
| Blob in memory ≤ 5 MB | Check starmus-recorder.js buffer management |

---

## Sirus Integration (Phase 3 — Architecture Must Not Block)

Sirus will replace `starmus-sparxstar-integration.js` for all environment
resolution. The integration point is in `starmus-integrator.js`.

Phase 3 integration shape (do not implement now — architecture must not block it):

```javascript
// Future: starmus-integrator.js will call:
import { SirusClient } from '@sparxstar/sirus-context';

const sirus = new SirusClient({ endpoint: SIRUS_ENDPOINT });
const context = await sirus.resolveContext(request);
const authority = await sirus.resolveAuthority(context, 'starmus');

// authority.tier determines Tier A / B / C behavior
// authority.capabilities[] determines which features are enabled
```

Do not hardcode tier logic. The tier gate in starmus-core.js must read from
a mutable config that Sirus can populate at runtime.

---

## Live-Transcript Slot — ADR-038

`src/js/starmus-transcript-provider.js` is a **slot**, not an engine. It is
built as its own bundle so a Tier C device never downloads it.

Its output always carries, and only carries:

1. tokens;
2. timestamps on the **original timeline** — the recording's own, the only
   timeline that exists (ADR-039);
3. provenance naming the engine and the model version.

What it is never:

- **Never the boundary mechanism of record.** Speech/silence boundaries are
  computed server-side by the Spoken Audio Node's VAD, for every recording,
  language and device tier. A provider being unavailable does not leave a
  recording without boundaries.
- **Never word-level alignment of record.** That is ESU's, from Yahura.
- **Never acoustic analysis.** ADR-036.

What leaves the slot is a **lowest-authority machine draft** — a starting point
for human correction in ESU, never the transcript.

Browser speech recognition is the first provider (Tier A). It reports no word
timings, so the built-in provider does not invent any: segments are stamped
from the recorder clock and marked `timing: 'approximate'`. A future Yahura
live provider for African languages registers into the same slot with no change
here. Adding a provider is `registerTranscriptProvider`; nothing else changes.

| FAIL | Condition |
| --- | --- |
| FAIL | A provider's output treated as the transcript, or as boundaries of record |
| FAIL | Fabricated word timings — a timing this package did not measure |
| FAIL | A provider bundled into `dist/starmus-audio.js` |
| FAIL | The slot running on Tier C |
| FAIL | Provenance omitted, or a placeholder model string standing in for one the engine does not expose |
| FAIL | `tokenGranularity` claiming `word` for an engine that emits utterances |
| FAIL | `openTranscriptSlot` called with a tier outside `SUPPORTED_TIERS` (it fails closed; a stray `'c'` must not open a microphone) |

---

## Post-Submission Immutability — ADR-039

Before submission the recording is the contributor's local draft: retake and
discard belong here, and a retake replaces a draft rather than editing it.

After submission nothing in this package touches the audio. There is no trim,
splice, cut, or "effective audio"/EDL mechanism, and none may be added. Dead
air and false starts are handled downstream by segmentation and annotation in
the ESU review surface — data *about* the audio, never instructions to change
it.

Client-side Web Audio waveform computation is permitted **only** on a local,
not-yet-uploaded capture blob. A waveform of a stored recording is a server-side
derivative the Spoken Audio Node produces (ADR-038).

## Asset References — ADR-038

Assets are referenced by immutable identifiers, never by durable storage URL —
not in events, not in records, not in evidence fields. The upload path returns
an upload identifier and no URL; short-lived access URLs are requested on demand
by whoever needs bytes, and this package never needs them.

## Waveform/Studio Tools — NEVER CLIENT-SIDE

The following are server-side post-processing features. They MUST NOT be
implemented in this package:

- Waveform visualization of existing recordings
- Audio trim / cut
- Silence detection
- Noise reduction
- Spectrogram
- Pitch analysis
- Level normalization (beyond recording calibration)

These are implemented in the SPARXSTAR media processing pipeline after upload.
If any of these appear in a PR for this package, reject it.

---

## Offline Queue — IndexedDB Policy

From AGENTS.md coding standards:
- IndexedDB usage requires defined eviction policy: 20 MB max, LRU
- localStorage: 5 MB max with TTL or explicit cleanup

The offline queue in `starmus-offline.js` must document its eviction policy
in a JSDoc comment.

**A queued recording is removed on successful upload and on nothing else.** An
entry that exhausts its retries, or fails with an error retrying cannot fix, is
marked `held`: kept, no longer retried, and surfaced through
`getHeldSubmissions()` so a person can act. The queue used to delete both, which
made it the component that decided a contributor's material was disposable
because a server returned 400 four times. ADR-011 does not allow that, and on
these networks the queued blob is often the only copy.

| FAIL | Condition |
| --- | --- |
| FAIL | A queue path that deletes a submission for any reason but successful upload |
| FAIL | Held submissions that no host-visible accessor reports |
| FAIL | A local cleanup failure recorded as an upload failure (it makes the next drain re-upload an asset the server already has) |
| FAIL | Automatic eviction to make room — see below |

**The 20 MB cap is enforced at the door, not by eviction.** The platform
standard says LRU; LRU here means deleting a contributor's older recording so a
newer one fits, which is what ADR-011 forbids. So `add()` refuses a recording
that will not fit, with an error naming what occupies the space, and
`getQueueUsage()` lets a host warn someone before they reach that point.

**Whose recording loses when a device is genuinely full is not this package's
call.** It is a sovereignty question and it routes to the platform owner. Until
it is ruled on, nothing already recorded is deleted without a person deciding
so.

---

AGENTS.md --- SPARXSTAR Coding Standards
======================================

sparxstar-coding-standards-v1 | Starisian Technologies
======================================================

If it cannot fail a build, it is not a standard. It is a suggestion.
====================================================================

* * * * *

Version Policy
--------------

- **WordPress**: 6.9 or higher
| Component | Version | Policy |
| --- | --- | --- |
| PHP | 8.2 minimum, 8.3 target | CI tests both. Code must pass on both. |
| WordPress | 6.9 floor (Abilities API), current stable ceiling | Rolling: N and N-1 minors supported. Update CI when WordPress releases. |
| OS | Ubuntu 24 LTS | CI runners use Ubuntu 24. Do not assume Ubuntu 22 or Debian. |
| MariaDB | Current stable | Provider-agnostic. No provider-specific extensions without abstraction layer. |
| Node.js | 20 LTS |  |
| TypeScript | 5.0+ strict | Required for all new JS. JavaScript-only files are legacy. |
| React | 18 | Ships with `@wordpress/scripts`. Do not upgrade independently. |

**Version numbers in this file are updated when the system is updated. The policy --- current stable, rolling window --- does not change.**

* * * * *

Repository Structure
--------------------

```
src/          ← all authored source code
src/js/       ← JavaScript source modules
dist/         ← compiled/built output only (JS bundle, CSS)
tests/        ← mirrors src/ structure exactly
scripts/      ← build and validation scripts
```

Compiled output goes to `dist/` --- never into `src/`.

* * * * *

Namespace Convention
--------------------

```
Starisian\Sparxstar\{RepoAbbreviation}\{Subdirectory}

```

| Repository | Root Namespace | Hook Prefix |
| --- | --- | --- |
| sparxstar-ouroboros-integrity | `Starisian\Sparxstar\Infrastructure` | `sparxstar_ouroboros_` |
| sparxstar-helios-trust | `Starisian\Sparxstar\Helios` | `sparxstar_helios_` |
| sparxstar-sirus-context | `Starisian\Sparxstar\Sirus` | `sparxstar_sirus_` |
| sparxstar-sky-eshu | `Starisian\Sparxstar\Sky` | `sparxstar_sky_` |
| sparxstar-starmus-ui | `Starisian\Sparxstar\Starmus` | `spx_starmus_` |

PSR-4 --- directory structure under `src/` maps exactly to namespace. One class per file. File name matches class name exactly.

* * * * *

ai_manifest.json
----------------

Every repository maintains `ai_manifest.json` in the root. Check it before creating any symbol. Update it when any symbol is added, removed, or renamed. Format: `{ repository, version, namespace, symbols: [{ symbol, type, owner, path }] }`

* * * * *

Tooling
-------

| Tool | Config file | Command |
| --- | --- | --- |
| ESLint | `eslint.config.js` | `pnpm run lint:js` |
| Prettier | `prettierrc.json` | `pnpm run format` |
| Stylelint | `stylelint.config.js` | `pnpm run lint:css` |
| Rollup | `roll-up.config.mjs` | `pnpm run build:js` |
| PostCSS | `postcss.config.cjs` | `pnpm run build:css` |
| Playwright | `playwright.config.js` | `pnpm run test:e2e` |

**Package manager: pnpm** --- `pnpm-lock.yaml` is the lockfile. Do not use npm or yarn. Presence of `package-lock.json` or `yarn.lock` is a CI failure.

* * * * *

JavaScript and TypeScript --- CI Fail Conditions
----------------------------------------------

| FAIL | Condition |
| --- | --- |
| FAIL | `var` used anywhere |
| FAIL | Default export --- use named exports everywhere |
| FAIL | Raw `fetch` or `XMLHttpRequest` for WordPress REST --- use `@wordpress/api-fetch` |
| FAIL | API call without timeout (`AbortSignal.timeout(5000)` minimum) |
| FAIL | Event listener without throttle or debounce |
| FAIL | Continuous interval without bounded execution |
| FAIL | JS bundle exceeds 150 KB gzipped. Enforced by `pnpm run size-check` (size-limit, brotli budgets in `package.json`) — the budget that fails a build is the one there, and the two are kept consistent. |
| FAIL | Blob in memory exceeds 5 MB |
| FAIL | Sensor active beyond 5000ms without auto-disable |
| FAIL | Infinite retry loop --- max 3 attempts with exponential backoff |
| FAIL | UI blocked during network operation |
| FAIL | `pnpm-lock.yaml` absent when `package.json` present |
| FAIL | `package-lock.json` or `yarn.lock` present |

**Execution budget --- hard caps:**

| Metric | Limit |
| --- | --- |
| Max main-thread block | 50ms |
| Max event handler rate | 10 Hz (production), 20 Hz (development) |
| Concurrent media streams | 1 |
| Blob in memory | 5 MB |
| Media buffers | 2 max |

* * * * *

CSS --- CI Fail Conditions
------------------------

**Pattern: global CSS with BEM naming. No CSS Modules.** CSS custom properties use `--sparxstar-` prefix. All design values via custom properties only.

| FAIL | Condition |
| --- | --- |
| FAIL | CSS bundle exceeds 20 KB unminified |
| FAIL | `outline: none` or `outline: 0` without replacement focus indicator |
| FAIL | Hardcoded colour, font size, or spacing value |

BEM: `.starmus-component__element--modifier`

* * * * *

AFRICA FIRST PERFORMANCE RULES
-------------------------------

- Single column layout always. No multi-column below 768px.
- Minimum touch target: 48px height on all interactive elements.
- No hover-only states. Touch is primary.
- No CSS animations that trigger layout (use transform/opacity only).
- No box-shadow animation on low-tier devices.
- No backdrop-filter on tier C devices.

* * * * *

Accessibility --- WCAG 2.1 AA Required
------------------------------------

- All interactive elements keyboard navigable
- All form inputs have visible label or `aria-label`
- All images have meaningful `alt` or `alt=""` if decorative
- Colour is never the sole means of conveying information
- Focus order matches visual order
- Dynamic content updates announced via `aria-live` or focus management

* * * * *

Audio --- CI Fail Conditions
---------------------------

Audio constraints belong to a **named capture profile**, never to a
platform-wide ceiling (ADR-035). The limits below are the `conversation`
profile's and apply to that profile only. Applying them to every recording
destroys the source material that documentation, sound-to-IPA, tone and
prosody work depend on.

Profiles live in `src/js/starmus-capture-profiles.js`.

| FAIL | Condition |
| --- | --- |
| FAIL | Any sample-rate, channel, bitrate or codec limit applied outside a profile |
| FAIL | `conversation` profile: `sampleRate` > 16000 |
| FAIL | `conversation` profile: `channels` > 1 |
| FAIL | `conversation` profile: bitrate > 32 kbps |
| *(held)* | Container/codec restriction --- **not enforced on any profile** until OQ-021 is ruled on; restricting formats now would answer that open question |
| FAIL | `documentation` or `import` profile downsampled, transcoded or fold-down to mono |
| FAIL | Echo cancellation or noise suppression requested on a profile whose `voiceProcessing` is false |
| FAIL | A profile's numeric limit sent as a mandatory constraint (`exact`/`min`/`max`) rather than `ideal` |
| FAIL | An unreported device setting counted as a profile attained |
| FAIL | An asset uploaded without its capture profile recorded |
| FAIL | `starmus:complete` not emitted on a queued upload that later drains |
| FAIL | A requested profile silently substituted instead of reported unattainable |
| FAIL | Recording starts automatically without explicit user action |

The numeric floor for `documentation` is **not this repository's to set**. It
is OQ-021 in the governance registry, owned by AIWA and the acoustic-analysis
owner. Until it is ruled on, `documentation` constrains nothing and reports
what the device delivered.

* * * * *

TUS Uploads --- CI Fail Conditions
--------------------------------

| FAIL | Condition |
| --- | --- |
| FAIL | Upload chunk > 512 KB |
| FAIL | Upload without chunk checksum verification |
| FAIL | Upload without UUID |
| FAIL | Full-file upload endpoint present |

* * * * *

Distributed System Rules
------------------------

| FAIL | Condition |
| --- | --- |
| FAIL | IndexedDB usage without defined eviction policy (20 MB max, LRU) |
| FAIL | localStorage used without TTL or explicit cleanup (5 MB max) |
| FAIL | Cache invalidation before DB commit confirmed |
| FAIL | Client-supplied timestamp used for ordering |

* * * * *

Final Rule
----------

Read this file before writing or reviewing any code. Apply every rule to every line. Do not apply conventions from other repositories or training data that conflict with this file. When a rule is ambiguous, apply the stricter interpretation. Check `ai_manifest.json` before creating any new symbol.
