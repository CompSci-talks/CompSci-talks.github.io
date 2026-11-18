import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import { collection, doc, query, where, getDoc, getDocs, updateDoc, setDoc, limit, startAfter, orderBy, documentId, arrayUnion, arrayRemove, increment, deleteDoc, writeBatch } from 'firebase/firestore';
import { Observable, from, map, of, catchError, switchMap, defer } from 'rxjs';
import { IUserService } from '../core/contracts/user.service.interface';
import { User } from '../core/models/user.model';
import { sanitizeForFirestore } from '../core/utils/firestore-utils';

@Injectable({
    providedIn: 'root'
})
export class FirebaseUserProfileService implements IUserService {
    private firestore = inject(Firestore);
    private usersCollection = collection(this.firestore, 'users');

    getUsers(pageSize: number, lastUser?: User, filter?: string): Observable<User[]> {
        return defer(async () => {
            // Every document has an ID. Ordering by display_name silently excludes legacy
            // profiles with only displayName, or profiles whose name has not been filled in.
            const search = (filter || '').trim().toLocaleLowerCase();
            const batchSize = search ? Math.max(pageSize, 50) : pageSize;
            const users: User[] = [];
            let cursor = lastUser?.id;
            while (users.length < pageSize) {
                let q = query(this.usersCollection, orderBy(documentId()), limit(batchSize));
                if (cursor) q = query(q, startAfter(cursor));
                const snapshot = await getDocs(q);
                for (const record of snapshot.docs) {
                    const user = this.mapToProfile({ ...record.data(), uid: record.id });
                    cursor = record.id;
                    if (!search || user.display_name.toLocaleLowerCase().includes(search)
                        || user.email.toLocaleLowerCase().includes(search)) users.push(user);
                    if (users.length === pageSize) break;
                }
                if (snapshot.size < batchSize) break;
            }
            return users;
        });
    }

    getUserById(uid: string): Observable<User | null> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        return from(getDoc(userDoc)).pipe(
            map(snapshot => snapshot.exists() ? this.mapToProfile({ ...snapshot.data(), uid: snapshot.id }) : null),
            catchError(() => of(null))
        );
    }

    getUserById$(uid: string): Observable<User | null> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        return (docData(userDoc, { idField: 'uid' }) as Observable<any>).pipe(
            map(data => data ? this.mapToProfile(data) : null),
            catchError(err => {
                console.error('[FirebaseUserProfileService] Error listening to user:', err);
                return of(null);
            })
        );
    }

    updateUserRole(uid: string, role: 'admin' | 'moderator' | 'authenticated'): Observable<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        const cleanUpdates = sanitizeForFirestore({ role });
        return from(updateDoc(userDoc, cleanUpdates));
    }

    createUser(profile: User): Observable<void> {
        const userDoc = doc(this.firestore, `users/${profile.id}`);
        // Convert to plain object and sanitize
        const data = sanitizeForFirestore(profile);
        return from(setDoc(userDoc, data));
    }
    updateAttendanceCount(uid: string, delta: number): Observable<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        return from(updateDoc(userDoc, {
            attendance_count: increment(delta)
        }));
    }

    updateAttendedSeminars(uid: string, seminarId: string, action: 'add' | 'remove'): Observable<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        return from(updateDoc(userDoc, {
            attended_seminar_ids: action === 'add' ? arrayUnion(seminarId) : arrayRemove(seminarId)
        }));
    }
    sendBulkEmail(uids: string[], subject: string, body: string): Observable<void> {
        // Implementation for FR-014: Mapping UIDs to emails for mailto
        // In a real app, this might call a backend service, but for now we follow the mailto pattern.
        return from(this.getEmails(uids)).pipe(
            map(emails => {
                if (emails.length > 0) {
                    const mailto = `mailto:${emails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.location.href = mailto;
                }
            })
        );
    }

    private async getEmails(uids: string[]): Promise<string[]> {
        const emails: string[] = [];
        for (const uid of uids) {
            const user = await getDoc(doc(this.firestore, `users/${uid}`));
            if (user.exists() && user.data()?.['email']) {
                emails.push(user.data()?.['email']);
            }
        }
        return emails;
    }

    private mapToProfile(data: any): User {
        return {
            id: data.uid || data.id,
            display_name: data.display_name || data.displayName || 'User',
            email: data.email || '',
            role: data.role || 'authenticated',
            photo_url: data.photo_url || data.photoURL,
            created_at: this.toDate(data.created_at) ?? this.toDate(data.createdAt),
            last_active_at: this.toDate(data.last_active_at) ?? this.toDate(data.lastLogin) ?? this.toDate(data.last_login),
            enrollment_date: this.toDate(data.enrollment_date) ?? this.toDate(data.enrollmentDate),
            preferred_topic_areas: data.preferred_topic_areas || data.preferredTopicAreas || [],
            attendance_count: data.attendance_count || data.attendanceCount || 0,
            attended_seminar_ids: data.attended_seminar_ids || data.attendedSeminarIds || [],
            email_verified: data.email_verified || false
        };
    }

    private toDate(field: unknown): Date | null {
        if (field === null || field === undefined || field === '') return null;
        try {
            const value = field as { toDate?: () => Date };
            const date = typeof value.toDate === 'function' ? value.toDate()
                : field instanceof Date ? field
                : typeof field === 'string' || typeof field === 'number' ? new Date(field) : null;
            return date && Number.isFinite(date.getTime()) ? date : null;
        } catch {
            return null;
        }
    }
    updatePhotoUrl(uid: string, photo_url: string): Observable<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        return from(updateDoc(userDoc, { photo_url: photo_url })).pipe(
            switchMap(() => from(this.cascadeUserUpdate(uid, { author_photo_url: photo_url })))
        );
    }

    updateDisplayName(uid: string, name: string): Observable<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        return from(updateDoc(userDoc, { display_name: name })).pipe(
            switchMap(() => from(this.cascadeUserUpdate(uid, { author_name: name })))
        );
    }
    updateProfile(uid: string, updates: { display_name?: string; photo_url?: string }): Observable<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        const cleanUpdates = sanitizeForFirestore(updates);
        const cascadeUpdates: any = {};
        if (updates.display_name) cascadeUpdates.author_name = updates.display_name;
        if (updates.photo_url) cascadeUpdates.author_photo_url = updates.photo_url;

        return from(updateDoc(userDoc, cleanUpdates)).pipe(
            switchMap(() => {
                if (Object.keys(cascadeUpdates).length > 0) {
                    return from(this.cascadeUserUpdate(uid, cascadeUpdates));
                }
                return of(undefined);
            })
        );
    }

    deleteUser(uid: string): Observable<void> {
        return from(this.checkUserReferences(uid)).pipe(
            switchMap((hasRefs: boolean) => {
                if (hasRefs) {
                    throw new Error('Cannot delete user: They have active RSVPs, comments, or sent emails.');
                }
                const userDoc = doc(this.firestore, `users/${uid}`);
                return from(deleteDoc(userDoc));
            })
        );
    }

    private async checkUserReferences(uid: string): Promise<boolean> {
        const rsvpsQ = query(collection(this.firestore, 'rsvps'), where('user_id', '==', uid), limit(1));
        const commentsQ = query(collection(this.firestore, 'comments'), where('author_id', '==', uid), limit(1));
        const emailsQ = query(collection(this.firestore, 'SentEmails'), where('senderUid', '==', uid), limit(1));

        const [rsvps, comments, emails] = await Promise.all([
            getDocs(rsvpsQ),
            getDocs(commentsQ),
            getDocs(emailsQ)
        ]);

        return !rsvps.empty || !comments.empty || !emails.empty;
    }

    private async cascadeUserUpdate(uid: string, updates: any) {
        const commentsQuery = query(collection(this.firestore, 'comments'), where('author_id', '==', uid));
        const snapshot = await getDocs(commentsQuery);
        const batch = writeBatch(this.firestore);
        snapshot.forEach(d => batch.update(d.ref, updates));
        await batch.commit();
    }
}
