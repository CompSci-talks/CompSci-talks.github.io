import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import { collection, doc, query, where, getDoc, getDocs, updateDoc, setDoc, limit, startAfter, orderBy, arrayUnion, arrayRemove, increment, deleteDoc, writeBatch } from 'firebase/firestore';
import { Observable, from, map, of, catchError, switchMap } from 'rxjs';
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
        let q = query(this.usersCollection, orderBy('display_name'), limit(pageSize));

        if (filter) {
            q = query(this.usersCollection,
                where('display_name', '>=', filter),
                where('display_name', '<=', filter + '\uf8ff'),
                orderBy('display_name'),
                limit(pageSize)
            );
        }

        // Handle cursor pagination
        // Note: For real cursor pagination, we need the DocumentSnapshot of the lastUser.
        // For simplicity in this implementation, we might need to fetch the doc first or 
        // rely on the caller passing the snapshot. But IUserService uses UserProfile.
        // We can fetch the last user's document to get the snapshot.

        return from(this.fetchWithCursor(q, lastUser)).pipe(
            map(snapshot => snapshot.docs.map(d => this.mapToProfile({ ...(d.data() as any), uid: d.id }))),
            catchError(error => {
                console.error('Error fetching users:', error);
                return of([]);
            })
        );
    }
    private async fetchWithCursor(q: any, lastUser?: User) {
        if (lastUser) {
            const lastDoc = await getDoc(doc(this.firestore, `users/${lastUser.id}`));
            if (lastDoc.exists()) {
                q = query(q, startAfter(lastDoc));
            }
        }
        return getDocs(q);
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
            created_at: this.toDate(data.created_at || data.createdAt),
            last_active_at: this.toDate(data.last_active_at || data.lastLogin || data.last_login),
            enrollment_date: this.toDate(data.enrollment_date || data.enrollmentDate),
            preferred_topic_areas: data.preferred_topic_areas || data.preferredTopicAreas || [],
            attendance_count: data.attendance_count || data.attendanceCount || 0,
            attended_seminar_ids: data.attended_seminar_ids || data.attendedSeminarIds || [],
            email_verified: data.email_verified || false
        };
    }

    private toDate(field: any): Date {
        if (!field) return new Date();
        if (field.toDate) return field.toDate();
        if (field instanceof Date) return field;
        return new Date(field);
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
