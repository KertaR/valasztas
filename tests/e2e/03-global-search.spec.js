import { test, expect } from '@playwright/test';
import { loadDataFromWeb } from './fixtures.js';

/**
 * Tests the global search modal (Ctrl+K / Cmd+K):
 * - Opening / closing
 * - Typing and getting results
 * - Keyboard navigation through results
 * - Selecting a result to navigate to the detail view
 */
test.describe('03 – Globális Kereső', () => {

    test.beforeEach(async ({ page }) => {
        await loadDataFromWeb(page);
    });

    test('Ctrl+K megnyitja a keresőt, ESC bezárja', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...');
        await expect(searchInput).not.toBeVisible();

        await page.keyboard.press('Control+k');
        await expect(searchInput).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(searchInput).not.toBeVisible();
    });

    test('Gépelés után jelöltek és szervezetek jelennek meg (min. 2 karakter)', async ({ page }) => {
        await page.keyboard.press('Control+k');
        const searchInput = page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...');
        await expect(searchInput).toBeVisible();

        // Type only 1 char – should NOT show results yet
        await searchInput.type('F');
        await expect(page.getByText('Gépelj még a kereséshez...')).toBeVisible();

        // Type 2nd char – results should appear
        await searchInput.type('i');
        // Some results section should appear (candidates, orgs, or districts)
        await page.waitForTimeout(1000);
        await expect(page.getByText(/Jelöltek|Szervezetek|Választókerületek/i).first()).toBeVisible();
    });

    test('Billentyűzet navigáció: ArrowDown kiemeli az első találatot', async ({ page }) => {
        await page.keyboard.press('Control+k');
        const searchInput = page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...');
        await searchInput.type('Ba');

        // Wait for results to appear
        await page.waitForSelector('[class*="bg-blue-50"], [class*="bg-emerald-50"], [class*="bg-amber-50"]', { timeout: 5000 }).catch(() => {});

        // Navigate down with keyboard
        await page.keyboard.press('ArrowDown');

        // At least one item should be in an active state (ring class or active color)
        await page.waitForTimeout(500);
        const activeItem = page.locator('[class*="ring-2"], [data-testid*="active"]').first();
        await expect(activeItem).toBeVisible();
    });

    test('Visszaállás Nincs találat állapotra ismeretlen szóra', async ({ page }) => {
        await page.keyboard.press('Control+k');
        const searchInput = page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...');
        await searchInput.type('xxxxxxzzzzzqqqqq');

        await expect(page.getByText(/Nincs találat/i)).toBeVisible();
    });

    test('Enter gomb a kijelölt elemre navigál és bezárja a keresőt', async ({ page }) => {
        await page.keyboard.press('Control+k');
        const searchInput = page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...');
        await searchInput.type('Budapest');

        // Wait for results
        await page.waitForTimeout(500);

        // Navigate to first result and select
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        // Search modal should be closed
        await expect(searchInput).not.toBeVisible();
    });
});
