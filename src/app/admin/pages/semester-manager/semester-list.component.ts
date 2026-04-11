import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Semester } from '../../../core/models/semester.model';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';

@Component({
  selector: 'app-semester-list',
  standalone: true,
  imports: [CommonModule, PaginatedTableComponent],
  template: `
    <app-paginated-table
      [data]="semesters"
      [loading]="loading"
      [columnCount]="5"
      [headerTemplate]="header"
      [rowTemplate]="row"
      [skeletonTemplate]="skeleton"
      [showPagination]="false"
      emptyMessage="No semesters found."
    >
      <ng-template #header>
        <th class="th-cell">Status</th>
        <th class="th-cell">Name</th>
        <th class="th-cell">Start Date</th>
        <th class="th-cell">End Date</th>
        <th class="th-cell text-right">Actions</th>
      </ng-template>

      <ng-template #row let-semester>
        <td class="px-6 py-4 whitespace-nowrap">
          <span *ngIf="semester.is_active" class="badge-success">ACTIVE</span>
          <span *ngIf="!semester.is_active" class="badge-neutral">INACTIVE</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-medium text-text-main">{{ semester.name }}</td>
        <td class="td-cell text-text-muted">{{ semester.start_date | date:'longDate' }}</td>
        <td class="td-cell text-text-muted">{{ semester.end_date | date:'longDate' }}</td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
          <button *ngIf="!semester.is_active" (click)="onActivate.emit(semester.id)" class="action-link-edit mr-4">Set Active</button>
          <button (click)="onEdit.emit(semester)" class="action-link-edit mr-4">Edit</button>
          <button (click)="onDelete.emit(semester.id)" class="action-link-delete">Delete</button>
        </td>
      </ng-template>

      <ng-template #skeleton>
        <tr *ngFor="let i of [1,2,3]" class="animate-pulse">
          <td class="px-6 py-4"><div class="skeleton h-6 rounded-full w-20"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-4 w-32"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-4 w-28"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-4 w-28"></div></td>
          <td class="px-6 py-4 text-right"><div class="skeleton h-4 w-32 ml-auto"></div></td>
        </tr>
      </ng-template>
    </app-paginated-table>
  `
})
export class SemesterListComponent {
  @Input() semesters: Semester[] = [];
  @Input() loading: boolean = false;
  @Output() onEdit = new EventEmitter<Semester>();
  @Output() onActivate = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();
}
