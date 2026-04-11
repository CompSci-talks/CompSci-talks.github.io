import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AUTH_SERVICE } from '../../core/contracts/auth.interface';
import { USER_SERVICE, IUserService } from '../../core/contracts/user.service.interface';
import { COMMENT_SERVICE } from '../../core/contracts/comment.interface';
import { SEMINAR_SERVICE } from '../../core/contracts/seminar.interface';
import { UserDetailComponent } from '../../admin/components/user-detail/user-detail.component';
import { User } from '../../core/models/user.model';
import { Comment } from '../../core/models/comment.model';
import { Seminar } from '../../core/models/seminar.model';
import { of, catchError, finalize, take, combineLatest } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule, UserDetailComponent],
  template: `
    <div class="container-main section-padding">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-heading tracking-tight">My Profile</h1>
        <p class="text-text-muted mt-1">Manage your account settings and view your community activity.</p>
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="space-y-6 animate-pulse">
          <div class="h-64 bg-skeleton rounded-2xl"></div>
          <div class="h-96 bg-skeleton rounded-2xl border border-border"></div>
        </div>
      }

      @if (!loading && user) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left column -->
          <div class="lg:col-span-1 space-y-6">
            <app-user-detail
              [user]="user"
              [allowEdit]="true"
              (onEditPhoto)="openModal()">
            </app-user-detail>
 
            <div class="card p-6 border-border">
              <h3 class="text-lg font-bold text-heading mb-4">Quick Stats</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-text-muted font-medium">Seminars Attended</span>
                  <span class="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{{ attendedSeminars.length }}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-text-muted font-medium">Comments Posted</span>
                  <span class="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{{ comments.length }}</span>
                </div>
                <div class="flex justify-between items-center text-sm border-t border-border pt-3">
                  <span class="text-text-muted font-medium">Member Since</span>
                  <span class="text-text-main font-semibold">{{ user.enrollment_date | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right column -->
          <div class="lg:col-span-2">
            <div class="card overflow-hidden h-full border-border">
 
              <!-- Tabs -->
              <div class="flex border-b border-border bg-surface-muted/30">
                <button (click)="activeTab.set('comments')"
                        class="flex-1 px-6 py-4 text-sm font-bold transition-all relative"
                        [class.text-primary]="activeTab() === 'comments'"
                        [class.text-text-faint]="activeTab() !== 'comments'">
                  My Comments
                  @if (activeTab() === 'comments') {
                    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  }
                  <span class="ml-2 text-xs px-2 py-0.5 rounded-full transition-colors"
                        [class.bg-primary]="activeTab() === 'comments'"
                        [class.text-white]="activeTab() === 'comments'"
                        [class.bg-surface-muted]="activeTab() !== 'comments'"
                        [class.text-text-muted]="activeTab() !== 'comments'">
                    {{ comments.length }}
                  </span>
                </button>
                <button (click)="activeTab.set('seminars')"
                        class="flex-1 px-6 py-4 text-sm font-bold transition-all relative"
                        [class.text-primary]="activeTab() === 'seminars'"
                        [class.text-text-faint]="activeTab() !== 'seminars'">
                  Attended Seminars
                  @if (activeTab() === 'seminars') {
                    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  }
                  <span class="ml-2 text-xs px-2 py-0.5 rounded-full transition-colors"
                        [class.bg-primary]="activeTab() === 'seminars'"
                        [class.text-white]="activeTab() === 'seminars'"
                        [class.bg-surface-muted]="activeTab() !== 'seminars'"
                        [class.text-text-muted]="activeTab() !== 'seminars'">
                    {{ attendedSeminars.length }}
                  </span>
                </button>
              </div>

              <div class="p-6">
                <!-- Loading -->
                @if (loadingActivity) {
                  <div class="space-y-4">
                    @for (i of [1,2,3]; track i) {
                      <div class="flex space-x-3 animate-pulse">
                        <div class="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
                        <div class="flex-1 space-y-2 py-1">
                          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div class="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Comments tab -->
                @if (!loadingActivity && activeTab() === 'comments') {
                  @if (comments.length === 0) {
                    <div class="text-center py-12 text-text-faint italic border-2 border-dashed border-border rounded-xl">
                      You haven't posted any comments yet.
                    </div>
                  }
                  <div class="space-y-4">
                    @for (comment of comments; track comment.id) {
                      <div class="flex gap-4 p-4 border border-border rounded-xl bg-surface-muted/10">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm text-text-muted mb-1">
                            <span class="font-bold text-heading">
                              {{ comment.parent_id ? 'Replied in' : 'Commented on' }}
                            </span>
                            <a [routerLink]="['/seminar', comment.seminar_id]"
                               class="text-primary hover:underline ml-1 font-semibold">
                              {{ comment.seminar_title || comment.seminar_id }}
                            </a>
                          </p>
                          <p class="text-sm text-text-main italic line-clamp-2">"{{ comment.text }}"</p>
                          <p class="text-[10px] font-bold text-text-faint uppercase tracking-widest mt-2">{{ comment.created_at | date:'medium' }}</p>
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- Attended seminars tab -->
                @if (!loadingActivity && activeTab() === 'seminars') {
                  @if (attendedSeminars.length === 0) {
                    <div class="text-center py-12 text-text-faint italic border-2 border-dashed border-border rounded-xl">
                      You haven't attended any seminars yet.
                    </div>
                  }
                  <div class="space-y-4">
                    @for (seminar of attendedSeminars; track seminar.id) {
                      <a [routerLink]="['/seminar', seminar.id]"
                         class="flex gap-4 p-4 border border-border rounded-xl hover:bg-surface-muted/30 transition-all group">
                        <div class="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-skeleton shadow-sm">
                          @if (seminar.thumbnail_url) {
                            <img [src]="seminar.thumbnail_url" [alt]="seminar.title" class="w-full h-full object-cover">
                          } @else {
                            <div class="w-full h-full flex items-center justify-center text-text-faint">
                              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="text-sm font-bold text-heading group-hover:text-primary transition-colors truncate">
                            {{ seminar.title }}
                          </h4>
                          <p class="text-xs text-text-muted mt-1 font-medium">
                            {{ seminar.date_time | date:'mediumDate' }} · {{ seminar.location }}
                          </p>
                          @if (seminar.speakers?.length) {
                            <p class="text-[10px] font-bold text-text-faint uppercase mt-1">{{ getSpeakerNames(seminar.speakers) }}</p>
                          }
                        </div>
                      </a>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      @if (!loading && !user) {
        <div class="text-center py-16 text-gray-400 italic">
          Could not load your profile. Please try again.
        </div>
      }
    </div>

    <!-- Photo URL Modal -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
           (click)="closeModal()">
        <div class="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-border"
             (click)="$event.stopPropagation()">
 
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-heading">Update Picture</h3>
            <button (click)="closeModal()" class="btn-ghost btn-sm p-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
 
          <!-- Preview -->
          <div class="flex justify-center mb-8">
            @if (previewUrl()) {
              <div class="relative">
                <img [src]="previewUrl()!"
                     class="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-premium"
                     (error)="onPreviewError()">
                <div class="absolute inset-0 rounded-full shadow-inner"></div>
              </div>
            } @else if (user?.photo_url) {
              <img [src]="user?.photo_url" class="w-32 h-32 rounded-full object-cover border-4 border-border shadow-soft">
            } @else {
              <div class="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold border-4 border-border">
                {{ user?.display_name?.charAt(0)?.toUpperCase() }}
              </div>
            }
          </div>
 
          <!-- Display Name input -->
          <div class="mb-4">
            <label class="block text-sm font-bold text-text-muted mb-2">
              Display Name
            </label>
            <input type="text"
                   [value]="displayNameInput()"
                   (input)="onDisplayNameInput($event)"
                   placeholder="Your public name"
                   class="input-field">
          </div>

          <!-- Photo upload -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-bold text-text-muted">
                Profile Photo
              </label>
              <input type="file" #fileInput class="hidden" (change)="onFileSelected($event)" accept="image/*">
              <button (click)="fileInput.click()" class="text-xs font-bold text-primary hover:underline">
                Upload Local File
              </button>
            </div>
            <input type="url"
                   [value]="photoUrlInput()"
                   (input)="onUrlInput($event)"
                   placeholder="https://example.com/avatar.jpg"
                   class="input-field">
            <p class="text-xs text-text-faint mt-2 font-medium">Use local files or direct image links.</p>
          </div>
 
          <!-- Error -->
          @if (uploadError()) {
            <p class="text-xs text-status-error mb-4 text-center font-bold px-4 py-2 bg-status-error/10 rounded-lg">{{ uploadError() }}</p>
          }
 
          <!-- Actions -->
          <div class="flex gap-3">
            <button (click)="closeModal()"
                    class="btn btn-outline flex-1">
              Cancel
            </button>
            <button (click)="saveProfileChanges()"
                    [disabled]="uploading() || (!photoUrlInput() && !displayNameInput())"
                    class="btn btn-primary flex-1">
              @if (uploading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Saving
              } @else {
                Save Changes
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ProfilePageComponent implements OnInit {
  private authService = inject(AUTH_SERVICE);
  private userService = inject<IUserService>(USER_SERVICE);
  private commentService = inject(COMMENT_SERVICE);
  private seminarService = inject(SEMINAR_SERVICE);

  user: User | null = null;
  comments: Comment[] = [];
  attendedSeminars: Seminar[] = [];
  loading = true;
  loadingActivity = false;
  activeTab = signal<'comments' | 'seminars'>('comments');

  // Modal state
  modalOpen = signal(false);
  previewUrl = signal<string | null>(null);
  photoUrlInput = signal<string>('');
  displayNameInput = signal<string>('');
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe(authUser => {
      if (!authUser) {
        this.loading = false;
        return;
      }

      const uid = (authUser as any).id || (authUser as any).uid;

      this.userService.getUserById(uid).pipe(take(1)).subscribe(profile => {
        this.user = profile;
        this.loading = false;
        if (profile) this.loadActivity(uid, profile.attended_seminar_ids || []);
      });
    });
  }

  private loadActivity(userId: string, attendedIds: string[]): void {
    this.loadingActivity = true;

    combineLatest([
      this.commentService.getAllComments(),
      this.seminarService.getSeminars()
    ]).pipe(
      take(1),
      catchError(() => of([[], []] as any)),
      finalize(() => this.loadingActivity = false)
    ).subscribe(([comments, seminars]) => {
      this.comments = comments
        .filter((c: Comment) => c.author_id === userId)
        .sort((a: Comment, b: Comment) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .map((c: Comment) => ({
          ...c,
          seminarTitle: seminars.find((s: any) => s.id === c.seminar_id)?.title || c.seminar_id
        }));

      this.attendedSeminars = seminars.filter((s: Seminar) =>
        attendedIds.includes(s.id)
      );
    });
  }

  openModal() {
    this.photoUrlInput.set(this.user?.photo_url || '');
    this.displayNameInput.set(this.user?.display_name || '');
    this.previewUrl.set(this.user?.photo_url || null);
    this.uploadError.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    if (this.uploading()) return;
    this.modalOpen.set(false);
  }

  onUrlInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.photoUrlInput.set(value);
    this.previewUrl.set(value || null);
  }

  onDisplayNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.displayNameInput.set(value);
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 in Firestore
        this.uploadError.set('Image is too large. Please select a file under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.photoUrlInput.set(result);
        this.previewUrl.set(result);
      };
      reader.readAsDataURL(file);
    }
  }

  onPreviewError() {
    this.uploadError.set('Could not load image from this URL. Please check the link.');
    this.previewUrl.set(null);
  }

  saveProfileChanges() {
    const photo_url = this.transformThumbnailUrl(this.photoUrlInput().trim());
    const display_name = this.displayNameInput().trim();
    if (!this.user) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    const updates: any = {};
    if (photo_url !== this.user.photo_url) updates.photo_url = photo_url;
    if (display_name !== this.user.display_name && display_name) updates.display_name = display_name;

    if (Object.keys(updates).length === 0) {
      this.modalOpen.set(false);
      this.uploading.set(false);
      return;
    }

    this.userService.updateProfile(this.user.id, updates).subscribe({
      next: () => {
        if (updates.photo_url) this.user!.photo_url = updates.photo_url;
        if (updates.display_name) this.user!.display_name = updates.display_name;
        this.uploading.set(false);
        this.modalOpen.set(false);
      },
      error: (err) => {
        console.error('Failed to save profile changes:', err);
        this.uploadError.set('Failed to save. Please try again.');
        this.uploading.set(false);
      }
    });
  }

  private transformThumbnailUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const driveId = this.extractDriveId(url);
    if (driveId && (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com'))) {
      return `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
    }
    return url;
  }

  private extractDriveId(input: string | null | undefined): string | null {
    if (!input || !input.trim()) return null;
    if (/^[a-zA-Z0-9_-]{25,}$/.test(input.trim())) return input.trim();
    const fileMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];
    const openMatch = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch) return openMatch[1];
    return input;
  }

  getSpeakerNames(speakers: any[] | undefined): string {
    if (!speakers || !Array.isArray(speakers)) return '';
    return speakers.map(s => s?.name || '').filter(Boolean).join(', ');
  }
}