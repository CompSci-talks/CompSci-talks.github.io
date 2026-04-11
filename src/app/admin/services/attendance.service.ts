import { Observable } from 'rxjs';
import { Attendee, AttendanceFilter } from '../../core/models/attendance.model';

export interface IAttendanceService {
    /**
     * Retrieves all attendees for a specific seminar.
     * @param seminarId The ID of the seminar.
     */
    getAttendees(seminarId: string): Observable<Attendee[]>;

    /**
     * Filters the provided list of attendees based on criteria.
     * @param attendees The source list.
     * @param filters Criteria (search query, status).
     */
    filterAttendees(attendees: Attendee[], filters: AttendanceFilter): Attendee[];

    /**
     * Updates the status of an attendee.
     * @param seminarId The ID of the seminar.
     * @param attendeeId The ID of the attendee.
     * @param status The new status.
     */
    updateAttendeeStatus(seminarId: string, attendeeId: string, status: Attendee['status']): Promise<void>;
}

import { InjectionToken } from '@angular/core';
export const ATTENDANCE_SERVICE = new InjectionToken<IAttendanceService>('ATTENDANCE_SERVICE');
