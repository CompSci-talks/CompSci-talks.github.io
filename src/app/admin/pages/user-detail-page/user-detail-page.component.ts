import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { USER_SERVICE } from '../../../core/contracts/user.service.interface';
import { COMMENT_SERVICE } from '../../../core/contracts/comment.interface';
import { UserDetailComponent } from '../../components/user-detail/user-detail.component';
import { ActivityHistoryComponent } from '../../components/user-activity/activity-history.component';
import { of, switchMap, catchError, finalize } from 'rxjs';
import { Comment } from '../../../core/models/comment.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [CommonModule, UserDetailComponent, RouterModule],
  template: `
    <div>

      <!-- Breadcrumb + page header -->
      <div class="admin-page-header">
        <nav class="flex items-center gap-2 text-sm text-text-muted mb-2">
          <a routerLink="/admin/user-management"
             class="hover:text-admin transition-colors font-medium">User Management</a>
          <span>/</span>
          <span class="font-semibold text-text-main">User Profile</span>
        </nav>
        <h1 class="admin-page-title">User Profile Detail</h1>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="space-y-6">
        <div class="h-64 bg-skeleton rounded-xl animate-pulse"></div>
        <div class="h-96 bg-skeleton rounded-xl border border-border animate-pulse"></div>
      </div>

      <!-- Content -->
      <div *ngIf="!loading && user" class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left: profile card + stats -->
        <div class="lg:col-span-1 space-y-6">
          <app-user-detail [user]="user"></app-user-detail>

          <div class="admin-card p-6">
            <h2 class="text-base font-bold text-text-main mb-4">Quick Stats</h2>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-text-muted text-sm">Attendance</span>
                <span class="text-primary font-bold">{{ user.attendance_count || 0 }} Seminars</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-text-muted text-sm">Member Since</span>
                <span class="text-text-main text-sm font-medium">{{ user.created_at | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: activity history -->
        <div class="lg:col-span-2">
          <div class="admin-card overflow-hidden">
            <div class="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 class="text-base font-bold text-text-main">Activity History</h2>
              <span *ngIf="loadingActivity" class="text-xs text-primary animate-pulse font-medium">Loading...</span>
            </div>

            <div class="p-6">
              <!-- Error notice -->
              <div *ngIf="activityError"
                   class="flex items-center gap-3 p-4 mb-4 text-sm text-status-error rounded-lg bg-status-error/5 border border-status-error/20">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                <span>Some activity logs could not be loaded.</span>
              </div>

              <!-- Comments list -->
              <div *ngIf="!loadingActivity">
                <div *ngIf="comments.length === 0"
                     class="text-center py-10 text-text-muted italic">
                  No activity history found for this user.
                </div>

                <div *ngFor="let comment of comments"
                     class="flex gap-3 py-3 border-b border-border last:border-0">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-text-muted mb-1">
                      <span class="font-semibold text-text-main">
                        {{ comment.parent_id ? 'Replied in' : 'Commented on' }}
                      </span>
                      seminar
                      <a [routerLink]="['/seminar', comment.seminar_id]"
                         class="text-primary hover:underline ml-1">{{ comment.seminar_title }}</a>
                    </p>
                    <p class="text-sm text-text-main italic truncate">"{{ comment.text }}"</p>
                    <p class="text-xs text-text-faint mt-1">{{ comment.created_at | date:'medium' }}</p>
                  </div>
                </div>
              </div>

              <!-- Loading skeleton -->
              <div *ngIf="loadingActivity && comments.length === 0" class="space-y-4">
                <div *ngFor="let i of [1,2,3,4]" class="flex gap-3 animate-pulse">
                  <div class="rounded-full bg-skeleton h-8 w-8 flex-shrink-0"></div>
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-4 bg-skeleton rounded w-3/4"></div>
                    <div class="h-3 bg-skeleton rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found -->
      <div *ngIf="!loading && !user"
           class="admin-card p-12 text-center max-w-lg mx-auto mt-12">
        <h2 class="text-xl font-bold text-text-main mb-2">User Not Found</h2>
        <p class="text-text-muted mb-6">This user may have been deleted or the UID is invalid.</p>
        <a routerLink="/admin/user-management" class="btn btn-primary">
          Return to User Management
        </a>
      </div>
    </div>
  `
})
export class UserDetailPageComponent implements OnInit {
  private userService = inject(USER_SERVICE);
  private commentService = inject(COMMENT_SERVICE);
  private route = inject(ActivatedRoute);

  user: User | null = null;
  comments: Comment[] = [];
  loading = true;
  loadingActivity = false;
  activityError = false;

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (id) {
          this.loadComments(id);
          return this.userService.getUserById(id);
        }
        return of(null);
      })
    ).subscribe(user => {
      this.user = user;
      this.loading = false;
    });
  }

  private loadComments(userId: string): void {
    this.loadingActivity = true;
    this.activityError = false;

    this.commentService.getAllComments().pipe(
      catchError(err => {
        console.error('Failed to load comments', err);
        this.activityError = true;
        return of([]);
      }),
      finalize(() => this.loadingActivity = false)
    ).subscribe(comments => {
      this.comments = comments
        .filter(c => c.author_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
  }
}
