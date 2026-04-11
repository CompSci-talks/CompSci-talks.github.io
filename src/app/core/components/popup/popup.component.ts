import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-popup',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative inline-block text-left">
      <div (click)="toggle($event)" class="cursor-pointer inline-flex items-center justify-center">
        <ng-content select="[trigger]"></ng-content>
      </div>

      <div *ngIf="isOpen" 
           class="absolute bg-surface border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden transition-all origin-top-right"
           [ngClass]="menuClass"
           (click)="closeOnMenuClick ? close() : null">
        <ng-content select="[menu]"></ng-content>
      </div>
    </div>
  `,
    styles: []
})
export class PopupComponent {
    /** Optional Tailwind classes for the menu container. Default puts it on the right with a margin-top and width. */
    @Input() menuClass: string = 'right-0 mt-2 w-36';

    /** Whether clicking an item inside the menu should automatically close the popup. */
    @Input() closeOnMenuClick: boolean = true;

    isOpen = false;

    constructor(private elementRef: ElementRef) { }

    toggle(event: MouseEvent) {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
    }

    close() {
        this.isOpen = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }
}
