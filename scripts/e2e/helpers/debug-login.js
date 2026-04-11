// scripts/e2e/helpers/debug-login.js
const { chromium } = require('playwright-core');
const { login } = require('./auth-helper');

async function debug() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: 'http://localhost:4200' });
    const page = await context.newPage();

    console.log('[Debug] Starting login debug...');
    try {
        await page.goto('/login');
        console.log('[Debug] On login page:', page.url());

        // Capture console logs from the page
        page.on('console', msg => console.log('[Browser Console]', msg.text()));

        await login(page, 'admin@example.com', 'admin123');
        console.log('[Debug] Login step finished. Current URL:', page.url());

        await page.screenshot({ path: 'login-debug.png' });
        console.log('[Debug] Screenshot saved to login-debug.png');

    } catch (err) {
        console.error('[Debug] Error during login:', err.message);
        await page.screenshot({ path: 'login-error.png' });
        console.log('[Debug] Error screenshot saved to login-error.png');
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    debug();
}
