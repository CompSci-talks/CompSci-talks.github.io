
const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const screenshotPath = (name) => path.join(__dirname, name);

    console.log('Navigating to http://localhost:4200/login');
    await page.goto('http://localhost:4200/login');
    await page.screenshot({ path: screenshotPath('debug_loaded.png') });

    console.log('Filling credentials...');
    await page.fill('#email', 'admin@compsci.test');
    await page.fill('#password', 'TestPassword123!');
    await page.screenshot({ path: screenshotPath('debug_filled.png') });

    console.log('Clicking Sign In...');
    await page.click('button[type="submit"]');

    try {
        await page.waitForTimeout(5000); // Wait for potential redirect
        console.log('Final URL:', page.url());

        // Wait for profile or some indicator
        const isAdmin = await page.locator('a:has-text("Admin")').isVisible();
        console.log('Admin link visible:', isAdmin);

        const logoutVisible = await page.locator('button:has-text("Logout"), button:has-text("Log out")').isVisible();
        console.log('Logout button visible:', logoutVisible);

    } catch (e) {
        console.log('Error during wait:', e.message);
    }

    await page.screenshot({ path: screenshotPath('debug_final.png') });

    await browser.close();
})();
