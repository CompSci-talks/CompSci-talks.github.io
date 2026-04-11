import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../../core/models/comment.model';
import { CommentFormComponent } from '../comment-form/comment-form.component';

@Component({
    selector: 'app-comment-list',
    standalone: true,
    imports: [CommonModule, CommentFormComponent],
    templateUrl: './comment-list.component.html'
})
export class CommentListComponent {
    @Input({ required: true }) comments: Comment[] = [];
    @Input() isLoading = false;
    @Input() activeReplyId: string | null = null;
    @Input() isReply = false;
    @Input() isAuthenticated = false;

    @Output() replyClicked = new EventEmitter<string | null>();
    @Output() replySubmitted = new EventEmitter<{ text: string; parentId?: string }>();

    // Helper to separate top-level comments from replies
    get displayComments() {
        if (this.isReply) return this.comments;
        return this.comments.filter(c => !c.parent_id);
    }

    getReplies(parentId: string) {
        return this.comments.filter(c => c.parent_id === parentId);
    }

    private expandedComments = new Set<string>();

    toggleExpand(commentId: string) {
        if (this.expandedComments.has(commentId)) {
            this.expandedComments.delete(commentId);
        } else {
            this.expandedComments.add(commentId);
        }
    }

    isExpanded(commentId: string): boolean {
        return this.expandedComments.has(commentId);
    }
}
