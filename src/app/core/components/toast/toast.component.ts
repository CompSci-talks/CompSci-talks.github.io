import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    animations: [
        trigger('fade', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
            ]),
        ]),
    ],
})
export class ToastComponent {
    private toastService = inject(ToastService);
    /**
     * Observable of all active toasts from the service.
     */
    toasts$ = this.toastService.toasts$;

    /**
     * Manually remove a toast via the service.
     * @param toast The toast object to remove.
     */
    remove(toast: Toast) {
        this.toastService.remove(toast.id);
    }
}
