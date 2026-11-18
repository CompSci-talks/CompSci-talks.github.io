import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UserManagementPageComponent } from './user-management-page.component';
import { USER_SERVICE } from '../../../core/contracts/user.service.interface';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { ToastService } from '../../../core/services/toast.service';

describe('User management pagination', () => {
    const profiles = Array.from({ length: 11 }, (_, i) => ({ id: 'user-' + i, display_name: 'Same name' }));
    let getUsers: ReturnType<typeof vi.fn>;
    function setup() {
        getUsers = vi.fn().mockReturnValue(of(profiles));
        TestBed.configureTestingModule({ providers: [
            { provide: USER_SERVICE, useValue: { getUsers } },
            { provide: AUTH_SERVICE, useValue: { currentUser$: of({ id: 'admin' }) } },
            { provide: Router, useValue: {} }, { provide: ToastService, useValue: {} }
        ] });
        TestBed.overrideComponent(UserManagementPageComponent, { set: { template: '', imports: [] } });
        const fixture = TestBed.createComponent(UserManagementPageComponent);
        fixture.detectChanges();
        return fixture.componentInstance;
    }
    it('uses lookahead and starts the next page after the last visible user', async () => {
        const page = setup();
        await vi.waitFor(() => expect(page.loading).toBe(false));
        expect(page.users).toHaveLength(10);
        expect(page.hasMore).toBe(true);
        getUsers.mockReturnValue(of([profiles[10]]));
        page.onPageChange('next');
        page.onPageChange('next'); // Repeated clicks while loading must not skip a page.
        await vi.waitFor(() => expect(page.loading).toBe(false));
        expect(getUsers).toHaveBeenLastCalledWith(11, profiles[9], '');
        expect(page.currentPage).toBe(2);
        expect(page.users).toEqual([profiles[10]]);
        expect(page.hasMore).toBe(false);
    });
    it('does not offer an empty next page for exactly ten users', async () => {
        const page = setup();
        getUsers.mockReturnValue(of(profiles.slice(0, 10)));
        await vi.waitFor(() => expect(page.loading).toBe(false));
        expect(page.hasMore).toBe(false);
    });
    it('shows a load failure and can retry without recreating the page', async () => {
        const page = setup();
        getUsers.mockReturnValue(throwError(() => Error('offline')));
        await vi.waitFor(() => expect(page.loadError).toContain('could not be loaded'));
        getUsers.mockReturnValue(of(profiles.slice(0, 3)));
        page.retry();
        await vi.waitFor(() => expect(page.users).toHaveLength(3));
        expect(page.loadError).toBe('');
    });
    it('resets pagination when the search changes', async () => {
        const page = setup();
        await vi.waitFor(() => expect(page.loading).toBe(false));
        page.onPageChange('next');
        await vi.waitFor(() => expect(page.loading).toBe(false));
        page.onFilterChange('Legacy');
        await vi.waitFor(() => expect(getUsers).toHaveBeenLastCalledWith(11, undefined, 'Legacy'));
        expect(page.currentPage).toBe(1);
    });
});
