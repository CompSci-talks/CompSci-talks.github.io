import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection, query, orderBy, documentId, limit, startAfter, queryEqual } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { FirebaseUserProfileService } from './firebase-user-profile.service';

vi.mock('firebase/firestore', async original => ({
    ...await original<typeof import('firebase/firestore')>(), getDocs: vi.fn()
}));
const db = getFirestore(initializeApp({ projectId: 'demo-user-list' }, 'user-list-test'));
const snapshot = (records: { id: string; data: Record<string, unknown> }[]) => ({
    size: records.length, docs: records.map(record => ({ id: record.id, data: () => record.data }))
});
describe('User management profile queries', () => {
    let service: FirebaseUserProfileService;
    beforeEach(() => {
        vi.clearAllMocks();
        TestBed.configureTestingModule({ providers: [{ provide: Firestore, useValue: db }] });
        service = TestBed.inject(FirebaseUserProfileService);
    });
    it('includes legacy and nameless profiles without ordering on an optional field', async () => {
        vi.mocked(getDocs).mockResolvedValue(snapshot([
            { id: 'a', data: { display_name: 'Modern' } },
            { id: 'b', data: { displayName: 'Legacy' } },
            { id: 'c', data: { email: 'nameless@example.com' } }
        ]) as never);
        const users = await firstValueFrom(service.getUsers(11));
        expect(users.map(u => u.display_name)).toEqual(['Modern', 'Legacy', 'User']);
        expect(users.map(u => u.id)).toEqual(['a', 'b', 'c']);
        expect(queryEqual(vi.mocked(getDocs).mock.calls[0][0], query(collection(db, 'users'), orderBy(documentId()), limit(11)))).toBe(true);
    });
    it('can continue after a cursor profile has been deleted', async () => {
        vi.mocked(getDocs).mockResolvedValue(snapshot([]) as never);
        await firstValueFrom(service.getUsers(11, { id: 'deleted-user' } as never));
        expect(queryEqual(vi.mocked(getDocs).mock.calls[0][0], query(collection(db, 'users'), orderBy(documentId()), limit(11), startAfter('deleted-user')))).toBe(true);
    });
    it('searches subsequent batches and both legacy names and email without case sensitivity', async () => {
        vi.mocked(getDocs)
            .mockResolvedValueOnce(snapshot(Array.from({ length: 50 }, (_, i) => ({ id: String(i).padStart(3, '0'), data: { display_name: 'Other' } }))) as never)
            .mockResolvedValueOnce(snapshot([
                { id: '050', data: { displayName: 'Abdallah Hussein' } },
                { id: '051', data: { display_name: 'Someone', email: 'ABDALLAH@example.com' } }
            ]) as never);
        const users = await firstValueFrom(service.getUsers(11, undefined, ' ABDALLAH '));
        expect(users.map(u => u.id)).toEqual(['050', '051']);
        expect(getDocs).toHaveBeenCalledTimes(2);
    });
    it('propagates database errors instead of reporting an empty directory', async () => {
        vi.mocked(getDocs).mockRejectedValue(new Error('permission-denied'));
        await expect(firstValueFrom(service.getUsers(11))).rejects.toThrow('permission-denied');
    });
});
