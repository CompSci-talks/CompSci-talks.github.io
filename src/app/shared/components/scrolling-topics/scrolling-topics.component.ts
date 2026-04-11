import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag } from '../../../core/models/seminar.model';

@Component({
    selector: 'app-scrolling-topics',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative w-full h-[400px] overflow-hidden flex items-center justify-center bg-surface-card rounded-2xl border border-border shadow-xl">
      
      <!-- Fading edges to blend with the container -->
      <div class="absolute inset-0 z-20 pointer-events-none rounded-2xl"
           style="background: linear-gradient(to bottom, var(--surface-card) 0%, transparent 20%, transparent 80%, var(--surface-card) 100%);">
      </div>

      <!-- Scrolling container -->
      <div #scrollContainer 
           class="w-full h-full overflow-y-auto hide-scrollbar snap-y snap-mandatory relative z-10"
           style="mask-image: linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 40%, black 60%, transparent 100%);"
           (scroll)="onScroll()">
        
        <!-- Padding blocks to center the first and last items -->
        <div class="h-[150px]"></div>

        <div class="flex flex-col items-center">
          <ng-container *ngFor="let tag of displayTags; let i = index; trackBy: trackById">
            <div class="h-[100px] w-full flex items-center justify-center snap-center select-none"
                 (click)="scrollToIndex(i)">
              <span class="text-3xl lg:text-5xl font-display font-medium text-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer tracking-tight"
                    [class]="i === activeIndex ? 'opacity-100 scale-100 text-text-main' : 'opacity-30 scale-95 text-text-muted hover:opacity-60'">
                {{ tag.name }}
              </span>
            </div>
          </ng-container>
        </div>

        <div class="h-[150px]"></div>
      </div>
    </div>
  `,
    styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class ScrollingTopicsComponent implements AfterViewInit, OnDestroy {
    @Input() set tags(value: Tag[] | null) {
        if (value && value.length > 0) {
            // Duplicate tags to allow an infinite-scroll feel without actual infinite scroll
            this.displayTags = [...value, ...value, ...value, ...value];
            // Start somewhere in the middle (second cycle) to allow scrolling up
            setTimeout(() => this.scrollToIndex(value.length, false), 100);
        }
    }

    displayTags: Tag[] = [];
    activeIndex = 0;

    @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

    private autoScrollInterval: any;

    ngAfterViewInit() {
        this.startAutoScroll();
    }

    ngOnDestroy() {
        this.stopAutoScroll();
    }

    onScroll() {
        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const scrollTop = container.scrollTop;
        const itemHeight = 100;

        this.activeIndex = Math.round(scrollTop / itemHeight);
    }

    scrollToIndex(index: number, smooth: boolean = true) {
        if (!this.scrollContainer) return;
        const container = this.scrollContainer.nativeElement;
        const itemHeight = 100;
        container.scrollTo({ top: index * itemHeight, behavior: smooth ? 'smooth' : 'auto' });
        this.activeIndex = index;
    }

    startAutoScroll() {
        this.autoScrollInterval = setInterval(() => {
            if (!this.scrollContainer) return;
            const container = this.scrollContainer.nativeElement;

            // Pause animation if user is hovering over the scrolling container
            if (!container.matches(':hover')) {
                let nextIndex = this.activeIndex + 1;
                if (nextIndex >= this.displayTags.length - 2) {
                    // Seamlessly reset to first set of tags
                    const baseLength = this.displayTags.length / 4;
                    this.scrollToIndex(baseLength, false); // jump invisibly
                    nextIndex = baseLength + 1;
                }
                // Tiny delay to ensure the invisible jump registers before smooth scrolling again
                setTimeout(() => this.scrollToIndex(nextIndex), 50);
            }
        }, 2500); // changes every 2.5 seconds
    }

    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
        }
    }

    trackById(index: number, item: Tag) {
        return index + '-' + item.id;
    }
}
