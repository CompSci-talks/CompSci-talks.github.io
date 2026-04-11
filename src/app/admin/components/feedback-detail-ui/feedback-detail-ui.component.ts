import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactSubmission } from '../../../core/contracts/contact-submission.interface';

@Component({
    selector: 'app-feedback-detail-ui',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './feedback-detail-ui.component.html',
})
export class FeedbackDetailUIComponent {
    @Input() isOpen = false;
    @Input() data: ContactSubmission | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() reply = new EventEmitter<ContactSubmission>();
    @Output() delete = new EventEmitter<ContactSubmission>();
    @Output() statusChange = new EventEmitter<{ submission: ContactSubmission, status: ContactSubmission['status'] }>();
}
