import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDoc, getDocs, writeBatch, limit, serverTimestamp, orderBy } from 'firebase/firestore';
// Added catchError to the rxjs imports
import { Observable, from, map, switchMap, combineLatest, of, catchError, take, firstValueFrom } from 'rxjs';
import { ISeminarService } from '../core/contracts/seminar.interface';
import { Seminar } from '../core/models/seminar.model';
import { Attendee } from '../core/models/attendance.model';
import { isNameUnique, sanitizeForFirestore } from '../core/utils/firestore-utils';

@Injectable({
    providedIn: 'root'
})
export class FirebaseSeminarService implements ISeminarService {
    private firestore = inject(Firestore);
    private injector = inject(Injector);
    private seminarsCollection = collection(this.firestore, 'seminars');

    getSeminars(tagId?: string, speakerId?: string, startDate?: Date, endDate?: Date): Observable<Seminar[]> {
        let q = query(this.seminarsCollection, orderBy('date_time', 'desc'));

        if (tagId) {
            q = query(q, where('tag_ids', 'array-contains', tagId));
        }

        if (speakerId) {
            q = query(q, where('speaker_ids', 'array-contains', speakerId));
        }

        if (startDate) {
            q = query(q, where('date_time', '>=', startDate));
        }

        if (endDate) {
            q = query(q, where('date_time', '<=', endDate));
        }

        return runInInjectionContext(this.injector, () => collectionData(q, { idField: 'id' })).pipe(
            map(seminars => seminars.map(s => this.mapTimestamps(s))),
            switchMap(seminars => {
                if (seminars.length === 0) return of([]);
                return combineLatest(seminars.map(s => from(this.enrichWithMetadata(s))));
            }),
            // Catch permission errors so the UI doesn't crash
            catchError(error => {
                console.error('Firebase Error fetching seminars:', error);
                return of([]);
            })
        ) as Observable<Seminar[]>;
    }

    getSeminarById(id: string): Observable<Seminar | null> {
        const seminarDoc = doc(this.firestore, `seminars/${id}`);
        return runInInjectionContext(this.injector, () => docData(seminarDoc, { idField: 'id' })).pipe(
            map(s => s ? this.mapTimestamps(s) : null),
            switchMap(s => s ? from(this.enrichWithMetadata(s)) : of(null)),
            // Catch permission errors to shut off the UI skeleton loader
            catchError(error => {
                console.error(`Firebase Error fetching seminar ${id}:`, error);
                return of(null);
            })
        ) as Observable<Seminar | null>;
    }

    createSeminar(seminar: Omit<Seminar, 'id'>): Observable<Seminar> {
        const withStats = {
            ...seminar,
            stats: { rsvp_count: 0, comment_count: 0 }
        };
        return from(isNameUnique(this.firestore, 'seminars', 'title', seminar.title)).pipe(
            switchMap(isUnique => {
                if (!isUnique) throw new Error('A seminar with this title already exists.');
                return from(this.enrichWithMetadata(withStats));
            }),
            switchMap(enriched => from(addDoc(this.seminarsCollection, enriched))),
            map(docRef => ({ ...withStats, id: docRef.id } as Seminar))
        );
    }

    updateSeminar(id: string, updates: Partial<Seminar>): Observable<Seminar> {
        const seminarDoc = doc(this.firestore, `seminars/${id}`);

        return from(
            updates.title
                ? isNameUnique(this.firestore, 'seminars', 'title', updates.title, id)
                : Promise.resolve(true)
        ).pipe(
            switchMap(isUnique => {
                if (!isUnique) throw new Error('A seminar with this title already exists.');

                // If IDs changed, we might need to re-enrich
                const enrichPromise = (updates.speaker_ids || updates.tag_ids)
                    ? this.enrichWithMetadata(updates as any, true) // Pass flag to indicate update
                    : Promise.resolve(updates);

                return from(enrichPromise);
            }),
            map(enriched => sanitizeForFirestore(enriched)),
            switchMap(sanitized => from(updateDoc(seminarDoc, sanitized))),
            switchMap(async () => {
                if (updates.title) {
                    await this.cascadeSeminarTitleUpdate(id, updates.title);
                }
                return firstValueFrom(this.getSeminarById(id).pipe(map(s => s!)));
            }),
            map(s => s!)
        );
    }

    private async cascadeSeminarTitleUpdate(seminarId: string, newTitle: string) {
        const commentsQuery = query(collection(this.firestore, 'comments'), where('seminar_id', '==', seminarId));
        const snapshot = await getDocs(commentsQuery);
        const batch = writeBatch(this.firestore);
        snapshot.forEach(d => batch.update(d.ref, { seminar_title: newTitle }));
        await batch.commit();
    }

    deleteSeminar(id: string): Observable<void> {
        return from(this.checkSeminarReferences(id)).pipe(
            switchMap(hasRefs => {
                if (hasRefs) {
                    throw new Error('Cannot delete seminar: It still has associated RSVPs or comments. Please delete those first.');
                }
                const seminarDoc = doc(this.firestore, `seminars/${id}`);
                return from(deleteDoc(seminarDoc));
            })
        );
    }

    private async checkSeminarReferences(seminarId: string): Promise<boolean> {
        const commentsQuery = query(collection(this.firestore, 'comments'), where('seminar_id', '==', seminarId), limit(1));
        const rsvpsQuery = query(collection(this.firestore, 'rsvps'), where('seminar_id', '==', seminarId), limit(1));

        const [commentsSnap, rsvpsSnap] = await Promise.all([
            getDocs(commentsQuery),
            getDocs(rsvpsQuery)
        ]);

        return !commentsSnap.empty || !rsvpsSnap.empty;
    }

    getAttendees(seminarId: string): Observable<Attendee[]> {
        const rsvpsQuery = query(collection(this.firestore, 'rsvps'), where('seminar_id', '==', seminarId));

        return runInInjectionContext(this.injector, () => collectionData(rsvpsQuery)).pipe(
            switchMap(rsvps => {
                if (rsvps.length === 0) return of([]);

                const userQueries = rsvps.map(r => runInInjectionContext(this.injector, () => docData(doc(this.firestore, `users/${r['user_id']}`), { idField: 'id' })));
                return combineLatest(userQueries).pipe(
                    map(users => users.map((u: any, index) => ({
                        id: u?.id || '',
                        email: u?.email || '',
                        display_name: u?.display_name || 'User',
                        marked_at: rsvps[index]?.['created_at']?.toDate() || new Date(),
                        status: (rsvps[index]?.['status'] as any) || 'confirmed'
                    } as Attendee)))
                );
            }),
            catchError(error => {
                console.error('Firebase Error fetching attendees:', error);
                return of([]);
            })
        );
    }



    /** Attendee emailing function stub (mailto logic) - T024 */
    sendAttendeeEmail(seminarId: string, subject: string, body: string): Observable<void> {
        return this.getAttendees(seminarId).pipe(
            map(attendees => {
                const emails = attendees.map(a => a.email).join(',');
                if (emails) {
                    const mailto = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.location.href = mailto;
                }
            })
        );
    }

    async syncRsvpCount(seminarId: string): Promise<number> {
        const rsvpsQuery = query(collection(this.firestore, 'rsvps'), where('seminar_id', '==', seminarId));
        const snapshot = await getDocs(rsvpsQuery);
        const count = snapshot.size;

        const seminarDoc = doc(this.firestore, `seminars/${seminarId}`);
        await updateDoc(seminarDoc, { 'stats.rsvp_count': count });
        return count;
    }

    private async enrichWithMetadata(seminar: any, isUpdate: boolean = false): Promise<any> {
        const enriched = { ...seminar };

        // Ensure stats object exists ONLY during creation, or if explicitly provided
        // During updates, we don't want to overwrite existing stats with defaults
        if (!isUpdate && !enriched.stats) {
            enriched.stats = { rsvp_count: 0, comment_count: 0 };
        }

        try {
            if (seminar.speaker_ids && seminar.speaker_ids.length > 0) {
                const speakers = await Promise.all(
                    seminar.speaker_ids.map(async (id: string) => {
                        try {
                            const sDoc = await getDoc(doc(this.firestore, `speakers/${id}`));
                            return { id, name: sDoc.data()?.['name'] || 'Unknown Speaker' };
                        } catch (err) {
                            console.warn(`Failed to fetch speaker ${id}:`, err);
                            return { id, name: id };
                        }
                    })
                );
                enriched.speakers = speakers;
            }

            if (seminar.tag_ids && seminar.tag_ids.length > 0) {
                const tags = await Promise.all(
                    seminar.tag_ids.map(async (id: string) => {
                        try {
                            const tDoc = await getDoc(doc(this.firestore, `tags/${id}`));
                            const data = tDoc.data();
                            return {
                                id,
                                name: data?.['name'] || id,
                                color_code: data?.['color_code'] || '#CBD5E1' // Default to slate-300 if missing
                            };
                        } catch (err) {
                            console.warn(`Failed to fetch tag ${id}:`, err);
                            return { id, name: id, color_code: '#CBD5E1' };
                        }
                    })
                );
                enriched.tags = tags;
            }
        } catch (err) {
            console.error('Error enriching seminar metadata:', err);
        }

        return enriched;
    }

    private mapTimestamps(data: any): Seminar {
        return {
            ...data,
            date_time: data.date_time?.toDate ? data.date_time.toDate() : data.date_time
        };
    }

    private sanitizeObject(obj: any): any {
        return obj;
    }
}