import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between border-t border-border bg-surface-card px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          (click)="onPrevious()"
          [disabled]="isFirstPage"
          class="relative inline-flex items-center rounded-lg border border-border bg-surface-card px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          (click)="onNext()"
          [disabled]="!hasMore"
          class="relative ml-3 inline-flex items-center rounded-lg border border-border bg-surface-card px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-text-muted">
            Page <span class="font-medium text-text-main">{{ currentPage }}</span>
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
            <button
              (click)="onPrevious()"
              [disabled]="isFirstPage"
              class="relative inline-flex items-center rounded-l-lg px-2 py-2 text-text-faint ring-1 ring-inset ring-border hover:bg-surface-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              (click)="onNext()"
              [disabled]="!hasMore"
              class="relative inline-flex items-center rounded-r-lg px-2 py-2 text-text-faint ring-1 ring-inset ring-border hover:bg-surface-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() hasMore: boolean = false;
  @Output() pageChange = new EventEmitter<'prev' | 'next'>();

  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  onPrevious(): void {
    if (!this.isFirstPage) {
      this.pageChange.emit('prev');
    }
  }

  onNext(): void {
    if (this.hasMore) {
      this.pageChange.emit('next');
    }
  }
}
