import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take, switchMap, filter } from 'rxjs';
import { AUTH_SERVICE } from './contracts/auth.interface';
import { User } from './models/user.model';

/**
 * AdminGuard: Restricts access to routes based on the 'admin' role.
 * Redirects to /login if unauthorized.
 */
export const AdminGuard: CanActivateFn = () => {
    const authService = inject(AUTH_SERVICE);
    const router = inject(Router);

    return authService.isInitialized$.pipe(
        filter(initialized => initialized),
        take(1),
        switchMap(() => authService.currentUser$.pipe(
            take(1),
            map((user: User | null) => {
                if (user && user.role === 'admin') {
                    return true;
                }
                // If not admin, redirect to login (or home if already logged in but not admin)
                return router.createUrlTree(['/login']);
            })
        ))
    );
};
