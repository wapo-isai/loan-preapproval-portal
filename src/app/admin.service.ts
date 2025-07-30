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
  private apiUrl = `${environment.apiUrl}/api/applications`;

  constructor(private http: HttpClient) {}

  getAllApplications(): Observable<ApplicationListItem[]> {
    return this.http.get<BackendLoanApplication[]>(this.apiUrl).pipe(
      map((backendApps) =>
        backendApps.map((app) => this.mapBackendToListItem(app))
      ),
      catchError(this.handleError)
    );
  }

  getApplicationDetails(id: string): Observable<AdminApplicationDetail> {
    return this.http.get<BackendLoanApplication>(`${this.apiUrl}/${id}`).pipe(
      map((backendApp) => this.mapBackendToDetail(backendApp)),
      catchError(this.handleError)
    );
  }

  updateApplicationStatus(
    id: string,
    newStatus: ApplicationStatus
  ): Observable<AdminApplicationDetail> {
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

  saveAdminNotes(
    id: string,
    notes: string
  ): Observable<AdminApplicationDetail> {
    const payload: AdminNotesUpdateRequestPayload = { notes: notes };
    return this.http
      .patch<BackendLoanApplication>(`${this.apiUrl}/${id}/notes`, payload)
      .pipe(
        map((backendApp) => this.mapBackendToDetail(backendApp)),
        catchError(this.handleError)
      );
  }

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
      mappedCurrentStatus = ApplicationStatus.SUBMITTED;
    }

    const detail: AdminApplicationDetail = {
      id: app.id,
      userId: app.userId,
      loanAmount: app.loanAmount,
      homePrice: app.homePrice,
      annualIncome: app.annualIncome,
      totalDebt: app.monthlyDebt,
      creditScore: app.creditScore,
      employmentStatus: app.employmentStatus,
      currentStatus: mappedCurrentStatus,
      submissionDate: app.submittedAt ? new Date(app.submittedAt) : undefined,
      adminNotes: app.adminNotes || '',
      statusHistory: app.timeline
        ? app.timeline.map((event: TimelineEvent) => {
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
                : new Date(),
              status: eventStatusEnum,
            };
          })
        : [],
      eligible: app.eligible,
      evaluationReason: app.evaluationReason,
    };
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
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${
        error.error?.message || error.message || error.statusText
      }`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
