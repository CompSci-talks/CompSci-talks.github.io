import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, getDoc, query, orderBy, getDocs, where, writeBatch, limit } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, catchError, of } from 'rxjs';
import { ISpeakerService } from '../core/contracts/speaker.interface';
import { Speaker } from '../core/models/seminar.model';
import { isNameUnique, sanitizeForFirestore } from '../core/utils/firestore-utils';

@Injectable({
    providedIn: 'root'
})
export class FirebaseSpeakerService implements ISpeakerService {
    private firestore = inject(Firestore);
    // Inject the Angular Injector to capture the context
    private injector = inject(Injector);
    private speakersCollection = collection(this.firestore, 'speakers');

    getSpeakers(): Observable<Speaker[]> {
        // Restore the context before calling collectionData
        return runInInjectionContext(this.injector, () => {
            const q = query(this.speakersCollection, orderBy('name'));
            return collectionData(q, { idField: 'id' }) as Observable<Speaker[]>;
        });
    }

    getSpeakerById(id: string): Observable<Speaker | null> {
        // Restore the context before calling docData
        return runInInjectionContext(this.injector, () => {
            const speakerDoc = doc(this.firestore, `speakers/${id}`);
            return docData(speakerDoc, { idField: 'id' }) as Observable<Speaker | null>;
        });
    }

    createSpeaker(speaker: Omit<Speaker, 'id'>): Observable<Speaker> {
        return from(isNameUnique(this.firestore, 'speakers', 'name', speaker.name)).pipe(
            switchMap(isUnique => {
                if (!isUnique) throw new Error('A speaker with this name already exists.');
                return from(addDoc(this.speakersCollection, speaker));
            }),
            map(docRef => ({ ...speaker, id: docRef.id } as Speaker))
        );
    }

    updateSpeaker(id: string, updates: Partial<Speaker>): Observable<Speaker> {
        const cleanUpdates = sanitizeForFirestore(updates);
        return from(
            cleanUpdates.name
                ? isNameUnique(this.firestore, 'speakers', 'name', cleanUpdates.name, id)
                : Promise.resolve(true)
        ).pipe(
            switchMap(isUnique => {
                if (!isUnique) throw new Error('A speaker with this name already exists.');
                const speakerDoc = doc(this.firestore, `speakers/${id}`);
                return from(updateDoc(speakerDoc, cleanUpdates));
            }),
            switchMap(async () => {
                if (cleanUpdates.name) {
                    await this.cascadeSpeakerUpdate(id, cleanUpdates.name);
                }
                // Use a one-shot getDoc so the pipeline completes
                const snapshot = await getDoc(doc(this.firestore, `speakers/${id}`));
                return { id, ...snapshot.data() } as Speaker;
            }),
            catchError(err => {
                console.error(`Error updating speaker ${id}:`, err);
                throw err;
            })
        );
    }

    deleteSpeaker(id: string): Observable<void> {
        const speakerDoc = doc(this.firestore, `speakers/${id}`);
        return from(this.checkSpeakerReferences(id)).pipe(
            switchMap(hasRefs => {
                if (hasRefs) {
                    throw new Error('Cannot delete speaker: They are still assigned to one or more seminars.');
                }
                return from(deleteDoc(speakerDoc));
            })
        );
    }

    private async checkSpeakerReferences(speakerId: string): Promise<boolean> {
        const q = query(collection(this.firestore, 'seminars'), where('speaker_ids', 'array-contains', speakerId), limit(1));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    }

    private async cascadeSpeakerUpdate(speakerId: string, newName: string) {
        const seminarsQuery = query(collection(this.firestore, 'seminars'), where('speaker_ids', 'array-contains', speakerId));
        const snapshot = await getDocs(seminarsQuery);

        const batch = writeBatch(this.firestore);
        snapshot.forEach(seminarDoc => {
            const data = seminarDoc.data();
            const speakers = (data['speakers'] || []).map((s: any) =>
                s.id === speakerId ? { ...s, name: newName } : s
            );
            batch.update(seminarDoc.ref, { speakers });
        });

        await batch.commit();
    }
}