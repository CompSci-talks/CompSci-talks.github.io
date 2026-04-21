import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../../core/pipes/safe-url.pipe';

@Component({
    selector: 'app-video-player',
    standalone: true,
    imports: [CommonModule, SafeUrlPipe],
    templateUrl: './video-player.component.html'
})
export class VideoPlayerComponent {
    @Input({ required: true }) videoId!: string;

    /** Any SharePoint / OneDrive URL — embed directly in an iframe. */
    get isOneDrive(): boolean {
        return /sharepoint\.com\/.+/.test(this.videoId) || /1drv\.ms\//.test(this.videoId);
    }

    /** Embed URL for Google Drive files. */
    get embedUrl(): string {
        return `https://drive.google.com/file/d/${this.videoId}/preview`;
    }
}
