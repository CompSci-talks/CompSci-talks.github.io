import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { Seminar } from '../../../core/models/seminar.model';
import { SEMINAR_SERVICE } from '../../../core/contracts/seminar.interface';
import { SeminarCardComponent } from '../../components/seminar-card/seminar-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { RouterModule } from '@angular/router';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
    selector: 'app-schedule',
    standalone: true,
    imports: [CommonModule, RouterModule, DurationPipe],
    templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {
    private seminarService = inject(SEMINAR_SERVICE);

    seminars: Seminar[] = [];
    loading = false;

    ngOnInit() {
        this.loadSeminars();
    }

    private loadSeminars() {
        this.loading = true;
        const now = new Date();
        this.seminarService.getSeminars().pipe(
            map(seminars => seminars
                .filter(s => new Date(s.date_time) > now)
                .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
            )
        ).subscribe({
            next: (data) => {
                this.seminars = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.seminars = [];
            }
        });
    }

    get groupedSeminars(): { date: string, seminars: Seminar[] }[] {
        const groups = new Map<string, Seminar[]>();
        for (const s of this.seminars) {
            const key = new Date(s.date_time).toDateString();
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(s);
        }
        return Array.from(groups.entries()).map(([date, seminars]) => ({ date, seminars }));
    }
    getSpeakerNames(speakers: any[] | undefined): string {
        if (!speakers || !Array.isArray(speakers)) return '';
        return speakers.map(s => s?.name || '').filter(Boolean).join(', ');
    }
    stripMarkdown(text: string): string {
        if (!text) return '';
        return text.replace(/[#*_`>\[\]!]/g, '').replace(/\n+/g, ' ').trim();
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
