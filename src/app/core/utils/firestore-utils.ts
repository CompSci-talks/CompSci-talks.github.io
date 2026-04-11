/**
 * Sanitizes an object for Firestore by recursively removing 'undefined' values
 * and reserved keys that should not be persisted as part of the document data.
 * 
 * @param obj The object to sanitize
 * @param keysToRemove Optional array of keys to remove (defaults to ['id', 'uid'])
 * @returns A new sanitized object
 */
export function sanitizeForFirestore(obj: any, keysToRemove: string[] = ['id', 'uid']): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Handle Dates (should be preserved)
    if (obj instanceof Date) {
        return obj;
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeForFirestore(item, keysToRemove));
    }

    const sanitized: any = {};
    Object.keys(obj).forEach(key => {
        // Skip reserved keys if they are at the top level or within nested objects
        if (keysToRemove.includes(key)) {
            return;
        }

        const value = obj[key];
        if (value !== undefined) {
            sanitized[key] = sanitizeForFirestore(value, keysToRemove);
        }
    });

    return sanitized;
}

import { Firestore, collection, query, where, getDocs, limit } from '@angular/fire/firestore';

/**
 * Checks if a value is unique within a collection (case-insensitive where possible).
 * Note: Firestore matches are case-sensitive. This check performs an exact match.
 * For true case-insensitive uniqueness, considers storing a 'name_lower' field.
 */
export async function isNameUnique(
    firestore: Firestore,
    collectionName: string,
    fieldName: string,
    value: string,
    excludeId?: string
): Promise<boolean> {
    if (!value) return true;

    const colRef = collection(firestore, collectionName);
    const q = query(colRef, where(fieldName, '==', value), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return true;

    // Check if the only match is the record we are excluding (self-update)
    if (excludeId && querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === excludeId) {
        return true;
    }

    return false;
}
