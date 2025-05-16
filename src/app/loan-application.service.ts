import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service'; // To get user ID
import {
  BackendLoanApplication,
  NewLoanApplicationPayload,
} from './models/loan-application.model';

@Injectable({
  providedIn: 'root',
})
export class LoanApplicationService {
  private apiUrl = `${environment.apiUrl}/api/applications`; // Gateway endpoint

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.id : null; // Assuming 'id' is available on your currentUser object
  }

  submitOrSaveApplication(
    payload: NewLoanApplicationPayload
  ): Observable<BackendLoanApplication> {
    // The backend POST /api/applications seems to handle both new and potentially draft submissions
    // if the payload contains the status.
    return this.http
      .post<BackendLoanApplication>(this.apiUrl, payload)
      .pipe(catchError(this.handleError));
  }

  // Method to get applications for the current user (could be used to find drafts)
  getUserApplications(): Observable<BackendLoanApplication[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return throwError(
        () => new Error('User not authenticated or user ID not found.')
      );
    }
    return this.http
      .get<BackendLoanApplication[]>(`${this.apiUrl}/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  // Method to get a specific application by its ID
  getApplicationById(
    applicationId: string
  ): Observable<BackendLoanApplication> {
    return this.http
      .get<BackendLoanApplication>(`${this.apiUrl}/${applicationId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error in LoanApplicationService:', error);
    let errorMessage = 'An unknown error occurred with the loan application!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Error Code: ${error.status}\nMessage: ${
        error.error?.message || error.message || error.statusText
      }`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
