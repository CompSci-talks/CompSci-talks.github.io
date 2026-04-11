import { Observable } from 'rxjs';
import { UserActivity } from '../models/user-activity.model';
import { InjectionToken } from '@angular/core';

export const USER_ACTIVITY_SERVICE = new InjectionToken<IUserActivityService>('USER_ACTIVITY_SERVICE');

export interface IUserActivityService {
    getUserActivity(userId: string, limit?: number): Observable<UserActivity[]>;
}
