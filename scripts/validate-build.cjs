#!/usr/bin/env node
"use strict";

const fs = require("fs");

console.log("🔍 Validating build configuration...\n");

const requiredFiles = [
    "src/starmus-audio.css",
    "src/starmus-prosody-engine.css",
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
    "src/js/starmus-transcript-controller.js",
    "src/js/prosody/starmus-prosody-engine.js",
    "src/js/appmode/starmus-audio.js",
];

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
}

// ---- FINAL EXIT ----
if (!ok) {
    console.log("\n⚠️  Validation failed. Fix the issues above before bundling.");
    process.exit(1);
}

console.log("\n🎉 Validation complete! All checks passed.\n");
process.exit(0);
