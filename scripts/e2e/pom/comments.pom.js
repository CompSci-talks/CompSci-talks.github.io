// scripts/e2e/pom/comments.pom.js
class CommentsPage {
    constructor(page) {
        this.page = page;
        this.commentInput = page.locator('app-comment-form textarea');
        this.postBtn = page.locator('app-comment-form button:has-text("Post"), app-comment-form button:has-text("Comment")');
    }

    async postComment(text) {
        await this.commentInput.fill(text);
        await this.postBtn.click();
    }

    async replyTo(commentText, replyText) {
        const comment = this.page.locator('div', { hasText: commentText }).last();
        await comment.locator('button:has-text("Reply")').click();
        await this.page.locator('app-comment-form textarea').fill(replyText);
        await this.page.locator('app-comment-form button:has-text("Reply")').click();
    }

    async deleteInModeration(commentText) {
        const row = this.page.locator('tr', { hasText: commentText });
        await row.locator('button:has-text("Delete")').click();
        // Handle the browser confirm dialog if needed, but playwright often handles it or we can use dialog listener
    }
}

module.exports = { CommentsPage };
