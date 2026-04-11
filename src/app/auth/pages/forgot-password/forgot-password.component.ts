import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { ToastService } from '../../../core/services/toast.service';
import { take } from 'rxjs';
import { getAuthErrorMessage } from '../../../core/utils/auth-error-messages';


@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule
    ],
    templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
    private authService = inject(AUTH_SERVICE);
    private toastService = inject(ToastService);
    private router = inject(Router);

    email = '';
    isLoading = false;
    isSent = false;

    onSubmit() {
        if (!this.email) return;
        this.isLoading = true;

        this.authService.sendPasswordResetEmail(this.email).pipe(take(1)).subscribe({
            next: () => {
                this.isLoading = false;
                this.isSent = true;
                this.toastService.success('Password reset email sent!');
            },
            error: (err) => {
                this.isLoading = false;
                const errorMessage = getAuthErrorMessage(err.code || err.message || 'auth/internal-error');
                this.toastService.error(errorMessage);
            }
        });
    }
}
