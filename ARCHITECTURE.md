# Starmus Audio Recorder — Architecture & Separation of Concerns

## Purpose

The Starmus Audio Recorder is the **frontline acquisition system** in the Starisian stack. It
captures audio, enforces consent, normalises metadata, and produces artefacts that later graduate
into the **AiWA corpus**. No data flows into AiWA until Starmus certifies it.

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
  transcript: array | null,
  audioUrl:  string | null,
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
- REST calls with capability + nonce
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

### 7. `starmus-transcript-controller.js` — Transcript Sync

**Responsibility**: Karaoke-style word highlighting synchronised with Peaks.js audio playback.

- Binary search for O(log n) word lookup at current time
- Click-to-seek on individual word tokens
- Auto-scroll with user-scroll detection
- Confidence indicators for low-accuracy words
- Clean destroy() for memory management

**Requires**: Peaks.js instance (provided by consuming plugin/editor page).

---

### 8. `prosody/starmus-prosody-engine.js` — Prosody Mode

**Responsibility**: Rhythm-paced text display synchronised with the recorder state.

- Tap-based BPM calibration
- Text segmented into `prosodic-unit` spans
- O(1) DOM updates (only mutates previous + current nodes)
- Connects to `window.StarmusStore` to auto-play/stop with recording
- AJAX pace persistence with offline guard

---

### 9. `appmode/starmus-audio.js` — Smart Audio Player

**Responsibility**: Optimised playback for recordings-list views on low-end devices.

- Network-aware source selection (Opus 24 kbps / MP3 32 kbps)
- Hardware-aware tier detection (RAM < 4 GB → skip Web Audio)
- Lazy AudioContext initialisation (autoplay policy compliance)
- Gentle broadcast levelling via DynamicsCompressor
- `destroy()` for memory safety in SPA contexts

---

## Data Flow

```
USER → UI Controller → Recorder Engine → Core / Submission Handler
         │                   │                   │
         ▼                   ▼                   ▼
     Bootstrap          Audio Blobs         TUS / REST / Queue
                                                  │
                                             WordPress
```

Graduation into **AiWA** happens only after a human or AI approves the transcript.

---

## Security Model

1. Nonce + capability checks for every POST/PUT
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
