// import { Injectable, inject, OnDestroy } from '@angular/core';
// import { Observable, BehaviorSubject, from, map, switchMap, timeout } from 'rxjs';
// import { ICommentService } from '../core/contracts/comment.interface';
// import { Comment } from '../core/models/comment.model';
// import { SupabaseService } from '../core/supabase.service';
// import { SupabaseAuthService } from './supabase-auth.service';

// @Injectable({ providedIn: 'root' })
// export class SupabaseCommentService implements ICommentService, OnDestroy {
//     private supabase = inject(SupabaseService);
//     private auth = inject(SupabaseAuthService);

//     // We manage local subject state to merge realtime updates into
//     private commentsSubject = new BehaviorSubject<Comment[]>([]);
//     private currentSeminarId?: string;
//     private channel?: any;

//     // Cleanup subscription
//     ngOnDestroy() {
//         this.unsubscribeFromRealtime();
//     }

//     getCommentsForSeminar$(seminarId: string): Observable<Comment[]> {
//         this.currentSeminarId = seminarId;
//         this.commentsSubject.next([]); // reset
//         this.fetchInitialComments(seminarId);
//         this.subscribeToRealtime(seminarId);

//         return this.commentsSubject.asObservable();
//     }

//     submitComment(seminarId: string, text: string, parentId?: string): Observable<Comment> {
//         return this.auth.currentUser$.pipe(
//             switchMap(user => {
//                 if (!user) throw new Error('Unauthenticated user cannot leave comments');

//                 const payload: any = {
//                     seminar_id: seminarId,
//                     author_id: user.id,
//                     text: text
//                 };
//                 if (parentId) {
//                     payload.parent_id = parentId;
//                 }

//                 const query = this.supabase.client
//                     .from('comments')
//                     .insert(payload)
//                     .select('*, users!author_id(display_name)')
//                     .single();

//                 return from(query).pipe(
//                     map(response => {
//                         if (response.error) throw response.error;
//                         const data = response.data;
//                         return {
//                             ...data,
//                             created_at: new Date(data.created_at),
//                             author_name: data.users?.display_name || 'User'
//                         } as Comment;
//                     })
//                 );
//             })
//         );
//     }

//     getAllComments(): Observable<Comment[]> {
//         const query = this.supabase.client
//             .from('comments')
//             .select('*, users!author_id(display_name)')
//             .order('created_at', { ascending: false });

//         return from(query).pipe(
//             map(response => {
//                 if (response.error) throw response.error;
//                 return (response.data || []).map((d: any) => ({
//                     ...d,
//                     created_at: new Date(d.created_at),
//                     author_name: d.users?.display_name || 'User'
//                 })) as Comment[];
//             })
//         );
//     }

//     deleteComment(commentId: string): Observable<void> {
//         const query = this.supabase.client
//             .from('comments')
//             .delete()
//             .eq('id', commentId);

//         return from(query).pipe(
//             map(response => {
//                 if (response.error) throw response.error;
//                 return;
//             })
//         );
//     }

//     updateCommentStatus(commentId: string, isHidden: boolean): Observable<void> {
//         const query = this.supabase.client
//             .from('comments')
//             .update({ is_hidden: isHidden })
//             .eq('id', commentId);

//         return from(query).pipe(
//             map(response => {
//                 if (response.error) throw response.error;
//                 return;
//             })
//         );
//     }

//     private fetchInitialComments(seminarId: string) {
//         this.supabase.client
//             .from('comments')
//             .select('*, users!author_id(display_name)')
//             .eq('seminar_id', seminarId)
//             .eq('is_hidden', false)
//             .order('created_at', { ascending: true })
//             .then(response => {
//                 if (!response.error && response.data) {
//                     const cs = response.data.map((d: any) => ({
//                         ...d,
//                         created_at: new Date(d.created_at),
//                         author_name: d.users?.display_name || 'User'
//                     })) as Comment[];
//                     this.commentsSubject.next(cs);
//                 }
//             });
//     }

//     private subscribeToRealtime(seminarId: string) {
//         this.unsubscribeFromRealtime();

//         this.channel = this.supabase.client.channel('public:comments')
//             .on('postgres_changes', {
//                 event: 'INSERT',
//                 schema: 'public',
//                 table: 'comments',
//                 filter: `seminar_id=eq.${seminarId}`
//             }, async payload => {
//                 if (payload.new && !payload.new['is_hidden']) {
//                     // Realtime payload doesn't include joins. Fetch user separately.
//                     const { data: userData } = await this.supabase.client
//                         .from('users')
//                         .select('display_name')
//                         .eq('id', payload.new['author_id'])
//                         .single();

//                     const newC = {
//                         ...payload.new,
//                         created_at: new Date(payload.new['created_at']),
//                         author_name: userData?.display_name || 'User'
//                     } as Comment;

//                     // Always append chronologically so the reply flow behaves correctly in feed
//                     this.commentsSubject.next([...this.commentsSubject.value, newC]);
//                 }
//             })
//             .subscribe();
//     }

//     private unsubscribeFromRealtime() {
//         if (this.channel) {
//             this.supabase.client.removeChannel(this.channel);
//             this.channel = undefined;
//         }
//     }
// }
