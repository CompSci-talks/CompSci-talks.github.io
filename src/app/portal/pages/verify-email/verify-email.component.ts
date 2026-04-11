import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { ToastService } from '../../../core/services/toast.service';
import { take, interval, Subscription, switchMap, filter, distinctUntilChanged, shareReplay, catchError, of } from 'rxjs';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './verify-email.component.html',
    styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    private authService = inject(AUTH_SERVICE);
    private toastService = inject(ToastService);
    private router = inject(Router);

    user$ = this.authService.currentUser$.pipe(
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id && prev?.email_verified === curr?.email_verified),
        shareReplay(1)
    );
    isResending = false;
    isChecking = false;
    resendCooldown = 0;

    private pollingSub?: Subscription;
    private cooldownInterval?: any;

    private route = inject(ActivatedRoute);

    isVerifyingDirectly = false;

    ngOnInit() {
        const oobCode = this.route.snapshot.queryParams['oobCode'];

        if (oobCode) {
            this.handleDirectVerification(oobCode);
        }

        // Auto-check status every 5 seconds for polling
        this.pollingSub = interval(5000).pipe(
            switchMap(() => this.authService.reloadUser().pipe(
                catchError(() => of(null))
            )),
            switchMap(() => this.authService.currentUser$.pipe(take(1))),
            filter(user => !!user?.email_verified)
        ).subscribe({
            next: (user) => {
                if (user?.email_verified) {
                    this.toastService.success('Email verified successfully!');
                    this.router.navigate(['/']);
                }
            }
        });
    }

    private handleDirectVerification(code: string) {
        this.isVerifyingDirectly = true;
        this.authService.applyActionCode(code).pipe(take(1)).subscribe({
            next: () => {
                this.toastService.success('Email verified successfully!');
                this.authService.reloadUser().subscribe(() => {
                    this.router.navigate(['/']);
                });
            },
            error: (err) => {
                const errorMessage = 'Invalid or expired verification link.';
                this.toastService.error(errorMessage);
                this.isVerifyingDirectly = false;
            }
        });
    }

    ngOnDestroy() {
        this.pollingSub?.unsubscribe();
        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
        }
    }

    resendVerification() {
        if (this.resendCooldown > 0) return;

        this.isResending = true;
        this.authService.sendVerificationEmail().pipe(take(1)).subscribe({
            next: () => {
                this.toastService.success('Verification email sent! Please check your inbox.');
                this.isResending = false;
                this.startCooldown();
            },
            error: (err) => {
                this.toastService.error(err.message || 'Failed to send email. Please try again later.');
                this.isResending = false;
            }
        });
    }

    private startCooldown() {
        this.resendCooldown = 60;
        this.cooldownInterval = setInterval(() => {
            this.resendCooldown--;
            if (this.resendCooldown <= 0) {
                clearInterval(this.cooldownInterval);
            }
        }, 1000);
    }

    checkVerificationStatus() {
        this.isChecking = true;
        this.authService.reloadUser().pipe(take(1)).subscribe({
            next: () => {
                this.authService.currentUser$.pipe(take(1)).subscribe(user => {
                    if (user?.email_verified) {
                        this.toastService.success('Email verified successfully!');
                        this.router.navigate(['/']);
                    } else {
                        this.toastService.warning('Email not verified yet. Please check your inbox.');
                    }
                    this.isChecking = false;
                });
            },
            error: (err) => {
                this.toastService.error('Error checking status: ' + err.message);
                this.isChecking = false;
            }
        });
    }

    logout() {
        this.authService.signOut().subscribe(() => {
            this.router.navigate(['/login']);
        });
    }
}
