// import { Injectable, inject } from '@angular/core';
// import { Observable, from, map, switchMap, of } from 'rxjs';
// import { IRsvpService } from '../core/contracts/rsvp.interface';
// import { Seminar } from '../core/models/seminar.model';
// import { generateGoogleCalendarLink } from '../core/utils/calendar.util';
// import { SupabaseService } from '../core/supabase.service';
// import { SupabaseAuthService } from './supabase-auth.service';
// import { SupabaseSeminarService } from './supabase-seminar.service';

// @Injectable({ providedIn: 'root' })
// export class SupabaseRsvpService implements IRsvpService {
//     private supabase = inject(SupabaseService);
//     private auth = inject(SupabaseAuthService);
//     private seminars = inject(SupabaseSeminarService); // Assuming generic fetching exists on it

//     isAttending$(seminarId: string): Observable<boolean> {
//         return this.auth.currentUser$.pipe(
//             switchMap(user => {
//                 if (!user) return of(false);
//                 const query = this.supabase.client
//                     .from('rsvps')
//                     .select('*')
//                     .eq('user_id', user.id)
//                     .eq('seminar_id', seminarId)
//                     .single();

//                 return from(query).pipe(
//                     map(response => {
//                         // PGRST116 is 0 rows returned
//                         if (response.error && response.error.code !== 'PGRST116') throw response.error;
//                         return !!response.data;
//                     })
//                 );
//             })
//         );
//     }

//     getUserRsvps(): Observable<Seminar[]> {
//         return this.auth.currentUser$.pipe(
//             switchMap(user => {
//                 if (!user) return of([]);
//                 // This is a naive N+1 safe logic using an inner join query assumed to exist for rsvps
//                 const query = this.supabase.client
//                     .from('rsvps')
//                     .select('seminar_id')
//                     .eq('user_id', user.id);

//                 return from(query).pipe(
//                     switchMap(res => {
//                         if (res.error) throw res.error;
//                         const ids = res.data.map(r => r.seminar_id);
//                         if (ids.length === 0) return of([]);

//                         const req = this.supabase.client.from('seminars').select('*').in('id', ids);
//                         return from(req).pipe(
//                             map(seminarRes => {
//                                 if (seminarRes.error) throw seminarRes.error;
//                                 return seminarRes.data.map((item: any) => ({
//                                     ...item,
//                                     date_time: new Date(item.date_time)
//                                 })) as Seminar[];
//                             })
//                         );
//                     })
//                 );
//             })
//         );
//     }

//     addRsvp(seminarId: string): Observable<void> {
//         return this.auth.currentUser$.pipe(
//             switchMap(user => {
//                 if (!user) throw new Error('Must be authenticated');
//                 const query = this.supabase.client.from('rsvps').insert({
//                     user_id: user.id,
//                     seminar_id: seminarId
//                 });
//                 return from(query).pipe(map(({ error }) => { if (error) throw error; }));
//             })
//         );
//     }

//     removeRsvp(seminarId: string): Observable<void> {
//         return this.auth.currentUser$.pipe(
//             switchMap(user => {
//                 if (!user) throw new Error('Must be authenticated');
//                 const query = this.supabase.client.from('rsvps')
//                     .delete()
//                     .eq('user_id', user.id)
//                     .eq('seminar_id', seminarId);
//                 return from(query).pipe(map(({ error }) => { if (error) throw error; }));
//             })
//         );
//     }

//     getCalendarLink(seminar: Seminar): string {
//         return generateGoogleCalendarLink(seminar);
//     }
// }
