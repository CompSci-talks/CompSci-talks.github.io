import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { ISemesterService } from '../core/contracts/semester.interface';
import { Semester } from '../core/models/semester.model';
import { SupabaseService } from '../core/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class SupabaseSemesterService implements ISemesterService {

    constructor(private supabase: SupabaseService) { }

    getSemesters(): Observable<Semester[]> {
        const query = this.supabase.client.from('semesters').select('*').order('start_date', { ascending: false });
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data.map((item: any) => ({
                    ...item,
                    start_date: new Date(item.start_date),
                    end_date: new Date(item.end_date)
                })) as Semester[];
            })
        );
    }

    getActiveSemester(): Observable<Semester | null> {
        const query = this.supabase.client.from('semesters').select('*').eq('is_active', true).single();
        return from(query).pipe(
            map(response => {
                if (response.error && response.error.code !== 'PGRST116') throw response.error;
                if (!response.data) return null;
                return {
                    ...response.data,
                    start_date: new Date(response.data.start_date),
                    end_date: new Date(response.data.end_date)
                } as Semester;
            })
        );
    }

    createSemester(semester: Omit<Semester, 'id'>): Observable<Semester> {
        const query = this.supabase.client.from('semesters').insert(semester).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return {
                    ...response.data,
                    start_date: new Date(response.data.start_date),
                    end_date: new Date(response.data.end_date)
                } as Semester;
            })
        );
    }

    updateSemester(id: string, updates: Partial<Semester>): Observable<Semester> {
        const query = this.supabase.client.from('semesters').update(updates).eq('id', id).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return {
                    ...response.data,
                    start_date: new Date(response.data.start_date),
                    end_date: new Date(response.data.end_date)
                } as Semester;
            })
        );
    }

    setActiveSemester(id: string): Observable<void> {
        return from(
            this.supabase.client.rpc('set_active_semester', { target_id: id })
        ).pipe(
            map(response => {
                if (response.error) {
                    throw response.error;
                }
            })
        );
    }

    private async fallbackSetActive(id: string): Promise<void> {
        await this.supabase.client.from('semesters').update({ is_active: false }).neq('id', id);
        await this.supabase.client.from('semesters').update({ is_active: true }).eq('id', id);
    }

    deleteSemester(id: string): Observable<void> {
        const query = this.supabase.client.from('semesters').delete().eq('id', id);
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
            })
        );
    }
}
