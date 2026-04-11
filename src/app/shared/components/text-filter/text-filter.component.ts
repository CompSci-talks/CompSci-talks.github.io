import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-text-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative rounded-xl shadow-sm group">
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg class="h-5 w-5 text-text-faint group-focus-within:text-primary transition-colors" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        [(ngModel)]="filterText"
        (ngModelChange)="onModelChange($event)"
        class="input-field block w-full pl-10"
        [placeholder]="placeholder"
      >
    </div>
  `
})
export class TextFilterComponent implements OnInit, OnDestroy {
  @Input() placeholder: number | string = 'Filter...';
  @Output() filterChange = new EventEmitter<string>();

  filterText: string = '';
  private filter$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.filter$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.filterChange.emit(value);
    });
  }

  onModelChange(value: string): void {
    this.filter$.next(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
