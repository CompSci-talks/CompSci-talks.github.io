import { TestBed } from '@angular/core/testing';
import { UserDetailComponent } from './user-detail.component';
import { User } from '../../../core/models/user.model';

describe('Account creation date', () => {
    it('renders created_at rather than the enrollment date', () => {
        const fixture = TestBed.createComponent(UserDetailComponent);
        fixture.componentRef.setInput('user', {
            id: 'member', display_name: 'Member', email: 'member@example.com', role: 'authenticated',
            email_verified: true, created_at: new Date(2026, 9, 1), enrollment_date: new Date(2026, 10, 18)
        } satisfies User);
        fixture.detectChanges();
        const labels = Array.from(fixture.nativeElement.querySelectorAll('label')) as HTMLLabelElement[];
        const account = labels.find(label => label.textContent?.includes('Account Created'))!;
        expect(account.nextElementSibling?.textContent).toContain('Oct 1, 2026');
        fixture.componentRef.setInput('user', { ...fixture.componentInstance.user, created_at: null });
        fixture.detectChanges();
        expect(account.nextElementSibling?.textContent).toContain('Not recorded');
    });
});
