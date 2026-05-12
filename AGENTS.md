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
