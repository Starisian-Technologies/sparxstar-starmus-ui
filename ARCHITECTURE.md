# Starmus Capture UI — Architecture & Separation of Concerns

## What this package is

This package is the **capture UI package** under ADR-034: an embeddable,
Africa-first browser recorder. It owns **browser microphone capture, local and
offline handling, the chunked-upload client, playback, recording-status
components, and capture UX** — and nothing else.

Any product can embed it without inheriting a CMS.

## What it does not own

| Concern | Owner |
| --- | --- |
| Server-side ingestion, validation, integrity, immutable storage, derivatives, processing jobs | Spoken Audio Node |
| **Acoustic measurement** — pitch, formant, intensity, duration | Spoken Audio Node |
| Canonical transcription, translation, linguistic interpretation, human correction | ESU |
| Elicitation script presentation, pacing, reader position | elicitation pacing package |

The paced reader ("prosody engine") and the transcript-sync controller were
removed from this package; they were never the capture UI's. Acoustic
measurement has never lived here and must not arrive.

The seams are contracts, not conventions — see the governance registry's
`contracts/spoken-audio-capture-to-ingestion.md` for what crosses the wire on
upload, and `contracts/elicitation-pacing-sync.md` for how a paced reader
synchronizes with this recorder.

---

## Runtime Bootstrap Contract

Starmus never initialises unless one of these globals exists:

```js
window.STARMUS_BOOTSTRAP = {
  pageType: 'recorder' | 'rerecorder' | 'editor',
  postId:   number | null,
  restUrl:  string,
  mode:     string,
  canCommit: boolean,
  audioUrl:  string | null,
  // ADR-035: the capture profile this product wants for this session.
  // 'conversation' | 'documentation' | 'import'. Omitted means 'conversation'.
  captureProfile: string | undefined,
  // Upload endpoint is injected by the host. This package ships no default
  // and holds no CMS path.
  uploadEndpoint: string | undefined,
}
```

This object **must** be present before JS bundles run. It defines **what this page is allowed
to do**. If no bootstrap object exists, no code runs.

---

## Module Responsibilities

### 1. `starmus-recorder.js` — Core Recording Engine

**Responsibility**: Capture and process live audio.

- MediaRecorder lifecycle (start / pause / resume / stop)
- Gain analysis + meter updates
- Timer and progress bar state
- Audio blob normalisation
- Tier detection influences these controls
- No knowledge of UI, WordPress, or uploads

**Public API**

```js
initRecorder(store, instanceId)
```

---

### 2. `starmus-ui.js` — Interface Orchestration

**Responsibility**: State machine for the two-step recorder UI.

- Validates Step 1 fields (title, language, type, consent)
- Advances or blocks recording stage
- Shows Tier A/B recorder or Tier C upload fallback
- Sanitises text input for safety
- Delegates save operations to the core submission handler

**Rules**

- Never touches blobs
- Never uploads anything
- Never talks to REST directly

---

### 3. `starmus-core.js` — Persistence Layer

**Responsibility**: Network, uploads, and offline queue coordination.

- TUS chunked uploads (resume-safe)
- Offline IndexedDB FIFO queue
- Upload endpoint and auth are injected by the host; no CMS path is hard-coded
- Metadata composition from UI + Bootstrap
- Delete / rollback capabilities

Everything here is **idempotent**.

---

### 4. `starmus-offline.js` — Offline Queue

**Responsibility**: IndexedDB offline queue and sync on reconnect.

- Queue entries keyed by UUID: `pending | uploading | complete | failed`
- Tier-specific blob size limits: 20 MB (A) / 10 MB (B) / 5 MB (C)
- Export-to-file fallback for constrained schools/devices

---

### 5. `starmus-tus.js` — TUS Upload Layer

**Responsibility**: Chunked, resumable uploads via tus-js-client.

- 512 KB max chunk
- Chunk checksum verification
- UUID per upload
- Circuit breaker: max 3 retries with exponential back-off

---

### 6. `starmus-integrator.js` — Sparxstar UEC Bridge

**Responsibility**: Translate `sparxstar:environment-ready` events into store dispatches.

- Normalises raw UEC payload to the strict Starmus backend schema
- Sets up `SpeechRecognition` / `webkitSpeechRecognition` compatibility shim
- AudioContext watchdog (resume on first user gesture)
- No Peaks.js dependency — pure store integration

---

### 7. `starmus-capture-profiles.js` — Capture Profiles

**Responsibility**: Resolve audio constraints from the named profile the
product chose (ADR-035).

- `conversation` carries the low-bandwidth numbers, and only that profile does
- `documentation` and `import` constrain nothing this package has authority to set
- Reports what the device actually delivered; never silently substitutes a profile
- The `documentation` floor is OQ-021, owned by AIWA and the analysis owner

**Public API**

```js
resolveCaptureProfile(name)
getAudioConstraints(name)
getRecorderOptions(name, mimeType)
describeAttainment(name, track)
```

---

### 8. `appmode/starmus-audio.js` — Smart Audio Player

**Responsibility**: Optimised playback for recordings-list views on low-end devices.

- Network-aware source selection (Opus 24 kbps / MP3 32 kbps)
- Hardware-aware tier detection (RAM < 4 GB → skip Web Audio)
- Lazy AudioContext initialisation (autoplay policy compliance)
- Gentle broadcast levelling via DynamicsCompressor
- `destroy()` for memory safety in SPA contexts

---

## Data Flow

```
USER → UI Controller → Recorder Engine → Offline Queue → TUS Upload Client
         │                   │                                   │
         ▼                   ▼                                   ▼
     Bootstrap        Audio Blob + capture profile      host-injected endpoint
                                                                 │
                                                                 ▼
                                                     Spoken Audio Node (ingestion)
```

This package's responsibility **ends at a successfully uploaded chunk**.
Ingestion, integrity, storage, derivatives and measurement are the Spoken
Audio Node's; the reviewed transcript and its translation are ESU's. This
package does not know whether a recording was later approved, and must not
grow a way to find out.

---

## Security Model

1. Auth for uploads is host-supplied; this package holds no CMS nonce or path
2. Sanitised inputs before DOM insertion
3. Escaped outputs before rendering
4. Upload MIME checks + allowed types enforcement
5. Offline queue sealed against replay attacks
6. Recorder never stores PII without explicit consent

---

## Performance Standards

- No blocking scripts
- DOM cached before mutations
- Single RecorderEngine instance per form
- Avoid heap growth by releasing blob URLs
- IndexedDB batching to reduce write thrash
- Payload ceilings enforced by CI

---

## Architectural Principles

1. **Bootstrap-first** — Nothing initialises without a `pageType` contract.
2. **Separation of duties** — UI is not allowed to upload; engine never touches the DOM.
3. **Replaceable layers** — Each module can fail without collapsing the system.
4. **Offline-first** — Queue always wins over network optimism.
5. **No shared mutable globals** except the bootstrap.
