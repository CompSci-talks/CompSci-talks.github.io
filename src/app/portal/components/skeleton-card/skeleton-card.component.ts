import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card flex flex-col w-full h-full animate-pulse-skeleton overflow-hidden">
      <!-- Thumbnail Skeleton -->
      <div class="h-48 w-full bg-surface-muted"></div>

      <!-- Content Skeleton -->
      <div class="p-4 flex flex-col flex-grow bg-white">
        <!-- Tags & Date -->
        <div class="flex items-center gap-2 mb-3">
          <div class="h-5 w-16 bg-surface-muted rounded-full"></div>
          <div class="h-4 w-24 bg-surface-muted rounded ml-auto"></div>
        </div>

        <!-- Title (Matching min-h-[3.5rem]) -->
        <div class="mb-4">
          <div class="h-6 w-11/12 bg-surface-muted rounded mb-2"></div>
          <div class="h-6 w-2/3 bg-surface-muted rounded"></div>
        </div>
        
        <!-- Speaker -->
        <div class="h-4 w-1/2 bg-surface-muted rounded mb-6"></div>

        <!-- Footer Info -->
        <div class="mt-auto flex items-center gap-2">
          <div class="h-4 w-4 bg-surface-muted rounded-full"></div>
          <div class="h-4 w-40 bg-surface-muted rounded"></div>
        </div>
      </div>
    </div>
  `,
  host: {
    'class': 'block h-full w-full'
  }
})
export class SkeletonCardComponent { }
