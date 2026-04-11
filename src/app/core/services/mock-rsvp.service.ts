// import { Injectable, inject } from '@angular/core';
// import { Observable, BehaviorSubject, of, map, delay, switchMap, combineLatest } from 'rxjs';
// import { IRsvpService } from '../contracts/rsvp.interface';
// import { Seminar } from '../models/seminar.model';
// import { MockAuthService } from './mock-auth.service';
// import { MockSeminarService } from './mock-seminar.service';
// import { generateGoogleCalendarLink } from '../utils/calendar.util';

// @Injectable({ providedIn: 'root' })
// export class MockRsvpService implements IRsvpService {
//     private rsvpStore = new BehaviorSubject<{ [seminarId: string]: string[] }>({}); // seminarId -> user_ids

//     private auth = inject(MockAuthService);
//     private seminarServ = inject(MockSeminarService);

//     isAttending$(seminarId: string): Observable<boolean> {
//         return combineLatest([this.auth.currentUser$, this.rsvpStore]).pipe(
//             map(([user, store]) => {
//                 if (!user) return false;
//                 const attendees = store[seminarId] || [];
//                 return attendees.includes(user.id);
//             })
//         );
//     }

//     getUserRsvps(): Observable<Seminar[]> {
//         return combineLatest([this.auth.currentUser$, this.rsvpStore]).pipe(
//             switchMap(([user, store]) => {
//                 if (!user) return of([]);
//                 const seminarIds = Object.keys(store).filter(sId => store[sId].includes(user.id));

//                 // This is a naive mock array fetch
//                 return this.seminarServ.getSeminars().pipe(
//                     map(seminars => seminars.filter(s => seminarIds.includes(s.id)))
//                 );
//             })
//         );
//     }

//     addRsvp(seminarId: string): Observable<void> {
//         let currentUser: string | undefined;
//         this.auth.currentUser$.subscribe(u => currentUser = u?.id).unsubscribe();

//         if (!currentUser) return of();

//         const state = { ...this.rsvpStore.value };
//         if (!state[seminarId]) state[seminarId] = [];
//         if (!state[seminarId].includes(currentUser)) {
//             state[seminarId].push(currentUser);
//             this.rsvpStore.next(state);
//         }
//         return of(undefined).pipe(delay(200));
//     }

//     removeRsvp(seminarId: string): Observable<void> {
//         let currentUser: string | undefined;
//         this.auth.currentUser$.subscribe(u => currentUser = u?.id).unsubscribe();

//         if (!currentUser) return of();

//         const state = { ...this.rsvpStore.value };
//         if (state[seminarId]) {
//             state[seminarId] = state[seminarId].filter(id => id !== currentUser);
//             this.rsvpStore.next(state);
//         }
//         return of(undefined).pipe(delay(200));
//     }

//     getCalendarLink(seminar: Seminar): string {
//         return generateGoogleCalendarLink(seminar);
//     }
// }
