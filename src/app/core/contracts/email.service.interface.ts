import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SentEmail } from '../models/sent-email.model';

export interface IEmailService {
    /**
     * Sends an email to the specified users and creates an audit log entry in Firestore.
     */
    sendEmail(recipientUids: string[], subject: string, bodyContent: string): Observable<void>;

    /**
     * Fetches the audit log of sent emails.
     */
    getSentEmails(): Observable<SentEmail[]>;
}

export const EMAIL_SERVICE = new InjectionToken<IEmailService>('EMAIL_SERVICE');
