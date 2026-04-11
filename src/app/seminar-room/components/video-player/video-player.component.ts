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

    // Updated for Google Drive embed.
    // Format: https://drive.google.com/file/d/:id/preview
    get embedUrl(): string {
        return `https://drive.google.com/file/d/${this.videoId}/preview`;
    }
}
