import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IEmailService, EmailPayload, SentEmail } from '../../../admin/services/email.service';

@Injectable({
    providedIn: 'root'
})
export class MailtoEmailAdapter implements IEmailService {
    /**
     * Opens the default mail client with a populated mailto link.
     */
    send(payload: EmailPayload): Observable<void> {
        const recipients = payload.to.join(',');
        const subject = encodeURIComponent(payload.subject);
        const body = encodeURIComponent(payload.body);

        const mailtoLink = `mailto:${recipients}?subject=${subject}&body=${body}`;

        // Open the mail client
        window.location.href = mailtoLink;

        return of(undefined);
    }

    getSentEmails(): Observable<SentEmail[]> {
        return of([]);
    }
}
