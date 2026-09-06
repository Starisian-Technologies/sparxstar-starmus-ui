# sparxstar-starmus-ui — Package Identity

## @sparxstar/starmus-audio — Vanilla JS+CSS Audio Capture Package

**This is not a React app. This is not a WordPress plugin.**
This is a vanilla JS+CSS npm package for audio recording, calibration,
consent capture, TUS upload, and prosody/teleprompter display.

---

## What This Package IS

- Audio recorder with device and acoustic calibration
- TUS chunked upload client (resumable, offline-tolerant)
- Offline recording queue (IndexedDB via starmus-offline.js)
- Prosody/teleprompter engine (recording mode, not a separate product)
- Consent capture (hookable — see Consent Contract below)
- State store for recorder lifecycle
- Transcript controller (live transcript display, where supported)

## What This Package Is NOT

- Not a waveform viewer or audio player
- Not a post-processing tool (waveform analysis, trim, noise reduction, spectrogram
  are server-side after upload — never in this package)
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
| Live transcript display | ✅ | ✅ | ❌ |
| Prosody/teleprompter | ✅ | ✅ | ❌ |
| File upload (fallback) | ✅ | ✅ | ✅ |

**Tier C = file upload only.** No recorder. No microphone access. No canvas.
No calibration. No live transcript. No prosody. The upload UI is the entire surface.

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
    uploadId: string,       // TUS upload UUID
    durationMs: number,
    sampleRate: number,     // must be ≤ 16000
    channels: 1,
    format: 'opus',         // or 'aac-lc' — never wav, never pcm
    language: string,       // BCP-47 e.g. 'mnk' for Mandinka
    contributorId: string,
    consentGranted: true,
    calibrationApplied: true,
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

## Audio Constraints — CI FAIL CONDITIONS

These must pass on every PR. Run `pnpm run lint:js` and review manually.

| Constraint | Enforced By | Value |
|---|---|---|
| sampleRate | Manual check in starmus-recorder.js | ≤ 16000 |
| channels | Manual check in starmus-recorder.js | 1 (mono only) |
| Format | Manual check | Opus or AAC-LC only. Never WAV. Never uncompressed PCM. |
| TUS chunk size | validate-build.cjs (add check) | ≤ 512 KB |
| TUS checksum | Manual check in starmus-tus.js | SHA-256 per chunk |
| TUS UUID | Manual check in starmus-tus.js | UUID v4 per upload |
| No full-file endpoint | validate-build.cjs (verify) | Chunked only |

---

## JavaScript Constraints — CI FAIL CONDITIONS

These are enforced by ESLint (.eslintrc.json `no-var: "error"`).
Run `pnpm run lint:js` and fix all violations before merge.

| Constraint | Check |
|---|---|
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
| FAIL | JS bundle exceeds 150 KB gzipped |
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

Audio and Video --- CI Fail Conditions
------------------------------------

| FAIL | Condition |
| --- | --- |
| FAIL | Audio `sampleRate` > 16000 |
| FAIL | Audio `channels` > 1 |
| FAIL | Audio bitrate > 32 kbps |
| FAIL | Audio format is WAV or uncompressed PCM --- Opus or AAC-LC only |
| FAIL | Recording starts automatically without explicit user action |

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
