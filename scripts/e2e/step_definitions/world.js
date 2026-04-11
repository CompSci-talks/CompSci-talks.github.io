// scripts/e2e/step_definitions/world.js
const { setWorldConstructor, World, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
setDefaultTimeout(60 * 1000);
const { chromium } = require('playwright-core');

class CustomWorld extends World {
    async init() {
        if (this.browser) return;
        this.browser = await chromium.launch({ headless: true });
        this.context = await this.browser.newContext({
            baseURL: 'http://localhost:4200'
        });
        this.page = await this.context.newPage();
    }

    async cleanup() {
        if (this.page) await this.page.close();
        if (this.context) await this.context.close();
        if (this.browser) await this.browser.close();
    }
}

setWorldConstructor(CustomWorld);

Before(async function () {
    await this.init();
});

After(async function (scenario) {
    if (scenario.result.status === 'FAILED') {
        const screenshotPath = `fail-${scenario.pickle.name.replace(/\W/g, '_')}.png`;
        await this.page.screenshot({ path: screenshotPath });
        console.log(`[After] Scenario failed! URL: ${this.page.url()}`);
        console.log(`[After] Screenshot saved to: ${screenshotPath}`);
    }
    await this.page.close();
    await this.context.close();
    await this.browser.close();
});
