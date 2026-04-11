import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export interface EmailPayload {
    to: string[];
    subject: string;
    body: string; // HTML content from rich-text editor
    metadata?: Record<string, any>;
}

export interface SentEmail {
    id?: string;
    senderUid: string;
    recipientUids: string[];
    subject: string;
    bodySnippet: string;
    sentAt: Date;
}

export interface IEmailService {
    /**
     * Sends a rich-text email to the specified recipients.
     * @param payload Recipients, subject, and HTML body.
     */
    send(payload: EmailPayload): Observable<void>;

    /**
     * Retrieves the audit log of sent emails.
     */
    getSentEmails(): Observable<SentEmail[]>;
}

export const EMAIL_SERVICE = new InjectionToken<IEmailService>('EMAIL_SERVICE');
