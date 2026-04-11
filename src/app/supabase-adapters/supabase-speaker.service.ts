import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { ISpeakerService } from '../core/contracts/speaker.interface';
import { Speaker } from '../core/models/seminar.model';
import { SupabaseService } from '../core/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class SupabaseSpeakerService implements ISpeakerService {
    private supabase = inject(SupabaseService);

    getSpeakers(): Observable<Speaker[]> {
        const query = this.supabase.client.from('speakers').select('*').order('name');
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data as Speaker[];
            })
        );
    }

    getSpeakerById(id: string): Observable<Speaker | null> {
        const query = this.supabase.client.from('speakers').select('*').eq('id', id).single();
        return from(query).pipe(
            map(response => {
                if (response.error && response.error.code !== 'PGRST116') throw response.error;
                return response.data as Speaker | null;
            })
        );
    }

    createSpeaker(speaker: Omit<Speaker, 'id'>): Observable<Speaker> {
        const query = this.supabase.client.from('speakers').insert(speaker).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data as Speaker;
            })
        );
    }

    updateSpeaker(id: string, updates: Partial<Speaker>): Observable<Speaker> {
        const query = this.supabase.client.from('speakers').update(updates).eq('id', id).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data as Speaker;
            })
        );
    }

    deleteSpeaker(id: string): Observable<void> {
        const query = this.supabase.client.from('speakers').delete().eq('id', id);
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return void 0;
            })
        );
    }
}
