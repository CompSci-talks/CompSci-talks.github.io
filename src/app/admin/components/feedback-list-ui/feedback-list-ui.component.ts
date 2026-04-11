import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactSubmission } from '../../../core/contracts/contact-submission.interface';

@Component({
    selector: 'app-feedback-list-ui',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './feedback-list-ui.component.html',
})
export class FeedbackListUIComponent {
    @Input() submissions: ContactSubmission[] = [];
    @Output() view = new EventEmitter<ContactSubmission>();
    @Output() delete = new EventEmitter<ContactSubmission>();
    @Output() reply = new EventEmitter<ContactSubmission>();
}
