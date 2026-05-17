/**
 * Global Playwright Setup for Starmus UI E2E Tests
 *
 * Verifies the WordPress environment is running and creates test pages.
 */

import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

/**
 * Verifies the WordPress environment is reachable.
 *
 * @param {string} baseURL
 * @returns {Promise<boolean>}
 */
async function verifyWordPressEnvironment(baseURL) {
    console.log(`Verifying WordPress environment at ${baseURL}...`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const response = await page.goto(baseURL, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        if (!response || response.status() >= 400) {
            throw new Error(
                `WordPress environment not responding: ${response?.status() || 'no response'}`
            );
        }

        console.log('WordPress environment is healthy');
        return true;
    } catch (error) {
        console.error('WordPress environment check failed:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * Ensures required test output directories exist.
 */
function ensureTestDirectories() {
    for (const dir of ['./test-results', './tests/e2e/assets']) {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }
    console.log('Test directories ready');
}

/**
 * Main global setup entry point.
 */
async function globalSetup() {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || process.env.WP_BASE_URL || 'http://localhost:8081';

    console.log('Starting Starmus UI Playwright global setup...');
    ensureTestDirectories();
    await verifyWordPressEnvironment(baseURL);

    console.log('Configuring test environment...');
    execSync('npx wp-env run tests-cli wp plugin activate sparxstar-starmus-ui', {
        stdio: 'inherit',
    });

    execSync(
        'npx wp-env run tests-cli wp post create --post_type=page --post_title="Recorder Test" --post_status=publish --post_content="[starmus_audio_recorder]" --post_name="recorder-test"',
        { stdio: 'inherit' }
    );

    execSync(
        `npx wp-env run tests-cli wp eval '$page = get_page_by_path("recorder-test"); if (!$page) { throw new Exception("recorder-test page not found"); } $options = get_option("starmus_options", []); $options["recorder_page_id"] = $page->ID; update_option("starmus_options", $options); echo "Recorder page option set to ID: " . $page->ID;'`,
        { stdio: 'inherit' }
    );

    console.log('Global setup complete');
}

export default globalSetup;
