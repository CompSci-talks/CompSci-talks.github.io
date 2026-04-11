import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, ParamMap } from '@angular/router';
import { Observable, switchMap, of, map, tap, catchError, shareReplay } from 'rxjs';
import { Seminar } from '../../../core/models/seminar.model';
import { AUTH_SERVICE } from '../../../core/contracts/auth.interface';
import { SEMINAR_SERVICE } from '../../../core/contracts/seminar.interface';
import { SeminarStatusPipe } from '../../../core/pipes/seminar-status.pipe';
import { VideoPlayerComponent } from '../../../seminar-room/components/video-player/video-player.component';
import { SlideViewerComponent } from '../../../seminar-room/components/slide-viewer/slide-viewer.component';
import { RsvpButtonComponent } from '../../components/rsvp-button/rsvp-button.component';
import { CommentsContainerComponent } from '../../../seminar-room/components/comments-container/comments-container.component';
import { MarkdownPipe } from "../../../shared/pipes/markdown-pipe";
import { DurationPipe } from '../../../shared/pipes/duration.pipe';

@Component({
    selector: 'app-seminar-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, SeminarStatusPipe, VideoPlayerComponent, SlideViewerComponent, RsvpButtonComponent, CommentsContainerComponent, MarkdownPipe, DurationPipe],
    templateUrl: './seminar-detail.component.html',
    styleUrl: './seminar-detail.component.css'
})
export class SeminarDetailComponent implements OnInit {
    private seminarService = inject(SEMINAR_SERVICE);
    private authService = inject(AUTH_SERVICE);
    private route = inject(ActivatedRoute);

    seminar$!: Observable<Seminar | null>;
    isAuthenticated$!: Observable<boolean>;
    seminar: Seminar | null = null;
    isLoading = true;
    imageLoaded = false;

    ngOnInit() {
        this.isAuthenticated$ = this.authService.currentUser$.pipe(map(user => !!user));

        this.seminar$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) => {
                const id = params.get('id');
                if (!id) {
                    this.isLoading = false;
                    this.seminar = null;
                    return of(null);
                }

                this.isLoading = true;
                this.seminar = null;
                this.imageLoaded = false;

                return this.seminarService.getSeminarById(id).pipe(
                    catchError(error => {
                        console.error('Failed to load seminar data:', error);
                        return of(null);
                    })
                );
            }),
            tap((data) => {
                this.seminar = data;
                this.isLoading = false;
            }),
            shareReplay(1)
        );

        this.seminar$.subscribe();
    }

    getSpeakerNames(speakers: any[] | undefined): string {
        if (!speakers) return '';
        return speakers.map(s => s.name).join(', ');
    }

    get isUpcoming(): boolean {
        return this.seminar ? this.seminar.date_time.getTime() > Date.now() : false;
    }
}