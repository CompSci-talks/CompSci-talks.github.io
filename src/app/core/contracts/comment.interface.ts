import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { InjectionToken } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { PaginatedResult } from '../models/paginated-result.model';

export interface ICommentService {
    getCommentsForSeminar$(seminarId: string): Observable<Comment[]>;
    submitComment(seminarId: string, seminar_title: string, text: string, parentId?: string): Observable<Comment>;

    /** Admin moderation: paginated, cursor-based */
    getAllCommentsPaginated(pageSize: number, lastDoc: DocumentSnapshot | null): Observable<PaginatedResult<Comment>>;

    /** Used where all comments for a user are needed at once */
    getAllComments(): Observable<Comment[]>;

    deleteComment(commentId: string): Observable<void>;
    updateCommentStatus(commentId: string, isHidden: boolean): Observable<void>;
}

export const COMMENT_SERVICE = new InjectionToken<ICommentService>('COMMENT_SERVICE');