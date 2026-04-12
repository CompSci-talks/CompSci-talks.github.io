import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Seminar } from '../../../core/models/seminar.model';
import { SeminarStatusPipe } from '../../../core/pipes/seminar-status.pipe';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
    selector: 'app-seminar-card',
    standalone: true,
    imports: [CommonModule, RouterModule, SeminarStatusPipe, DurationPipe],
    templateUrl: './seminar-card.component.html',
    host: {
        'class': 'block h-full w-full'
    }
})
export class SeminarCardComponent {
    @Input({ required: true }) seminar!: Seminar;

    imageLoaded = false;
    hasImageError = false;

    getSpeakerNames(speakers: any[] | undefined): string {
        if (!speakers || !Array.isArray(speakers)) return '';
        return speakers.map(s => s?.name || '').filter(Boolean).join(', ');
    }

    getAbstractSnippet(abstract: string | undefined): string {
        if (!abstract) return '';
        const plainText = abstract.replace(/[#*`]/g, '');
        return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    }
    getPlaceholderImage(id: string): string {
        const images = [
            'assets/placeholders/abstract_1.png',
            'assets/placeholders/abstract_2.png',
            'assets/placeholders/abstract_3.png'
        ];
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % images.length;
        return images[index];
    }
}
