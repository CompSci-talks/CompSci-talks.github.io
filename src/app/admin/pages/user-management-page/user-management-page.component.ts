import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { USER_SERVICE } from '../../../core/contracts/user.service.interface';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { User as AppUser } from '../../../core/models/user.model';
import { UserListComponent } from '../../components/user-list/user-list.component';
import { TextFilterComponent } from '../../../shared/components/text-filter/text-filter.component';
import { ToastService } from '../../../core/services/toast.service';
import { BehaviorSubject, combineLatest, debounceTime, switchMap, tap, catchError, of } from 'rxjs';
import { EmailSelectionService } from '../../services/email-selection.service';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [CommonModule, UserListComponent, TextFilterComponent],
  template: `
    <div>

      <!-- Page header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div class="admin-page-header mb-0">
          <h1 class="admin-page-title">User Management</h1>
          <p class="admin-page-subtitle">Manage roles, view profiles, and send bulk emails.</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            [disabled]="selectedUserIds.size === 0"
            (click)="onEmailSelected()"
            class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Email ({{ selectedUserIds.size }})
          </button>
          <app-text-filter
            class="w-64"
            placeholder="Search by name or email..."
            (filterChange)="onFilterChange($event)"
          ></app-text-filter>
        </div>
      </div>

      <div *ngIf="loadError" role="alert" class="mb-4 p-4 border border-status-error rounded-lg">
        {{ loadError }} <button class="btn btn-outline ml-3" (click)="retry()">Retry</button>
      </div>
      <div class="admin-card" *ngIf="!loadError">
        <app-user-list
          [users]="users"
          [loading]="loading"
          [selectedUserIds]="selectedUserIds"
          [currentUserId]="currentUserId"
          [currentPage]="currentPage"
          [hasMore]="hasMore && !loading"
          (viewDetail)="onViewDetail($event)"
          (selectionChange)="onSelectionChange($event)"
          (roleChange)="onRoleChange($event)"
          (pageChange)="onPageChange($event)"
        ></app-user-list>
      </div>
    </div>
  `
})
export class UserManagementPageComponent implements OnInit {
  private userService = inject(USER_SERVICE);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AUTH_SERVICE);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private emailSelectionService = inject(EmailSelectionService);

  users: AppUser[] = [];
  loading = true;
  loadError = '';
  currentPage = 1;
  hasMore = false;
  selectedUserIds: Set<string> = new Set();
  currentUserId: string | null = null;

  private filter$ = new BehaviorSubject<string>('');
  private page$ = new BehaviorSubject<number>(1);
  private pageSize = 10;
  private lastUsers: (AppUser | undefined)[] = [undefined];

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.currentUserId = user?.id || null;
    });

    combineLatest([this.filter$, this.page$]).pipe(
      debounceTime(100),
      tap(() => { this.loading = true; this.loadError = ''; }),
      switchMap(([filter, page]) => {
        const lastUser = this.lastUsers[page - 1];
        return this.userService.getUsers(this.pageSize + 1, lastUser, filter).pipe(
          catchError(() => {
            this.loadError = 'Users could not be loaded. Check your connection and try again.';
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (users) => {
        this.loading = false;
        if (users === null) return;
        this.hasMore = users.length > this.pageSize;
        this.users = users.slice(0, this.pageSize);
        this.lastUsers[this.currentPage] = this.users.at(-1);
      }
    });
  }

  onFilterChange(filter: string): void {
    this.filter$.next(filter);
    this.currentPage = 1;
    this.page$.next(1);
    this.lastUsers = [undefined];
    this.selectedUserIds.clear();
  }

  retry(): void { this.page$.next(this.currentPage); }

  onPageChange(direction: 'prev' | 'next'): void {
    if (this.loading) return;
    if (direction === 'next' && this.hasMore) {
      this.loading = true;
      this.currentPage++;
      this.page$.next(this.currentPage);
    } else if (direction === 'prev' && this.currentPage > 1) {
      this.loading = true;
      this.currentPage--;
      this.page$.next(this.currentPage);
    }
  }

  onViewDetail(uid: string): void {
    this.router.navigate(['/admin/user', uid]);
  }

  onSelectionChange(selected: Set<string>): void {
    this.selectedUserIds = new Set(selected);
  }

  onRoleChange(event: { uid: string, role: 'admin' | 'moderator' | 'authenticated' }): void {
    this.userService.updateUserRole(event.uid, event.role).subscribe({
      next: () => this.toastService.success(`Role updated to ${event.role}`),
      error: () => this.toastService.error('Failed to update role')
    });
  }

  onEmailSelected(): void {
    if (this.selectedUserIds.size === 0) return;
    const selectedProfiles = this.users.filter(u => this.selectedUserIds.has(u.id));
    this.emailSelectionService.setSelectedUsers(selectedProfiles);
    this.router.navigate(['/admin/email-composer']);
  }
}
