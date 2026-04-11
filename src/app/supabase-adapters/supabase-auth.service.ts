// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, from, map } from 'rxjs';
// import { IAuthService } from '../core/contracts/auth.interface';
// import { User, UserRole } from '../core/models/user.model';
// import { SupabaseService } from '../core/supabase.service';

// @Injectable({ providedIn: 'root' })
// export class SupabaseAuthService implements IAuthService {
//     private userSubject = new BehaviorSubject<User | null>(null);
//     currentUser$ = this.userSubject.asObservable();

//     private initializedSubject = new BehaviorSubject<boolean>(false);
//     isInitialized$ = this.initializedSubject.asObservable();

//     constructor(private supabase: SupabaseService) {
//         this.initializeAuthListener();
//         this.checkInitialSession();
//     }

//     private async checkInitialSession(): Promise<void> {
//         try {
//             // Add a 10s timeout to prevent initialization hang
//             const timeout = new Promise<void>((_, reject) =>
//                 setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
//             );

//             await Promise.race([
//                 (async () => {
//                     const { data: { session } } = await this.supabase.client.auth.getSession();
//                     if (session?.user) {
//                         await this.updateUserFromSession(session);
//                     } else {
//                         this.userSubject.next(null);
//                         this.initializedSubject.next(true);
//                     }
//                 })(),
//                 timeout
//             ]);
//         } catch (error) {
//             console.error('Auth initialization issue:', error);
//             // Fallback: mark as initialized and proceed as unauthenticated
//             this.userSubject.next(null);
//             this.initializedSubject.next(true);
//         }
//     }

//     private async updateUserFromSession(session: any): Promise<void> {
//         try {
//             const { data, error } = await this.supabase.client
//                 .from('users')
//                 .select('*')
//                 .eq('id', session.user.id)
//                 .single();

//             if (data && !error) {
//                 console.log(`[SupabaseAuth] Profile found for ${data.email}, role: ${data.role}`);
//                 this.userSubject.next({
//                     id: data.id,
//                     email: data.email,
//                     display_name: data.display_name,
//                     role: data.role as UserRole,
//                     created_at: new Date(data.created_at)
//                 });
//             } else {
//                 console.warn(`[SupabaseAuth] No profile found for user ${session.user.id}, defaulting to 'authenticated'`);
//                 this.userSubject.next({
//                     id: session.user.id,
//                     email: session.user.email || '',
//                     display_name: session.user.user_metadata?.['display_name'] || 'User',
//                     role: 'authenticated',
//                     created_at: new Date()
//                 });
//             }
//         } catch (error) {
//             console.error('Error updating user from session:', error);
//             // Don't modify user state on error, but ensure we mark as initialized
//         } finally {
//             this.initializedSubject.next(true);
//         }
//     }

//     private initializeAuthListener(): void {
//         this.supabase.client.auth.onAuthStateChange(async (event, session) => {
//             if (session?.user) {
//                 await this.updateUserFromSession(session);
//             } else {
//                 this.userSubject.next(null);
//                 this.initializedSubject.next(true);
//             }
//         });
//     }

//     signIn(email: string, password: string): Observable<User> {
//         return from(this.supabase.client.auth.signInWithPassword({ email, password })).pipe(
//             map(response => {
//                 if (response.error) throw response.error;
//                 if (!response.data.user) throw new Error('No user returned');

//                 return {
//                     id: response.data.user.id,
//                     email: response.data.user.email!,
//                     display_name: response.data.user.user_metadata?.['display_name'] || 'User',
//                     role: 'authenticated' as UserRole,
//                     created_at: new Date()
//                 };
//             })
//         );
//     }

//     signUp(email: string, password: string, displayName: string): Observable<User> {
//         return from(this.supabase.client.auth.signUp({
//             email,
//             password,
//             options: { data: { display_name: displayName } }
//         })).pipe(
//             map(response => {
//                 if (response.error) throw response.error;
//                 if (!response.data.user) throw new Error('No user returned');

//                 return {
//                     id: response.data.user.id,
//                     email: response.data.user.email!,
//                     display_name: displayName,
//                     role: 'authenticated' as UserRole,
//                     created_at: new Date()
//                 };
//             })
//         );
//     }

//     signOut(): Observable<void> {
//         return from(this.supabase.client.auth.signOut()).pipe(
//             map(response => {
//                 if (response.error) throw response.error;
//             })
//         );
//     }
// }
