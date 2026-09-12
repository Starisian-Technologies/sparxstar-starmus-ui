#!/usr/bin/env node
'use strict';

/**
 * Run every unit test under `tests/`.
 *
 * This exists because `node --test` reads its arguments differently across the
 * versions this package has to work on. Node 20 — the platform's LTS floor —
 * treats an argument as a path and fails on a glob pattern; later versions
 * expand the glob but take a bare directory as a single entry and report one
 * passing "test", which looks like success. Passing explicit file paths is the
 * one form every version agrees on, so the walk happens here rather than in a
 * glob that works on whichever machine it was written on.
 *
 * It also means a test file added anywhere under `tests/` is picked up without
 * anyone remembering to widen a pattern — `tests/starmus-metadata-schema.test.js`
 * sat unrun for exactly that reason.
 *
 * Playwright specs under `tests/e2e/` are excluded: they need a running host
 * and are driven by `pnpm run test:e2e`.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const TESTS = path.join(ROOT, 'tests');
const SKIP_DIRS = new Set(['e2e', 'test-mocks', 'node_modules']);

if (!fs.existsSync(TESTS)) {
    console.error('No tests/ directory.');
    process.exit(1);
}

/**
 * @param {string} dir
 * @param {string[]} out
 * @returns {string[]}
 */
function collect(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) {
                collect(path.join(dir, entry.name), out);
            }
        } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
            out.push(path.relative(ROOT, path.join(dir, entry.name)));
        }
    }
    return out;
}

const files = collect(TESTS).sort();

if (files.length === 0) {
    console.error('No test files found under tests/. An empty set is a failure, not a pass.');
    process.exit(1);
}

console.log(`Running ${files.length} test file(s):`);
for (const file of files) {
    console.log(`  ${file}`);
}
console.log('');

const result = spawnSync(process.execPath, ['--test', ...files], {
    cwd: ROOT,
    stdio: 'inherit',
});

process.exit(result.status === null ? 1 : result.status);
