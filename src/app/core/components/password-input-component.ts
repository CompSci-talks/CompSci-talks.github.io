import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PasswordInputComponent),
    multi: true
  }],
  template: `
        <div class="relative">
            <input [type]="showPassword ? 'text' : 'password'"
                [id]="inputId" [name]="inputId"
                [placeholder]="placeholder"
                [disabled]="isDisabled"
                [(ngModel)]="value"
                class="input-field pr-10">
            <button type="button" (click)="togglePassword()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors">
                <svg *ngIf="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg *ngIf="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 012.163-3.592m3.12-2.627A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.423 4.606M3 3l18 18"/>
                </svg>
            </button>
        </div>
    `
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() inputId = 'password';
  @Input() placeholder = '••••••••';

  showPassword = false;
  isDisabled = false;
  private _value = '';

  private onChange = (_: string) => { };
  private onTouched = () => { };

  togglePassword() { this.showPassword = !this.showPassword; }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
  }
  get value(): string { return this._value; }

  writeValue(val: string) { this._value = val ?? ''; }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(disabled: boolean) { this.isDisabled = disabled; }
}