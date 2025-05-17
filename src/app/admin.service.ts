// src/app/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {
  ApplicationListItem,
  AdminApplicationDetail,
  StatusUpdateRequestPayload,
  TimelineEvent,
  ApplicationStatus,
} from './models/application.model';
import { BackendLoanApplication } from './models/loan-application.model';

export interface AdminNotesUpdateRequestPayload {
  notes: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/applications`; // Gateway endpoint

  constructor(private http: HttpClient) {}

  // GET all applications for the list view
  getAllApplications(): Observable<ApplicationListItem[]> {
    return this.http.get<BackendLoanApplication[]>(this.apiUrl).pipe(
      map((backendApps) =>
        backendApps.map((app) => this.mapBackendToListItem(app))
      ),
      catchError(this.handleError)
    );
  }

  // GET details for a specific application
  getApplicationDetails(id: string): Observable<AdminApplicationDetail> {
    return this.http.get<BackendLoanApplication>(`${this.apiUrl}/${id}`).pipe(
      map((backendApp) => this.mapBackendToDetail(backendApp)),
      catchError(this.handleError)
    );
  }

  // PATCH to update application status
  updateApplicationStatus(
    id: string,
    newStatus: ApplicationStatus
  ): Observable<AdminApplicationDetail> {
    // The backend expects the string value of the enum
    const payload: StatusUpdateRequestPayload = {
      status: newStatus.toString(),
    };
    return this.http
      .patch<BackendLoanApplication>(`${this.apiUrl}/${id}/status`, payload)
      .pipe(
        map((backendApp) => this.mapBackendToDetail(backendApp)),
        catchError(this.handleError)
      );
  }

  // Placeholder for saving admin notes - requires backend endpoint
  // For now, this would be a separate call if an endpoint exists
  saveAdminNotes(
    id: string,
    notes: string
  ): Observable<AdminApplicationDetail> {
    const payload: AdminNotesUpdateRequestPayload = { notes: notes };
    return this.http
      .patch<BackendLoanApplication>(`${this.apiUrl}/${id}/notes`, payload)
      .pipe(
        map((backendApp) => this.mapBackendToDetail(backendApp)), // Assuming backend returns full updated app
        catchError(this.handleError)
      );
  }

  // --- Mappers ---
  private mapBackendToListItem(
    app: BackendLoanApplication
  ): ApplicationListItem {
    return {
      id: app.id,
      userId: app.userId,
      loanAmount: app.loanAmount,
      submissionDate:
        app.submittedAt == undefined
          ? new Date()
          : typeof app.submittedAt == 'string'
          ? new Date(app.submittedAt)
          : app.submittedAt,
      currentStatus: app.status as ApplicationStatus,
    };
  }

  private mapBackendToDetail(
    app: BackendLoanApplication
  ): AdminApplicationDetail {
    // Map the raw string status from backend to your ApplicationStatus enum
    // This provides a more robust way to handle status strings.
    let mappedCurrentStatus: ApplicationStatus;
    const backendStatusUpper = app.status?.toUpperCase().replace(/ /g, '_');
    if (
      backendStatusUpper &&
      ApplicationStatus[backendStatusUpper as keyof typeof ApplicationStatus]
    ) {
      mappedCurrentStatus =
        ApplicationStatus[backendStatusUpper as keyof typeof ApplicationStatus];
    } else {
      console.warn(
        `Unknown backend status received: ${app.status}. Defaulting to SUBMITTED.`
      );
      mappedCurrentStatus = ApplicationStatus.SUBMITTED; // Or handle as an error/unknown state
    }

    const detail: AdminApplicationDetail = {
      id: app.id, // Now guaranteed to be a string from BackendLoanApplication
      userId: app.userId,
      // applicantName: "Fetch/Join Name", // Populate if/when available
      loanAmount: app.loanAmount,
      homePrice: app.homePrice,
      annualIncome: app.annualIncome,
      totalDebt: app.monthlyDebt, // Mapping backend's monthlyDebt to UI's totalDebt
      creditScore: app.creditScore,
      employmentStatus: app.employmentStatus,
      currentStatus: mappedCurrentStatus, // Use the mapped enum value
      submissionDate: app.submittedAt ? new Date(app.submittedAt) : undefined,
      adminNotes: app.adminNotes || '', // Correctly maps from app.adminNotes
      statusHistory: app.timeline // Use app.timeline instead of app.statusHistory
        ? app.timeline.map((event: TimelineEvent) => {
            // Map event status string to enum if needed and ensure date is a Date object
            let eventStatusEnum: ApplicationStatus;
            const eventBackendStatusUpper = (event.status as string)
              ?.toUpperCase()
              .replace(/ /g, '_');
            if (
              eventBackendStatusUpper &&
              ApplicationStatus[
                eventBackendStatusUpper as keyof typeof ApplicationStatus
              ]
            ) {
              eventStatusEnum =
                ApplicationStatus[
                  eventBackendStatusUpper as keyof typeof ApplicationStatus
                ];
            } else {
              // If event.status is already an enum or if mapping fails, decide a fallback or use original
              eventStatusEnum =
                typeof event.status === 'string'
                  ? ApplicationStatus.SUBMITTED
                  : event.status;
              if (typeof event.status === 'string')
                console.warn(`Unknown timeline event status: ${event.status}`);
            }
            return {
              ...event,
              date: event.date
                ? new Date(event.date as unknown as string)
                : new Date(), // Ensure date is a Date object
              status: eventStatusEnum,
            };
          })
        : [],
      eligible: app.eligible,
      evaluationReason: app.evaluationReason,
      // ltvRatio & dtiRatio will be calculated next
    };

    // Calculate LTV and DTI
    if (
      detail.homePrice != null &&
      detail.homePrice > 0 &&
      detail.loanAmount != null
    ) {
      detail.ltvRatio = (detail.loanAmount / detail.homePrice) * 100;
    }
    if (
      detail.annualIncome != null &&
      detail.annualIncome > 0 &&
      detail.totalDebt != null
    ) {
      const monthlyIncome = detail.annualIncome / 12;
      if (monthlyIncome > 0) {
        detail.dtiRatio = (detail.totalDebt / monthlyIncome) * 100;
      }
    }
    return detail;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error in AdminService:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code.
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${
        error.error?.message || error.message || error.statusText
      }`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
