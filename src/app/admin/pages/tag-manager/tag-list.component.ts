import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { Tag } from '../../../core/models/seminar.model';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [CommonModule, PaginatedTableComponent],
  template: `
    <app-paginated-table
      [data]="tags"
      [loading]="loading"
      [columnCount]="3"
      [headerTemplate]="headerTmpl"
      [rowTemplate]="rowTmpl"
      [skeletonTemplate]="skeletonTmpl"
      emptyMessage="No tags found. Create your first tag to get started."
    >
      <ng-template #headerTmpl>
        <th class="th-cell text-left">Preview</th>
        <th class="th-cell text-left">Color Code</th>
        <th class="th-cell text-left">Actions</th>
      </ng-template>

      <ng-template #rowTmpl let-tag>
        <td class="px-6 py-4 whitespace-nowrap">
          <span [style.backgroundColor]="tag.color_code" class="px-3 py-1 rounded-full text-white text-xs font-bold shadow-sm">
            {{ tag.name }}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-medium text-text-main font-mono">{{ tag.color_code }}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex space-x-3">
            <button (click)="edit.emit(tag)" class="action-link-edit">Edit</button>
            <button (click)="onDelete.emit(tag.id)" class="action-link-delete">Delete</button>
          </div>
        </td>
      </ng-template>

      <ng-template #skeletonTmpl>
        <tr *ngFor="let i of [1,2,3,4,5]" class="animate-pulse">
          <td class="px-6 py-4"><div class="skeleton h-6 rounded-full w-20"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-4 w-1/2"></div></td>
          <td class="px-6 py-4"><div class="skeleton h-4 w-1/4"></div></td>
        </tr>
      </ng-template>
    </app-paginated-table>
  `
})
export class TagListComponent {
  @Input() tags: Tag[] = [];
  @Input() loading = false;
  @Output() edit = new EventEmitter<Tag>();
  @Output() onDelete = new EventEmitter<string>();
}
