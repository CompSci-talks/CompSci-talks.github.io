import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserActivity } from '../../../core/models/user-activity.model';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flow-root">
      <ul role="list" class="-mb-8">
        <li *ngFor="let activity of activities; let last = last">
          <div class="relative pb-8">
            <span *ngIf="!last" class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true"></span>
            <div class="relative flex space-x-3">
              <div>
                <span [class]="getIconClass(activity.type)" class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-surface">
                   <ng-container [ngSwitch]="activity.type">
                     <!-- Icons for different activities -->
                     <svg *ngSwitchCase="'seminar_attendance'" class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
                     <svg *ngSwitchCase="'comment_posted'" class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>
                     <svg *ngSwitchDefault class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                   </ng-container>
                </span>
              </div>
              <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                <div>
                  <p class="text-sm text-text-muted">
                    {{ getDescription(activity) }}
                    <span class="font-medium text-text-main">{{ activity.metadata['title'] || activity.metadata['seminarTitle'] }}</span>
                  </p>
                  <p *ngIf="activity.metadata['content']" class="mt-1 text-sm text-text-muted bg-surface-muted p-2 rounded border border-border">
                    "{{ activity.metadata['content'] }}"
                  </p>
                </div>
                <div class="whitespace-nowrap text-right text-sm text-text-muted">
                  <time [attr.datetime]="activity.timestamp.toISOString()">{{ activity.timestamp | date:'short' }}</time>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div *ngIf="activities.length === 0" class="text-center py-10">
        <p class="text-sm text-text-muted">No activity history found for this user.</p>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ActivityHistoryComponent {
  @Input() activities: UserActivity[] = [];

  getIconClass(type: string): string {
    switch (type) {
      case 'seminar_attendance': return 'bg-status-success';
      case 'comment_posted': return 'bg-status-info';
      case 'comment_replied': return 'bg-admin';
      case 'profile_updated': return 'bg-status-warning';
      default: return 'bg-text-faint';
    }
  }

  getDescription(activity: UserActivity): string {
    switch (activity.type) {
      case 'seminar_attendance': return 'Attended seminar: ';
      case 'comment_posted': return 'Posted a comment on: ';
      case 'comment_replied': return 'Replied to a comment on: ';
      case 'profile_updated': return 'Updated their profile';
      default: return 'Performed an action: ';
    }
  }
}
