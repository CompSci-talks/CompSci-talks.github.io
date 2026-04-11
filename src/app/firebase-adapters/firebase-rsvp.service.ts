import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, where, deleteDoc, getDocs, writeBatch, increment, setDoc } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, take, of, combineLatest } from 'rxjs';
import { IRsvpService } from '../core/contracts/rsvp.interface';
import { Seminar } from '../core/models/seminar.model';
import { AUTH_SERVICE } from '../core/contracts/auth.interface';
import { SEMINAR_SERVICE } from '../core/contracts/seminar.interface';

@Injectable({
    providedIn: 'root'
})
export class FirebaseRsvpService implements IRsvpService {
    private firestore = inject(Firestore);
    private injector = inject(Injector);
    private authService = inject(AUTH_SERVICE);
    private seminarService = inject(SEMINAR_SERVICE);
    private rsvpsCollection = collection(this.firestore, 'rsvps');

    isAttending$(seminarId: string): Observable<boolean> {
        return this.authService.currentUser$.pipe(
            switchMap(user => {
                if (!user) return of(false);
                const q = query(this.rsvpsCollection, where('seminar_id', '==', seminarId), where('user_id', '==', user.id));
                return runInInjectionContext(this.injector, () => collectionData(q)).pipe(map(docs => docs.length > 0));
            })
        );
    }

    getUserRsvps(): Observable<Seminar[]> {
        return this.authService.currentUser$.pipe(
            take(1),
            switchMap(user => {
                if (!user) return of([]);
                const q = query(this.rsvpsCollection, where('user_id', '==', user.id));
                return runInInjectionContext(this.injector, () => collectionData(q)).pipe(
                    switchMap(rsvps => {
                        if (rsvps.length === 0) return of([]);
                        const seminarQueries = rsvps.map(r => this.seminarService.getSeminarById(r['seminar_id']));
                        return combineLatest(seminarQueries).pipe(
                            map(seminars => seminars.filter((s): s is Seminar => !!s))
                        );
                    })
                );
            })
        );
    }

    addRsvp(seminarId: string): Observable<void> {
        return this.authService.currentUser$.pipe(
            take(1),
            switchMap(user => {
                if (!user) throw new Error('Must be authenticated to RSVP');

                const batch = writeBatch(this.firestore);
                const rsvpRef = doc(collection(this.firestore, 'rsvps'));
                batch.set(rsvpRef, {
                    seminar_id: seminarId,
                    user_id: user.id,
                    created_at: new Date(),
                    status: 'pending'
                });

                const seminarRef = doc(this.firestore, `seminars/${seminarId}`);
                batch.update(seminarRef, { 'stats.rsvp_count': increment(1) });

                return from(batch.commit());
            })
        );
    }

    removeRsvp(seminarId: string): Observable<void> {
        return this.authService.currentUser$.pipe(
            take(1),
            switchMap(async user => {
                if (!user) throw new Error('Must be authenticated to remove RSVP');

                const q = query(this.rsvpsCollection, where('seminar_id', '==', seminarId), where('user_id', '==', user.id));
                const snapshot = await getDocs(q);

                if (snapshot.empty) return;

                const batch = writeBatch(this.firestore);
                snapshot.forEach(d => batch.delete(d.ref));

                const seminarRef = doc(this.firestore, `seminars/${seminarId}`);
                batch.update(seminarRef, { 'stats.rsvp_count': increment(-snapshot.size) });

                await batch.commit();
            }),
            map(() => void 0)
        );
    }

    getCalendarLink(seminar: Seminar): string {
        const start = seminar.date_time.toISOString().replace(/-|:|\.\d+/g, '');
        const end = new Date(seminar.date_time.getTime() + 3600000).toISOString().replace(/-|:|\.\d+/g, '');
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(seminar.title)}&dates=${start}/${end}&details=${encodeURIComponent(seminar.abstract)}&location=${encodeURIComponent(seminar.location)}`;
    }

    private mapTimestamps(data: any): Seminar {
        return {
            ...data,
            date_time: data.date_time?.toDate ? data.date_time.toDate() : data.date_time
        };
    }
}
