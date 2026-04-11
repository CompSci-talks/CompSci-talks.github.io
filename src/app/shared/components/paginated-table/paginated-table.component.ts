import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
  <div class="shadow-sm sm:rounded-xl bg-surface-card border border-border">
    <div>
      <table
        class="w-full text-sm text-left text-text-muted"
        [attr.aria-label]="ariaLabel || 'Data Table'"
        role="grid"
      >
        <thead class="text-xs text-text-muted uppercase bg-surface-muted">
          <tr>
            <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">

          <!-- Loading State -->
          <ng-container *ngIf="loading">
            <ng-container *ngIf="skeletonTemplate; else defaultSkeleton">
              <ng-container *ngTemplateOutlet="skeletonTemplate"></ng-container>
            </ng-container>
            <ng-template #defaultSkeleton>
              <tr *ngFor="let _ of [1,2,3,4,5]" class="animate-pulse bg-surface-card">
                <td *ngFor="let col of columnCountArray" class="px-6 py-4">
                  <div class="h-4 bg-skeleton rounded w-3/4"></div>
                </td>
              </tr>
            </ng-template>
          </ng-container>

          <!-- Data State -->
          <ng-container *ngIf="!loading && data.length > 0">
            <tr *ngFor="let item of data; trackBy: trackByFn"
                class="bg-surface-card hover:bg-surface-muted transition-colors">
              <ng-container *ngTemplateOutlet="rowTemplate; context: { $implicit: item }"></ng-container>
            </tr>
          </ng-container>

          <!-- Empty State -->
          <tr *ngIf="!loading && data.length === 0">
            <td [attr.colspan]="columnCount" class="px-6 py-12 text-center text-text-muted">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 mb-4 text-text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-lg font-medium">{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>

        </tbody>
      </table>
    </div>

    <app-pagination
      *ngIf="showPagination"
      [currentPage]="currentPage"
      [hasMore]="hasMore"
      (pageChange)="pageChange.emit($event)"
    ></app-pagination>
  </div>
  `,
  styles: [`:host { display: block; width: 100%; }`]
})
export class PaginatedTableComponent {
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No results found.';
  @Input() columnCount: number = 1;
  @Input() showPagination: boolean = true;
  @Input() currentPage: number = 1;
  @Input() hasMore: boolean = false;
  @Input() trackByProperty?: string;
  @Input() ariaLabel: string = '';

  @Input() headerTemplate!: TemplateRef<any>;
  @Input() rowTemplate!: TemplateRef<any>;
  @Input() skeletonTemplate?: TemplateRef<any>;

  @Output() pageChange = new EventEmitter<'prev' | 'next'>();

  get columnCountArray(): number[] {
    return Array(this.columnCount).fill(0);
  }

  trackByFn(index: number, item: any): any {
    if (this.trackByProperty && item) {
      return item[this.trackByProperty];
    }
    return index;
  }
}