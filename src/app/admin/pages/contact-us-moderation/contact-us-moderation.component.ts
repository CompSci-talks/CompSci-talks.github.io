import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CONTACT_SUBMISSION_SERVICE, ContactSubmission } from '../../../core/contracts/contact-submission.interface';
import { BehaviorSubject, combineLatest, debounceTime, switchMap, Observable, of, catchError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { EmailSelectionService } from '../../services/email-selection.service';
import { ToastService } from '../../../core/services/toast.service';
import { FeedbackListUIComponent } from '../../components/feedback-list-ui/feedback-list-ui.component';
import { FeedbackDetailUIComponent } from '../../components/feedback-detail-ui/feedback-detail-ui.component';

@Component({
    selector: 'app-contact-us-moderation',
    standalone: true,
    imports: [CommonModule, FeedbackListUIComponent, FeedbackDetailUIComponent],
    templateUrl: './contact-us-moderation.component.html',
})
export class ContactUsModerationComponent implements OnInit {
    private contactService = inject(CONTACT_SUBMISSION_SERVICE);
    private emailSelection = inject(EmailSelectionService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    private statusFilter$ = new BehaviorSubject<ContactSubmission['status'] | 'all'>('all');
    private subjectFilter$ = new BehaviorSubject<string[]>(['General Feedback', 'Bug Report', 'Speaker Suggestion', 'Other']);

    availableSubjects = ['General Feedback', 'Bug Report', 'Speaker Suggestion', 'Other'];
    submissions$!: Observable<ContactSubmission[]>;
    selectedSubmission: ContactSubmission | null = null;
    isSlideOverOpen = false;

    currentStatus: ContactSubmission['status'] | 'all' = 'all';
    currentSubjects: string[] = ['General Feedback', 'Bug Report', 'Speaker Suggestion', 'Other'];

    ngOnInit(): void {
        this.submissions$ = combineLatest([
            this.statusFilter$,
            this.subjectFilter$
        ]).pipe(
            debounceTime(50),
            tap(([status, subjects]) => console.log('Current Filters:', { status, subjects })),
            switchMap(([status, subjects]) => {
                if (subjects.length === 0) return of([]);

                const filters: any = {};
                if (status !== 'all') filters.status = status;

                // If all are selected, no need to filter by subject (optional, but keep for logic consistency)
                // If the user wants specific ones, we pass the array
                if (subjects.length < this.availableSubjects.length) {
                    filters.subject = subjects;
                }

                return this.contactService.getSubmissions(50, filters).pipe(
                    catchError(err => {
                        console.error('Firestore Query Error:', err);
                        this.toastService.error('Filter query failed. Some combinations may require an index.');
                        return of([]);
                    })
                );
            })
        );
    }

    setStatusFilter(status: ContactSubmission['status'] | 'all'): void {
        this.currentStatus = status;
        this.statusFilter$.next(status);
    }

    toggleSubject(subject: string): void {
        if (subject === 'all_selected') {
            this.currentSubjects = [...this.availableSubjects];
        } else if (subject === 'none') {
            this.currentSubjects = [];
        } else {
            const current = this.subjectFilter$.value;
            const index = current.indexOf(subject);
            if (index > -1) {
                this.currentSubjects = current.filter(s => s !== subject);
            } else {
                this.currentSubjects = [...current, subject];
            }
        }
        this.subjectFilter$.next(this.currentSubjects);
    }

    getSubjectSummary(): string {
        if (this.currentSubjects.length === this.availableSubjects.length) return 'All Categories';
        if (this.currentSubjects.length === 0) return 'No Categories Selected';

        const first = this.currentSubjects[0];
        if (this.currentSubjects.length === 1) return first;

        return `${first} + ${this.currentSubjects.length - 1} more`;
    }

    getFullSubjectList(): string {
        return this.currentSubjects.join(', ');
    }

    resetFilters(): void {
        this.currentStatus = 'all';
        this.currentSubjects = [...this.availableSubjects];
        this.statusFilter$.next('all');
        this.subjectFilter$.next(this.currentSubjects);
    }

    onView(submission: ContactSubmission): void {
        this.selectedSubmission = submission;
        this.isSlideOverOpen = true;

        if (submission.status === 'new' && submission.id) {
            this.contactService.updateStatus(submission.id, 'read')
                .catch(err => console.error('Failed to update status to read:', err));
        }
    }

    onStatusChange(submission: ContactSubmission, newStatus: ContactSubmission['status']): void {
        if (!submission.id) return;

        this.contactService.updateStatus(submission.id, newStatus)
            .then(() => this.toastService.success(`Status updated to ${newStatus}`))
            .catch(() => this.toastService.error('Failed to update status'));
    }

    onDelete(submission: ContactSubmission): void {
        if (!submission.id) return;

        if (confirm('Are you sure you want to delete this submission?')) {
            this.contactService.softDelete(submission.id)
                .then(() => {
                    this.toastService.success('Submission deleted');
                    if (this.selectedSubmission?.id === submission.id) {
                        this.closeDetail();
                    }
                })
                .catch(() => this.toastService.error('Failed to delete submission'));
        }
    }

    onReply(submission: ContactSubmission): void {
        if (!submission.id || !submission.email) return;

        // Map to pseudo-User for EmailSelectionService
        const pseudoUser: any = {
            id: `contact-${submission.id}`,
            display_name: submission.name,
            email: submission.email,
            role: 'authenticated', // Guests are treated as authenticated for email selection context
            email_verified: true,
            created_at: new Date()
        };

        this.emailSelection.clearSelection();
        this.emailSelection.addSelectedUser(pseudoUser);

        this.router.navigate(['/admin/email-composer'], {
            queryParams: { returnUrl: '/admin/feedback' }
        });
    }

    closeDetail(): void {
        this.isSlideOverOpen = false;
        this.selectedSubmission = null;
    }
}
