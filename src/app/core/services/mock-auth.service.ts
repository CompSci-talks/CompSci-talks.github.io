// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable, of, throwError, delay } from 'rxjs';
// import { IAuthService } from '../contracts/auth.interface';
// import { User, UserRole } from '../models/user.model';

// @Injectable({ providedIn: 'root' })
// export class MockAuthService implements IAuthService {
//     private userSubject = new BehaviorSubject<User | null>(null);
//     currentUser$ = this.userSubject.asObservable();

//     private initializedSubject = new BehaviorSubject<boolean>(true); // Mocks are usually instantly ready
//     isInitialized$ = this.initializedSubject.asObservable();

//     private loadUser(): User | null {
//         const stored = localStorage.getItem('mock_user');
//         if (stored) {
//             try {
//                 const user = JSON.parse(stored);
//                 return { ...user, created_at: new Date(user.created_at) };
//             } catch (e) {
//                 return null;
//             }
//         }
//         return null;
//     }

//     private saveUser(user: User | null) {
//         if (user) {
//             localStorage.setItem('mock_user', JSON.stringify(user));
//         } else {
//             localStorage.removeItem('mock_user');
//         }
//         this.userSubject.next(user);
//     }

//     signIn(email: string, password: string): Observable<User> {
//         if (password === 'password') {
//             const user: User = {
//                 id: 'mock-user-123',
//                 email,
//                 display_name: email.split('@')[0],
//                 role: (email.includes('admin') ? 'admin' : 'authenticated') as UserRole,
//                 created_at: new Date()
//             };
//             this.saveUser(user);
//             return of(user).pipe(delay(500));
//         }
//         return throwError(() => new Error('Invalid credentials. Hint: use "password"'));
//     }

//     signUp(email: string, password: string, displayName: string): Observable<User> {
//         const user: User = {
//             id: 'mock-user-' + Math.floor(Math.random() * 1000),
//             email,
//             display_name: displayName,
//             role: 'authenticated' as UserRole,
//             created_at: new Date()
//         };
//         this.saveUser(user);
//         return of(user).pipe(delay(500));
//     }

//     signOut(): Observable<void> {
//         this.saveUser(null);
//         return of(undefined).pipe(delay(200));
//     }
// }
