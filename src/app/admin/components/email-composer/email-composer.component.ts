import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { EMAIL_SERVICE, IEmailService, EmailPayload } from '../../services/email.service';
import { Attendee } from '../../../core/models/attendance.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-email-composer',
    standalone: true,
    imports: [CommonModule, FormsModule, QuillModule],
    templateUrl: './email-composer.component.html',
    styleUrl: './email-composer.component.css'
})
export class EmailComposerComponent {
    @Input() recipients: Attendee[] = [];
    @Output() onClose = new EventEmitter<void>();
    @Output() onSent = new EventEmitter<void>();

    subject = '';
    body = '';
    isSending = false;

    // Quill configuration
    quillConfig = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],                                         // remove formatting button
            ['link', 'image']                         // link and image
        ]
    };

    constructor(
        @Inject(EMAIL_SERVICE) private emailService: IEmailService,
        private toastService: ToastService
    ) { }

    get recipientEmails(): string[] {
        return this.recipients.map(r => r.email);
    }

    sendEmail(): void {
        if (!this.subject || !this.body || this.recipients.length === 0) return;

        this.isSending = true;
        const payload: EmailPayload = {
            to: this.recipientEmails,
            subject: this.subject,
            body: this.body
        };

        this.emailService.send(payload).subscribe({
            next: () => {
                this.isSending = false;
                this.onSent.emit();
            },
            error: (err) => {
                console.error('Failed to send email', err);
                this.isSending = false;
                this.toastService.error('Failed to send email. Please try again.');
            }
        });
    }
}
