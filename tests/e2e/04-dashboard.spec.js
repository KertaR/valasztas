import { test, expect } from '@playwright/test';
import { loadDataFromWeb } from './fixtures.js';

/**
 * Tests the Dashboard (Áttekintés) tab:
 * - Stat cards show correct labels
 * - Charts are rendered
 * - Manual refresh button is visible and clickable
 * - PDF Export triggers a file download
 */
test.describe('04 – Dashboard (Áttekintés)', () => {

    test.beforeEach(async ({ page }) => {
        await loadDataFromWeb(page);
    });

    test('Statisztikai kártyák megjelennek helyes feliratokkal', async ({ page }) => {
        await expect(page.getByText('Induló Jelöltek').first()).toBeVisible();
        await expect(page.getByText('Jelölő Szervezetek').first()).toBeVisible();
        await expect(page.getByText('Választókerületek').first()).toBeVisible();
        await expect(page.getByText('Szavazásra Jogosultak').first()).toBeVisible();
    });

    test('Statisztikai kártyák valós értéket mutatnak (nem 0)', async ({ page }) => {
        // Get all stat card value elements – they should be non-zero numbers
        // The values are typically in a bold large text inside the stat cards
        const statValues = page.locator('text=/^[1-9][0-9,]+$/').first();
        await expect(statValues).toBeVisible();
    });

    test('Kézi frissítés gomb látható', async ({ page }) => {
        const refreshButton = page.locator('button[title="Azonnali frissítés"]');
        await expect(refreshButton).toBeVisible();
    });

    test('PDF export gomb kattintható, letöltés indul', async ({ page }) => {
        // Watch for download event
        const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

        await page.getByRole('button', { name: /Elmentés PDF-ként/i }).click();

        // Wait for the download to start
        const download = await downloadPromise;

        // Verify the downloaded filename matches the expected pattern
        expect(download.suggestedFilename()).toMatch(/valasztas-dashboard-export-\d{4}-\d{2}-\d{2}\.pdf/);
    });

    test('Top pártok diagram megjelenik', async ({ page }) => {
        // Recharts renders SVG elements – locate inside the chart area specifically
        const chart = page.locator('.recharts-wrapper svg, [class*="recharts"] svg').first();
        await expect(chart).toBeVisible();
    });
});
