import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
    Firestore, collection, collectionData, addDoc, query, where,
    orderBy, deleteDoc, doc, getDocs, writeBatch, updateDoc,
    increment, getDoc, startAfter, limit, DocumentSnapshot
} from '@angular/fire/firestore';
import { Observable, catchError, from, map, of, switchMap, take } from 'rxjs';
import { ICommentService } from '../core/contracts/comment.interface';
import { Comment } from '../core/models/comment.model';
import { AUTH_SERVICE } from '../core/contracts/auth.interface';
import { PaginatedResult } from '../core/models/paginated-result.model';

@Injectable({ providedIn: 'root' })
export class FirebaseCommentService implements ICommentService {
    private firestore = inject(Firestore);
    private injector = inject(Injector);
    private authService = inject(AUTH_SERVICE);
    private commentsCollection = collection(this.firestore, 'comments');

    getCommentsForSeminar$(seminarId: string): Observable<Comment[]> {
        return runInInjectionContext(this.injector, () => {
            const q = query(
                this.commentsCollection,
                where('seminar_id', '==', seminarId),
                orderBy('created_at', 'desc')
            );
            return collectionData(q, { idField: 'id' }).pipe(
                map(comments => comments.map(c => this.mapTimestamps(c)))
            ) as Observable<Comment[]>;
        });
    }

    submitComment(seminarId: string, seminar_title: string, text: string, parentId?: string): Observable<Comment> {
        return this.authService.currentUser$.pipe(
            take(1),
            switchMap(user => {
                if (!user) throw new Error('Must be authenticated to comment');

                const newComment: Omit<Comment, 'id'> = {
                    seminar_id: seminarId,
                    author_id: user.id,
                    author_name: user.display_name,
                    author_photo_url: user.photo_url || null,
                    text,
                    parent_id: parentId || null,
                    created_at: new Date(),
                    is_hidden: false,
                    seminar_title: seminar_title
                };

                const batch = writeBatch(this.firestore);
                const commentRef = doc(collection(this.firestore, 'comments'));
                batch.set(commentRef, newComment);

                const seminarRef = doc(this.firestore, `seminars/${seminarId}`);
                batch.update(seminarRef, { 'stats.comment_count': increment(1) });

                return from(batch.commit()).pipe(
                    map(() => ({ ...newComment, id: commentRef.id } as Comment))
                );
            })
        );
    }

    getAllComments(): Observable<Comment[]> {
        const q = query(this.commentsCollection, orderBy('created_at', 'desc'));
        return from(getDocs(q)).pipe(
            map(snapshot => snapshot.docs.map(d => this.mapTimestamps({ ...d.data(), id: d.id }))),
            catchError(err => {
                console.error('Failed to fetch all comments:', err);
                return of([]);
            })
        );
    }

    getAllCommentsPaginated(pageSize: number, lastDoc: DocumentSnapshot | null): Observable<PaginatedResult<Comment>> {
        const baseQuery = lastDoc
            ? query(this.commentsCollection, orderBy('created_at', 'desc'), startAfter(lastDoc), limit(pageSize + 1))
            : query(this.commentsCollection, orderBy('created_at', 'desc'), limit(pageSize + 1));

        return from(getDocs(baseQuery)).pipe(
            map(snapshot => {
                const hasMore = snapshot.docs.length > pageSize;
                const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
                return {
                    data: docs.map(d => this.mapTimestamps({ ...d.data(), id: d.id })),
                    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
                    hasMore
                };
            }),
            catchError(err => {
                console.error('Failed to fetch comments:', err);
                return of({ data: [], lastDoc: null, hasMore: false });
            })
        );
    }

    deleteComment(commentId: string): Observable<void> {
        const commentDoc = doc(this.firestore, `comments/${commentId}`);
        return from(getDoc(commentDoc)).pipe(
            switchMap(snapshot => {
                const data = snapshot.data();
                if (!data) return from(Promise.resolve());

                const batch = writeBatch(this.firestore);
                batch.delete(commentDoc);

                const seminarRef = doc(this.firestore, `seminars/${data['seminar_id']}`);
                batch.update(seminarRef, { 'stats.comment_count': increment(-1) });

                return from(batch.commit());
            })
        );
    }

    updateCommentStatus(commentId: string, isHidden: boolean): Observable<void> {
        const commentDoc = doc(this.firestore, `comments/${commentId}`);
        return from(updateDoc(commentDoc, { is_hidden: isHidden }));
    }

    private mapTimestamps(data: any): Comment {
        return {
            ...data,
            created_at: data.created_at?.toDate ? data.created_at.toDate() : data.created_at
        };
    }
}