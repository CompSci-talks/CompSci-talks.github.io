import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleToggleComponent } from '../role-toggle/role-toggle.component';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RoleToggleComponent, PaginatedTableComponent],
  template: `
    <app-paginated-table
      [data]="users"
      [loading]="loading"
      [columnCount]="7"
      [headerTemplate]="header"
      [rowTemplate]="row"
      [skeletonTemplate]="skeleton"
      [showPagination]="true"
      [currentPage]="currentPage"
      [hasMore]="hasMore"
      (pageChange)="pageChange.emit($event)"
      [trackByProperty]="'uid'"
      emptyMessage="No users found."
    >
      <ng-template #header>
        <th scope="col" class="p-4 border-b border-border bg-surface-muted/50">
          <div class="flex items-center">
            <input id="checkbox-all-search" type="checkbox" (change)="toggleAll($event)" class="w-4 h-4 text-admin bg-surface border-border rounded focus:ring-admin focus:ring-2">
            <label for="checkbox-all-search" class="sr-only">checkbox</label>
          </div>
        </th>
        <th scope="col" class="th-cell">Name</th>
        <th scope="col" class="th-cell">Email</th>
        <th scope="col" class="th-cell">Role</th>
        <th scope="col" class="th-cell text-center">Attendance</th>
        <th scope="col" class="th-cell">Created</th>
        <th scope="col" class="th-cell">Action</th>
      </ng-template>

      <ng-template #row let-user>
        <td class="w-4 p-4 border-b border-border">
          <div class="flex items-center">
            <input [id]="'checkbox-' + user.id" type="checkbox" [checked]="selectedUserIds.has(user.id)" (change)="toggleUser(user.id)" class="w-4 h-4 text-admin bg-surface border-border rounded focus:ring-admin focus:ring-2">
            <label [for]="'checkbox-' + user.id" class="sr-only">Select {{ user.display_name }}</label>
          </div>
        </td>
        <th scope="row" (click)="viewDetail.emit(user.id)" class="flex items-center px-6 py-4 text-text-main whitespace-nowrap font-medium border-b border-border cursor-pointer hover:bg-surface-muted/30 transition-colors group">
          <img class="w-10 h-10 rounded-full group-hover:ring-2 group-hover:ring-admin/20 transition-all" [src]="user.photo_url || 'https://ui-avatars.com/api/?name=' + user.display_name" alt="{{user.display_name}} image">
          <div class="pl-3">
            <div class="flex items-center gap-2">
              <div class="text-base font-semibold group-hover:text-admin transition-colors">{{user.display_name}}</div>
              <!-- <span *ngIf="!user.email_verified" class="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-status-error/10 text-status-error border border-status-error/20">Unverified</span> -->
            </div>
            <div class="font-normal text-text-muted">Last active: {{user.last_active_at | date:'short'}}</div>
          </div>
        </th>
        <td class="td-cell">{{user.email}}</td>
        <td class="td-cell">
           <app-role-toggle 
             [role]="user.role" 
             [disabled]="user.id === currentUserId"
             (roleChange)="onRoleUpdate(user.id, $event)"
           ></app-role-toggle>
        </td>
        <td class="td-cell text-center font-medium">
          {{user.attendance_count || 0}}
        </td>
        <td class="td-cell">{{user.createdAt | date:'mediumDate'}}</td>
        <td class="td-cell">
          <button (click)="viewDetail.emit(user.id)" class="btn-link-admin font-medium hover:underline">View details</button>
        </td>
      </ng-template>

      <ng-template #skeleton>
        <tr *ngFor="let i of [1,2,3,4,5]" class="animate-pulse border-b border-border">
          <td class="p-4"><div class="w-4 h-4 bg-skeleton rounded"></div></td>
          <td class="px-6 py-4 flex items-center">
            <div class="w-10 h-10 rounded-full bg-skeleton"></div>
            <div class="pl-3">
              <div class="h-4 bg-skeleton rounded w-24 mb-2"></div>
              <div class="h-3 bg-skeleton rounded w-32"></div>
            </div>
          </td>
          <td class="px-6 py-4"><div class="h-4 bg-skeleton rounded w-40"></div></td>
          <td class="px-6 py-4"><div class="h-8 bg-skeleton rounded w-24"></div></td>
          <td class="px-6 py-4 text-center"><div class="h-4 bg-skeleton rounded w-8 mx-auto"></div></td>
          <td class="px-6 py-4"><div class="h-4 bg-skeleton rounded w-20"></div></td>
          <td class="px-6 py-4"><div class="h-4 bg-skeleton rounded w-16"></div></td>
        </tr>
      </ng-template>
    </app-paginated-table>
  `,
})
export class UserListComponent {
  @Input() users: User[] = [];
  @Input() loading: boolean = false;
  @Input() selectedUserIds: Set<string> = new Set();
  @Input() currentUserId: string | null = null;
  @Input() currentPage: number = 1;
  @Input() hasMore: boolean = false;

  @Output() viewDetail = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<Set<string>>();
  @Output() roleChange = new EventEmitter<{ uid: string, role: 'admin' | 'moderator' | 'authenticated' }>();
  @Output() pageChange = new EventEmitter<'prev' | 'next'>();

  onRoleUpdate(uid: string, role: 'admin' | 'moderator' | 'authenticated'): void {
    this.roleChange.emit({ uid, role });
  }

  toggleUser(uid: string): void {
    if (this.selectedUserIds.has(uid)) {
      this.selectedUserIds.delete(uid);
    } else {
      this.selectedUserIds.add(uid);
    }
    this.selectionChange.emit(this.selectedUserIds);
  }

  toggleAll(event: any): void {
    if (event.target.checked) {
      this.users.forEach((u) => this.selectedUserIds.add(u.id));
    } else {
      this.selectedUserIds.clear();
    }
    this.selectionChange.emit(this.selectedUserIds);
  }
}
