import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-comment-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './comment-form.component.html'
})
export class CommentFormComponent {
    @Input() isSubmitting = false;
    @Input() isReply = false;
    @Input() parentId?: string;

    @Output() submitComment = new EventEmitter<{ text: string; parentId?: string }>();
    @Output() cancelReply = new EventEmitter<void>();

    newCommentText = '';

    onSubmit() {
        if (!this.newCommentText.trim() || this.isSubmitting) return;
        this.submitComment.emit({
            text: this.newCommentText.trim(),
            parentId: this.parentId
        });
        this.newCommentText = '';
    }
}
