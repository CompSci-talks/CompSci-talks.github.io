import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';
import { verifiedOrGuestGuard } from './core/verifiedOrGuest.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./portal/pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'archive',
        loadComponent: () => import('./portal/pages/archive/archive.component').then(m => m.ArchiveComponent),
        canActivate: [verifiedOrGuestGuard]
    },
    {
        path: 'schedule',
        loadComponent: () => import('./portal/pages/schedule/schedule.component').then(m => m.ScheduleComponent),
        canActivate: [verifiedOrGuestGuard]
    },
    {
        path: 'seminar/:id',
        loadComponent: () => import('./portal/pages/seminar-detail/seminar-detail.component').then(m => m.SeminarDetailComponent),
        canActivate: [verifiedOrGuestGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/pages/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./portal/pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
        path: 'contact',
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent)
    },
    {
        path: 'fire-redirect',
        loadComponent: () => import('./core/fire-redirect').then(m => m.FireRedirect)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile-page-component/profile-page-component').then(m => m.ProfilePageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin',
        canActivate: [AdminGuard],
        loadComponent: () => import('./admin/components/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'seminars', pathMatch: 'full' },
            // TODO: implement semester manager
            // {
            //     path: 'semesters',
            //     loadComponent: () => import('./admin/pages/semester-manager/semester-manager.component').then(m => m.SemesterManagerComponent)
            // },
            {
                path: 'seminars',
                loadComponent: () => import('./admin/pages/seminar-manager/seminar-manager.component').then(m => m.SeminarManagerComponent)
            },
            {
                path: 'feedback',
                loadComponent: () => import('./admin/pages/contact-us-moderation/contact-us-moderation.component').then(m => m.ContactUsModerationComponent)
            },
            {
                path: 'moderation',
                loadComponent: () => import('./admin/pages/comment-moderation/comment-moderation.component').then(m => m.CommentModerationComponent)
            },
            {
                path: 'speakers',
                loadComponent: () => import('./admin/pages/speaker-manager/speaker-manager.component').then(m => m.SpeakerManagerComponent)
            },
            {
                path: 'tags',
                loadComponent: () => import('./admin/pages/tag-manager/tag-manager.component').then(m => m.TagManagerComponent)
            },
            {
                path: 'seminar/:id/attendance',
                loadComponent: () => import('./admin/pages/attendance/attendance.page').then(m => m.AttendancePageComponent)
            },
            {
                path: 'user-management',
                loadComponent: () => import('./admin/pages/user-management-page/user-management-page.component').then(m => m.UserManagementPageComponent)
            },
            {
                path: 'user/:id',
                loadComponent: () => import('./admin/pages/user-detail-page/user-detail-page.component').then(m => m.UserDetailPageComponent)
            },
            {
                path: 'email-composer',
                loadComponent: () => import('./admin/pages/email-composer-page/email-composer-page').then(m => m.EmailComposerPage)
            },
            {
                path: 'email-settings',
                loadComponent: () => import('./admin/pages/email-settings/email-settings.component').then(m => m.EmailSettingsComponent)
            }
        ]
    },

    { path: '**', redirectTo: '' }
];
