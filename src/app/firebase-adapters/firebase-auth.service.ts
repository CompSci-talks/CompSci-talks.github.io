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
    private readonly mailEndpoint = 'https://send-mail-gamma.vercel.app/api/send-mail';

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

        return from(sendEmailVerification(this.auth.currentUser, actionCodeSettings)).pipe(
            tap(() => {
                this.sendCompanionEmail({
                    to: this.auth.currentUser?.email ?? '',
                    subject: 'Confirm your CompSci Talks account',
                    html: this.buildVerificationCompanionHtml(this.auth.currentUser?.displayName || this.auth.currentUser?.email || 'there')
                });
            })
        );
    }

    sendPasswordResetEmail(email: string): Observable<void> {
        // Use ActionCodeSettings to point back to our reset-password page
        const actionCodeSettings = {
            url: window.location.origin + '/reset-password'
        };

        return from(sendPasswordResetEmail(this.auth, email, actionCodeSettings)).pipe(
            tap(() => {
                this.sendCompanionEmail({
                    to: email,
                    subject: 'Password reset requested for CompSci Talks',
                    html: this.buildResetCompanionHtml(email)
                });
            })
        );
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

    private sendCompanionEmail(payload: { to: string; subject: string; html: string }): void {
        if (!payload.to) return;

        void fetch(this.mailEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: payload.to,
                subject: payload.subject,
                html: payload.html
            })
        }).then(async res => {
            if (!res.ok) {
                const body = await res.text();
                throw new Error(body || 'Failed to send companion email');
            }
        }).catch(error => {
            // Non-blocking fallback: Firebase email is still the source of truth for auth links.
            console.warn('[FirebaseAuthService] Companion email failed:', error);
        });
    }

    private buildVerificationCompanionHtml(name: string): string {
        const safeName = this.escapeHtml(name);
        const verifyPageUrl = `${window.location.origin}/verify-email`;

        return `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827; line-height: 1.5;">
                <h2 style="margin-bottom: 8px;">Verify your email</h2>
                <p>Hi ${safeName},</p>
                <p>We sent your secure verification link via Firebase Authentication.</p>
                <p>If you cannot find it, check Spam/Junk, then use the button below to open the verification page and resend the link.</p>
                <p style="margin: 24px 0;">
                    <a href="${verifyPageUrl}" style="background:#0ea5e9;color:#ffffff;padding:12px 16px;border-radius:8px;text-decoration:none;display:inline-block;">Open Verification Page</a>
                </p>
                <p style="color:#6b7280;font-size:12px;">If you did not create an account, you can ignore this email.</p>
            </div>
        `;
    }

    private buildResetCompanionHtml(email: string): string {
        const safeEmail = this.escapeHtml(email);
        const forgotPasswordUrl = `${window.location.origin}/forgot-password`;

        return `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827; line-height: 1.5;">
                <h2 style="margin-bottom: 8px;">Password reset requested</h2>
                <p>We received a password reset request for <strong>${safeEmail}</strong>.</p>
                <p>Your secure reset link is sent by Firebase Authentication. If you don't see it, check Spam/Junk, then request a new one from the page below.</p>
                <p style="margin: 24px 0;">
                    <a href="${forgotPasswordUrl}" style="background:#0ea5e9;color:#ffffff;padding:12px 16px;border-radius:8px;text-decoration:none;display:inline-block;">Request New Reset Link</a>
                </p>
                <p style="color:#6b7280;font-size:12px;">If you did not request this change, you can ignore this email.</p>
            </div>
        `;
    }

    private escapeHtml(input: string): string {
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
