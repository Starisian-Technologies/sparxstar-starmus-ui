#!/usr/bin/env node
"use strict";

const fs = require("fs");

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
    const anyDirectPattern = /\bfunction\s+uploadDirect\b|\buploadDirect\s*=/;
    if (anyDirectPattern.test(tusContent) || /directUpload/.test(tusContent)) {
        console.log(
            "❌ starmus-tus.js: no full-file upload path may exist (uploadDirect / directUpload endpoint). Chunked, resumable transfer is the only path — capture-to-ingestion contract and ADR-038.",
        );
        ok = false;
    } else {
        console.log("✅ No full-file upload path (chunked-only constraint satisfied)");
    }

    // ADR-035 and the capture-to-ingestion contract: the capture profile
    // travels with the asset. It was being assembled in starmus-core.js and
    // then dropped before transmission, so it reached ingestion on no path.
    if (!/captureProfile\s*:/.test(tusContent)) {
        console.log(
            "❌ starmus-tus.js: the capture profile must travel with the asset in upload metadata (ADR-035; AGENTS.md: 'An asset uploaded without its capture profile recorded' is a FAIL).",
        );
        ok = false;
    } else {
        console.log("✅ Capture profile travels with the asset");
    }

    // A total-duration abort on a resumable upload ends every real upload on a
    // 2G link before it finishes. Only a no-progress watchdog is admissible.
    if (!/stallTimeoutMs/.test(tusContent)) {
        console.log(
            "❌ starmus-tus.js: the upload watchdog must be a no-progress (stall) bound, not a total-duration deadline.",
        );
        ok = false;
    } else {
        console.log("✅ Upload watchdog is a no-progress bound, not a deadline");
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
