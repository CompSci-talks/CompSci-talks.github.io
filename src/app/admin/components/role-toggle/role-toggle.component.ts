import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <select 
      [(ngModel)]="role" 
      (ngModelChange)="onRoleChange($event)"
      [disabled]="disabled"
      class="bg-surface border border-border text-text-main text-sm rounded-lg focus:ring-admin focus:border-admin block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="authenticated">User</option>
      <option value="moderator">Moderator</option>
      <option value="admin">Admin</option>
    </select>
  `
})
export class RoleToggleComponent {
  @Input() role: 'admin' | 'moderator' | 'authenticated' = 'authenticated';
  @Input() disabled: boolean = false;
  @Output() roleChange = new EventEmitter<'admin' | 'moderator' | 'authenticated'>();

  onRoleChange(newRole: 'admin' | 'moderator' | 'authenticated'): void {
    this.roleChange.emit(newRole);
  }
}
