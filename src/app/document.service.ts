import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {
  UserDocumentResponse,
  DocumentMetadata,
} from './models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/api/users/documents`;

  constructor(private http: HttpClient) {}

  uploadDocument(
    documentType: string,
    file: File
  ): Observable<DocumentMetadata | number> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('documentType', documentType);

    return this.http
      .post<DocumentMetadata>(this.apiUrl, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            return Math.round((100 * event.loaded) / event.total);
          } else if (event instanceof HttpResponse) {
            return event.body as DocumentMetadata;
          }
          return 0;
        }),
        catchError(this.handleError)
      );
  }

  getUserDocuments(): Observable<UserDocumentResponse[]> {
    return this.http.get<UserDocumentResponse[]>(this.apiUrl).pipe(
      map((documents) =>
        documents.map((doc) => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt as string),
        }))
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error in DocumentService:', error);
    let errorMessage = 'An unknown error occurred with the document service!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Server-side error Code: ${error.status}\nMessage: ${
        error.error?.message ||
        error.message ||
        error.statusText ||
        'Server error'
      }`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
