import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { provideQuillConfig } from 'ngx-quill';
import { FirebaseSemesterService } from './firebase-adapters/firebase-semester.service';
import { FirebaseSeminarService } from './firebase-adapters/firebase-seminar.service';
import { FirebaseAuthService } from './firebase-adapters/firebase-auth.service';
import { FirebaseCommentService } from './firebase-adapters/firebase-comment.service';
import { FirebaseRsvpService } from './firebase-adapters/firebase-rsvp.service';
import { FirebaseSpeakerService } from './firebase-adapters/firebase-speaker.service';
import { FirebaseTagService } from './firebase-adapters/firebase-tag.service';
import { AUTH_SERVICE } from './core/contracts/auth.interface';
import { RSVP_SERVICE } from './core/contracts/rsvp.interface';
import { SEMESTER_SERVICE } from './core/contracts/semester.interface';
import { SPEAKER_SERVICE } from './core/contracts/speaker.interface';
import { TAG_SERVICE } from './core/contracts/tag.interface';
import { SEMINAR_SERVICE } from './core/contracts/seminar.interface';
import { COMMENT_SERVICE } from './core/contracts/comment.interface';
import { EMAIL_SERVICE } from './admin/services/email.service';
import { ATTENDANCE_SERVICE } from './admin/services/attendance.service';
import { FirebaseAttendanceService } from './firebase-adapters/firebase-attendance.service';
import { USER_SERVICE } from './core/contracts/user.service.interface';
import { USER_ACTIVITY_SERVICE } from './core/contracts/user-activity.service.interface';
import { FirebaseUserProfileService } from './firebase-adapters/firebase-user-profile.service';
import { FirebaseUserActivityService } from './firebase-adapters/firebase-user-activity.service';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { STORAGE_SERVICE } from './core/contracts/storage.interface';
import { FirebaseStorageService } from './firebase-adapters/firebase-storage.service';
import { VercelMailService } from './core/services/vercel-mail-service';
import { CONTACT_SUBMISSION_SERVICE } from './core/contracts/contact-submission.interface';
import { FirebaseContactSubmissionService } from './firebase-adapters/firebase-contact-submission.service';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
// No activity service yet, but let's assume we'll use a mock or similar soon, 
// for now let's only provide USER_SERVICE if we haven't created the other implementation.
// Actually T020 says FirebaseUserActivityService, but I haven't written it.
// I'll provide USER_SERVICE only for now.

export const appConfig: ApplicationConfig = {
  providers: [
    provideStorage(() => getStorage()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // Firebase Setup
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimations(),
    // Core Firebase Service Injection
    { provide: STORAGE_SERVICE, useClass: FirebaseStorageService },
    { provide: SEMESTER_SERVICE, useClass: FirebaseSemesterService },
    { provide: SEMINAR_SERVICE, useClass: FirebaseSeminarService },
    { provide: AUTH_SERVICE, useClass: FirebaseAuthService },
    { provide: SPEAKER_SERVICE, useClass: FirebaseSpeakerService },
    { provide: TAG_SERVICE, useClass: FirebaseTagService },
    { provide: COMMENT_SERVICE, useClass: FirebaseCommentService },
    { provide: RSVP_SERVICE, useClass: FirebaseRsvpService },
    { provide: EMAIL_SERVICE, useClass: VercelMailService },
    { provide: ATTENDANCE_SERVICE, useClass: FirebaseAttendanceService },
    { provide: USER_SERVICE, useClass: FirebaseUserProfileService },
    { provide: USER_ACTIVITY_SERVICE, useClass: FirebaseUserActivityService },
    { provide: CONTACT_SUBMISSION_SERVICE, useClass: FirebaseContactSubmissionService },
    provideQuillConfig({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    }),
    provideAnalytics(() => getAnalytics()),
  ]
};
