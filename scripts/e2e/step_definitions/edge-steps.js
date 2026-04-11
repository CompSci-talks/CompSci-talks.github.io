// scripts/e2e/step_definitions/edge-steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { SemesterPage } = require('../pom/semester.pom');

Given('I am creating a new semester', async function () {
    const sem = new SemesterPage(this.page);
    await sem.openCreateForm();
});

When('I enter an end date that is before the start date', async function () {
    const sem = new SemesterPage(this.page);
    await sem.endDateInput.fill('2026-01-01');
    await sem.startDateInput.fill('2026-12-31');
});

Then('the {string} button should be disabled', async function (btnText) {
    const btn = this.page.locator(`button:has-text("${btnText}")`);
    await expect(btn).toBeDisabled();
});

Given('a semester with no assigned seminars {string}', async function (name) {
    // Logic to ensure it's empty
});

When('I view the portal for {string}', async function (name) {
    await this.page.goto('/');
    // Logic to find it
});
