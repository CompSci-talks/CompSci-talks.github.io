import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, query, where, getDocs, writeBatch, orderBy, limit, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, take, catchError, of } from 'rxjs';
import { ISemesterService } from '../core/contracts/semester.interface';
import { Semester } from '../core/models/semester.model';
import { isNameUnique, sanitizeForFirestore } from '../core/utils/firestore-utils';

@Injectable({
    providedIn: 'root'
})
export class FirebaseSemesterService implements ISemesterService {
    private firestore = inject(Firestore);
    private injector = inject(Injector);
    private semestersCollection = collection(this.firestore, 'semesters');

    getSemesters(): Observable<Semester[]> {
        const q = query(this.semestersCollection, orderBy('start_date', 'desc'));
        return runInInjectionContext(this.injector, () => collectionData(q, { idField: 'id' })).pipe(
            map(semesters => semesters.map(s => this.mapTimestamps(s)))
        ) as Observable<Semester[]>;
    }

    getActiveSemester(): Observable<Semester | null> {
        const q = query(this.semestersCollection, where('is_active', '==', true), limit(1));
        return runInInjectionContext(this.injector, () => collectionData(q, { idField: 'id' })).pipe(
            map(semesters => semesters.length > 0 ? this.mapTimestamps(semesters[0]) : null)
        ) as Observable<Semester | null>;
    }

    createSemester(semester: Omit<Semester, 'id'>): Observable<Semester> {
        return from(isNameUnique(this.firestore, 'semesters', 'name', semester.name)).pipe(
            switchMap(isUnique => {
                if (!isUnique) throw new Error('A semester with this name already exists.');
                return from(addDoc(this.semestersCollection, semester));
            }),
            map(docRef => ({ ...semester, id: docRef.id } as Semester))
        );
    }

    updateSemester(id: string, updates: Partial<Semester>): Observable<Semester> {
        const cleanUpdates = sanitizeForFirestore(updates);
        return from(
            cleanUpdates.name
                ? isNameUnique(this.firestore, 'semesters', 'name', cleanUpdates.name, id)
                : Promise.resolve(true)
        ).pipe(
            switchMap(isUnique => {
                if (!isUnique) throw new Error('A semester with this name already exists.');
                const semesterDoc = doc(this.firestore, `semesters/${id}`);
                return from(updateDoc(semesterDoc, cleanUpdates));
            }),
            switchMap(() => this.mapTimestampsFromDoc(id))
        );
    }

    setActiveSemester(id: string): Observable<void> {
        return from(this.orchestrateSetActiveSemester(id));
    }

    private async orchestrateSetActiveSemester(id: string): Promise<void> {
        const activeQuery = query(this.semestersCollection, where('is_active', '==', true));
        const activeDocs = await getDocs(activeQuery);

        const batch = writeBatch(this.firestore);

        // Deactivate current active semesters
        activeDocs.forEach(d => {
            batch.update(d.ref, { is_active: false });
        });

        // Activate the new one
        const targetDoc = doc(this.firestore, `semesters/${id}`);
        batch.update(targetDoc, { is_active: true });

        await batch.commit();
    }

    deleteSemester(id: string): Observable<void> {
        if (!id) return of(undefined);
        const semesterDoc = doc(this.firestore, `semesters/${id}`);
        return from(getDoc(semesterDoc)).pipe(
            switchMap(snapshot => {
                const data = snapshot.data();
                if (data && data['is_active']) {
                    throw new Error('Cannot delete the active semester. Set another semester as active first.');
                }
                return from(deleteDoc(semesterDoc));
            }),
            catchError(err => {
                console.error(`Error deleting semester ${id}:`, err);
                throw err;
            })
        );
    }

    private mapTimestamps(data: any): Semester {
        return {
            ...data,
            start_date: data.start_date?.toDate ? data.start_date.toDate() : data.start_date,
            end_date: data.end_date?.toDate ? data.end_date.toDate() : data.end_date
        };
    }

    private mapTimestampsFromDoc(id: string): Observable<Semester> {
        const semesterDoc = doc(this.firestore, `semesters/${id}`);
        return runInInjectionContext(this.injector, () => docData(semesterDoc, { idField: 'id' })).pipe(
            take(1),
            map(s => this.mapTimestamps(s))
        );
    }
}
