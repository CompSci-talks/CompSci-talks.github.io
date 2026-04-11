import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, orderBy, limit, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { IContactSubmissionService, ContactSubmission } from '../core/contracts/contact-submission.interface';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FirebaseContactSubmissionService implements IContactSubmissionService {
    private firestore: Firestore = inject(Firestore);

    async submitContactMessage(submission: Omit<ContactSubmission, 'id' | 'createdAt' | 'status' | 'isDeleted'>): Promise<void> {
        const contactRef = collection(this.firestore, 'contact_submissions');
        const enrichedPayload = {
            ...submission,
            createdAt: serverTimestamp(),
            status: 'new',
            isDeleted: false
        };

        await addDoc(contactRef, enrichedPayload);
    }

    getSubmissions(limitCount: number = 50, filters?: { status?: ContactSubmission['status'], subject?: string | string[] }): Observable<ContactSubmission[]> {
        const contactRef = collection(this.firestore, 'contact_submissions');

        const constraints: any[] = [
            where('isDeleted', '==', false)
        ];

        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (filters?.subject) {
            if (Array.isArray(filters.subject)) {
                if (filters.subject.length > 0) {
                    constraints.push(where('subject', 'in', filters.subject));
                }
            } else if (filters.subject !== 'all') {
                constraints.push(where('subject', '==', filters.subject));
            }
        }

        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(limitCount));

        try {
            const q = query(contactRef, ...constraints);
            return collectionData(q, { idField: 'id' }) as Observable<ContactSubmission[]>;
        } catch (error) {
            console.error('Error creating Firestore query:', error);
            throw error;
        }
    }

    async updateStatus(id: string, status: ContactSubmission['status']): Promise<void> {
        const contactDoc = doc(this.firestore, `contact_submissions/${id}`);
        await updateDoc(contactDoc, { status });
    }

    async softDelete(id: string): Promise<void> {
        const contactDoc = doc(this.firestore, `contact_submissions/${id}`);
        await updateDoc(contactDoc, { isDeleted: true });
    }
}
