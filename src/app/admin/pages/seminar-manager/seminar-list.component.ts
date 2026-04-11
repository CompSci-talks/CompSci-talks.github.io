import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Seminar } from '../../../core/models/seminar.model';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-seminar-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginatedTableComponent, DurationPipe],
  template: `
    <app-paginated-table
      [data]="seminars"
      [loading]="loading"
      [columnCount]="7"
      [headerTemplate]="header"
      [rowTemplate]="row"
      [skeletonTemplate]="skeleton"
      [showPagination]="false"
      emptyMessage="No seminars scheduled."
    >
      <ng-template #header>
        <th class="th-cell">Date & Time</th>
        <th class="th-cell">Seminar Title</th>
        <th class="th-cell">Location</th>
        <th class="th-cell text-center">Duration</th>
        <th class="th-cell text-center">Attendees</th>
        <th class="th-cell">Status</th>
        <th class="th-cell text-right">Actions</th>
      </ng-template>

      <ng-template #row let-seminar>
        <td class="td-cell text-text-muted">{{ seminar.date_time | date:'short' }}</td>
        <td class="px-6 py-4">
          <a [routerLink]="['/seminar', seminar.id]" class="font-medium text-text-main hover:text-primary transition-colors">{{ seminar.title }}</a>
        </td>
        <td class="td-cell text-text-muted">{{ seminar.location }}</td>
        <td class="td-cell text-center font-medium">{{ seminar.duration | duration }}</td>
        <td class="td-cell text-center font-medium text-primary">{{ getRSVPCount(seminar) }}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span *ngIf="!seminar.is_hidden" class="badge-success">Visible</span>
          <span *ngIf="seminar.is_hidden" class="badge-warning">Hidden</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
          <a [routerLink]="['/admin/seminar', seminar.id, 'attendance']" class="action-link-admin mr-4">Attendance</a>
          <button (click)="edit.emit(seminar)" class="action-link-edit mr-4">Edit</button>
          <button (click)="delete.emit(seminar.id)" class="action-link-delete">Delete</button>
          <!-- <button (click)="edit.emit(seminar)">Edit</button>
          <button (click)="delete.emit(seminar.id)">Delete</button> -->

        </td>
      </ng-template>

      <ng-template #skeleton>
        <tr *ngFor="let i of [1,2,3,4,5]" class="animate-pulse">
          <td class="px-6 py-4"><div class="skeleton h-4 w-32"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-4 w-48"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-4 w-32"></div></td>
          <td class="px-6 py-4 text-center"><div class="skeleton h-4 w-12 mx-auto"></div></td>
          <td class="px-6 py-4 text-center"><div class="skeleton h-4 w-8 mx-auto"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-6 w-16"></div></td>
          <td class="px-6 py-4 text-right"><div class="skeleton h-4 w-24 ml-auto"></div></td>
        </tr>
      </ng-template>
    </app-paginated-table>
  `
})
export class SeminarListComponent {
  @Input() seminars: Seminar[] = [];
  @Input() loading: boolean = false;
  @Output() edit = new EventEmitter<Seminar>();
  @Output() delete = new EventEmitter<string>();

  getRSVPCount(seminar: Seminar): number {
    return seminar.stats?.rsvp_count || 0;
  }
}
