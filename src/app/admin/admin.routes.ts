import { Routes } from '@angular/router';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { STORAGE_SERVICE } from '../core/contracts/storage.interface';
import { FirebaseStorageService } from '../firebase-adapters/firebase-storage.service';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        // Storage is only used by admin pages, so it's provided here to keep it out of the initial bundle
        providers: [
            provideStorage(() => getStorage()),
            { provide: STORAGE_SERVICE, useClass: FirebaseStorageService },
        ],
        loadComponent: () => import('./components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'seminars', pathMatch: 'full' },
            // TODO: implement semester manager
            // {
            //     path: 'semesters',
            //     loadComponent: () => import('./pages/semester-manager/semester-manager.component').then(m => m.SemesterManagerComponent)
            // },
            {
                path: 'seminars',
                loadComponent: () => import('./pages/seminar-manager/seminar-manager.component').then(m => m.SeminarManagerComponent)
            },
            {
                path: 'feedback',
                loadComponent: () => import('./pages/contact-us-moderation/contact-us-moderation.component').then(m => m.ContactUsModerationComponent)
            },
            {
                path: 'moderation',
                loadComponent: () => import('./pages/comment-moderation/comment-moderation.component').then(m => m.CommentModerationComponent)
            },
            {
                path: 'speakers',
                loadComponent: () => import('./pages/speaker-manager/speaker-manager.component').then(m => m.SpeakerManagerComponent)
            },
            {
                path: 'tags',
                loadComponent: () => import('./pages/tag-manager/tag-manager.component').then(m => m.TagManagerComponent)
            },
            {
                path: 'seminar/:id/attendance',
                loadComponent: () => import('./pages/attendance/attendance.page').then(m => m.AttendancePageComponent)
            },
            {
                path: 'user-management',
                loadComponent: () => import('./pages/user-management-page/user-management-page.component').then(m => m.UserManagementPageComponent)
            },
            {
                path: 'user/:id',
                loadComponent: () => import('./pages/user-detail-page/user-detail-page.component').then(m => m.UserDetailPageComponent)
            },
            {
                path: 'email-composer',
                loadComponent: () => import('./pages/email-composer-page/email-composer-page').then(m => m.EmailComposerPage)
            },
            {
                path: 'email-settings',
                loadComponent: () => import('./pages/email-settings/email-settings.component').then(m => m.EmailSettingsComponent)
            }
        ]
    }
];
