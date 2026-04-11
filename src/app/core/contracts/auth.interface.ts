import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { InjectionToken } from '@angular/core';

export interface IAuthService {
    /** Emits the current user, or null if unauthenticated */
    currentUser$: Observable<User | null>;

    /** Emits true when the initial session check has completed */
    isInitialized$: Observable<boolean>;
    currentUser(): User | null;
    signIn(email: string, password: string): Observable<User>;
    signUp(email: string, password: string, displayName: string): Observable<User>;
    signOut(): Observable<void>;
    sendVerificationEmail(): Observable<void>;
    reloadUser(): Observable<void>;

    /** Requests a password reset email */
    sendPasswordResetEmail(email: string): Observable<void>;

    /** Verifies the reset code from the email */
    verifyPasswordResetCode(code: string): Observable<string>;

    /** Completes the password reset */
    confirmPasswordReset(code: string, newPassword: string): Observable<void>;

    /** Applies an auth action code (e.g. for email verification) */
    applyActionCode(code: string): Observable<void>;
}

export const AUTH_SERVICE = new InjectionToken<IAuthService>('AUTH_SERVICE');
