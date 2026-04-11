import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-paginated-grid',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="space-y-6">
      <div 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        [attr.aria-label]="ariaLabel || 'Data Grid'"
        role="list"
      >
        <!-- Loading State -->
        <ng-container *ngIf="loading">
          <ng-container *ngIf="skeletonTemplate; else defaultSkeleton">
            <ng-container *ngTemplateOutlet="skeletonTemplate"></ng-container>
          </ng-container>
          <ng-template #defaultSkeleton>
            <div *ngFor="let _ of [1,2,3,4,5,6]" class="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
          </ng-template>
        </ng-container>

        <!-- Data State -->
        <ng-container *ngIf="!loading && data.length > 0">
          <div *ngFor="let item of data; trackBy: trackByFn">
            <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item }"></ng-container>
          </div>
        </ng-container>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && data.length === 0" class="py-20 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p class="text-slate-500 font-medium">{{ emptyMessage }}</p>
      </div>

      <!-- Pagination -->
      <app-pagination
        *ngIf="showPagination"
        [currentPage]="currentPage"
        [hasMore]="hasMore"
        (pageChange)="pageChange.emit($event)"
      ></app-pagination>
    </div>
  `
})
export class PaginatedGridComponent {
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No items found.';
  @Input() showPagination = true;
  @Input() currentPage = 1;
  @Input() hasMore = false;
  @Input() trackByProperty?: string;
  @Input() ariaLabel: string = '';

  @Input() itemTemplate!: TemplateRef<any>;
  @Input() skeletonTemplate?: TemplateRef<any>;

  @Output() pageChange = new EventEmitter<'prev' | 'next'>();

  trackByFn(index: number, item: any): any {
    if (this.trackByProperty && item) {
      return item[this.trackByProperty];
    }
    return index;
  }
}
