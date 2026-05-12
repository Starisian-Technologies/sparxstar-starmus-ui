**SPARXSTAR**

sparxstar-starmus-ui

**Technical Specification v2.0**

May 2026 · Starisian Technologies · CONFIDENTIAL · PATENT PENDING

| Document ID | STARMUS-UI-SPEC-002 |
| :---- | :---- |
| **Status** | NORMATIVE — v2.0 supersedes v1.0 |
| **Repository** | sparxstar-starmus-ui (new — to be created) |
| **Stack** | React 19 \+ TypeScript \+ Vite PWA |
| **Audio Engine** | @sparxstar/starmus-audio (vanilla JS \+ CSS package) |
| **Backend (transitional)** | sparxstar-starmus-audio (PHP WordPress plugin REST API) |
| **Backend (target)** | sparxstar-esu-mcp (Python \+ Node MCP — not yet built) |
| **DVE Schema** | sparxstar-digital-village-elder-schema-max (canonical source) |
| **Author** | Starisian Technologies — Max Barrett |

# **PART I — Purpose, Position, and Architecture**

## **1.1 What This Repo Is**

sparxstar-starmus-ui is the React PWA frontend for all Starmus audio capture surfaces on the SPARXSTAR platform. It is the user-facing UI that wraps the @sparxstar/starmus-audio vanilla JS engine with screens, navigation, consent, calibration, prosody mode, and live transcript.

It has no WordPress dependency. It calls the REST API directly. During the transitional period it calls the PHP plugin REST API. When sparxstar-esu-mcp is ready the service layer switches — the UI does not change.

## **1.2 Where This UI Is Used**

This is not a standalone app only. It is embedded in multiple surfaces:

| Surface | Context | Notes |
| :---- | :---- | :---- |
| sparxstar-starmus-ui (standalone) | Direct community recording, voiceover, transcription source, meetings | Primary surface. Full feature set. |
| sparxstar-3iatlas-rlc-ui (game) | Students recording words during RLC game sessions | Embedded recorder component. Session consent mode. Tier C likely. |
| sparxstar-3iatlas-s2s | Sound to Symbol — reading practice with script | Prosody mode embedded. Script-driven recording. |
| Future surfaces | Any SPARXSTAR app that needs audio capture | React component, importable. |

## **1.3 Architecture**

| Layer | Repo | Role |
| :---- | :---- | :---- |
| React UI | sparxstar-starmus-ui | This repo. Screens, consent, calibration, prosody, transcript. |
| Audio Engine | @sparxstar/starmus-audio | Vanilla JS \+ CSS. Recorder, TUS, offline queue, prosody mode. |
| MCP Backend (target) | sparxstar-esu-mcp | Python \+ Node. Governed API. DVE field mapping, pipeline, Brain writes. |
| PHP Backend (transitional) | sparxstar-starmus-audio | WordPress plugin REST API. Active until MCP is ready. |
| DVE Schema | sparxstar-digital-village-elder-schema-max | Canonical field definitions. ALL data must conform. |
| Context / Environment | Sirus | Device tier, network, battery, mic capabilities. |
| Auth | Helios | Frontend authentication. Token management. |

**CRITICAL — DVE COMPLIANCE: Every field submitted by this UI must map to a canonical DVE field name from sparxstar-digital-village-elder-schema-max. Any field not in the DVE schema will be rejected by the pipeline. This is non-negotiable.**

## **1.4 What This Repo Is Not**

* Not a WordPress plugin or theme component

* Not an audio editor — post-recording waveform editing (Peaks.js) belongs to Sky Eshu UI (future)

* Not a transcription correction UI — that belongs to Sky Eshu UI (future)

* Not a governance engine — DVE, token flow, policy evaluation are MCP responsibilities

* Not a standalone app only — it is also an embeddable React component

# **PART II — Recording Use Cases**

## **2.1 Use Case Map**

All use cases share the same capture engine. What differs is the context, consent mode, and calibration profile. Governance is universal — every recording goes through DVE regardless of use case.

| Use Case | Consent Mode | Calibration | Prosody | Live Transcript | Tier C Behaviour |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Language preservation (AiWA) | full | session | Optional — script if available | If SR API \+ language supported | File upload. Checkbox consent. |
| Prosody / Reading practice | self or session | session | Yes — rhythm engine active | If SR API \+ language supported | File upload. Checkbox consent. |
| Voiceover | self or full | session | Optional — script/cue | If SR API \+ language supported | File upload. Checkbox consent. |
| RLC game word recording | session | session (once on join) | No | No | File upload. No consent UI. |
| Transcription source / meetings | self | session | No | If SR API \+ language supported | File upload. Checkbox consent. |
| General / notes | self | session | No | If SR API \+ language supported | File upload. Checkbox consent. |

## **2.2 Prosody Mode**

Prosody mode is a recording mode — not a separate application. When a script is associated with a session, the rhythm engine activates. The teleprompter advances text at pace X during recording. The timing data generated becomes the synchronisation signal for playback.

For languages supported by the browser Speech Recognition API, the live transcript replaces the rhythm engine timing signal with real timestamps from actual speech. For unsupported languages (Mandinka, Wolof, Pulaar etc.), the rhythm engine pace is the primary timing signal. Yahura is the post-processing verification layer, not the primary transcription source.

*PATENT NOTE: For scripted content in unsupported languages, pace-based sync provides a synchronised transcript without ASR. This is a novel approach to low-resource language transcription. Flag for patent review before publishing.*

# **PART III — Technical Stack**

## **3.1 Stack**

| Component | Technology | Notes |
| :---- | :---- | :---- |
| Framework | React 19 |  |
| Language | TypeScript — strict mode | No any. No @ts-ignore. |
| Build | Vite | Latest stable |
| PWA | vite-plugin-pwa | Installable, offline-capable |
| State (UI) | Zustand | UI state only. Not audio engine state. |
| Routing | React Router v7 |  |
| Audio engine | @sparxstar/starmus-audio | Vanilla JS. Imported as npm package. |
| Package manager | pnpm |  |
| Font | Noto Sans / Noto Serif | Full Unicode. African language support. |
| Testing | Vitest \+ Playwright |  |
| Linting | ESLint \+ Stylelint \+ Prettier | Mirror config from sparxstar-starmus-audio |

## **3.2 State Architecture**

The @sparxstar/starmus-audio package has its own internal Redux-style store. The React app does NOT own or duplicate that store. Zustand manages React UI state only — screen navigation, session state, user preferences, consent status, calibration state.

The React app communicates with the audio engine exclusively through DOM events:

* starmus:ready — engine initialised, tier resolved, calibration state known

* starmus:complete — upload succeeded or queued offline

* starmus/error — dispatched to the engine store, React listens via subscription

The React app never reaches into the audio engine store directly.

## **3.3 PWA Requirements**

* Installable on Android home screen — manifest with name, icons, theme\_color, display: standalone

* Offline-capable — service worker caches app shell

* Audio upload queued when offline, flushed when connection returns — handled by @sparxstar/starmus-audio

* Chrome for Android minimum. Firefox and Safari are progressive enhancement.

* No WordPress dependency anywhere in this repo

## **3.4 Coding Standards**

* TypeScript strict mode. No any. No @ts-ignore.

* ES modules only. No IIFE. No CommonJS.

* No window globals. No window assignments.

* No jQuery. No ACF. No WordPress globals of any kind.

* No console.log in production code.

* Object.prototype.hasOwnProperty.call() not Object.hasOwn() — Android 8+ compatibility.

* Proprietary license header on every file.

# **PART IV — DVE Compliance**

## **4.1 The Rule**

**Every field name submitted to the API must match a canonical DVE field name from sparxstar-digital-village-elder-schema-max. No exceptions. Data with non-canonical field names cannot flow through the governance pipeline, cannot be stored in Brain, cannot be processed by Yahura or Behistun.**

## **4.2 Canonical Post Types Used by Starmus UI**

| Post Type | Purpose |
| :---- | :---- |
| sparx\_audio\_recording | The audio recording artifact. Primary post type. |
| sparx\_contributor | Contributor identity and legal agreement record. |
| sparx\_contributor\_word | Word contributed by a contributor in a game session. |
| sparx\_starmus\_script | Script used in prosody / reading mode. |
| sparx\_starmus\_transcript | Transcript post type — created by Yahura post-processing. |
| sparx\_starmus\_translate | Translation post type — created by Behistun post-processing. |

## **4.3 Key Consent Field Names (sparx\_audio\_recording)**

These are the canonical DVE field names the consent flow must write to. No other field names are valid.

| DVE Field Name | Type | Description |
| :---- | :---- | :---- |
| sparx\_sparxstar\_terms\_type | select | clickwrap / signwrap / checkbox |
| sparx\_sparxstar\_terms\_purpose | select | contribute / interview / self |
| sparx\_sparxstar\_authorized\_signatory | post\_object | Contributor post ID |
| sparx\_sparxstar\_signatory\_name | text | Legal name of signatory |
| sparx\_sparxstar\_signatory\_submission\_id | text | UUID linking recording to consent record |
| sparx\_sparxstar\_signatory\_agreement\_datetime | datetime | UTC timestamp of agreement |
| sparx\_sparxstar\_signatory\_ip | text | IP address at time of signing |
| sparx\_sparxstar\_signatory\_user\_agent | text | Browser user agent |
| sparx\_sparxstar\_signatory\_fingerprint\_id | text | Browser fingerprint hash |
| sparx\_sparxstar\_signatory\_geolocation | google\_map | GPS coordinates if available |
| sparx\_sparxstar\_agreement\_signature | file | Signature file (PNG canvas or null for checkbox) |
| sparx\_sparxstar\_agreement\_seal | text | HMAC integrity seal — generated server-side |

*sparx\_sparxstar\_agreement\_seal is generated server-side. The UI never generates or submits it. The API writes it after verifying the consent payload.*

# **PART V — Environment, Device, and Tier**

## **5.1 Tier System**

Tier is resolved by Sirus before the recorder initialises. The resolved tier is passed into @sparxstar/starmus-audio via the bootstrap contract. The package never resolves tier on its own in production — the app always provides it.

| Tier | Capability | Recording Method | Calibration | Live Transcript |
| :---- | :---- | :---- | :---- | :---- |
| A | Full — MediaRecorder \+ AudioContext \+ getUserMedia | Live recording via MediaRecorder | 15 seconds, 3 phases | Yes if SR API \+ language supported |
| B | Limited — MediaRecorder, no AudioContext | Live recording via MediaRecorder | 10 seconds, 2 phases | Yes if SR API \+ language supported |
| C | Minimal — no MediaRecorder | File upload only. No live recording. | None — skip | No |

**TIER C — NO LIVE RECORDING: On Tier C the entire recording flow becomes a file upload. The user records natively on their device using their own voice memo app, then uploads the file. No mic access. No calibration. No live transcript. No amplitude meter. No canvas. The UI is a form: file picker \+ metadata \+ submit.**

## **5.2 Sirus Integration**

Call Sirus for environment resolution before initialising the audio engine. Sirus replaces the sparxstar-sparxstar-integration.js shim that exists in the current PHP plugin. The shim is retired entirely in this repo.

| Sirus Output | Used For | Passed To |
| :---- | :---- | :---- |
| Device tier (A/B/C) | Recording method, calibration profile, UI variant | STARMUS\_BOOTSTRAP.tier |
| Network type (2G/3G/4G/WiFi) | TUS chunk size, upload strategy | createTusUploader() options |
| Battery state | Upload deferral when critical (\<20%, not charging) | createOfflineQueue() options |
| Mic capabilities | getUserMedia constraint optimisation | getUserMedia constraints |
| Country code | Speech Recognition probe language selection | SR API lang parameter |
| Error reporting | Runtime error logging | createRecorder() options.onError |

## **5.3 Microphone Capability Detection**

Before requesting mic access, query MediaStreamTrack.getCapabilities() and MediaStreamTrack.getSettings(). Pass device ID, echoCancellation state, noiseSuppression state, and autoGainControl state to Sirus. Sirus returns an optimised constraint profile based on recording context.

*Language preservation recordings: request echoCancellation: false, noiseSuppression: false, autoGainControl: false. Low-end Android AGC flattens tonal distinctions in Mandinka and other tonal languages. This is the opposite of the default and must be explicitly requested for this context.*

Store the device ID with the calibration result. Same device ID at next calibration check — stored result is still valid.

## **5.4 Battery Monitoring**

Pull the battery monitoring module from sparxstar-starmus-audio when it lands. The React app reads battery state from Sirus (Battery Status API). Defer uploads when battery is below 20% and not charging. Show a visible warning to the user. Never defer silently.

## **5.5 Session-Scoped Calibration**

Calibration runs once per session — not once per recording. Running calibration before every recording is friction that kills the multi-recording session experience. The re-calibrate button is always available for when conditions change.

| Condition | Action |
| :---- | :---- |
| No calibration in sessionStorage | Run calibration on first recorder init |
| Calibration found — same device ID — within session | Skip calibration. Use stored gain and speech level. |
| Calibration found — different device ID | Run calibration. User changed microphone. |
| User taps Re-calibrate | Run calibration. Update sessionStorage. Apply to all subsequent recordings in session. |
| Tab closed / new session | sessionStorage cleared. Fresh calibration next session. |
| Tier C | No calibration. Skip entirely. No mic access on Tier C. |

Store in sessionStorage (not localStorage, not server):

{ deviceId, gain, speechLevel, tier, timestamp, sessionId }

Re-calibrate button: always visible, secondary action, never hidden, never disabled.

## **5.6 Calibration Duration by Tier**

| Tier | Duration | Phases | AGC |
| :---- | :---- | :---- | :---- |
| A | 15 seconds | 3 phases | Enabled — unless language preservation context |
| B | 10 seconds | 2 phases | Enabled — unless language preservation context |
| C | Not applicable | Skip | Not applicable — no mic access |

# **PART VI — Consent**

## **6.1 Consent Modes**

Consent mode is passed to the recorder via the bootstrap contract. The recorder does not decide consent mode. The consuming application decides and passes it in. The consent UI renders based on the mode.

| Mode | STARMUS\_BOOTSTRAP.consentMode | When Used | UI |
| :---- | :---- | :---- | :---- |
| Full | full | Community contributors signing IP agreement. AiWA recordings. | Legal name, email, terms scroll, signature, geolocation. Full server POST creating contributor record. |
| Session | session | RLC game. Teacher session already has submission\_id. Student just records. | No consent UI shown. submission\_id passed from session context. |
| Self | self | User recording themselves. Voiceover. Meetings. Notes. | Lightweight checkbox: "I agree to the recording terms." Email optional. No signature. |
| None | none | Admin recordings. Internal use. Test mode only. | No consent UI. No consent record created. |

## **6.2 Full Consent Flow**

Full consent mode captures a legally binding contributor agreement. The flow:

* Step 1 — Legal name and email (required)

* Step 2 — Purpose selection (contribute / interview)

* Step 3 — Terms display with scroll gate (must scroll to bottom before signing)

* Step 4 — Signature (canvas on Tier A/B, checkbox on Tier C)

* Step 5 — Geolocation capture (silent, best-effort, not blocking)

* Step 6 — Fingerprint capture (silent — UA \+ screen \+ timezone hash)

* Step 7 — Server POST — creates sparx\_contributor and sparx\_audio\_recording consent record

* Step 8 — Server returns submission\_id

* Step 9 — submission\_id stored in session, passed to recorder as configuration

## **6.3 Tier C Consent**

On Tier C, canvas is not available. Replace the canvas signature with a checkbox:

"I confirm I have read and agree to the contributor terms."

The sparx\_sparxstar\_agreement\_signature file field receives no file. The sparx\_sparxstar\_agreement\_seal is still generated server-side from the forensic evidence fields. The consent record is still legally valid — the HMAC seal, IP, user agent, fingerprint, and timestamp are the legal proof, not the signature image.

## **6.4 On 2G — Consent Failure Handling**

For full consent mode the server POST must succeed before recording begins. If it fails:

* Show a clear error with a retry button

* Cache the consent form data locally so the user does not re-enter everything

* Retry automatically when connection returns

* Never lose the signature or form data

* Never allow recording to begin without a valid submission\_id

*For session consent mode there is no POST at recording time. The submission\_id came from session creation on the teacher device with a better connection. The student just records.*

## **6.5 Returning Contributors**

A contributor who has already signed once gets a lighter re-consent on subsequent sessions. If a valid sparx\_contributor record already exists for the user:

* Skip the name/email/terms/signature steps

* Show: "Welcome back \[name\]. You are recording under your existing contributor agreement."

* Capture a new submission\_id for this session

* Still capture geolocation and fingerprint for the new session

# **PART VII — Screens and Navigation**

## **7.1 Screen Map**

| Screen | Route | Consent Modes | Description |
| :---- | :---- | :---- | :---- |
| Consent | /consent | full, self | Legal agreement flow. Skipped for session and none modes. |
| Session Setup | /record/setup | all | Language, recording type, title. Optional script selection for prosody mode. |
| Calibration | /record/calibrate | all except Tier C | Mic calibration. Runs once per session. Skipped if valid calibration in sessionStorage. |
| Recorder — Free | /record | all | Main recording screen. No script. |
| Recorder — Prosody | /record/prosody | all | Script on screen. Rhythm engine active. Teleprompter running. |
| Review | /record/review | all | Playback of just-recorded audio. Accept or re-record. |
| Submission | /record/submit | all | Upload progress. Offline queue status if queued. |
| My Recordings | /recordings | all | List of recordings with DVE status indicators. |
| Recording Detail | /recordings/:id | all | Single recording. Playback. DVE metadata display. |
| Tier C Upload | /record/upload | Tier C only | File picker for native recording. Metadata form. Submit. |

## **7.2 Layout Rules**

* Single column always. 360px minimum viewport. No multi-column layout below 768px.

* Every screen is a full-height mobile screen. No desktop three-panel layout.

* Navigation is a bottom tab bar — maximum 4 tabs. No sidebar. No hamburger menu.

* Touch targets: 48px minimum height on all interactive elements.

* No hover-only states — touch is primary interaction.

* Font: Noto Sans for all UI text. Noto Serif for script/prosody text display.

* Noto Sans loaded via @font-face or Google Fonts CDN — never assumed from system.

* Dark mode supported via prefers-color-scheme media query.

## **7.3 Recorder Screen — Free Mode — Detail**

This is the most critical screen. It must work on a Tecno or Itel device on 2G in Tier A/B.

| Component | Tier A/B Behaviour | Tier C Behaviour |
| :---- | :---- | :---- |
| Mode indicator | Animated pulse during recording | Text only — no animation |
| Microphone button | 80px min diameter. Clear idle/recording/paused states. CSS animation only. | Not shown — file picker replaces it |
| Timer | Current time / max time. Monospace. 1.5rem min. | Not shown |
| Amplitude meter | CSS class-toggled bar: good/warning/clipping. No canvas. | Not shown |
| Pause / Stop / Mark | Horizontal row. 48px min height. Icons \+ text labels always. | Not shown |
| Live transcript | Shown only when SR API available AND language supported. Timestamped lines. | Not shown |
| AI Confidence | Shown below transcript when SR API active. | Not shown |
| Audio quality | Text label: Good / Warning / Poor. CSS coloured dot. | Not shown |
| Re-calibrate button | Always visible. Secondary action. | Not shown — no mic |
| Offline banner | Shown when navigator.onLine is false. | Shown when navigator.onLine is false. |
| File picker | Not shown | Primary interface. Full width. Accepts audio/\* types. |

## **7.4 Recorder Screen — Prosody Mode — Additional Components**

* All free mode components plus:

* Script display — Noto Serif, large readable text, full width, current chunk highlighted

* Rhythm engine running — advances at pace X during recording

* Pace control — Slow / Normal / Fast selection. Set before recording starts. Cannot change during recording.

* Progress indicator — Chunk X of Y

* Auto scroll — toggle, on by default

* If Speech Recognition API active — live words displayed as spoken, replace chunk timing with real timestamps

* View translation toggle — shows translation of current chunk if available

# **PART VIII — API Contract**

## **8.1 Service Layer**

All API calls go through a service layer. No direct fetch() calls in components. The service layer is the only thing that changes when switching from PHP plugin to MCP backend.

src/services/StarmusApiService.ts — all API calls go here

src/services/ConsentService.ts — consent record creation

src/services/ProsodyService.ts — script data and pace persistence

## **8.2 Transitional REST API (PHP Plugin)**

| Endpoint | Method | Description | Status |
| :---- | :---- | :---- | :---- |
| /starmus/v1/consent | POST | Create contributor and consent record. Returns submission\_id. | Exists |
| /starmus/v1/record/upload-chunk | POST | TUS chunk upload | Exists |
| /starmus/v1/record/upload-fallback | POST | Tier C full file upload | Exists |
| /starmus/v1/record/status/:id | GET | Upload and pipeline status | Exists |
| /starmus/v1/recording/:id | GET | Recording detail with DVE fields | Exists |
| /starmus/v1/recordings | GET | User recordings list | Exists |
| /starmus/v1/prosody/:id | GET | Prosody script data | MISSING — must be added to plugin |
| /starmus/v1/prosody/:id/pace | POST | Save pace preference | MISSING — must be added to plugin |

**The prosody GET and POST endpoints do not yet exist in the PHP plugin. They must be added before prosody mode can be tested. This is a blocking PHP task.**

## **8.3 DVE Field Mapping at Submission**

When the React app submits a recording, the form data payload must use canonical DVE field names. The service layer handles this mapping. No component ever assembles a raw WordPress field name.

Required fields in every recording submission:

* sparx\_sparxstar\_signatory\_submission\_id — from the consent flow

* sparx\_sparxstar\_original\_language — from session setup language selection

* sparx\_sparxstar\_terms\_type — from the consent mode

* sparx\_sparxstar\_device\_fingerprint — from Sirus environment

* sparx\_sparxstar\_environment\_data — Sirus environment snapshot JSON

* sparx\_sparxstar\_session\_gps — if geolocation available

* sparx\_sparxstar\_transcription\_text — if live transcript captured

# **PART IX — Reference File Pull List**

Pull these files from https://github.com/Starisian-Technologies/sparxstar-starmus-audio as reference. Read them. Do not copy them into the new repo. Rewrite using them as the behavioural reference.

## **JavaScript (rewrite as React/TypeScript)**

* src/js/starmus-recorder.js

* src/js/starmus-tus.js

* src/js/starmus-offline.js

* src/js/starmus-state-store.js

* src/js/starmus-hooks.js

* src/js/starmus-core.js

* src/js/starmus-ui.js

* src/js/starmus-enhanced-calibration.js

* src/js/starmus-metadata-auto.js

* src/js/starmus-sparxstar-integration.js

* src/js/starmus-main.js

* src/js/starmus-transcript-controller.js

* src/js/starmus-integrator.js

* src/js/consent/starmus-legal.js

* src/js/prosody/starmus-prosody-engine.js

* src/js/appmode/starmus-audio.js

* src/js/appmode/sparxstar-app-mode.js

## **CSS (rewrite as component CSS modules)**

* src/css/starmus-audio-recorder.css

* src/css/starmus-prosody-engine.css

* src/css/consent/starmus-consent.css

* src/css/sparxstar-app-mode.css

## **PHP Templates (reference — these become React screens)**

* src/templates/starmus-audio-recorder-ui.php

* src/templates/starmus-audio-re-recorder-ui.php

* src/templates/starmus-consent-form.php

* src/templates/starmus-my-recordings-list.php

* src/templates/starmus-recording-detail-user.php

* src/frontend/StarmusConsentUI.php

* src/frontend/StarmusProsodyPlayer.php

* src/core/StarmusConsentHandler.php

## **Tests (migrate and adapt for React/Vitest/Playwright)**

* tests/e2e/01-bootstrap-enforcement.spec.js

* tests/e2e/02-recorder-workflow.spec.js

* tests/e2e/african-conditions.spec.js

* tests/e2e/offline-queue.spec.js

* tests/e2e/global-setup.js

* tests/starmus-metadata-schema.test.js

## **Governance (carry over directly)**

* AGENTS.md — update for React context

* CODE-OWNERSHIP.md

* SECURITY.md

* AUDIO-TIER-STANDARDS.md

* LICENSE.md

* LICENSE-HEADER.md

* .editorconfig

* .commitlintrc.js

## **Do Not Pull**

* Any PHP source files (templates are read-only reference)

* src/js/starmus-audio-editor.js — moves to Sky Eshu UI (future)

* src/js/starmus-cue-events.js — moves to Sky Eshu UI (future)

* assets/ — build output

* acf-json/ — stays in PHP plugin

* bin/ — WP-CLI scripts, not relevant

# **PART X — Rules**

## **10.1 Africa-First Rules**

* Design for Tecno / Itel / Infinix on 2G first. Desktop is progressive enhancement.

* 360px minimum viewport. Single column always below 768px.

* Touch targets 48px minimum. No hover-only states.

* No canvas rendering on Tier C devices.

* No CSS animations that trigger layout — use transform and opacity only.

* No box-shadow animation on Tier C. Gate with prefers-reduced-motion.

* No backdrop-filter on Tier C. Gate with @supports.

* Noto Sans for all text. Noto Serif for script display. system-ui as fallback only.

* Total initial JS bundle under 130KB gzipped. Total CSS under 25KB.

## **10.2 Audio Engine Rules**

* @sparxstar/starmus-audio is a dependency, not a fork. Never copy its source into this repo.

* The React app does not own the audio engine store. Listen to starmus:complete and starmus:ready DOM events only.

* Pass Sirus-resolved environment into createRecorder(). Never rely on the package own detection in production.

* Calibration stored in sessionStorage. Never localStorage. Never server.

* Re-calibrate button always visible on Tier A/B. Never hidden.

* Tier C gets no recorder — file upload only. Do not attempt MediaRecorder on Tier C.

## **10.3 Consent Rules**

* Consent mode is set by STARMUS\_BOOTSTRAP.consentMode. The UI reads it and renders accordingly.

* Full consent mode: recording cannot begin without a valid submission\_id from the server.

* Session consent mode: submission\_id is passed in from the session context. No consent UI shown.

* Canvas signature on Tier A/B. Checkbox on Tier C. No paper. No upload of signed documents.

* Forensic evidence (IP, user agent, fingerprint, timestamp) is captured regardless of tier or consent mode.

* Returning contributors skip the full consent flow. Confirm existing record. Capture new submission\_id.

## **10.4 DVE Rules**

* Every form field submitted to the API uses a canonical DVE field name from sparxstar-digital-village-elder-schema-max.

* The service layer handles field name mapping. No component assembles field names directly.

* No field name invented in this repo. If a field is needed and does not exist in DVE schema — it must be added to the DVE schema repo first, then used here.

* Post type slugs: sparx\_audio\_recording, sparx\_contributor, sparx\_starmus\_script. Never the old audio-recording slug.

## **10.5 What Is Not In This Repo**

* No waveform editor (Peaks.js) — Sky Eshu UI (future)

* No transcription correction — Sky Eshu UI (future)

* No translation review — Sky Eshu UI (future)

* No speaker diarization — future

* No pronunciation scoring — future

* No governance enforcement — MCP backend

* No WordPress admin screens — PHP plugin

# **PART XI — Bootstrap Contract**

The React app writes STARMUS\_BOOTSTRAP to window before initialising the audio engine. This is the only window write permitted. The @sparxstar/starmus-audio package reads it.

window.STARMUS\_BOOTSTRAP \= {

  mode: "production" | "development" | "draft",

  tier: "A" | "B" | "C",           // resolved by Sirus

  consentMode: "full" | "session" | "self" | "none",

  calibrationProfile: "session" | "per-recording" | "skip",

  submissionId: string | null,      // from consent flow or session context

  language: string,                 // BCP-47 language tag

  country: string,                  // ISO 3166-1 alpha-2

  networkType: "2g" | "3g" | "4g" | "wifi" | "unknown",

  batteryLevel: number | null,      // 0.0 \- 1.0

  batteryCharging: boolean | null,

};

Mode maps to max recording duration:

* production: 120,000ms (2 minutes)

* development: 180,000ms (3 minutes)

* draft: 300,000ms (5 minutes)

Calibration profile maps to tier automatically unless overridden:

* Tier A/B — default: session

* Tier C — always: skip

*sparxstar-starmus-ui · Technical Specification v2.0 · May 2026 · Starisian Technologies · CONFIDENTIAL · PATENT PENDING*