# Operating Guidelines for AI Agents

_Starisian Engineering Agent — SPARXSTAR Starmus UI Package_

---

## 1. Intake Checklist

- Identify **plugin role in the ecosystem**:
  - **Starmus** = capture + drafts
  - **AiWA** = approved corpus + linguistics
- Confirm identifiers: PascalCase name, slug, text domain, REST namespace.
- Capture CPTs / taxonomies, storage model (options / table), and capability requirements.
- Determine **bootstrap contract** fields and `pageType`.
- Specify offline / queue interactions, GDPR/CCPA sensitivity, retention, delete / opt-out.

---

## 2. Scaffolding

This package is a **standalone JS + CSS UI package** — not a WordPress plugin. Generate:

```
sparxstar-starmus-ui/
├─ src/
│   ├─ js/
│   │   ├─ appmode/
│   │   └─ prosody/
│   └─ *.css
├─ dist/            ← compiled output only
├─ tests/
│   └─ e2e/
├─ scripts/
└─ *.md, *.json, *.mjs, *.cjs, *.js  ← config at root
```

- Package manager: **pnpm** (not npm, not yarn)
- Build: **Rollup** (IIFE bundle for WordPress compatibility)
- CSS pipeline: **PostCSS** with cssnano

---

## 3. Naming Conventions (Non-Negotiable)

- **JS files**: `starmus-{feature}.js` under `src/js/`
- **Sub-mode JS**: `src/js/prosody/`, `src/js/appmode/`
- **CSS tokens**: `--sparxstar-{name}` prefix
- **DOM hooks**: `data-starmus-*` attributes
- **Global namespaces**: `window.Starmus`, `window.StarmusStore`, `window.StarmusHooks`
- **Exports**: named only — no default exports

---

## 4. Error Handling

- Internals throw `Error`; surface as console warnings in production.
- Network calls use capped exponential back-off + jitter, ≤ 5 s timeout per request.
- JS responses always `{ ok, code, message, data }`.
- Offline does not equal error — it equals **enqueue**.

---

## 5. Offline-First Mandate

- IndexedDB preferred; `localStorage` as fallback with TTL.
- Queue entries keyed by UUID: `pending | uploading | complete | failed`.
- Chunked resumable uploads + idempotency tokens.
- Export-to-file fallback for constrained schools/devices.
- **Eviction policy**: 20 MB max per DB, LRU.

---

## 6. Accessibility & i18n

- WCAG 2.1 AA conformance; live regions for status updates.
- No colour-only meaning; maintain keyboard tab order.
- All user-visible strings localised via the consuming host application.
- JS never hard-codes UI strings — they come from `window.STARMUS_BOOTSTRAP.i18n` if provided.

---

## 7. Security

- Capabilities + nonces applied server-side (consuming plugin responsibility).
- Strict MIME enforcement and upload allowlists.
- Rate-limit sensitive REST endpoints (consuming plugin responsibility).
- Never expose file paths, stack traces, or PII without consent.

---

## 8. Bootstrap Contract

Every recorder page must expose one bootstrap object **before** scripts load:

```js
window.STARMUS_BOOTSTRAP = {
  pageType:   'recorder' | 'rerecorder' | 'editor',
  postId:     number | null,
  restUrl:    string,
  canCommit:  boolean,
  transcript: array | null,
  audioUrl:   string | null,
};
```

### Rule

**If no bootstrap object exists, no code runs.** Modules must not inspect global state
outside this contract.

---

## 9. The Bicameral Architecture

Starisian packages separate:

| Part       | Role                                                   |
|------------|--------------------------------------------------------|
| **UI**     | Empathy, validation, user flow                         |
| **Kernel** | Actions, uploads, REST, drafts, approvals              |

UI never uploads; Kernel never touches DOM.

---

## 10. Builds, Budgets & CI Gates

- **Bundle format**: IIFE (not ESM) — must be embeddable in WordPress pages.
- **Budgets (CI enforced)**:
  - JS bundle ≤ 150 KB gzipped (130 KB enforced by size-limit)
  - `starmus-audio.css` ≤ 20 KB unminified
- System fonts only (`Noto Sans`, `system-ui`); no font imports in the package.
- ESLint + Stylelint are required for this package.

---

## 11. Testing

- **E2E** (Playwright): bootstrap enforcement, recorder workflow, offline queue.
- Throttle tests at 2G / 3G (Playwright network conditions API).
- Idempotency tests: submit same blob twice, expect identical post IDs.
- WCAG axe-core scan on every rendered page.

---

## 12. Documentation

- `ARCHITECTURE.md` — module map and bootstrap contract.
- `AUDIO-TIER-STANDARDS.md` — tier definitions, audio settings per tier.
- `CHANGELOG.md` — Keep-a-Changelog format.

---

## 13. AiWA Interaction Rule

Starmus produces **draft artefacts**. AiWA **accepts approved transcripts** and integrates them
into the corpus. No module may bypass this gate.

---

## 14. Immutable Decision

Shared globals are forbidden except for the **bootstrap contract**. Everything else passes
through modular interfaces (`window.StarmusStore`, `window.StarmusHooks`).
