# Starmus UI Development Status

_Review date: 3 September 2026 · Technical specification v2.0 versus repository `1.1.0`_

## Verdict

**FAIL — the repository is a usable legacy audio-engine prototype, not the React PWA described by
technical specification v2.0.** It can demonstrate capture, upload, offline queuing, transcript
sync, and prosody primitives, but it is not yet a complete, governed “rock star recorder.”

The most important decision is architectural: either rename and maintain this repository as the
`@sparxstar/starmus-audio` engine that the specification says should be a dependency, or replace
the current application layer with the specified React/TypeScript PWA. Continuing to add screens
to the present vanilla IIFE bundle increases migration work.

## Executive Progress Estimate

| Area | Status | Evidence and gap |
| --- | --- | --- |
| Audio capture engine | **Partial** | MediaRecorder capture, pause/resume/stop, calibration, tier handling, and a smart player exist. Production tier must come from Sirus, but the code still performs local detection and uses a compatibility shim. |
| Upload and offline queue | **Partial** | TUS uses 512 KB chunks, checksums, UUIDs, capped retries, and IndexedDB. The queue has per-item limits but no database-wide 20 MB LRU eviction. |
| User interface | **Prototype only** | A DOM-driven two-step form exists. The routed React screens, Zustand UI state, recordings list/detail, review screen, and mobile navigation do not. |
| Consent and governance | **Not implemented** | The full/session/self/none flows, submission-ID gate, returning-contributor flow, forensic evidence, and canonical v2 DVE consent mapping are absent. |
| PWA and offline shell | **Not implemented** | There is no application manifest, service worker, Vite configuration, or installable app shell. |
| Prosody and transcript | **Partial** | Legacy standalone engines exist, but they are not integrated into the specified screens and depend on globals/DOM hooks. The backend prosody endpoints remain externally blocked. |
| Accessibility | **Partial/unverified** | BEM CSS, focus styles, reduced-motion handling, and labelled controls are present in places. The required automated axe gate is configured only as an E2E command and has not been demonstrated against a running host. |
| Automated quality | **Partial** | Lint, build validation, unit schema tests, bundle build, and size checks are available. E2E tests require an external WordPress fixture, contrary to the target standalone architecture. |

## Specification-to-Code Findings

### What is already valuable

- The bundle observes its legacy bootstrap guard before creating the recorder runtime.
- Recording is explicitly user initiated, and audio constraints target mono 16 kHz capture.
- The upload layer supplies UUID metadata, limits TUS chunks to 512 KB, requests checksums, caps
  retries, and applies request timeouts.
- IndexedDB queue items are size-limited by tier and retry no more than three times.
- The CSS and bundle remain within the currently configured budgets.
- Transcript synchronization, a prosody rhythm engine, environment calibration, and low-end audio
  playback provide reusable prototype knowledge for the new UI.

### Critical blockers

1. **Repository identity conflicts with the specification.** The spec calls this repo a React 19,
   strict-TypeScript, Vite PWA which consumes `@sparxstar/starmus-audio`. This repo instead contains
   that vanilla engine, builds an IIFE with Rollup, and exposes multiple globals. This also conflicts
   with the current repository instructions, which describe a standalone JS/CSS package using
   React 18 only if React is introduced. Product and engineering must approve one canonical target
   before a rewrite.
2. **Consent is the release gate.** There is no `/consent` flow, consent-mode router, legal
   signature/checkbox handling, returning-contributor path, or enforcement that a full-consent
   recording has a valid `submissionId` before microphone access.
3. **The submitted schema is obsolete.** The metadata mapper emits legacy fields such as
   `starmus_title` and `agreement_to_terms`, while v2 requires canonical
   `sparx_sparxstar_*` DVE fields. The authoritative DVE schema must be imported or otherwise made
   available so drift can be tested rather than maintained as a hand-written list.
4. **No standalone application exists.** There are no React screens, router, service layer,
   install manifest, service worker, Zustand store, or app-shell cache. Consequently there is no
   complete path from consent through setup, calibration, recording, review, upload, and recording
   detail.
5. **Required backend work is external.** The v2 document says prosody GET/save endpoints are
   missing from the transitional PHP plugin. Consent, upload status, recording detail/list, and
   MCP migration contracts also need integration tests against an available backend.
6. **Sirus and Helios are not integrated to the target contract.** Environment data is inferred by
   local shims, and no target authentication/token service exists. Tier C and consent authorization
   therefore cannot be trusted as production policy decisions.
7. **Offline governance is incomplete.** The database lacks the required 20 MB total cap and LRU
   eviction. Queue status does not model the full `pending | uploading | complete | failed`
   lifecycle, and no export-to-file recovery flow is exposed in the complete UI.

### High-priority engineering debt

- Bootstrap definitions disagree between `INSTRUCTIONS.md`, `ARCHITECTURE.md`, and spec v2. The
  runtime currently validates only that an object exists; it does not validate required fields,
  allowed enum values, URL shape, or consent invariants.
- The current entry point writes globals beyond the allowed bootstrap/interface namespaces and
  logs production runtime information. Several listeners are anonymous and not removable, which
  complicates SPA teardown.
- The direct-upload fallback is a full-file endpoint. This is needed by the v2 Tier C flow but
  conflicts with the repository's blanket prohibition on full-file endpoints; the standard needs
  an explicit Tier C exception or the implementation must change.
- Several source modules and configuration/test files do not yet have complete file/symbol API
  documentation. Documentation normalization should be enforced with ESLint/JSDoc rather than
  handled as a one-time comment pass.
- The package version previously differed from `ai_manifest.json`; both now report `1.1.0`.

## Security and Runtime Review Fixes

- Server-provided post-upload redirects are now limited to same-origin HTTP(S) locations. This
  blocks executable schemes and untrusted cross-origin navigation.
- The offline queue no longer creates an unbounded polling interval, and it installs its online
  listener only once. Upload attempts still occur immediately and when connectivity returns.
- The metadata schema test now uses Node's actual test runner and strict assertions, so it fails on
  schema drift instead of crashing on missing Playwright globals.
- Existing Stylelint violations were normalized, and package/manifest versions were aligned.

## Recommended Delivery Sequence

1. **Resolve the architecture and standards conflict.** Decide whether this is the engine package
   or the v2 PWA, then update the spec, package name, and build rules together.
2. **Freeze the API contracts.** Publish machine-readable bootstrap and DVE schemas; define Sirus,
   Helios, consent, upload, status, recordings, and prosody responses.
3. **Build the governed vertical slice.** Implement full consent → setup → session calibration →
   record/review → TUS/offline submission, with Tier C as upload-only.
4. **Add the PWA shell and remaining routes.** Complete recordings list/detail, prosody,
   transcript, installability, app-shell caching, and visible battery/offline states.
5. **Make release evidence reproducible.** Add unit/component tests, standalone Playwright fixtures,
   axe scans, 2G/3G profiles, duplicate-upload idempotency tests, PHP 8.2/8.3 integration CI, and
   device testing on representative Tecno/Itel hardware.

## Release Exit Criteria

Do not call the product release-ready until all of the following are true:

- a single approved architecture matches the repository and its enforceable standards;
- every consent mode enforces its submission-ID and evidence requirements;
- every submitted field validates against the canonical DVE schema;
- Tier C never requests microphone access and can complete an upload on constrained connectivity;
- IndexedDB eviction, recovery/export, retry states, and idempotency are proven;
- all required routes and PWA assets exist;
- unit, integration, E2E, accessibility, security, and bundle-budget gates pass in CI; and
- backend prosody and consent dependencies are deployed in the target environment.
