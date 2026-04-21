import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const STORAGE_SERVICE = new InjectionToken<IStorageService>('STORAGE_SERVICE');

export interface IStorageService {
    uploadProfilePicture(uid: string, file: File): Observable<string>;
    uploadSeminarThumbnail(file: File): Observable<string>;
    deleteFile(url: string): Observable<void>;
}