import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FirebaseTagService } from '../../../firebase-adapters/firebase-tag.service';
import { Tag } from '../../../core/models/seminar.model';
import { ScrollingTopicsComponent } from '../../../shared/components/scrolling-topics/scrolling-topics.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterModule, CommonModule, ScrollingTopicsComponent],
    templateUrl: './home.component.html'
})
export class HomeComponent {
    private tagService = inject(FirebaseTagService);
    tags$: Observable<Tag[]> = this.tagService.getTags();
}
