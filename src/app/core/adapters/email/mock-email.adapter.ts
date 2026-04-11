import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IEmailService, EmailPayload, SentEmail } from '../../../admin/services/email.service';

@Injectable({
    providedIn: 'root'
})
export class MockEmailAdapter implements IEmailService {
    /**
     * Simulates sending an email by logging the payload and delaying the response.
     */
    send(payload: EmailPayload): Observable<void> {
        console.log('--- MOCK EMAIL SENDER ---');
        console.log(`To: ${payload.to.join(', ')}`);
        console.log(`Subject: ${payload.subject}`);
        console.log(`Body: ${payload.body}`);
        console.log('-------------------------');

        return of(void 0).pipe(delay(1000));
    }

    getSentEmails(): Observable<SentEmail[]> {
        return of([]);
    }
}
