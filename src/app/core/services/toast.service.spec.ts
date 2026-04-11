import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToastService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a toast and automatically remove it after duration', async () => {
        service.success('Test message', 100);
        let toasts: Toast[] = [];
        service.toasts$.subscribe(t => toasts = t);

        expect(toasts.length).toBe(1);
        expect(toasts[0].message).toBe('Test message');

        await new Promise(resolve => setTimeout(resolve, 150));
        expect(toasts.length).toBe(0);
    });

    it('should limit active toasts to 5', () => {
        for (let i = 1; i <= 10; i++) {
            service.info(`Message ${i}`);
        }

        let toasts: Toast[] = [];
        service.toasts$.subscribe(t => toasts = t);

        expect(toasts.length).toBe(5);
        // Should contain the most recent ones (10, 9, 8, 7, 6)
        expect(toasts[0].message).toBe('Message 10');
        expect(toasts[4].message).toBe('Message 6');
    });

    it('should remove a toast manually by ID', () => {
        service.info('To be removed');
        let toasts: Toast[] = [];
        service.toasts$.subscribe(t => toasts = t);

        const id = toasts[0].id;
        service.remove(id);
        expect(toasts.length).toBe(0);
    });

    it('should support warning type', () => {
        service.warning('Warning message');
        let toasts: Toast[] = [];
        service.toasts$.subscribe(t => toasts = t);
        expect(toasts[0].type).toBe('warning');
    });
});
