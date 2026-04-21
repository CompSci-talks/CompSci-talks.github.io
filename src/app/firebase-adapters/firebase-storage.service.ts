import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { IStorageService } from '../core/contracts/storage.interface';

@Injectable({ providedIn: 'root' })
export class FirebaseStorageService implements IStorageService {
    private storage = inject(Storage);

    uploadProfilePicture(uid: string, file: File): Observable<string> {
        const filePath = `profile_pictures/${uid}/${Date.now()}_${file.name}`;
        return this.uploadToPath(filePath, file);
    }

    uploadSeminarThumbnail(file: File): Observable<string> {
        const filePath = `seminar_thumbnails/${Date.now()}_${file.name}`;
        return this.uploadToPath(filePath, file);
    }

    private uploadToPath(path: string, file: File): Observable<string> {
        const storageRef = ref(this.storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Observable<string>(observer => {
            uploadTask.on(
                'state_changed',
                null,
                error => observer.error(error),
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    observer.next(url);
                    observer.complete();
                }
            );
        });
    }

    deleteFile(url: string): Observable<void> {
        const fileRef = ref(this.storage, url);
        return from(deleteObject(fileRef));
    }
}