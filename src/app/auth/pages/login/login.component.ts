import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { ToastService } from '../../../core/services/toast.service';
import { getAuthErrorMessage } from '../../../core/utils/auth-error-messages';
import { PasswordInputComponent } from "../../../core/components/password-input-component";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, PasswordInputComponent],
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnDestroy {
    authService = inject(AUTH_SERVICE);
    router = inject(Router);
    route = inject(ActivatedRoute);
    toastService = inject(ToastService);

    email = '';
    password = '';
    errorMessage = '';
    isLoading = false;
    showPassword = false;
    togglePassword() { this.showPassword = !this.showPassword; }
    cooldownSeconds = 0;
    private cooldownNextDuration = 5;  // seconds; doubles each failure, capped at 60
    private cooldownTimer: ReturnType<typeof setInterval> | null = null;

    get isDisabled(): boolean {
        return this.isLoading || this.cooldownSeconds > 0;
    }

    get buttonLabel(): string {
        if (this.isLoading) return 'Signing in…';
        if (this.cooldownSeconds > 0) return `Try again in ${this.cooldownSeconds}s`;
        return 'Sign In';
    }

    onSubmit() {
        if (!this.email || !this.password || this.isDisabled) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.signIn(this.email, this.password).subscribe({
            next: () => {
                this.isLoading = false;
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = getAuthErrorMessage(err.code || err.message || 'auth/internal-error');
                // this.toastService.error(this.errorMessage);
                this.startCooldown();
                // this.password = '';
            }
        });
    }

    private startCooldown() {
        this.cooldownSeconds = this.cooldownNextDuration;
        // Exponential backoff: double next time, cap at 60s
        this.cooldownNextDuration = Math.min(this.cooldownNextDuration * 2, 60);

        this.cooldownTimer = setInterval(() => {
            this.cooldownSeconds--;
            if (this.cooldownSeconds <= 0) {
                this.clearCooldown();
            }
        }, 1000);
    }

    private clearCooldown() {
        if (this.cooldownTimer) {
            clearInterval(this.cooldownTimer);
            this.cooldownTimer = null;
        }
        this.cooldownSeconds = 0;
    }

    ngOnDestroy() {
        this.clearCooldown();
    }
}