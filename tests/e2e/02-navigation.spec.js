import { test, expect } from '@playwright/test';
import { loadDataFromWeb } from './fixtures.js';

/**
 * Tests navigation between the main tabs of the application.
 */
test.describe('02 – Navigáció a fő lapok között', () => {

    test.beforeEach(async ({ page }) => {
        await loadDataFromWeb(page);
    });

    test('Kezdőlap: Áttekintés tab aktív alapértelmezetten', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Áttekintés' })).toBeVisible();
    });

    test('Jelöltek tab megnyitható', async ({ page }) => {
        await page.getByRole('button', { name: 'Egyéni Jelöltek' }).click();
        // The candidates tab should show a search input
        await expect(page.getByPlaceholder(/Keresés|Szűr/i).first()).toBeVisible();
    });

    test('Szervezetek tab megnyitható', async ({ page }) => {
        await page.getByRole('button', { name: /Szervezetek/ }).click();
        // The organizations tab should render something meaningful
        await expect(page.getByRole('heading', { name: /Szervez|Párt/i }).first()).toBeVisible();
    });

    test('Változások tab megnyitható', async ({ page }) => {
        await page.getByRole('button', { name: /Változások/ }).click();
        await expect(page.getByRole('heading', { name: /Változás|Changelog/i }).first()).toBeVisible();
    });

    test('OEVK Körzetek tab megnyitható', async ({ page }) => {
        await page.getByRole('button', { name: 'Választókerületek' }).click();
        await expect(page.getByPlaceholder(/Keresés|Szűr/i).first()).toBeVisible();
    });
});
