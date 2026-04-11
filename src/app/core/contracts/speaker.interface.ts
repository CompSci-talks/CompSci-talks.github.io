import { Observable } from 'rxjs';
import { Speaker } from '../models/seminar.model';
import { InjectionToken } from '@angular/core';

export interface ISpeakerService {
    getSpeakers(): Observable<Speaker[]>;
    getSpeakerById(id: string): Observable<Speaker | null>;
    createSpeaker(speaker: Omit<Speaker, 'id'>): Observable<Speaker>;
    updateSpeaker(id: string, updates: Partial<Speaker>): Observable<Speaker>;
    deleteSpeaker(id: string): Observable<void>;
}

export const SPEAKER_SERVICE = new InjectionToken<ISpeakerService>('SPEAKER_SERVICE');
