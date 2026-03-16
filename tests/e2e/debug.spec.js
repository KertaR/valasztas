import { test, expect } from '@playwright/test';

test('DEBUG: Capture console errors on page load', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', (exception) => {
        console.log(`PAGE ERROR: ${exception.message}`);
        consoleErrors.push(exception.message);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            console.log(`CONSOLE ERROR: ${msg.text()}`);
            consoleErrors.push(msg.text());
        }
    });

    await page.goto('/');
    
    // Setup API mocks
    const { setupApiMocks } = await import('./fixtures.js');
    await setupApiMocks(page);

    // Click load button
    const loadButton = page.locator('button:has-text("Élő adatok betöltése")');
    if (await loadButton.isVisible()) {
        await loadButton.click();
    }

    // Wait some time for processing
    await page.waitForTimeout(5000);

    // Open search modal
    await page.keyboard.press('Control+k');
    const searchInput = page.getByPlaceholder('Keresés jelöltekre, pártokra, vagy körzetekre...');
    await expect(searchInput).toBeVisible();
    await searchInput.type('Budapest');
    await page.waitForTimeout(1000);

    const rootContent = await page.innerHTML('#root');
    console.log(`Root div content: ${rootContent.substring(0, 300)}...`);

    if (consoleErrors.length > 0) {
        console.log('=== ERRORS ===');
        consoleErrors.forEach(err => console.log(err));
    }

    await page.screenshot({ path: 'e2e-debug-screenshot-2.png', fullPage: true });

    expect(true).toBe(true);
});
