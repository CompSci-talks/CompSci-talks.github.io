import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_SERVICE } from './contracts/auth.interface';
import { map, take } from 'rxjs';

export const verifiedOrGuestGuard = () => {
    const authService = inject(AUTH_SERVICE);
    const router = inject(Router);

    return authService.currentUser$.pipe(
        take(1),
        map(user => {
            if (!user) return true;

            if (user.email_verified) return true;

            router.navigate(['/verify-email']);
            return false;
        })
    );
};