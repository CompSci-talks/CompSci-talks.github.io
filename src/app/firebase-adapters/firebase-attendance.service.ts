import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { doc, getDoc, docData } from '@angular/fire/firestore';
import { Observable, map, switchMap, combineLatest, of } from 'rxjs';
import { IAttendanceService } from '../admin/services/attendance.service';
import { Attendee, AttendanceFilter } from '../core/models/attendance.model';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAttendanceService implements IAttendanceService {
    private firestore = inject(Firestore);

    getAttendees(seminarId: string): Observable<Attendee[]> {
        const rsvpsQuery = query(collection(this.firestore, 'rsvps'), where('seminar_id', '==', seminarId));

        return collectionData(rsvpsQuery).pipe(
            switchMap(rsvps => {
                if (!rsvps || rsvps.length === 0) return of([]);

                const userQueries = rsvps.map(r => docData(doc(this.firestore, `users/${r['user_id']}`), { idField: 'id' }).pipe(
                    map((u: any) => ({
                        id: u?.id || '',
                        email: u?.email || '',
                        display_name: u?.display_name || 'User',
                        marked_at: r['created_at']?.toDate ? r['created_at'].toDate() : new Date(),
                        status: (r['status'] as any) || 'pending'
                    } as Attendee))
                ));
                return combineLatest(userQueries);
            })
        );
    }

    filterAttendees(attendees: Attendee[], filters: AttendanceFilter): Attendee[] {
        let filtered = [...attendees];

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.display_name.toLowerCase().includes(query) ||
                a.email.toLowerCase().includes(query)
            );
        }

        if (filters.status) {
            filtered = filtered.filter(a => a.status === filters.status);
        }

        return filtered;
    }

    async updateAttendeeStatus(seminarId: string, attendeeId: string, status: Attendee['status']): Promise<void> {
        const { getDocs, updateDoc, limit } = await import('@angular/fire/firestore');

        const rsvpsQuery = query(
            collection(this.firestore, 'rsvps'),
            where('seminar_id', '==', seminarId),
            where('user_id', '==', attendeeId),
            limit(1)
        );
        const snapshot = await getDocs(rsvpsQuery);
        if (!snapshot.empty) {
            const docRef = snapshot.docs[0].ref;
            await updateDoc(docRef, { status });
        } else {
            throw new Error('RSVP record not found');
        }
    }
}
