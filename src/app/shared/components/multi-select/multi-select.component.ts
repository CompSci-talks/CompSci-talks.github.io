import { Component, Input, forwardRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

interface SelectItem {
    id: string;
    name: string;
    [key: string]: any;
}

@Component({
    selector: 'app-multi-select',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectComponent),
            multi: true
        }
    ],
    template: `
    <div class="relative w-full" #container>
      <div class="flex flex-wrap gap-2 p-2 min-h-[50px] bg-surface-elevated border border-border rounded-xl
                  focus-within:ring-2 focus-within:ring-admin/20 focus-within:border-admin
                  transition-all cursor-text"
           (click)="focusInput()">

        <!-- Chips -->
        <div *ngFor="let item of selectedItems"
             class="flex items-center gap-1 px-2 py-1 bg-primary-light text-primary rounded-lg text-sm font-medium animate-fade-in">
          {{ item.name }}
          <button type="button" (click)="removeItem(item.id, $event)" class="hover:text-primary-hover">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Input -->
        <input #searchInput
               type="text"
               [(ngModel)]="searchQuery"
               (focus)="isOpen = true"
               [placeholder]="selectedItems.length ? '' : placeholder"
               class="flex-grow bg-transparent outline-none text-sm py-1 px-1 min-w-[120px] text-text-main placeholder:text-text-faint">
      </div>

      <!-- Dropdown -->
      <div *ngIf="isOpen && filteredItems.length > 0"
           class="absolute z-50 w-full mt-2 bg-surface-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in">
        <div *ngFor="let item of filteredItems"
             (click)="selectItem(item)"
             class="px-4 py-3 hover:bg-surface-muted cursor-pointer flex justify-between items-center transition-colors">
          <span class="text-sm text-text-main">{{ item.name }}</span>
          <div *ngIf="isSelected(item.id)" class="text-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <div *ngIf="isOpen && filteredItems.length === 0 && searchQuery"
           class="absolute z-50 w-full mt-2 bg-surface-card border border-border rounded-xl shadow-xl p-4 text-center text-text-faint italic text-sm animate-fade-in">
        No results found for "{{ searchQuery }}"
      </div>
    </div>
  `,
    styles: [`:host { display: block; width: 100%; }`]
})
export class MultiSelectComponent implements ControlValueAccessor {
    @Input() items: SelectItem[] = [];
    @Input() placeholder: string = 'Select options...';

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
    @ViewChild('container') container!: ElementRef;

    searchQuery = '';
    isOpen = false;
    selectedIds: string[] = [];

    onChange: any = () => { };
    onTouched: any = () => { };

    get selectedItems(): SelectItem[] {
        return this.items.filter(item => this.selectedIds.includes(item.id));
    }

    get filteredItems(): SelectItem[] {
        return this.items.filter(item =>
            item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
            !this.selectedIds.includes(item.id)
        );
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        if (!this.container.nativeElement.contains(event.target)) {
            this.isOpen = false;
            this.searchQuery = '';
        }
    }

    focusInput() {
        this.searchInput.nativeElement.focus();
        this.isOpen = true;
    }

    selectItem(item: SelectItem) {
        if (!this.selectedIds.includes(item.id)) {
            this.selectedIds = [...this.selectedIds, item.id];
            this.onChange(this.selectedIds);
            this.searchQuery = '';
        }
    }

    removeItem(id: string, event?: any) {
        if (event) event.stopPropagation();
        this.selectedIds = this.selectedIds.filter(itemId => itemId !== id);
        this.onChange(this.selectedIds);
    }

    handleBackspace(event: any) {
        if (this.searchQuery === '' && this.selectedIds.length > 0) {
            this.selectedIds.pop();
            this.onChange(this.selectedIds);
        }
    }

    isSelected(id: string): boolean {
        return this.selectedIds.includes(id);
    }

    writeValue(value: any): void {
        this.selectedIds = Array.isArray(value) ? value.filter((id: string) => !!id) : [];
    }

    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouched = fn; }
    setDisabledState?(isDisabled: boolean): void { }
}
