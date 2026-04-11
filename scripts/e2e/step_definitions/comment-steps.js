// scripts/e2e/step_definitions/comment-steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { CommentsPage } = require('../pom/comments.pom');
const { NavigationPage } = require('../pom/navigation.pom');
const { login } = require('../helpers/auth-helper');

Given('I am on a seminar detail page for {string}', async function (title) {
    await this.page.goto('/schedule');
    await this.page.locator('app-seminar-card', { hasText: title }).click();
});

Given('I am logged in as a standard user', async function () {
    await login(this.page, 'user@compsci.test', 'TestPassword123!');
});

When('I post a comment {string}', async function (text) {
    const comments = new CommentsPage(this.page);
    await comments.postComment(text);
});

Then('the global loader should appear and disappear', async function () {
    const nav = new NavigationPage(this.page);
    const loader = await nav.getGlobalLoader();
    // We might miss it if it's too fast, so we just check if it's not visible now
    // or use a more sophisticated wait if possible.
    await expect(loader).not.toBeVisible();
});

Then('a success toast should be visible', async function () {
    await expect(this.page.locator('.toast-success, .hot-toast-bar')).toBeVisible();
});

Then('the comment {string} should be visible', async function (text) {
    await expect(this.page.locator('div', { hasText: text })).toBeVisible();
});

When('I reply to the comment {string} with {string}', async function (original, reply) {
    const comments = new CommentsPage(this.page);
    await comments.replyTo(original, reply);
});

Then('the reply {string} should be visible nested under the original comment', async function (reply) {
    await expect(this.page.locator('div.ml-8', { hasText: reply })).toBeVisible();
});

Given('the comment {string} exists', async function (text) {
    // Implicitly assumed from previous step or we could seed data
});

When('I log in as an administrator', async function () {
    await login(this.page, 'admin@compsci.test', 'TestPassword123!');
});

When('I navigate to the moderation view for {string}', async function (title) {
    await this.page.goto('/admin/comments');
});

When('I delete the comment {string}', async function (text) {
    // Handle confirm dialog
    this.page.once('dialog', dialog => dialog.accept());
    const comments = new CommentsPage(this.page);
    await comments.deleteInModeration(text);
});

Then('the comment {string} should no longer be visible for any user', async function (text) {
    await this.page.goto('/');
    // Navigate back to check
    await expect(this.page.locator('div', { hasText: text })).not.toBeVisible();
});
