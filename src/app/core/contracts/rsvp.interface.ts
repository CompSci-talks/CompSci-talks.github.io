// contracts/rsvp.interface.ts
import { Observable } from 'rxjs';
import { Seminar } from '../models/seminar.model';

export interface IRsvpService {
    /** Emits true if the current user has RSVP'd to the given seminar */
    isAttending$(seminarId: string): Observable<boolean>;

    /** Fetch all upcoming seminars the current user is attending */
    getUserRsvps(): Observable<Seminar[]>;

    /** Mark as attending */
    addRsvp(seminarId: string): Observable<void>;

    /** Remove attendance */
    removeRsvp(seminarId: string): Observable<void>;

    /** Generate an Add To Calendar link/file for a seminar */
    getCalendarLink(seminar: Seminar): string;
}

import { InjectionToken } from '@angular/core';
export const RSVP_SERVICE = new InjectionToken<IRsvpService>('RSVP_SERVICE');
