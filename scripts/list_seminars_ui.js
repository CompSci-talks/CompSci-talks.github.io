
const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Navigating to http://localhost:4200/schedule');
    await page.goto('http://localhost:4200/schedule');

    try {
        await page.waitForSelector('.seminar-card', { timeout: 10000 });
        const seminars = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.seminar-card h3')).map(h3 => h3.textContent.trim());
        });
        console.log('Seminars found:', seminars);
    } catch (e) {
        console.log('No seminars found on /schedule within timeout');
        await page.screenshot({ path: 'schedule_page_empty.png' });
    }

    await browser.close();
})();
