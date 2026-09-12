#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

console.log("🔍 Validating build configuration...\n");

const requiredFiles = [
    "src/starmus-audio.css",
    "src/css/consent/starmus-consent.css",
    "src/js/starmus-hooks.js",
    "src/js/starmus-state-store.js",
    "src/js/starmus-sparxstar-integration.js",
    "src/js/starmus-integrator.js",
    "src/js/starmus-enhanced-calibration.js",
    "src/js/starmus-metadata-auto.js",
    "src/js/starmus-tus.js",
    "src/js/starmus-offline.js",
    "src/js/starmus-recorder.js",
    "src/js/starmus-ui.js",
    "src/js/starmus-core.js",
    "src/js/starmus-main.js",
    "src/js/starmus-capture-profiles.js",
    "src/js/starmus-completion-event.js",
    "src/js/starmus-transcript-provider.js",
    "src/js/appmode/starmus-audio.js",
];

// Source files scanned by the cross-cutting checks below.
function allSourceJs(dir = "src/js") {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            out.push(...allSourceJs(full));
        } else if (entry.name.endsWith(".js")) {
            out.push(full);
        }
    }
    return out;
}

let ok = true;

// ---- CHECK CSS SIZE (<20KB unminified) ----
const cssFile = "src/starmus-audio.css";
if (fs.existsSync(cssFile)) {
    const cssSize = fs.statSync(cssFile).size;
    const cssSizeKB = (cssSize / 1024).toFixed(2);
    if (cssSize > 20 * 1024) {
        console.log(`❌ CSS exceeds 20 KB unminified: ${cssSizeKB} KB`);
        ok = false;
    } else {
        console.log(`✅ CSS size OK: ${cssSizeKB} KB`);
    }
}

// ---- CHECK REQUIRED CSS TOKENS ----
if (fs.existsSync(cssFile)) {
    const cssContent = fs.readFileSync(cssFile, "utf8");
    const requiredTokens = [
        "--sparxstar-primary",
        "--sparxstar-accent-hex",
        "--sparxstar-text",
        "--sparxstar-theme-base",
        "--sparxstar-bg",
        "--sparxstar-inner-bg",
        "--sparxstar-border-color",
        "--sparxstar-danger",
        "--sparxstar-success",
        "--sparxstar-warning",
        "--sparxstar-shadow",
        "--sparxstar-shd",
        "--sparxstar-shd-onhover",
        "--sparxstar-shd-onclick",
    ];
    for (const token of requiredTokens) {
        if (!cssContent.includes(token)) {
            console.log(`❌ Missing required CSS token: ${token}`);
            ok = false;
        }
    }
    if (ok) {
        console.log("✅ All required CSS tokens present");
    }
}

// ---- CHECK FILE PRESENCE ----
console.log("\n📦 Checking required files:");
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.log(`❌ Missing: ${file}`);
        ok = false;
    } else {
        console.log(`✅ Found: ${file}`);
    }
}

// ---- CHECK MAIN ENTRY DOES NOT IMPORT EXCLUDED MODULES ----
const mainFile = "src/js/starmus-main.js";
if (fs.existsSync(mainFile)) {
    const mainContent = fs.readFileSync(mainFile, "utf8");
    const excluded = [
        "peaks.js",
        "starmus-audio-editor",
        "starmus-cue-events",
    ];
    for (const exc of excluded) {
        if (mainContent.includes(exc)) {
            console.log(`❌ starmus-main.js must not import: ${exc}`);
            ok = false;
        }
    }
    if (ok) {
        console.log("✅ Main entry imports are clean");
    }
}

// ---- CHECK TUS CONSTRAINTS ----
const tusFile = "src/js/starmus-tus.js";
if (fs.existsSync(tusFile)) {
    const tusContent = fs.readFileSync(tusFile, "utf8");

    // Verify the runtime chunk size cap enforces ≤ 512 KB via Math.min.
    // Use lazy [\s\S]*? so the match crosses newlines and function call parens.
    const chunkCapPattern = /Math\.min\([\s\S]*?512\s*\*\s*1024/;
    if (!chunkCapPattern.test(tusContent)) {
        console.log(
            "❌ starmus-tus.js: Runtime chunk size cap not found. Expected Math.min(…, 512 * 1024).",
        );
        ok = false;
    } else {
        console.log("✅ TUS chunk size runtime cap (Math.min ≤ 512 KB) enforced");
    }

    // Verify uploadTus is exported as a function (not just mentioned in a comment/import).
    const exportTusPattern = /export\s+(?:async\s+)?function\s+uploadTus\b/;
    if (!exportTusPattern.test(tusContent)) {
        console.log(
            "❌ starmus-tus.js: Missing exported uploadTus function (primary chunked upload path).",
        );
        ok = false;
    } else {
        console.log("✅ Exported uploadTus function is present");
    }

    // Verify checksumAlgorithm is explicitly configured to SHA-256 and not SHA-1.
    const checksumSha256Pattern = /checksumAlgorithm\s*[:=]\s*["']sha256["']/;
    const checksumSha1Pattern = /checksumAlgorithm\s*[:=]\s*["']sha1["']/;

    if (checksumSha1Pattern.test(tusContent) || !checksumSha256Pattern.test(tusContent)) {
        console.log(
            '❌ starmus-tus.js: checksumAlgorithm must be explicitly set to "sha256" and must not use "sha1".',
        );
        ok = false;
    } else {
        console.log('✅ TUS checksumAlgorithm is "sha256"');
    }

    // Verify no full-file upload path exists at all — not merely that it is
    // unexported. The capture-to-ingestion contract forbids a full-file
    // endpoint on both sides, and ADR-038 forbids "any re-upload-from-scratch
    // of a partially transferred original". A module-private fallback still
    // re-sends the whole recording over the link that just failed, so hiding
    // it from the public API is not compliance.
    // Checking for the old identifiers alone would pass a renamed FormData
    // POST, so the check is on the *capability*: this module transfers through
    // tus and nothing else. A whole-blob send needs one of these three, and
    // none of them has a legitimate use here.
    const fullFileMechanisms = [
        [/\bfunction\s+uploadDirect\b|\buploadDirect\s*=|directUpload/, "the former direct-upload path"],
        [/\bnew\s+FormData\b/, "a FormData body"],
        [/\bnew\s+XMLHttpRequest\b/, "an XMLHttpRequest"],
        [/\bfetch\s*\(/, "a raw fetch"],
    ];
    let chunkedOnly = true;
    for (const [pattern, label] of fullFileMechanisms) {
        if (pattern.test(tusContent)) {
            console.log(
                `❌ starmus-tus.js: ${label} can send a whole recording in one request. Chunked, resumable transfer is the only path — capture-to-ingestion contract and ADR-038.`,
            );
            chunkedOnly = false;
            ok = false;
        }
    }
    if (chunkedOnly) {
        console.log("✅ No full-file upload path (chunked-only constraint satisfied)");
    }

    // Resumability is not the fingerprint; it is the lookup that reads it.
    // tus-js-client's `start()` does not consult URL storage on its own, so
    // without this the stall abort orphans a partial resource and the retry
    // re-sends from byte zero — the re-upload ADR-038 forbids.
    if (!/findPreviousUploads\s*\(/.test(tusContent) || !/resumeFromPreviousUpload\s*\(/.test(tusContent)) {
        console.log(
            "❌ starmus-tus.js: a retry must look up and resume the previous upload (findPreviousUploads + resumeFromPreviousUpload) before start(). ADR-038 forbids re-sending a partially transferred original.",
        );
        ok = false;
    } else {
        console.log("✅ A retry resumes the previous upload rather than restarting it");
    }

    // ADR-035 and the capture-to-ingestion contract: the capture profile
    // travels with the asset. It was being assembled in starmus-core.js and
    // then dropped before transmission, so it reached ingestion on no path.
    // Checking that the property name appears would pass
    // `captureProfile: metadata.captureProfile || ""`, which transmits an empty
    // profile — indistinguishable downstream from a profile the Node could not
    // read, when it actually means none was set. So: the key must be assigned
    // conditionally, and the empty-string default must not return.
    //
    // The test is on the *sanitised and trimmed* value, because a profile of
    // only spaces is truthy: an earlier version of this check required the
    // literal `if (metadata.captureProfile)` and so certified a blank profile
    // as conforming. A check that pins a spelling instead of the guarantee is
    // worse than no check, because it is believed.
    const profileTrimmedBeforeTest =
        /const\s+captureProfile\s*=\s*sanitizeMetadata\(\s*metadata\.captureProfile\s*\)\s*\.trim\(\)/.test(
            tusContent,
        );
    const profileSentConditionally = /if\s*\(\s*captureProfile\s*\)\s*\{\s*\n\s*tusMetadata\.captureProfile\s*=\s*captureProfile;/.test(
        tusContent,
    );
    const profileDefaultsToEmpty = /captureProfile\s*:\s*sanitizeMetadata\(\s*metadata\.captureProfile\s*\|\|/.test(
        tusContent,
    );
    if (!profileTrimmedBeforeTest || !profileSentConditionally || profileDefaultsToEmpty) {
        console.log(
            "❌ starmus-tus.js: the capture profile must travel with the asset as a present value or be absent — never present and empty (ADR-035; AGENTS.md: 'An asset uploaded without its capture profile recorded' is a FAIL).",
        );
        ok = false;
    } else {
        console.log("✅ Capture profile travels with the asset, or is absent — never empty");
    }

    // A total-duration abort on a resumable upload ends every real upload on a
    // 2G link before it finishes. Only a no-progress watchdog is admissible.
    // Two halves, because the presence of a stall bound does not rule out a
    // deadline sitting beside it: the watchdog must exist, must be re-armed on
    // progress, and the total-duration timeout it replaced must not return.
    const hasStallBound = /stallTimeoutMs/.test(tusContent);
    const rearmsOnProgress = /onProgress\s*\([^)]*\)\s*\{[\s\S]{0,200}?armStallWatchdog\s*\(/.test(
        tusContent,
    );
    const hasDeadline = /requestTimeoutMs/.test(tusContent);
    if (!hasStallBound || !rearmsOnProgress || hasDeadline) {
        console.log(
            "❌ starmus-tus.js: the upload watchdog must be a no-progress bound that is re-armed on every progress event, with no total-duration deadline beside it. " +
                `(stall bound: ${hasStallBound}; re-armed on progress: ${rearmsOnProgress}; deadline present: ${hasDeadline})`,
        );
        ok = false;
    } else {
        console.log("✅ Upload watchdog is a no-progress bound, re-armed on progress");
    }
}

// ---- CHECK NO CMS REACH (ADR-034) ----
// The capture package makes no CMS REST call, sends no CMS nonce, and reads no
// CMS page global. The host injects the endpoint and any auth headers.
{
    const cmsPatterns = [
        [/X-WP-Nonce/i, "CMS nonce header"],
        [/wp-json/i, "CMS REST route"],
        [/wpApiSettings|ajaxurl|wp\.apiFetch/i, "CMS page global"],
    ];
    let cmsClean = true;
    for (const file of allSourceJs()) {
        const content = fs.readFileSync(file, "utf8");
        for (const [pattern, label] of cmsPatterns) {
            if (pattern.test(content)) {
                console.log(`❌ ${file}: ${label} present. ADR-034 forbids CMS reach in this package.`);
                cmsClean = false;
                ok = false;
            }
        }
    }
    if (cmsClean) {
        console.log("✅ No CMS reach (no CMS route, nonce, or page global)");
    }
}

// ---- CHECK ONE HOME FOR CAPTURE CONSTRAINTS (ADR-035) ----
// src/js/starmus-capture-profiles.js is the only module that may hold an audio
// limit. A literal anywhere else is a second home for the same fact, which is
// how the platform-wide ceiling ADR-035 removed got there in the first place.
{
    const limitPattern = /\b(sampleRate|channelCount|audioBitsPerSecond|bitsPerSecond)\s*:\s*\d/;
    let oneHome = true;
    for (const file of allSourceJs()) {
        if (file.endsWith("starmus-capture-profiles.js")) {
            continue;
        }
        if (limitPattern.test(fs.readFileSync(file, "utf8"))) {
            console.log(
                `❌ ${file}: audio limit literal outside src/js/starmus-capture-profiles.js. ADR-035: constraints belong to a named profile, and the profiles module is their one home.`,
            );
            oneHome = false;
            ok = false;
        }
    }
    if (oneHome) {
        console.log("✅ Capture constraints have one home (starmus-capture-profiles.js)");
    }
}

// ---- CHECK ai_manifest.json IS COMPLETE ----
// AGENTS.md: check the manifest before creating any symbol, and update it when
// one is added, removed or renamed. A manifest that silently drifts is worse
// than none, because the rule says to trust it.
{
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "ai_manifest.json"), "utf8"));
    const listed = new Set(manifest.symbols.map((entry) => entry.symbol));
    // Both export forms, because only the first was covered before and the
    // check therefore reported success while six exported symbols were
    // missing: `export { subscribe, dispatch, debugLog, ... }` in
    // starmus-hooks.js and `export { EnhancedCalibration }` in the calibration
    // module were invisible to it. A manifest check that sees one syntax is a
    // check that certifies drift.
    //
    // Both directions too. A symbol removed or renamed leaves an entry
    // pointing at nothing, which AGENTS.md's "update it when one is removed or
    // renamed" is exactly about, and which the missing-only test could never
    // catch.
    const exported = new Set();
    const sourceByPath = new Map();
    for (const file of allSourceJs()) {
        const content = fs.readFileSync(file, "utf8");
        const rel = path.relative(ROOT_DIR, file).split(path.sep).join("/");
        sourceByPath.set(rel, content);
        const here = new Set();

        // `export function foo`, `export const foo`, `export class Foo`,
        // `export let/var foo`, with or without `async`.
        const declared = /export\s+(?:async\s+)?(?:function|const|class|let|var)\s+(\w+)/g;
        let match;
        while ((match = declared.exec(content)) !== null) {
            here.add(match[1]);
        }

        // `export { a, b as c }` — the exported name is the one after `as`.
        const lists = /export\s*\{([^}]*)\}\s*(?!\s*from)/g;
        while ((match = lists.exec(content)) !== null) {
            for (const part of match[1].split(",")) {
                const name = part.trim().split(/\s+as\s+/).pop().trim();
                if (name && /^\w+$/.test(name) && name !== "default") {
                    here.add(name);
                }
            }
        }

        for (const name of here) {
            exported.add(name);
        }
    }

    const missing = [...exported].filter((symbol) => !listed.has(symbol)).sort();
    const stale = manifest.symbols
        .filter((entry) => {
            const content = sourceByPath.get(entry.path);
            // An entry whose file this scan did not read is left alone rather
            // than called stale: being unable to see a file is not evidence
            // that its symbol is gone.
            if (content === undefined) {
                return false;
            }
            // Declared, not exported. AGENTS.md says the manifest tracks *any*
            // symbol added, removed or renamed, and it deliberately inventories
            // internal ones — `getSafeRedirect` and the queue's `_`-prefixed
            // methods among them. Testing for an export here would have called
            // four correct entries stale.
            const name = entry.symbol.replace(/[^\w$]/g, "");
            return !new RegExp(
                `(?:function|const|let|var|class)\\s+${name}\\b` +
                    `|^\\s*(?:async\\s+)?${name}\\s*\\(` +
                    `|\\b${name}\\s*[:=]`,
                "m",
            ).test(content);
        })
        .map((entry) => `${entry.symbol} (${entry.path})`)
        .sort();

    if (missing.length > 0) {
        console.log(
            `❌ ai_manifest.json is missing ${missing.length} exported symbol(s): ${missing.join(", ")}. AGENTS.md requires the manifest to track every symbol added, removed or renamed.`,
        );
        ok = false;
    }
    if (stale.length > 0) {
        console.log(
            `❌ ai_manifest.json lists ${stale.length} symbol(s) that are no longer exported: ${stale.join(", ")}. A manifest entry pointing at nothing is the drift AGENTS.md's rename/remove rule exists to prevent.`,
        );
        ok = false;
    }
    if (missing.length === 0 && stale.length === 0) {
        console.log("✅ ai_manifest.json matches the exported symbols, in both directions");
    }
}

// ---- CHECK NO POST-SUBMISSION AUDIO MUTATION (ADR-039) ----
// The preservation path never edits audio. Retake and discard are
// pre-submission and belong to the recorder; trimming, splicing and any
// "effective audio"/EDL mechanism exist nowhere in this package.
{
    const editPatterns = [
        [/\bEditDecisionList\b|\bedit_decision_list\b|\bEDL\b/, "edit decision list"],
        [/\bOfflineAudioContext\b/, "offline render of captured audio"],
        [/\btrimAudio\b|\bspliceAudio\b|\bcutAudio\b/, "audio edit helper"],
    ];
    let noEdit = true;
    for (const file of allSourceJs()) {
        const content = fs.readFileSync(file, "utf8");
        for (const [pattern, label] of editPatterns) {
            if (pattern.test(content)) {
                console.log(`❌ ${file}: ${label} present. ADR-039: no edit capability in the capture path.`);
                noEdit = false;
                ok = false;
            }
        }
    }
    if (noEdit) {
        console.log("✅ No audio-edit capability (ADR-039)");
    }
}

// ---- FINAL EXIT ----
if (!ok) {
    console.log("\n⚠️  Validation failed. Fix the issues above before bundling.");
    process.exit(1);
}

console.log("\n🎉 Validation complete! All checks passed.\n");
process.exit(0);
