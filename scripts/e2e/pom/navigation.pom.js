// scripts/e2e/pom/navigation.pom.js
class NavigationPage {
    constructor(page) {
        this.page = page;
    }

    async gotoHome() {
        await this.page.goto('/');
    }

    async gotoLogin() {
        await this.page.goto('/login');
    }

    async gotoAdminDashboard() {
        await this.page.goto('/admin');
    }

    async getGlobalLoader() {
        return this.page.locator('.loader-container, .spinner-border, #global-loader'); // Adjust based on actual loader selector
    }
}

module.exports = { NavigationPage };
