import { test, expect } from '@playwright/test';
import { loadDataFromWeb, setupApiMocks } from './fixtures.js';

/**
 * Tests the app's initial state (Upload Screen) and the data loading flow.
 * This is the entry point for all other E2E tests.
 */
test.describe('01 – Adatbetöltési folyamat', () => {

    test('Upload Screen megjelenik, a CTA gombok láthatóak', async ({ page }) => {
        await page.goto('/');

        // Should show the main heading
        await expect(page.getByRole('heading', { name: 'Választási Elemző Rendszer' })).toBeVisible();

        // The web load button and file upload area should be present
        await expect(page.getByRole('button', { name: /Élő adatok betöltése/i })).toBeVisible();
        await expect(page.getByText('Kattints ide az 5 JSON fájl tallózásához')).toBeVisible();

        // File status indicators should all show as NOT loaded initially
        await expect(page.getByText('Megyek', { exact: true })).toBeVisible();
        await expect(page.getByText('Szervezetek', { exact: true })).toBeVisible();
    });

    test('Webes adatbetöltés: a Dashboard jelenik meg sikeres betöltés után', async ({ page }) => {
        await loadDataFromWeb(page);

        // The main dashboard heading should be visible
        await expect(page.getByRole('heading', { name: 'Áttekintés' })).toBeVisible();

        // Key stat cards should appear
        await expect(page.getByText('Induló Jelöltek').first()).toBeVisible();
        await expect(page.getByText('Jelölő Szervezetek').first()).toBeVisible();
        await expect(page.getByText('Választókerületek').first()).toBeVisible();
        await expect(page.getByText('Szavazásra Jogosultak').first()).toBeVisible();
    });

    test('Kézi fájlfeltöltés: az 5 JSON fájl feltöltése után az app megnyílik', async ({ page }) => {
        await page.goto('/');

        const filePaths = [
            'public/data/Megyek.json',
            'public/data/Telepulesek.json',
            'public/data/OevkAdatok.json',
            'public/data/EgyeniJeloltek.json',
            'public/data/Szervezetek.json',
            'public/data/OevkPoligonok.json',
            'public/data/ListakEsJeloltek.json',
        ];

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(filePaths);

        // Wait for the dashboard to appear
        await page.waitForSelector('h1:has-text("Áttekintés")', { timeout: 30000 });
        await expect(page.getByRole('heading', { name: 'Áttekintés' })).toBeVisible();
    });
});
