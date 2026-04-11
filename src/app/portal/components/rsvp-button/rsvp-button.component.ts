import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seminar } from '../../../core/models/seminar.model';
import { IRsvpService, RSVP_SERVICE } from '../../../core/contracts/rsvp.interface';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { Observable, map, switchMap, of, take } from 'rxjs';
import { IUserService, USER_SERVICE } from '../../../core/contracts/user.service.interface';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-rsvp-button',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './rsvp-button.component.html'
})
export class RsvpButtonComponent implements OnInit {
    @Input({ required: true }) seminar!: Seminar;

    private rsvpService = inject(RSVP_SERVICE);
    private authService = inject(AUTH_SERVICE);
    private userService = inject<IUserService>(USER_SERVICE);
    private router = inject(Router);
    isAttending$!: Observable<boolean>;
    isAuthenticated$!: Observable<boolean>;
    isLoading = false;

    ngOnInit() {
        this.isAuthenticated$ = this.authService.currentUser$.pipe(map(u => !!u));
        this.isAttending$ = this.isAuthenticated$.pipe(
            switchMap(auth => auth ? this.rsvpService.isAttending$(this.seminar.id) : of(false))
        );
    }

    toggleRsvp(currentlyAttending: boolean) {
        this.isLoading = true;

        this.authService.currentUser$.pipe(take(1)).subscribe(user => {
            if (!user) {
                this.isLoading = false;
                return;
            }

            const uid = (user as any).id || (user as any).uid;
            const action = currentlyAttending ? 'remove' : 'add';
            const delta = currentlyAttending ? -1 : 1;

            const rsvp$ = currentlyAttending
                ? this.rsvpService.removeRsvp(this.seminar.id)
                : this.rsvpService.addRsvp(this.seminar.id);

            rsvp$.pipe(
                switchMap(() => this.userService.updateAttendanceCount(uid, delta)),
                switchMap(() => this.userService.updateAttendedSeminars(uid, this.seminar.id, action))
            ).subscribe({
                next: () => this.isLoading = false,
                error: (err) => {
                    console.error('RSVP update failed:', err);
                    this.isLoading = false;
                }
            });
        });
    }

    get calendarLink(): string {
        return this.rsvpService.getCalendarLink(this.seminar);
    }
    redirectToLogin() {
        this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
        });
    }
}