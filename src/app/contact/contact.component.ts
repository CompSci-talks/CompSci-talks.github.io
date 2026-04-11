import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CONTACT_SUBMISSION_SERVICE } from '../core/contracts/contact-submission.interface';
import { AUTH_SERVICE } from '../core/contracts/auth.interface';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './contact.component.html',
    styleUrls: []
})
export class ContactComponent implements OnInit {
    contactForm!: FormGroup;
    isLoading = false;
    isSuccess = false;

    private fb = inject(FormBuilder);
    private contactService = inject(CONTACT_SUBMISSION_SERVICE);
    private authService = inject(AUTH_SERVICE);

    submitterUid: string | null = null;

    ngOnInit(): void {
        this.contactForm = this.fb.group({
            name: [''],
            email: ['', [Validators.email]],
            subject: ['General Feedback', [Validators.required]],
            message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
        });

        // Observe auth state (T011)
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.submitterUid = user.id;
                this.contactForm.patchValue({
                    name: user.display_name || '',
                    email: user.email || ''
                });
            } else {
                this.submitterUid = null;
            }
        });
    }

    get messageControl() {
        return this.contactForm.get('message');
    }

    get messageLength(): number {
        return this.messageControl?.value?.length || 0;
    }

    async onSubmit() {
        if (this.contactForm.invalid) {
            this.contactForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        try {
            await this.contactService.submitContactMessage({
                name: this.contactForm.value.name,
                email: this.contactForm.value.email,
                subject: this.contactForm.value.subject,
                message: this.contactForm.value.message,
                submitterUid: this.submitterUid
            });
            this.isSuccess = true;
        } catch (error) {
            console.error('Failed to submit message:', error);
        } finally {
            this.isLoading = false;
        }
    }

    resetForm() {
        this.isSuccess = false;
        const currentName = this.contactForm.value.name;
        const currentEmail = this.contactForm.value.email;

        this.contactForm.reset();

        // Restore pre-filled values
        this.contactForm.patchValue({
            name: this.submitterUid ? currentName : '',
            email: this.submitterUid ? currentEmail : '',
            subject: 'General Feedback',
            message: ''
        });
    }
}
