import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { ITagService } from '../core/contracts/tag.interface';
import { Tag } from '../core/models/seminar.model';
import { SupabaseService } from '../core/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class SupabaseTagService implements ITagService {
    private supabase = inject(SupabaseService);

    getTags(): Observable<Tag[]> {
        const query = this.supabase.client.from('tags').select('*').order('name');
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data as Tag[];
            })
        );
    }

    getTagById(id: string): Observable<Tag | null> {
        const query = this.supabase.client.from('tags').select('*').eq('id', id).single();
        return from(query).pipe(
            map(response => {
                if (response.error && response.error.code !== 'PGRST116') throw response.error;
                return response.data as Tag | null;
            })
        );
    }

    createTag(tag: Omit<Tag, 'id'>): Observable<Tag> {
        const query = this.supabase.client.from('tags').insert(tag).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data as Tag;
            })
        );
    }

    updateTag(id: string, updates: Partial<Tag>): Observable<Tag> {
        const query = this.supabase.client.from('tags').update(updates).eq('id', id).select().single();
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return response.data as Tag;
            })
        );
    }

    deleteTag(id: string): Observable<void> {
        const query = this.supabase.client.from('tags').delete().eq('id', id);
        return from(query).pipe(
            map(response => {
                if (response.error) throw response.error;
                return void 0;
            })
        );
    }
}
