import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../../core/pipes/safe-url.pipe';

@Component({
    selector: 'app-slide-viewer',
    standalone: true,
    imports: [CommonModule, SafeUrlPipe],
    templateUrl: './slide-viewer.component.html'
})
export class SlideViewerComponent {
    @Input({ required: true }) presentationId!: string;

    /** True when the stored value is an OneDrive / SharePoint URL (embed or sharing). */
    get isOneDrive(): boolean {
        return /sharepoint\.com\/.+/.test(this.presentationId) || /1drv\.ms\//.test(this.presentationId);
    }

    /** Google Drive preview embed URL. */
    get embedUrl(): string {
        return `https://drive.google.com/file/d/${this.presentationId}/preview`;
    }
}
