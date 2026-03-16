/**
 * E2E Test Fixtures and helpers
 *
 * This module intercepts all NVI API calls and responds with local fixture data
 * from the `public/data/` directory, making tests fully offline-capable and deterministic.
 */

import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const NVI_FILE_MAP = {
    'Megyek.json': 'Megyek.json',
    'Telepulesek.json': 'Telepulesek.json',
    'OevkAdatok.json': 'OevkAdatok.json',
    'EgyeniJeloltek.json': 'EgyeniJeloltek.json',
    'Szervezetek.json': 'Szervezetek.json',
    'OevkPoligonok.json': 'OevkPoligonok.json',
    'ListakEsJeloltek.json': 'ListakEsJeloltek.json',
};

/**
 * Intercepts all `/api/nvi/**` requests and serves local fixture files.
 * @param {import('@playwright/test').Page} page
 */
export async function setupApiMocks(page) {
    // Intercept config.json to prevent dynamic version lookups
    await page.route('**/api/nvi/config.json', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ver: '03160900' }),
        });
    });

    // Intercept all NVI data file requests with absolute paths
    for (const [nviFile, localFile] of Object.entries(NVI_FILE_MAP)) {
        const localPath = path.join(PROJECT_ROOT, 'public', 'data', localFile);
        await page.route(`**/api/nvi/**/${nviFile}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                path: localPath,
            });
        });
    }
}

/**
 * Loads data by clicking the "Élő adatok betöltése" button and waits for the
 * dashboard to appear, confirming a successful data load.
 * @param {import('@playwright/test').Page} page
 */
export async function loadDataFromWeb(page) {
    await setupApiMocks(page);
    await page.goto('/');

    // Wait for the upload screen to be ready
    await page.waitForSelector('button:has-text("Élő adatok betöltése")', { timeout: 15000 });

    // Click the load button (use text locator to avoid SVG icon in accessible name)
    await page.locator('button:has-text("Élő adatok betöltése")').click();

    // Wait for the main dashboard heading to appear (60s for slow local data processing)
    await page.waitForSelector('h1:has-text("Áttekintés")', { timeout: 60000 });
}
