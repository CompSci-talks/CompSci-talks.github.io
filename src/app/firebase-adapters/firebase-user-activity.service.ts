import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Observable, from, map, of, catchError } from 'rxjs';
import { IUserActivityService } from '../core/contracts/user-activity.service.interface';
import { UserActivity } from '../core/models/user-activity.model';

@Injectable({
    providedIn: 'root'
})
export class FirebaseUserActivityService implements IUserActivityService {
    private firestore = inject(Firestore);
    private activityCollection = collection(this.firestore, 'activity_logs');

    getUserActivity(userId: string, limitCount: number = 20): Observable<UserActivity[]> {
        const q = query(
            this.activityCollection,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        return from(getDocs(q)).pipe(
            map(snapshot => snapshot.docs.map(d => this.mapToActivity({ ...d.data(), id: d.id }))),
            catchError(error => {
                console.error(`Error fetching activity for user ${userId}:`, error);
                return of([]);
            })
        );
    }

    private mapToActivity(data: any): UserActivity {
        return {
            id: data.id,
            userId: data.userId || data.user_id,
            type: data.type,
            targetId: data.targetId || data.target_id,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp),
            metadata: data.metadata || {}
        };
    }
}
