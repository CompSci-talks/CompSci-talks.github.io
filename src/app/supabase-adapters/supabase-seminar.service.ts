import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { ISeminarService } from '../core/contracts/seminar.interface';
import { Seminar } from '../core/models/seminar.model';
import { Attendee } from '../core/models/attendance.model';
import { SupabaseService } from '../core/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class SupabaseSeminarService implements ISeminarService {

    constructor(private supabase: SupabaseService) { }

    getSeminars(tagId?: string, speakerId?: string, startDate?: Date, endDate?: Date): Observable<Seminar[]> {
        let query = this.supabase.client.from('seminars').select('*').order('date_time', { ascending: false });

        if (tagId) {
            query = query.contains('tag_ids', [tagId]);
        }
        if (speakerId) {
            query = query.contains('speaker_ids', [speakerId]);
        }
        if (startDate && endDate) {
            query = query.gte('date_time', startDate.toISOString()).lte('date_time', endDate.toISOString());
        }

        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data.map((item: any) => ({
                    ...item,
                    date_time: new Date(item.date_time)
                })) as Seminar[];
            })
        );
    }

    getSeminarById(id: string): Observable<Seminar | null> {
        const query = this.supabase.client.from('seminars').select('*').eq('id', id).single();
        return from(query).pipe(
            map(response => {
                if (response.error && response.error.code !== 'PGRST116') throw response.error;
                if (!response.data) return null;
                return {
                    ...response.data,
                    date_time: new Date(response.data.date_time)
                } as Seminar;
            })
        );
    }

    createSeminar(seminar: Omit<Seminar, 'id'>): Observable<Seminar> {
        const query = this.supabase.client.from('seminars').insert(seminar).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return {
                    ...response.data,
                    date_time: new Date(response.data.date_time)
                } as Seminar;
            })
        );
    }

    updateSeminar(id: string, updates: Partial<Seminar>): Observable<Seminar> {
        const query = this.supabase.client.from('seminars').update(updates).eq('id', id).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return {
                    ...response.data,
                    date_time: new Date(response.data.date_time)
                } as Seminar;
            })
        );
    }

    deleteSeminar(id: string): Observable<void> {
        const query = this.supabase.client.from('seminars').delete().eq('id', id);
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
            })
        );
    }

    getAttendees(seminarId: string): Observable<Attendee[]> {
        const query = this.supabase.client
            .from('rsvps')
            .select('*, users!user_id(display_name, email)')
            .eq('seminar_id', seminarId);

        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return (response.data || []).map((r: any) => ({
                    id: r.user_id,
                    email: r.users?.email || '',
                    display_name: r.users?.display_name || 'User',
                    marked_at: new Date(r.created_at || r.marked_at), // Assuming created_at or marked_at exists
                    status: r.status || 'confirmed'
                })) as Attendee[];
            })
        );
    }
}
