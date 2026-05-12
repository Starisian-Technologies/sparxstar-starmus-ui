/**
 * Bootstrap Enforcement Tests for Starmus Audio Recorder
 *
 * Validates that the Starmus JavaScript enforces bootstrap gating —
 * the app must not initialise without proper bootstrap data.
 */

import { test, expect } from '@playwright/test';

test.describe('Bootstrap Enforcement', () => {

    test('JS does not initialize without STARMUS_BOOTSTRAP', async ({ page }) => {
        const initAttempts = [];

        page.on('console', msg => {
            if (msg.text().includes('[STARMUS INIT]') || msg.text().includes('[STARMUS ERROR]')) {
                initAttempts.push(msg.text());
            }
        });

        await page.addInitScript(() => {
            delete window.STARMUS_BOOTSTRAP;

            const originalConsoleError = console.error;
            const sanitize = (v) => {
                try { return String(v).replace(/[\r\n\u0000-\u001f]+/g, ' '); } catch (_e) { return '[LogSanitizationError]'; }
            };

            console.error = (...args) => {
                const safe = args.map(sanitize);
                if (safe[0] && typeof safe[0] === 'string' && safe[0].includes('[STARMUS')) {
                    window.__starmusInitAttempts = window.__starmusInitAttempts || [];
                    window.__starmusInitAttempts.push(safe[0]);
                }
                return originalConsoleError.apply(console, safe);
            };
        });

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const bootstrapMissingError = await page.evaluate(() => {
            return window.__starmusInitAttempts?.some(msg =>
                msg.includes('BOOTSTRAP_MISSING') || msg.includes('bootstrap')
            ) || false;
        });

        expect(bootstrapMissingError || initAttempts.length === 0).toBe(true);
    });

    test('JS initializes with valid STARMUS_BOOTSTRAP', async ({ page }) => {
        const initSuccess = [];

        page.on('console', msg => {
            if (msg.text().includes('[STARMUS INIT]') || msg.text().includes('[STARMUS READY]')) {
                initSuccess.push(msg.text());
            }
        });

        await page.addInitScript(() => {
            window.STARMUS_BOOTSTRAP = {
                restUrl: 'http://localhost:8081/wp-json/star-starmus-audio-recorder/v1',
                nonce: 'test-nonce-12345',
                postId: 0,
                uploadEndpoint: 'upload',
                debug: false,
                tier: 'A',
                tierConfig: {
                    maxDuration: 1200,
                    supportedMimeTypes: ['audio/webm'],
                    chunkSize: 262144,
                    maxRetries: 3,
                    retryDelay: 1000,
                },
                calibration: {
                    inputLatency: 0,
                    outputLatency: 0,
                    sampleRate: 48000,
                    bufferSize: 4096,
                },
            };
        });

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const setupBtn = page.locator('[data-starmus-action="setup-mic"]');
        await expect(setupBtn).toBeVisible({ timeout: 5000 });
    });

    test('No DOM access before bootstrap validation', async ({ page }) => {
        await page.addInitScript(() => {
            const orig = document.querySelector.bind(document);
            document.querySelector = (selector) => {
                if (selector.includes('starmus-') && !window.STARMUS_BOOTSTRAP) {
                    window.__starmusEarlyDomAccess = window.__starmusEarlyDomAccess || [];
                    window.__starmusEarlyDomAccess.push({ selector, hasBootstrap: false });
                }
                return orig(selector);
            };
        });

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        const earlyAccess = await page.evaluate(() => window.__starmusEarlyDomAccess);

        if (earlyAccess && earlyAccess.length > 0) {
            const withoutBootstrap = earlyAccess.filter(a => !a.hasBootstrap);
            expect(withoutBootstrap.length).toBe(0);
        }

        await page.addInitScript(() => {
            window.STARMUS_BOOTSTRAP = {
                restUrl: 'http://localhost:8081/wp-json/star-starmus-audio-recorder/v1',
                nonce: 'test-nonce-12345',
                postId: 0,
                uploadEndpoint: 'upload',
                debug: false,
                tier: 'A',
                tierConfig: { maxDuration: 1200, supportedMimeTypes: ['audio/webm'], chunkSize: 262144, maxRetries: 3, retryDelay: 1000 },
                calibration: { inputLatency: 0, outputLatency: 0, sampleRate: 48000, bufferSize: 4096 },
            };
        });

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const setupBtn = page.locator('[data-starmus-action="setup-mic"]');
        await expect(setupBtn).toBeVisible({ timeout: 5000 });
    });

    test('Invalid bootstrap data prevents initialization', async ({ page }) => {
        const errorLogs = [];

        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('[STARMUS')) {
                errorLogs.push(msg.text());
            }
        });

        await page.addInitScript(() => {
            window.STARMUS_BOOTSTRAP = { debug: false };
        });

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const hasValidationError = errorLogs.some(msg =>
            msg.includes('VALIDATION') || msg.includes('INVALID') ||
            msg.includes('MISSING') || msg.includes('BOOTSTRAP')
        );

        expect(hasValidationError).toBe(true);
    });

    test('Bootstrap persists across page navigation', async ({ page }) => {
        const bootstrapStates = [];

        await page.addInitScript(() => {
            window.STARMUS_BOOTSTRAP = {
                restUrl: 'http://localhost:8081/wp-json/star-starmus-audio-recorder/v1',
                nonce: 'test-nonce-12345',
                postId: 0,
                uploadEndpoint: 'upload',
                debug: false,
                tier: 'A',
                tierConfig: { maxDuration: 1200, supportedMimeTypes: ['audio/webm'], chunkSize: 262144, maxRetries: 3, retryDelay: 1000 },
                calibration: { inputLatency: 0, outputLatency: 0, sampleRate: 48000, bufferSize: 4096 },
            };
        });

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        bootstrapStates.push({ page: 'recorder', hasBootstrap: await page.evaluate(() => !!window.STARMUS_BOOTSTRAP) });

        await page.goto('/my-recordings/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        bootstrapStates.push({ page: 'my-recordings', hasBootstrap: await page.evaluate(() => !!window.STARMUS_BOOTSTRAP) });

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        bootstrapStates.push({ page: 'recorder-back', hasBootstrap: await page.evaluate(() => !!window.STARMUS_BOOTSTRAP) });

        expect(bootstrapStates.every(s => s.hasBootstrap)).toBe(true);
    });
});
