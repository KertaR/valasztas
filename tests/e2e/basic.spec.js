import { test, expect } from '@playwright/test';

test.describe('Választás App Basic E2E', () => {
  test('should load the dashboard and show stats', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('Áttekintés');

    // Check if stat cards are present
    const statCards = page.locator('.bg-white.dark\\:bg-slate-900.rounded-2xl.p-6'); // Adjust selector based on StatCard implementation
    // Since I don't know the exact class if it's nested, let's look for "Induló Jelöltek" text
    await expect(page.getByText('Induló Jelöltek')).toBeVisible();
    await expect(page.getByText('Jelölő Szervezetek')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/');

    // Click on the "Jelöltek" tab
    await page.getByRole('button', { name: 'Jelöltek' }).click();

    // Verify we are on the candidates tab (look for search input or heading)
    await expect(page.getByPlaceholder('Keresés név vagy körzet alapján...')).toBeVisible();
  });

  test('should open global search with Cmd+K / Ctrl+K', async ({ page }) => {
    await page.goto('/');

    // Use keyboard shortcut
    await page.keyboard.press('Control+k');

    // Verify search modal is open
    await expect(page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...')).toBeVisible();
    
    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...')).not.toBeVisible();
  });
});
