import { DocumentSnapshot } from '@angular/fire/firestore';

export interface PaginatedResult<T> {
    data: T[];
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
}