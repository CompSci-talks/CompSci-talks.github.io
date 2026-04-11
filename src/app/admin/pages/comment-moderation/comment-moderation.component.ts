import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { COMMENT_SERVICE } from '../../../core/contracts/comment.interface';
import { SEMINAR_SERVICE } from '../../../core/contracts/seminar.interface';
import { Comment } from '../../../core/models/comment.model';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { combineLatest, map } from 'rxjs';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';

@Component({
  selector: 'app-comment-moderation',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginatedTableComponent],
  template: `
    <div class="w-full">

      <!-- Page header — same structure as all other admin pages -->
      <div class="admin-page-header">
        <h1 class="admin-page-title">Comment Moderation</h1>
        <p class="admin-page-subtitle">Review and manage community discussions across all seminars.</p>
      </div>

      <div class="admin-card">
        <app-paginated-table
          [data]="enrichedComments"
          [loading]="loading"
          [columnCount]="4"
          [currentPage]="currentPage"
          [hasMore]="hasMore"
          [headerTemplate]="header"
          [rowTemplate]="row"
          [skeletonTemplate]="skeleton"
          (pageChange)="onPageChange($event)"
          emptyMessage="No comments found for moderation."
        >
          <ng-template #header>
            <th class="th-cell">Author</th>
            <th class="th-cell">Comment Info</th>
            <th class="th-cell">Date</th>
            <th class="th-cell text-right">Actions</th>
          </ng-template>

          <ng-template #row let-item>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img class="w-10 h-10 rounded-full mr-3"
                     [src]="item.comment.author_photo_url || 'https://ui-avatars.com/api/?name=' + item.comment.author_name"
                     alt="{{item.comment.author_name}} image">
                <div class="flex flex-col">
                  <a [routerLink]="['/admin/user', item.comment.author_id]"
                     class="text-sm font-bold text-text-main hover:text-admin transition-colors cursor-pointer">
                    {{ item.comment.author_name }}
                  </a>
                  <div class="text-[10px] text-text-faint">ID: {{ item.comment.author_id.substring(0, 8) }}...</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-text-muted max-w-md italic mb-2">"{{ item.comment.text }}"</div>
              <div class="flex items-center group">
                <span class="text-[10px] font-bold text-text-faint uppercase tracking-widest mr-2">Seminar:</span>
                <a [routerLink]="['/seminar', item.comment.seminar_id]"
                   class="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded hover:bg-primary hover:text-white transition-all cursor-pointer">
                 {{ item.seminarName }}
                </a>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-xs text-text-muted">
              {{ item.comment.created_at | date:'short' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
              <button (click)="deleteComment(item.comment.id)" class="action-link-delete px-3 py-1 rounded-lg hover:bg-status-error/5 transition-colors">
                Delete
              </button>
            </td>
          </ng-template>

          <ng-template #skeleton>
            <tr *ngFor="let i of [1,2,3,4,5]" class="animate-pulse">
              <td class="px-6 py-4"><div class="skeleton h-4 w-32"></div></td>
              <td class="px-6 py-4"><div class="skeleton h-4 w-64"></div></td>
              <td class="px-6 py-4"><div class="skeleton h-4 w-24"></div></td>
              <td class="px-6 py-4 text-right"><div class="skeleton h-4 w-16 ml-auto"></div></td>
            </tr>
          </ng-template>
        </app-paginated-table>
      </div>
    </div>
  `
})
export class CommentModerationComponent implements OnInit {
  private commentService = inject(COMMENT_SERVICE);
  private seminarService = inject(SEMINAR_SERVICE);

  readonly pageSize = 5;

  enrichedComments: { comment: Comment, seminarName: string }[] = [];
  loading = true;
  currentPage = 1;
  hasMore = false;

  private cursorStack: (DocumentSnapshot | null)[] = [null];
  private seminars: any[] = [];

  ngOnInit() {
    this.seminarService.getSeminars().subscribe(seminars => {
      this.seminars = seminars;
      this.fetchPage(null);
    });
  }

  private fetchPage(cursor: DocumentSnapshot | null) {
    this.loading = true;
    this.commentService.getAllCommentsPaginated(this.pageSize, cursor).subscribe(page => {
      this.enrichedComments = page.data.map(comment => ({
        comment,
        seminarName: this.seminars.find(s => s.id === comment.seminar_id)?.title || 'Unknown Seminar'
      }));
      this.hasMore = page.hasMore;
      this.cursorStack[this.currentPage] = page.lastDoc;
      this.loading = false;
    });
  }

  onPageChange(direction: 'prev' | 'next') {
    if (direction === 'next' && this.hasMore) {
      this.currentPage++;
      const cursor = this.cursorStack[this.currentPage - 1] ?? null;
      this.fetchPage(cursor);
    } else if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
      const cursor = this.cursorStack[this.currentPage - 1];
      this.fetchPage(cursor);
    }
  }

  deleteComment(id: string) {
    if (confirm('Are you sure you want to permanently delete this comment?')) {
      this.commentService.deleteComment(id).subscribe(() => {
        this.currentPage = 1;
        this.cursorStack = [null];
        this.fetchPage(null);
      });
    }
  }
}
