export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
    timestamp: number;
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private readonly toasts = new BehaviorSubject<Toast[]>([]);

    // Default durations in milliseconds
    public static readonly DEFAULT_DURATION = 3000;   // success, info
    public static readonly WARNING_DURATION = 4000;   // warning
    public static readonly ERROR_DURATION = 5000;     // error
    /**
     * Observable stream of all active toast notifications.
     */
    readonly toasts$ = this.toasts.asObservable();

    /**
     * Display a toast notification.
     * @param type Semantic type of the toast.
     * @param message Content to display.
     * @param duration Optional duration in ms.
     */
    show(type: Toast['type'], message: string, duration?: number) {
        const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        const defaultDuration =
            type === 'error' ? ToastService.ERROR_DURATION :
                type === 'warning' ? ToastService.WARNING_DURATION :
                    ToastService.DEFAULT_DURATION;
        const toast: Toast = {
            id,
            type,
            message,
            duration: duration ?? defaultDuration,
            timestamp: Date.now()
        };

        // Limit to 5 most recent toasts (Story: Concurrent Notifications)
        const currentToasts = this.toasts.value;
        const newToasts = [toast, ...currentToasts].slice(0, 5);
        this.toasts.next(newToasts);

        if (toast.duration !== 0) {
            setTimeout(() => this.remove(id), toast.duration);
        }
    }

    success(message: string, duration?: number) {
        this.show('success', message, duration);
    }

    error(message: string, duration?: number) {
        this.show('error', message, duration);
    }

    warning(message: string, duration?: number) {
        this.show('warning', message, duration);
    }

    info(message: string, duration?: number) {
        this.show('info', message, duration);
    }

    /**
     * Remove a toast by its unique ID.
     */
    remove(id: string) {
        const currentToasts = this.toasts.value;
        this.toasts.next(currentToasts.filter(t => t.id !== id));
    }
}
