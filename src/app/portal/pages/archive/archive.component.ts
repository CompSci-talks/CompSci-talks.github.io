import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { Seminar } from '../../../core/models/seminar.model';
import { SEMINAR_SERVICE } from '../../../core/contracts/seminar.interface';
import { SeminarCardComponent } from '../../components/seminar-card/seminar-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { PaginatedGridComponent } from '../../../shared/components/paginated-grid/paginated-grid.component';

@Component({
    selector: 'app-archive',
    standalone: true,
    imports: [CommonModule, SeminarCardComponent, SkeletonCardComponent, PaginatedGridComponent],
    templateUrl: './archive.component.html'
})
export class ArchiveComponent implements OnInit {
    private seminarService = inject(SEMINAR_SERVICE);

    seminars: Seminar[] = [];
    loading = false;

    ngOnInit() {
        this.loadArchive();
    }

    private loadArchive() {
        this.loading = true;
        const now = new Date();
        this.seminarService.getSeminars().pipe(
            map(seminars => seminars.filter(s => new Date(s.date_time) <= now))
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
}
