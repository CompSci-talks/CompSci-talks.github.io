
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Navigating to http://localhost:4200/login');
    await page.goto('http://localhost:4200/login');

    console.log('Filling credentials for user@compsci.test...');
    await page.fill('#email', 'user@compsci.test');
    await page.fill('#password', 'TestPassword123!');

    console.log('Clicking Sign In...');
    await page.click('button:has-text("Sign In")');

    try {
        await page.waitForURL('http://localhost:4200/', { timeout: 15000 });
        console.log('Final URL:', page.url());
    } catch (e) {
        console.log('Navigation to / failed or timed out');
        const errorText = await page.locator('.bg-status-error').innerText().catch(() => 'No error message found');
        console.log('Error on page:', errorText);
        await page.screenshot({ path: 'login_error_user.png' });
    }

    const logoutVisible = await page.isVisible('button:has-text("Logout")');
    console.log('Logout button visible:', logoutVisible);

    await browser.close();
})();
