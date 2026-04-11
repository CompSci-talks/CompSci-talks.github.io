import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ATTENDANCE_SERVICE, IAttendanceService } from '../../services/attendance.service';
import { SEMINAR_SERVICE, ISeminarService } from '../../../core/contracts/seminar.interface';
import { ToastService } from '../../../core/services/toast.service';
import { Attendee, AttendanceFilter } from '../../../core/models/attendance.model';
import { Seminar } from '../../../core/models/seminar.model';
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { EmailSelectionService } from '../../services/email-selection.service';
import { User } from '../../../core/models/user.model';
import { ModalComponent } from '../../../core/components/modal/modal.component';

@Component({
    selector: 'app-attendance-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ModalComponent
    ],
    templateUrl: './attendance.page.html',
    styleUrl: './attendance.page.css'
})
export class AttendancePageComponent implements OnInit {
    seminarId: string | null = null;
    seminar: Seminar | null = null;
    attendees: Attendee[] = [];
    filteredAttendees: Attendee[] = [];
    selectedAttendeeIds = new Set<string>();
    selectedRecipients: Attendee[] = [];
    isLoading = true;
    showComposer = false;

    /** State for the status-change modal */
    statusModalAttendee: Attendee | null = null;
    tempStatus: Attendee['status'] = 'pending';
    isSavingStatus = false;

    filters: AttendanceFilter = {
        searchQuery: '',
        status: undefined
    };

    readonly statusOptions: { value: Attendee['status']; label: string; description: string; color: string; dot: string }[] = [
        { value: 'pending', label: 'Pending', description: 'User plans to join', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-500' },
        { value: 'attended', label: 'Attended', description: 'User attended the session', color: 'text-status-success bg-status-success/10 border-status-success/30', dot: 'bg-status-success' },
        { value: 'no_show', label: 'No Show', description: 'User did not attend', color: 'text-status-error bg-status-error/10 border-status-error/30', dot: 'bg-status-error' },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        @Inject(ATTENDANCE_SERVICE) private attendanceService: IAttendanceService,
        @Inject(SEMINAR_SERVICE) private seminarService: ISeminarService,
        private toastService: ToastService,
        private emailSelectionService: EmailSelectionService
    ) { }

    ngOnInit(): void {
        this.seminarId = this.route.snapshot.paramMap.get('id');
        if (this.seminarId) {
            this.loadData(this.seminarId);
        }
    }

    loadData(id: string): void {
        this.isLoading = true;

        const timeoutId = setTimeout(() => {
            if (this.isLoading) {
                this.isLoading = false;
                this.toastService.error('Loading timed out. This may be due to missing database indexes.');
            }
        }, 10000);

        combineLatest({
            seminar: this.seminarService.getSeminarById(id),
            attendees: this.attendanceService.getAttendees(id)
        }).subscribe({
            next: (data) => {
                clearTimeout(timeoutId);
                this.seminar = data.seminar;
                this.attendees = data.attendees;
                this.applyFilters();
                this.isLoading = false;
            },
            error: (err) => {
                clearTimeout(timeoutId);
                console.error('Error loading attendance data', err);
                this.isLoading = false;
                this.toastService.error('Failed to load attendance data.');
            }
        });
    }

    applyFilters(): void {
        this.filteredAttendees = this.attendanceService.filterAttendees(this.attendees, this.filters);
        const visibleIds = new Set(this.filteredAttendees.map(a => a.id));
        this.selectedAttendeeIds.forEach(id => {
            if (!visibleIds.has(id)) this.selectedAttendeeIds.delete(id);
        });
    }

    toggleAttendee(id: string): void {
        if (this.selectedAttendeeIds.has(id)) {
            this.selectedAttendeeIds.delete(id);
        } else {
            this.selectedAttendeeIds.add(id);
        }
    }

    toggleAll(checked: boolean): void {
        if (checked) {
            this.filteredAttendees.forEach(a => this.selectedAttendeeIds.add(a.id));
        } else {
            this.selectedAttendeeIds.clear();
        }
    }

    isAllSelected(): boolean {
        return this.filteredAttendees.length > 0 &&
            this.filteredAttendees.every(a => this.selectedAttendeeIds.has(a.id));
    }

    isSelected(id: string): boolean {
        return this.selectedAttendeeIds.has(id);
    }

    openStatusModal(attendee: Attendee): void {
        this.statusModalAttendee = attendee;
        this.tempStatus = attendee.status;
    }

    closeStatusModal(): void {
        this.statusModalAttendee = null;
        this.isSavingStatus = false;
    }

    async saveAttendeeStatus(): Promise<void> {
        if (!this.seminarId || !this.statusModalAttendee) return;
        this.isSavingStatus = true;
        try {
            await this.attendanceService.updateAttendeeStatus(
                this.seminarId,
                this.statusModalAttendee.id,
                this.tempStatus
            );
            const index = this.attendees.findIndex(a => a.id === this.statusModalAttendee!.id);
            if (index !== -1) {
                this.attendees[index].status = this.tempStatus;
                this.applyFilters();
            }
            const label = this.statusOptions.find(o => o.value === this.tempStatus)?.label ?? this.tempStatus;
            this.toastService.success(`Status updated to ${label}`);
            this.closeStatusModal();
        } catch (error) {
            console.error('Failed to update status', error);
            this.toastService.error('Failed to update status. Please try again.');
            this.isSavingStatus = false;
        }
    }

    getEmailCount(): number {
        return this.selectedAttendeeIds.size;
    }

    openComposer(): void {
        const selected = this.attendees.filter(a => this.selectedAttendeeIds.has(a.id));
        if (selected.length === 0) return;

        const profiles: User[] = selected.map(a => ({
            id: a.id,
            display_name: a.display_name,
            email: a.email,
            role: 'authenticated' as const,
            created_at: new Date(),
            last_login: new Date(),
            last_active_timestamp: new Date(),
            attendance_count: 0,
            email_verified: false
        }));

        this.emailSelectionService.setSelectedUsers(profiles);
        this.router.navigate(['/admin/email-composer']);
    }

    closeComposer(): void {
        this.showComposer = false;
    }

    onEmailSent(): void {
        this.showComposer = false;
        this.selectedAttendeeIds.clear();
        this.toastService.success(`Emails sent successfully to ${this.selectedRecipients.length} recipients.`);
    }
}
