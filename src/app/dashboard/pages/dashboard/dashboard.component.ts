import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Seminar } from '../../../core/models/seminar.model';
import { IRsvpService, RSVP_SERVICE } from '../../../core/contracts/rsvp.interface';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { SeminarCardComponent } from '../../../portal/components/seminar-card/seminar-card.component';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, SeminarCardComponent],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    private rsvpService = inject(RSVP_SERVICE);
    private authService = inject(AUTH_SERVICE);

    rsvps$!: Observable<Seminar[]>;
    currentUser$!: Observable<User | null>;

    ngOnInit() {
        this.currentUser$ = this.authService.currentUser$;
        this.rsvps$ = this.rsvpService.getUserRsvps();
    }
}
