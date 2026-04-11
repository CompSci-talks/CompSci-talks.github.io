import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { ToastService } from '../../../core/services/toast.service';
import { getAuthErrorMessage } from '../../../core/utils/auth-error-messages';
import { PasswordInputComponent } from '../../../core/components/password-input-component';


@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, PasswordInputComponent],
    templateUrl: './register.component.html'
})
export class RegisterComponent {
    authService = inject(AUTH_SERVICE);
    router = inject(Router);
    toastService = inject(ToastService);
    displayName = '';
    email = '';
    password = '';
    confirmPassword = '';
    errorMessage = '';
    isLoading = false;

    onSubmit() {
        if (!this.email || !this.password || !this.displayName) return;
        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match';
            this.toastService.error(this.errorMessage);
            return;
        }
        this.isLoading = true;
        this.errorMessage = '';

        this.authService.signUp(this.email, this.password, this.displayName).subscribe({
            next: () => {
                // Trigger verification email immediately
                this.isLoading = false;
                this.authService.sendVerificationEmail().subscribe();
                this.toastService.success('Registration successful. Please verify your email.');
                this.router.navigate(['/verify-email']);
            },
            error: (err) => {
                this.errorMessage = getAuthErrorMessage(err.code || err.message || 'auth/internal-error');
                // this.toastService.error(this.errorMessage);
                this.isLoading = false;
            }
        });
    }
}
