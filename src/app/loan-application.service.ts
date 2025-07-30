import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';
import { BackendLoanApplication } from './models/loan-application.model';

@Injectable({
  providedIn: 'root',
})
export class LoanApplicationService {
  private apiUrl = `${environment.apiUrl}/api/applications`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.id : null;
  }

  submitOrSaveApplication(payload: any): Observable<BackendLoanApplication> {
    return this.http
      .post<BackendLoanApplication>(this.apiUrl, payload)
      .pipe(catchError(this.handleError));
  }

  getUserApplications(): Observable<BackendLoanApplication[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return throwError(
        () =>
          new Error(
            'User not authenticated or user ID not found for fetching applications.'
          )
      );
    }
    return this.http
      .get<BackendLoanApplication[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map((apps) =>
          apps.map((app) => ({
            ...app,
            submittedAt: app.submittedAt
              ? new Date(app.submittedAt)
              : undefined,
            updatedAt: app.updatedAt ? new Date(app.updatedAt) : undefined,
          }))
        ),
        catchError(this.handleError)
      );
  }

  getApplicationById(
    applicationId: string
  ): Observable<BackendLoanApplication> {
    return this.http
      .get<BackendLoanApplication>(`${this.apiUrl}/${applicationId}`)
      .pipe(
        map((app) => ({
          ...app,
          submittedAt: app.submittedAt ? new Date(app.submittedAt) : undefined,
          updatedAt: app.updatedAt ? new Date(app.updatedAt) : undefined,
          timeline: app.timeline
            ? app.timeline.map((event) => ({
                ...event,
                date: event.date
                  ? new Date(event.date as unknown as string)
                  : new Date(), // Defensive
              }))
            : [],
        })),
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('API Error in LoanApplicationService:', error);
    let errorMessage =
      'An unknown error occurred with the loan application service!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Server-side error Code: ${error.status}\nMessage: ${
        error.error?.message || error.message || error.statusText
      }`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
