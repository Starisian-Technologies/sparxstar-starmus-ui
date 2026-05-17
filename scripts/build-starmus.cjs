#!/usr/bin/env node
"use strict";

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const files = process.argv.slice(2);
if (files.length === 0) {
    console.error("Usage: node build-starmus.cjs <file1> <file2> ...");
    process.exit(1);
}

console.log("🔨 Generating file hashes...");

const hashes = [];

files.forEach((file) => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file);
        const hash = crypto.createHash("md5").update(content).digest("hex").substring(0, 8);
        const output = `${path.basename(file)}: ${hash}`;
        console.log(`✅ ${output}`);
        hashes.push(output);
    } else {
        console.log(`❌ File not found: ${file}`);
    }
});

const distDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

const hashFilePath = path.join(distDir, "build-hash.txt");
fs.writeFileSync(hashFilePath, hashes.join("\n") + "\n");
console.log(`💾 Hashes saved to ${hashFilePath}`);

console.log("🎉 Hash generation complete!");
