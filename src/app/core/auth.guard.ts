import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take, switchMap, filter } from 'rxjs';
import { AUTH_SERVICE } from './contracts/auth.interface';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AUTH_SERVICE);

    return authService.isInitialized$.pipe(
        filter(initialized => initialized),
        take(1),
        switchMap(() => authService.currentUser$.pipe(
            take(1),
            map(user => {
                if (user) {
                    if (!user.email_verified && state.url !== '/verify-email') {
                        console.log('[AuthGuard] Unverified user redirected to /verify-email');
                        return router.createUrlTree(['/verify-email']);
                    }
                    if (user.email_verified && state.url === '/verify-email') {
                        console.log('[AuthGuard] Verified user redirected away from /verify-email');
                        return router.createUrlTree(['/']);
                    }
                    return true;
                }

                // Store the attempted URL for redirecting after login
                return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
            })
        ))
    );
};
