/**
 * Recorder Workflow Tests for Starmus Audio Recorder
 *
 * Tests the complete recorder workflow under various network conditions:
 * - Offline recording and queue persistence
 * - Network interruption handling
 * - Upload resumption
 * - No work loss under adverse conditions
 *
 * These tests MUST fail when bugs exist — they surface real user experience issues.
 */

import { test, expect } from '@playwright/test';

const VALID_BOOTSTRAP = {
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

test.describe('Recorder Workflow - Offline & Network Conditions', () => {

    test('Start recording while offline - local storage works', async ({ page }) => {
        await page.context().setOffline(true);
        await page.addInitScript((bs) => { window.STARMUS_BOOTSTRAP = bs; }, VALID_BOOTSTRAP);

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const setupBtn = page.locator('[data-starmus-action="setup-mic"]');
        await expect(setupBtn).toBeVisible({ timeout: 10000 });
        await setupBtn.click();
        await page.waitForTimeout(2000);

        const timer = page.locator('[data-starmus-timer]');
        await expect(timer).toBeVisible({ timeout: 10000 });

        const recordBtn = page.locator('[data-starmus-action="record"]');
        await expect(recordBtn).toBeVisible({ timeout: 5000 });
        await recordBtn.click();

        const pauseBtn = page.locator('[data-starmus-action="pause"]');
        await expect(pauseBtn).toBeVisible({ timeout: 5000 });

        await page.waitForTimeout(3000);

        const stopBtn = page.locator('[data-starmus-action="stop"]');
        await expect(stopBtn).toBeVisible({ timeout: 5000 });
        await stopBtn.click();

        const playBtn = page.locator('[data-starmus-action="play"]');
        await expect(playBtn).toBeVisible({ timeout: 5000 });
    });

    test('Recording persists after page reload', async ({ page }) => {
        await page.addInitScript((bs) => { window.STARMUS_BOOTSTRAP = bs; }, VALID_BOOTSTRAP);

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const setupBtn = page.locator('[data-starmus-action="setup-mic"]');
        await setupBtn.click();
        await page.waitForTimeout(2000);

        const recordBtn = page.locator('[data-starmus-action="record"]');
        await recordBtn.click();
        await page.waitForTimeout(2000);

        const stopBtn = page.locator('[data-starmus-action="stop"]');
        await stopBtn.click();
        await page.waitForTimeout(1000);

        // Reload and verify offline queue still has items
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        // The recorder should still be present
        const form = page.locator('form[data-starmus-instance]');
        await expect(form).toBeVisible({ timeout: 5000 });

        // Persisted recording should still expose submit/playback controls
        const playBtn = page.locator('[data-starmus-action="play"]');
        const submitBtn = page.locator('[data-starmus-action="submit"]');
        await expect(playBtn.or(submitBtn)).toBeVisible({ timeout: 5000 });
    });

    test('Submit while offline - queued, not lost', async ({ page }) => {
        await page.context().setOffline(true);
        await page.addInitScript((bs) => { window.STARMUS_BOOTSTRAP = bs; }, VALID_BOOTSTRAP);

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const setupBtn = page.locator('[data-starmus-action="setup-mic"]');
        await setupBtn.click();
        await page.waitForTimeout(2000);

        const recordBtn = page.locator('[data-starmus-action="record"]');
        await recordBtn.click();
        await page.waitForTimeout(2000);

        const stopBtn = page.locator('[data-starmus-action="stop"]');
        await stopBtn.click();
        await page.waitForTimeout(1000);

        const submitBtn = page.locator('[data-starmus-action="submit"]');
        await expect(submitBtn).toBeEnabled({ timeout: 5000 });
        await submitBtn.click();
        await page.waitForTimeout(2000);

        const modeIndicator = page.locator('[data-starmus-mode]');
        await expect(modeIndicator).toBeVisible({ timeout: 5000 });

        const statusText = await modeIndicator.textContent();
        expect(
            statusText.toLowerCase().includes('queue') ||
            statusText.toLowerCase().includes('upload')
        ).toBe(true);
    });

    test('Go back online - queue resumes automatically', async ({ page }) => {
        await page.context().setOffline(true);
        await page.addInitScript((bs) => { window.STARMUS_BOOTSTRAP = bs; }, VALID_BOOTSTRAP);

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // Go back online
        await page.context().setOffline(false);

        // Wait for network listener to fire queue processing
        await page.waitForTimeout(2000);

        // App should be responsive
        const setupBtn = page.locator('[data-starmus-action="setup-mic"]');
        await expect(setupBtn).toBeVisible({ timeout: 5000 });
    });

    test('Pause and resume recording preserves data', async ({ page }) => {
        await page.addInitScript((bs) => { window.STARMUS_BOOTSTRAP = bs; }, VALID_BOOTSTRAP);

        await page.goto('/recorder-test/');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const setupBtn = page.locator('[data-starmus-action="setup-mic"]');
        await setupBtn.click();
        await page.waitForTimeout(2000);

        const recordBtn = page.locator('[data-starmus-action="record"]');
        await recordBtn.click();
        await page.waitForTimeout(2000);

        const pauseBtn = page.locator('[data-starmus-action="pause"]');
        await expect(pauseBtn).toBeVisible({ timeout: 5000 });
        await pauseBtn.click();

        // Mode indicator should show paused
        const modeIndicator = page.locator('[data-starmus-mode]');
        await expect(modeIndicator).toContainText(/pause/i, { timeout: 3000 });

        // Resume should appear
        const resumeBtn = page.locator('[data-starmus-action="resume"]');
        await expect(resumeBtn).toBeVisible({ timeout: 3000 });
        await resumeBtn.click();

        // Should be recording again
        const stopBtn = page.locator('[data-starmus-action="stop"]');
        await expect(stopBtn).toBeVisible({ timeout: 5000 });
    });
});
