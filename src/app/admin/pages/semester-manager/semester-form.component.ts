import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Semester } from '../../../core/models/semester.model';

@Component({
  selector: 'app-semester-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-surface-card p-6 rounded-xl border border-border shadow-premium">
      <h3 class="text-lg font-bold text-text-main mb-4 font-display">{{ semester ? 'Edit' : 'New' }} Semester</h3>
      
      <form [formGroup]="semesterForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-text-main mb-1">Semester Name</label>
          <input type="text" formControlName="name" placeholder="e.g. Spring 2026"
                 class="input-field w-full">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-text-main mb-1">Start Date</label>
            <input type="date" formControlName="start_date"
                   class="input-field w-full">
          </div>
          <div>
            <label class="block text-sm font-medium text-text-main mb-1">End Date</label>
            <input type="date" formControlName="end_date"
                   class="input-field w-full">
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button type="button" (click)="onCancel.emit()"
                  class="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" [disabled]="semesterForm.invalid"
                  class="btn btn-primary min-w-[140px]">
            Save Semester
          </button>
        </div>
      </form>
    </div>
  `
})
export class SemesterFormComponent {
  @Input() semester: Semester | null = null;
  @Output() onSave = new EventEmitter<Omit<Semester, 'id'>>();
  @Output() onCancel = new EventEmitter<void>();

  semesterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.semesterForm = this.fb.group({
      name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      is_active: [false]
    });
  }

  ngOnInit() {
    if (this.semester) {
      this.semesterForm.patchValue({
        name: this.semester.name,
        start_date: this.formatDate(this.semester.start_date),
        end_date: this.formatDate(this.semester.end_date),
        is_active: this.semester.is_active
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.semesterForm.valid) {
      const val = this.semesterForm.value;
      this.onSave.emit({
        ...val,
        start_date: new Date(val.start_date),
        end_date: new Date(val.end_date)
      });
    }
  }
}
