import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Seminar } from '../../../core/models/seminar.model';
import { SEMINAR_SERVICE } from '../../../core/contracts/seminar.interface';
import { SeminarCardComponent } from '../../components/seminar-card/seminar-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';
import { PaginatedGridComponent } from '../../../shared/components/paginated-grid/paginated-grid.component';
import { TextFilterComponent } from '../../../shared/components/text-filter/text-filter.component';

interface FilterOption {
    id: string;
    name: string;
}

@Component({
    selector: 'app-archive',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        SeminarCardComponent,
        SkeletonCardComponent,
        PaginatedGridComponent,
        TextFilterComponent
    ],
    templateUrl: './archive.component.html'
})
export class ArchiveComponent implements OnInit {
    private seminarService = inject(SEMINAR_SERVICE);
    @ViewChildren('filterMenu') filterMenus!: QueryList<ElementRef<HTMLDetailsElement>>;

    seminars: Seminar[] = [];
    filteredSeminars: Seminar[] = [];
    availableTags: FilterOption[] = [];
    availableSpeakers: FilterOption[] = [];
    loading = false;
    searchQuery = '';
    selectedTagIds: string[] = [];
    selectedSpeakerIds: string[] = [];
    showFilterControls = false;

    ngOnInit() {
        this.loadArchive();
    }

    private loadArchive() {
        this.loading = true;
        const now = new Date();
        this.seminarService.getSeminars().pipe(
            map(seminars => seminars
                .filter(s => new Date(s.date_time) <= now)
                .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
            )
        ).subscribe({
            next: (data) => {
                this.seminars = data;
                this.availableTags = this.buildOptions(data, 'tags');
                this.availableSpeakers = this.buildOptions(data, 'speakers');
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.seminars = [];
                this.filteredSeminars = [];
            }
        });
    }

    onSearchChange(value: string): void {
        this.searchQuery = value;
        this.applyFilters();
    }

    toggleFilterControls(): void {
        if (this.showFilterControls) {
            this.clearFilters();
            return;
        }

        this.showFilterControls = true;
    }

    toggleTag(tagId: string): void {
        if (this.selectedTagIds.includes(tagId)) {
            this.selectedTagIds = this.selectedTagIds.filter(id => id !== tagId);
        } else {
            this.selectedTagIds = [...this.selectedTagIds, tagId];
        }
        this.applyFilters();
    }

    toggleSpeaker(speakerId: string): void {
        if (this.selectedSpeakerIds.includes(speakerId)) {
            this.selectedSpeakerIds = this.selectedSpeakerIds.filter(id => id !== speakerId);
        } else {
            this.selectedSpeakerIds = [...this.selectedSpeakerIds, speakerId];
        }
        this.applyFilters();
    }

    getTagSummary(): string {
        return this.getSummaryLabel(this.selectedTagIds, this.availableTags, 'Filter by tags');
    }

    getSpeakerSummary(): string {
        return this.getSummaryLabel(this.selectedSpeakerIds, this.availableSpeakers, 'Filter by speakers');
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const clickedInsideMenu = this.filterMenus?.some(menu =>
            menu.nativeElement.contains(target)
        );

        if (!clickedInsideMenu) {
            this.closeFilterMenus();
        }
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedTagIds = [];
        this.selectedSpeakerIds = [];
        this.applyFilters();
        this.showFilterControls = false;
    }

    get hasActiveFilters(): boolean {
        return !!this.searchQuery.trim() || this.selectedTagIds.length > 0 || this.selectedSpeakerIds.length > 0;
    }

    private applyFilters(): void {
        const search = this.searchQuery.trim().toLowerCase();

        this.filteredSeminars = this.seminars.filter(seminar => {
            const matchesSearch = !search || this.matchesSearch(seminar, search);
            const matchesTags = this.selectedTagIds.length === 0
                || this.selectedTagIds.every(tagId => seminar.tags?.some(tag => tag.id === tagId));
            const matchesSpeakers = this.selectedSpeakerIds.length === 0
                || this.selectedSpeakerIds.every(speakerId => seminar.speakers?.some(speaker => speaker.id === speakerId));

            return matchesSearch && matchesTags && matchesSpeakers;
        });
    }

    private matchesSearch(seminar: Seminar, search: string): boolean {
        const haystack = [
            seminar.title,
            seminar.abstract,
            seminar.location,
            ...(seminar.tags?.map(tag => tag.name) ?? []),
            ...(seminar.speakers?.map(speaker => speaker.name) ?? [])
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(search);
    }

    private buildOptions(seminars: Seminar[], key: 'tags' | 'speakers'): FilterOption[] {
        const optionMap = new Map<string, FilterOption>();

        for (const seminar of seminars) {
            for (const item of seminar[key] ?? []) {
                if (!optionMap.has(item.id)) {
                    optionMap.set(item.id, { id: item.id, name: item.name });
                }
            }
        }

        return Array.from(optionMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    private getSummaryLabel(selectedIds: string[], options: FilterOption[], placeholder: string): string {
        if (selectedIds.length === 0) return placeholder;

        const firstSelected = options.find(option => option.id === selectedIds[0]);
        if (!firstSelected) return placeholder;

        if (selectedIds.length === 1) return firstSelected.name;
        return `${firstSelected.name} +${selectedIds.length - 1}`;
    }

    private closeFilterMenus(): void {
        this.filterMenus?.forEach(menu => {
            menu.nativeElement.open = false;
        });
    }
}
