import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Firestore, collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { sanitizeForFirestore } from '../utils/firestore-utils';
import { IEmailService, EmailPayload, SentEmail } from '../../admin/services/email.service';

@Injectable({
    providedIn: 'root'
})
export class VercelMailService implements IEmailService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);

    private readonly MAIL_ENDPOINT = 'https://send-mail-gamma.vercel.app/api/send-mail';
    private readonly VERIFY_MAIL_ENDPOINT = 'https://send-mail-gamma.vercel.app/api/send-verification-mail';
    private readonly RESET_MAIL_ENDPOINT = 'https://send-mail-gamma.vercel.app/api/send-reset-mail';

    send(payload: EmailPayload): Observable<void> {
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
            return throwError(() => new Error('Unauthenticated user cannot send emails.'));
        }

        const sendRequest = fetch(this.MAIL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: payload.to.length === 1 ? payload.to[0] : payload.to,
                subject: payload.subject,
                html: payload.body,
            }),
        }).then(async res => {
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to send email');
            }
        });

        return from(sendRequest).pipe(
            switchMap(() => {
                const textSnippet = payload.body.replace(/<[^>]*>?/gm, '').substring(0, 150);
                const emailRecord = {
                    senderUid: currentUser.uid,
                    recipientUids: payload.to,
                    subject: payload.subject,
                    bodySnippet: textSnippet,
                    sentAt: serverTimestamp(),
                    ...payload.metadata
                };

                const sanitizedData = sanitizeForFirestore(emailRecord);
                const emailsRef = collection(this.firestore, 'SentEmails');
                return from(addDoc(emailsRef, sanitizedData));
            }),
            switchMap(() => from(Promise.resolve())),
            catchError(error => {
                console.error('Failed to send email or save record:', error);
                return throwError(() => new Error(error?.message || 'Failed to send email'));
            })
        );
    }

    getSentEmails(): Observable<SentEmail[]> {
        const emailsRef = collection(this.firestore, 'SentEmails');
        const q = query(emailsRef, orderBy('sentAt', 'desc'));

        return from(getDocs(q).then(snapshot => {
            return snapshot.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    senderUid: data['senderUid'],
                    recipientUids: data['recipientUids'],
                    subject: data['subject'],
                    bodySnippet: data['bodySnippet'],
                    sentAt: data['sentAt']?.toDate() || new Date()
                } as SentEmail;
            });
        }));
    }

    sendVerificationEmail(email: string, displayName: string, idToken: string): Promise<void> {
        return fetch(this.VERIFY_MAIL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                displayName,
                continueUrl: window.location.origin + '/verify-email',
                idToken
            })
        }).then(async res => {
            if (!res.ok) console.warn('[VercelMailService] Verification email failed:', await res.text());
        }).catch(err => console.warn('[VercelMailService] Verification email error:', err));
    }

    sendPasswordResetEmail(email: string): Promise<void> {
        return fetch(this.RESET_MAIL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                continueUrl: window.location.origin + '/reset-password'
            })
        }).then(async res => {
            if (!res.ok) console.warn('[VercelMailService] Reset email failed:', await res.text());
        }).catch(err => console.warn('[VercelMailService] Reset email error:', err));
    }
}