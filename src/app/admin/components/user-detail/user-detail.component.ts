import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-8 border-border">
      <div class="flex flex-col items-center text-center mb-8">
 
        <!-- Avatar -->
        <div class="relative mb-4 group">
          @if (user.photo_url) {
            <div class="relative">
              <img [src]="user.photo_url" [alt]="user.display_name"
                   class="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-premium group-hover:scale-105 transition-transform duration-300">
              <div class="absolute inset-0 rounded-full shadow-inner"></div>
            </div>
          } @else {
            <div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-surface shadow-premium group-hover:scale-105 transition-transform duration-300">
              {{ user.display_name.charAt(0).toUpperCase() }}
            </div>
          }
        </div>
 
        <h2 class="text-2xl font-bold text-heading tracking-tight">{{ user.display_name }}</h2>
        <div class="mt-2">
          <span class="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border"
            [class.bg-role-admin-bg]="user.role === 'admin'"
            [class.text-role-admin-text]="user.role === 'admin'"
            [class.border-role-admin-text/20]="user.role === 'admin'"
            [class.bg-role-moderator-bg]="user.role === 'moderator'"
            [class.text-role-moderator-text]="user.role === 'moderator'"
            [class.border-role-moderator-text/20]="user.role === 'moderator'"
            [class.bg-role-user-bg]="user.role === 'authenticated'"
            [class.text-role-user-text]="user.role === 'authenticated'"
            [class.border-role-user-text/20]="user.role === 'authenticated'"
          >{{ user.role }}</span>
        </div>
 
        <!-- Edit button — only shown on own profile -->
        @if (allowEdit) {
          <button (click)="onEditPhoto.emit()"
                  class="mt-4 btn btn-outline btn-sm gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"/>
            </svg>
            Edit
          </button>
        }
      </div>
 
      <div class="space-y-6 pt-6 border-t border-border">
        <div>
          <label class="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1">Email Address</label>
          <p class="text-sm text-text-main font-medium">{{ user.email }}</p>
        </div>
        <div>
          <label class="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1">Account Created</label>
          <p class="text-sm text-text-main font-medium">{{ user.enrollment_date | date:'mediumDate' }}</p>
        </div>
        <div>
          <label class="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-1">Last Activity</label>
          <p class="text-sm text-text-main font-medium">{{ user.last_active_at | date:'medium' }}</p>
        </div>
        <div>
          <label class="text-[10px] font-bold text-text-faint uppercase tracking-widest block mb-2">Interests</label>
          <div class="flex flex-wrap gap-2">
            @for (topic of user.preferred_topic_areas; track topic) {
              <span class="px-2.5 py-1 bg-surface-muted/50 border border-border text-[10px] font-bold uppercase rounded-md text-text-muted">
                {{ topic }}
              </span>
            } @empty {
              <span class="text-sm text-text-faint italic font-medium">None specified</span>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserDetailComponent {
  @Input({ required: true }) user!: User;
  @Input() allowEdit = false;
  @Output() onEditPhoto = new EventEmitter<void>();
}