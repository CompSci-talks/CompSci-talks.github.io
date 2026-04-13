import { Injectable, inject, NgZone, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence, sendEmailVerification, sendPasswordResetEmail, verifyPasswordResetCode, confirmPasswordReset, applyActionCode } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, map, take, tap, switchMap, Subscription, throwError } from 'rxjs';
import { IAuthService } from '../core/contracts/auth.interface';
import { USER_SERVICE } from '../core/contracts/user.service.interface';
import { User, UserRole } from '../core/models/user.model';
import { Firestore } from '@angular/fire/firestore';
import { isNameUnique } from '../core/utils/firestore-utils';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAuthService implements IAuthService {
    private zone = inject(NgZone);
    private auth = inject(Auth);
    private userService = inject(USER_SERVICE);
    private firestore = inject(Firestore);

    private userSubject = new BehaviorSubject<User | null>(null);
    private initializedSubject = new BehaviorSubject<boolean>(false);

    currentUser$ = this.userSubject.asObservable();
    isInitialized$ = this.initializedSubject.asObservable();

    private profileSub?: Subscription;
    currentUserSignal = signal<User | null>(null);

    constructor() {
        onAuthStateChanged(this.auth, (firebaseUser) => {
            console.log('[FirebaseAuthService] Auth state changed. User:', firebaseUser?.email);
            this.profileSub?.unsubscribe();

            if (firebaseUser) {
                console.log('[FirebaseAuthService] Subscribing to profile for UID:', firebaseUser.uid);
                this.profileSub = this.userService.getUserById$(firebaseUser.uid).subscribe(profile => {
                    console.log('[FirebaseAuthService] Received profile update:', profile);
                    this.zone.run(() => {
                        const mappedUser = this.mapFirebaseUser(firebaseUser, profile?.role, profile?.photo_url, profile?.display_name);
                        console.log('[FirebaseAuthService] Emitting user with role:', mappedUser.role);
                        this.userSubject.next(mappedUser);
                        this.currentUserSignal.set(mappedUser);

                        if (!this.initializedSubject.value) {
                            this.initializedSubject.next(true);
                        }
                    });
                });
            } else {
                this.zone.run(() => {
                    this.userSubject.next(null);
                    this.currentUserSignal.set(null);
                    if (!this.initializedSubject.value) {
                        this.initializedSubject.next(true);
                    }
                });
            }
        });
    }

    currentUser(): User | null {
        return this.currentUserSignal();
    }

    signIn(email: string, password: string): Observable<User> {
        return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
            switchMap(credential => this.userService.getUserById(credential.user.uid).pipe(
                map(profile => this.mapFirebaseUser(credential.user, profile?.role, profile?.photo_url, profile?.display_name))
            )),
            tap(user => this.userSubject.next(user))
        );
    }

    signUp(email: string, password: string, displayName: string): Observable<User> {
        return from(isNameUnique(this.firestore, 'users', 'display_name', displayName)).pipe(
            switchMap(isUnique => {
                if (!isUnique) return throwError(() => new Error('custom/display-name-already-taken'));
                return from(createUserWithEmailAndPassword(this.auth, email, password));
            }),
            switchMap(credential => {
                const firebaseUser = credential.user;
                const user = this.mapFirebaseUser(firebaseUser, undefined, undefined, displayName);

                const profile: User = {
                    id: firebaseUser.uid,
                    display_name: displayName || firebaseUser.displayName || 'Authenticated User',
                    email: firebaseUser.email || email,
                    role: 'authenticated',
                    email_verified: false,
                    created_at: new Date(),
                    last_active_at: new Date(),
                    attendance_count: 0,
                    attended_seminar_ids: [],
                    preferred_topic_areas: []
                };

                return this.userService.createUser(profile).pipe(
                    map(() => user)
                );
            })
        );
    }

    signOut(): Observable<void> {
        return from(signOut(this.auth));
    }

    sendVerificationEmail(): Observable<void> {
        if (!this.auth.currentUser) return throwError(() => new Error('No user logged in'));

        // Use ActionCodeSettings to point back to our verify-email page
        const actionCodeSettings = {
            url: window.location.origin + '/verify-email'
        };

        return from(sendEmailVerification(this.auth.currentUser, actionCodeSettings));
    }

    sendPasswordResetEmail(email: string): Observable<void> {
        // Use ActionCodeSettings to point back to our reset-password page
        const actionCodeSettings = {
            url: window.location.origin + '/reset-password'
        };

        return from(sendPasswordResetEmail(this.auth, email, actionCodeSettings));
    }

    verifyPasswordResetCode(code: string): Observable<string> {
        return from(verifyPasswordResetCode(this.auth, code));
    }

    confirmPasswordReset(code: string, newPassword: string): Observable<void> {
        return from(confirmPasswordReset(this.auth, code, newPassword));
    }

    applyActionCode(code: string): Observable<void> {
        return from(applyActionCode(this.auth, code));
    }

    reloadUser(): Observable<void> {
        if (!this.auth.currentUser) return throwError(() => new Error('No user logged in'));
        return from(this.auth.currentUser.reload()).pipe(
            tap(() => {
                const firebaseUser = this.auth.currentUser;
                if (firebaseUser) {
                    // Manually trigger a refresh of the user object to pick up emailVerified change
                    this.userService.getUserById(firebaseUser.uid).pipe(take(1)).subscribe(profile => {
                        this.zone.run(() => {
                            const mappedUser = this.mapFirebaseUser(firebaseUser, profile?.role, profile?.photo_url, profile?.display_name);
                            this.userSubject.next(mappedUser);
                            this.currentUserSignal.set(mappedUser);
                        });
                    });
                }
            })
        );
    }

    private mapFirebaseUser(firebaseUser: FirebaseUser, role?: UserRole, photoURL?: string | null, displayName?: string): User {
        return {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            display_name: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            role: role || 'authenticated',
            photo_url: photoURL || firebaseUser.photoURL || null,
            email_verified: firebaseUser.emailVerified,
            created_at: new Date()
        };
    }
}