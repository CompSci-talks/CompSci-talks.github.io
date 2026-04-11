import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../core/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class EmailSelectionService {
    private selectedUsersSubject = new BehaviorSubject<User[]>([]);

    /**
     * Observable stream of currently selected user profiles for emailing.
     */
    get selectedUsers$(): Observable<User[]> {
        return this.selectedUsersSubject.asObservable();
    }

    /**
     * Set the entire list of selected users.
     */
    setSelectedUsers(users: User[]): void {
        this.selectedUsersSubject.next(users);
    }

    /**
     * Get the current value of selected users synchronously.
     */
    getSelectedUsers(): User[] {
        return this.selectedUsersSubject.getValue();
    }

    /**
     * Add a single user to the selection if not already present.
     */
    addSelectedUser(user: User): void {
        const current = this.getSelectedUsers();
        if (!current.some(u => u.id === user.id)) {
            this.selectedUsersSubject.next([...current, user]);
        }
    }

    /**
     * Remove a single user from the selection.
     */
    removeSelectedUser(id: string): void {
        const current = this.getSelectedUsers();
        this.selectedUsersSubject.next(current.filter(u => u.id !== id));
    }

    /**
     * Clear all selected users.
     */
    clearSelection(): void {
        this.selectedUsersSubject.next([]);
    }
}
