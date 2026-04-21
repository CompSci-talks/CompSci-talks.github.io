import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Seminar } from '../../../core/models/seminar.model';
import { SPEAKER_SERVICE, ISpeakerService } from '../../../core/contracts/speaker.interface';
import { TAG_SERVICE, ITagService } from '../../../core/contracts/tag.interface';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { Observable, map, finalize } from 'rxjs';
import { STORAGE_SERVICE, IStorageService } from '../../../core/contracts/storage.interface';
function materialUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value || !value.trim()) return null;

  // Reject Google Drive folder URLs explicitly
  if (/drive\.google\.com\/drive\/folders\//.test(value)) {
    return { invalidMaterialUrl: true };
  }

  // Accept pasted <iframe> embed codes (e.g. from SharePoint Stream)
  if (/<iframe\s[^>]*src="[^"]+"[^>]*>/i.test(value)) return null;

  const isPlainId = /^[a-zA-Z0-9_-]{25,}$/.test(value.trim());
  const isGoogleDriveFileUrl = /drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/.test(value);
  const isGoogleDriveOpenUrl = /drive\.google\.com\/open\?id=[a-zA-Z0-9_-]+/.test(value);
  const isOneDriveUrl = /sharepoint\.com\/.+/.test(value) || /1drv\.ms\//.test(value);

  if (isPlainId || isGoogleDriveFileUrl || isGoogleDriveOpenUrl || isOneDriveUrl) return null;
  return { invalidMaterialUrl: true };
}
@Component({
  selector: 'app-seminar-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectComponent],
  template: `
    <div class="bg-surface p-8 rounded-2xl border border-border shadow-soft max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-heading">{{ seminar ? 'Edit' : 'Schedule' }} Seminar</h3>
        <button (click)="onCancel.emit()" class="btn-ghost btn-sm p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form [formGroup]="seminarForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-text-main mb-2">Seminar Title</label>
            <input type="text" formControlName="title" placeholder="e.g. Advanced Machine Learning Patterns"
                   class="input-field"
                   [class.border-status-error]="isInvalid('title')">
            <p *ngIf="isInvalid('title')" class="text-xs text-status-error mt-1">Title is required.</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-2">Date & Time</label>
            <input type="datetime-local" formControlName="date_time"
                   class="input-field"
                   [class.border-status-error]="isInvalid('date_time')">
            <p *ngIf="isInvalid('date_time')" class="text-xs text-status-error mt-1">Date & time is required.</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-2">Location</label>
            <input type="text" formControlName="location" placeholder="e.g. Hall A or Zoom Link"
                   class="input-field"
                   [class.border-status-error]="isInvalid('location')">
            <p *ngIf="isInvalid('location')" class="text-xs text-status-error mt-1">Location is required.</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-2">Duration (minutes)</label>
            <input type="number" formControlName="duration" placeholder="e.g. 60"
                   class="input-field"
                   [class.border-status-error]="isInvalid('duration')">
            <p *ngIf="isInvalid('duration')" class="text-xs text-status-error mt-1">Duration must be a positive number.</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-text-main mb-2">Abstract (Markdown supported)</label>
          <textarea formControlName="abstract" rows="4" placeholder="Describe the seminar..."
                    class="input-field resize-none h-32"
                    [class.border-status-error]="isInvalid('abstract')"></textarea>
          <p *ngIf="isInvalid('abstract')" class="text-xs text-status-error mt-1">Abstract is required.</p>
        </div>

        <!-- Speakers & Tags -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-text-main mb-2">Speakers</label>
            <app-multi-select
                [items]="(speakerItems$ | async) || []"
                placeholder="Find speakers..."
                formControlName="speaker_ids">
            </app-multi-select>
            <p *ngIf="isInvalid('speaker_ids')" class="text-xs text-status-error mt-1">At least one speaker is required.</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-main mb-2">Tags</label>
            <app-multi-select
                [items]="(tagItems$ | async) || []"
                placeholder="Add tags..."
                formControlName="tag_ids">
            </app-multi-select>
            <p *ngIf="isInvalid('tag_ids')" class="text-xs text-status-error mt-1">At least one tag is required.</p>
          </div>
        </div>

        <!-- Materials -->
        <div class="bg-surface-muted p-6 rounded-2xl border border-border space-y-4">
          <h4 class="text-sm font-bold text-heading uppercase tracking-wider">Materials & Media</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-text-muted mb-1">Video Material URL</label>
              <input type="text" formControlName="video_material_id"
                     placeholder="Google Drive URL/ID or OneDrive sharing link"
                     class="input-field-sm"
                     [class.border-status-error]="isInvalid('video_material_id')">
              <p *ngIf="isInvalid('video_material_id')" class="text-xs text-status-error mt-1">
                Must be a valid Google Drive URL/ID or OneDrive sharing link.
              </p>
              <p *ngIf="!isInvalid('video_material_id')" class="text-xs text-text-faint mt-1">
                Paste a Google Drive or OneDrive link, or leave empty.
              </p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-text-muted mb-1">Presentation Material URL</label>
              <input type="text" formControlName="presentation_material_id"
                     placeholder="Google Drive URL/ID or OneDrive sharing link"
                     class="input-field-sm"
                     [class.border-status-error]="isInvalid('presentation_material_id')">
              <p *ngIf="isInvalid('presentation_material_id')" class="text-xs text-status-error mt-1">
                Must be a valid Google Drive URL/ID or OneDrive sharing link.
              </p>
              <p *ngIf="!isInvalid('presentation_material_id')" class="text-xs text-text-faint mt-1">
                Paste a Google Drive or OneDrive link, or leave empty.
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-text-muted mb-1">Thumbnail URL</label>
              <div class="flex gap-2">
                <input type="text" formControlName="thumbnail_url"
                       placeholder="e.g. https://assets.example.com/thumb.jpg"
                       class="input-field-sm flex-1"
                       [class.border-status-error]="isInvalid('thumbnail_url')">
                
                <input type="file" #fileInput class="hidden" (change)="onFileSelected($event)" accept="image/*">
                <button type="button" (click)="fileInput.click()" 
                        [disabled]="isUploading"
                        class="btn btn-outline btn-sm px-3 whitespace-nowrap">
                  <span *ngIf="isUploading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
                  {{ isUploading ? 'Uploading...' : 'Pick Image' }}
                </button>
              </div>

              <!-- Preview -->
              <div *ngIf="seminarForm.get('thumbnail_url')?.value" class="mt-3 flex items-start gap-4 p-3 bg-surface border border-border rounded-xl">
                <div class="w-24 aspect-video rounded-lg overflow-hidden bg-surface-muted flex-shrink-0">
                  <img [src]="seminarForm.get('thumbnail_url')?.value" alt="Preview" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] text-text-faint truncate mb-1">
                    {{ seminarForm.get('thumbnail_url')?.value }}
                  </p>
                  <button type="button" (click)="clearThumbnail()" class="text-xs font-bold text-status-error hover:underline">
                    Remove Thumbnail
                  </button>
                </div>
              </div>

              <p *ngIf="isInvalid('thumbnail_url')" class="text-xs text-status-error mt-1">
                Must be a valid URL (http/https) or a Data image.
              </p>
              <p *ngIf="!isInvalid('thumbnail_url')" class="text-xs text-text-faint mt-1">
                Direct image link, Data URL, or select a local file.
              </p>
            </div>
          </div>

          <!-- <div class="flex items-center space-x-3">
            <input type="checkbox" formControlName="is_hidden" id="is_hidden"
                   class="w-4 h-4 text-admin border-border rounded focus:ring-admin">
               <label for="is_hidden" class="text-sm text-text-main font-medium">
              Hide from public feed (Draft/Moderation)
            </label>
          </div> -->
        </div>

        <div class="flex justify-end items-center gap-4 pt-6 border-t border-border mt-4">
          <button type="button" (click)="onCancel.emit()"
                  class="btn btn-outline">
            Discard
          </button>
          <button type="submit" [disabled]="seminarForm.invalid"
                  class="btn btn-admin px-10">
            {{ seminar ? 'Update Seminar' : 'Schedule Seminar' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class SeminarFormComponent implements OnInit {
  @Input() seminar: Seminar | null = null;
  @Output() onSave = new EventEmitter<Omit<Seminar, 'id'>>();
  @Output() onCancel = new EventEmitter<void>();

  seminarForm: FormGroup;
  speakerItems$: Observable<{ id: string, name: string }[]>;
  tagItems$: Observable<{ id: string, name: string }[]>;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    @Inject(SPEAKER_SERVICE) private speakerService: ISpeakerService,
    @Inject(TAG_SERVICE) private tagService: ITagService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService
  ) {
    this.speakerItems$ = this.speakerService.getSpeakers().pipe(
      map(speakers => speakers.map(s => ({ id: s.id, name: `${s.name} (${s.affiliation})` })))
    );
    this.tagItems$ = this.tagService.getTags().pipe(
      map(tags => tags.map(t => ({ id: t.id, name: t.name })))
    );

    this.seminarForm = this.fb.group({
      title: ['', Validators.required],
      date_time: ['', Validators.required],
      location: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(1)]],
      abstract: ['', Validators.required],
      speaker_ids: [[], Validators.required],
      tag_ids: [[], Validators.required],
      video_material_id: ['', materialUrlValidator],
      presentation_material_id: ['', materialUrlValidator],
      is_hidden: [false],
      thumbnail_url: ['', Validators.pattern(/^(https?:\/\/|data:image\/).+/)]
    });
  }

  ngOnInit() {
    if (this.seminar) {
      this.seminarForm.patchValue({
        ...this.seminar,
        date_time: this.formatDate(this.seminar.date_time)
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.seminarForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  onSubmit() {
    this.seminarForm.markAllAsTouched();
    if (this.seminarForm.invalid) return;

    const val = this.seminarForm.value;
    this.onSave.emit({
      ...val,
      date_time: new Date(val.date_time),
      speaker_ids: val.speaker_ids.filter((id: string) => !!id),
      tag_ids: val.tag_ids.filter((id: string) => !!id),
      video_material_id: this.extractMaterialId(val.video_material_id),
      presentation_material_id: this.extractMaterialId(val.presentation_material_id),
      thumbnail_url: this.transformThumbnailUrl(val.thumbnail_url?.trim())
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.isUploading = true;
      this.storageService.uploadSeminarThumbnail(file).pipe(
        finalize(() => this.isUploading = false)
      ).subscribe({
        next: (url) => {
          this.seminarForm.patchValue({ thumbnail_url: url });
        },
        error: (err) => {
          console.error('Upload failed:', err);
          // Optional: Add toast notification here if available
        }
      });
    }
  }

  clearThumbnail() {
    this.seminarForm.patchValue({ thumbnail_url: '' });
  }

  private transformThumbnailUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const driveId = this.extractMaterialId(url);
    if (driveId && (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com'))) {
      return `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
    }
    return url;
  }

  private extractMaterialId(input: string | null | undefined): string | null {
    if (!input || !input.trim()) return null;
    const trimmed = input.trim();

    // Extract src from a pasted <iframe> embed code
    const iframeSrcMatch = trimmed.match(/<iframe\s[^>]*src="([^"]+)"[^>]*>/i);
    if (iframeSrcMatch) return iframeSrcMatch[1];

    // OneDrive / SharePoint sharing URL — store as-is
    if (/sharepoint\.com\/.+/.test(trimmed) || /1drv\.ms\//.test(trimmed)) {
      return trimmed;
    }

    // Google Drive plain ID
    if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) return trimmed;

    // Google Drive file URL: /d/<id>
    const fileMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];

    // Google Drive folder URL
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];

    // Google Drive open URL
    const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch) return openMatch[1];

    return trimmed;
  }
}