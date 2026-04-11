// scripts/e2e/pom/seminar.pom.js
class SeminarPage {
    constructor(page) {
        this.page = page;
        this.scheduleBtn = page.locator('button:has-text("Schedule Seminar")');
        this.titleInput = page.locator('input[formControlName="title"]');
        this.dateTimeInput = page.locator('input[formControlName="date_time"]');
        this.locationInput = page.locator('input[formControlName="location"]');
        this.abstractInput = page.locator('textarea[formControlName="abstract"]');
        this.speakersSelect = page.locator('select[formControlName="speaker_ids"]');
        this.saveBtn = page.locator('button[type="submit"]');
    }

    async openScheduleForm() {
        await this.scheduleBtn.first().click(); // first() because there might be one in the list header
    }

    async fillForm(details) {
        if (details.title) await this.titleInput.fill(details.title);
        if (details.date_time) await this.dateTimeInput.fill(details.date_time);
        if (details.location) await this.locationInput.fill(details.location);
        if (details.abstract) await this.abstractInput.fill(details.abstract);
    }

    async save() {
        await this.saveBtn.click();
    }

    async selectSpeaker(name) {
        // Select by label/text in the multiple select
        await this.speakersSelect.selectOption({ label: new RegExp(name) });
    }

    async toggleTag(name) {
        const tagBtn = this.page.locator(`button:has-text("${name}")`);
        await tagBtn.click();
    }

    async isVisibleInList(title) {
        return await this.page.locator('tr', { hasText: title }).isVisible();
    }
}

module.exports = { SeminarPage };
