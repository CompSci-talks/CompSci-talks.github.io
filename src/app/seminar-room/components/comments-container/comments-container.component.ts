import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { CommentFormComponent } from '../comment-form/comment-form.component';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { COMMENT_SERVICE } from '../../../core/contracts/comment.interface';
import { Observable, map } from 'rxjs';
import { Comment } from '../../../core/models/comment.model';
import { ToastService } from '../../../core/services/toast.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-comments-container',
    standalone: true,
    imports: [CommonModule, CommentListComponent, CommentFormComponent, RouterLink],
    templateUrl: './comments-container.component.html'
})
export class CommentsContainerComponent implements OnInit {
    @Input({ required: true }) seminarId!: string;
    @Input({ required: true }) seminar_title!: string;

    private commentService = inject(COMMENT_SERVICE);
    private authService = inject(AUTH_SERVICE);
    private toastService = inject(ToastService);

    comments$!: Observable<Comment[]>;
    isAuthenticated$!: Observable<boolean>;

    isLoadingComments = true;
    isSubmitting = false;
    activeReplyId: string | null = null;

    ngOnInit() {
        this.isAuthenticated$ = this.authService.currentUser$.pipe(map(u => !!u));

        // We mock loading state briefly
        this.comments$ = this.commentService.getCommentsForSeminar$(this.seminarId);
        setTimeout(() => this.isLoadingComments = false, 500);
    }

    onReplyInitiated(commentId: string | null) {
        this.activeReplyId = commentId;
    }

    onCommentSubmitted(event: { text: string; parentId?: string }) {
        this.isSubmitting = true;
        this.commentService.submitComment(this.seminarId, this.seminar_title, event.text, event.parentId).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.toastService.success('Comment posted successfully.');
                if (event.parentId) {
                    this.activeReplyId = null; // Close reply UI
                }
            },
            error: (err) => {
                console.error('Failed to submit comment:', err);
                this.isSubmitting = false;
                this.toastService.error('Failed to post comment. Please try again.');
            }
        });
    }
}
