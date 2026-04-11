import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ContactSubmission {
    id?: string;
    name?: string;
    email?: string;
    subject: 'General Feedback' | 'Bug Report' | 'Speaker Suggestion' | 'Other';
    message: string;
    submitterUid?: string | null;
    createdAt?: any; // Firestore serverTimestamp or Date string
    status: 'new' | 'read' | 'resolved';
    isDeleted: boolean;
}

export interface IContactSubmissionService {
    /**
     * Submits a new contact message and persists it.
     */
    submitContactMessage(submission: Omit<ContactSubmission, 'id' | 'createdAt' | 'status' | 'isDeleted'>): Promise<void>;

    /**
     * Retrieves messages with optional filtering.
     * @param limit Maximum results
     * @param filters Optional status or subject filtering
     */
    getSubmissions(limit?: number, filters?: { status?: ContactSubmission['status'], subject?: string | string[] }): Observable<ContactSubmission[]>;

    /**
     * Updates the moderation status of a submission.
     */
    updateStatus(id: string, status: ContactSubmission['status']): Promise<void>;

    /**
     * Soft-deletes a submission by setting isDeleted: true.
     */
    softDelete(id: string): Promise<void>;
}

export const CONTACT_SUBMISSION_SERVICE = new InjectionToken<IContactSubmissionService>('IContactSubmissionService');
