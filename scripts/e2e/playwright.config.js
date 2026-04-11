// scripts/e2e/playwright.config.js
module.exports = {
    timeout: 60000,
    use: {
        baseURL: 'http://localhost:4200',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        viewport: { width: 1280, height: 720 },
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
};
