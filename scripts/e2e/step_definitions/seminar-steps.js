// scripts/e2e/step_definitions/seminar-steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { SeminarPage } = require('../pom/seminar.pom');
const { NavigationPage } = require('../pom/navigation.pom');
const { SemesterPage } = require('../pom/semester.pom');

Given('I have an active semester {string}', async function (name) {
    const nav = new NavigationPage(this.page);
    const sem = new SemesterPage(this.page);
    await nav.gotoAdminDashboard();
    if (!(await sem.isActive(name))) {
        await sem.setActive(name);
    }
});

When('I navigate to the Seminar Management page', async function () {
    await this.page.goto('/admin/seminars');
});

When('I open the "Add Seminar" form', async function () {
    const seminar = new SeminarPage(this.page);
    await seminar.openScheduleForm();
});

When('I fill in the following seminar details:', async function (table) {
    const seminar = new SeminarPage(this.page);
    const details = table.rowsHash();
    // Add a default time
    details.date_time = '2027-03-15T14:00';
    await seminar.fillForm(details);
});

When('I select speaker {string}', async function (name) {
    const seminar = new SeminarPage(this.page);
    await seminar.selectSpeaker(name);
});

When('I add tag {string}', async function (name) {
    const seminar = new SeminarPage(this.page);
    await seminar.toggleTag(name);
});

When('I click "Save Seminar"', async function () {
    const seminar = new SeminarPage(this.page);
    await seminar.save();
});

Then('I should see {string} in the seminar list', async function (title) {
    const seminar = new SeminarPage(this.page);
    await expect(this.page.locator('tr', { hasText: title })).toBeVisible();
});

Then('I should see it in the public portal for {string}', async function (semesterName) {
    await this.page.goto('/schedule');
    // Logic to verify it appears in the portal
    await expect(this.page.locator('app-seminar-card')).toContainText(semesterName, { timeout: 10000 });
});

Given('there is an existing seminar {string}', async function (title) {
    // Implicit or we could verify it's there
});

When('I edit the seminar {string}', async function (title) {
    const seminar = new SeminarPage(this.page);
    await this.page.locator('tr', { hasText: title }).locator('button:has-text("Edit")').click();
});

When('I change the location to {string}', async function (loc) {
    const seminar = new SeminarPage(this.page);
    await seminar.locationInput.fill(loc);
});

When('I save the changes', async function () {
    const seminar = new SeminarPage(this.page);
    await seminar.save();
});

Then('the seminar {string} location should be {string}', async function (title, loc) {
    await expect(this.page.locator('tr', { hasText: title })).toContainText(loc);
});
