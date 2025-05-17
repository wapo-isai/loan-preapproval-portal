import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import {
  ApplicationStatus,
  LoanApplication,
  TimelineEvent,
} from '../models/application.model';

import { LoanApplicationService } from '../loan-application.service';
import { BackendLoanApplication } from '../models/loan-application.model';

@Component({
  selector: 'app-application-status-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-status-page.component.html',
  styleUrl: './application-status-page.component.css',
})
export class ApplicationStatusPageComponent implements OnInit, OnDestroy {
  application: LoanApplication | null = null;
  applicationId: string | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  readonly demoStatuses = ApplicationStatus;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private applicationService: LoanApplicationService // Inject the service
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.unsubscribe$),
        map((params) => params.get('id'))
      )
      .subscribe((id) => {
        if (id) {
          this.applicationId = id;
          this.loadApplicationData(id);
        } else {
          this.error = 'Application ID not found in route.';
          this.isLoading = false;
          // this.router.navigate(['/some-error-page-or-dashboard']);
        }
      });
  }

  loadApplicationData(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.application = null; // Reset previous application

    this.applicationService
      .getApplicationById(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (backendApp: BackendLoanApplication) => {
          // Map backend data to the structure your component expects
          this.application = this.mapBackendToComponentData(backendApp);
          // Sort timeline by date descending if not already sorted by backend
          if (this.application && this.application.timeline) {
            this.application.timeline.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load application data', err);
          this.error = `Failed to load application details: ${
            err.message || 'Please try again later.'
          }`;
          this.isLoading = false;
        },
      });
  }

  private mapBackendToComponentData(
    backendApp: BackendLoanApplication
  ): LoanApplication {
    // Convert string status from backend to ApplicationStatus enum
    // This requires your ApplicationStatus enum to have string values matching backend
    let currentStatusEnum: ApplicationStatus;
    switch (backendApp.status?.toLowerCase()) {
      case 'submitted':
        currentStatusEnum = ApplicationStatus.SUBMITTED;
        break;
      case 'under review':
        currentStatusEnum = ApplicationStatus.UNDER_REVIEW;
        break;
      case 'additional info required':
        currentStatusEnum = ApplicationStatus.ADDITIONAL_INFO_REQUIRED;
        break;
      case 'approved':
        currentStatusEnum = ApplicationStatus.APPROVED;
        break;
      case 'rejected':
        currentStatusEnum = ApplicationStatus.REJECTED;
        break;
      default:
        currentStatusEnum = ApplicationStatus.SUBMITTED; // Or some default/unknown status
    }

    // Calculate progress (example logic, adjust as needed)
    let progress = 0;
    switch (currentStatusEnum) {
      case ApplicationStatus.SUBMITTED:
        progress = 10;
        break;
      case ApplicationStatus.UNDER_REVIEW:
        progress = 50;
        break;
      case ApplicationStatus.ADDITIONAL_INFO_REQUIRED:
        progress = 65;
        break;
      case ApplicationStatus.APPROVED:
        progress = 100;
        break;
      case ApplicationStatus.REJECTED:
        progress = 100;
        break; // Or 0
    }

    return {
      id: backendApp.id || 'N/A',
      submittedDate: backendApp.submittedAt
        ? new Date(backendApp.submittedAt)
        : new Date(), // Ensure it's a Date object
      currentStatus: currentStatusEnum,
      progress: progress,
      loanAmount: backendApp.loanAmount,
      homePrice: backendApp.homePrice,
      timeline: backendApp.timeline
        ? backendApp.timeline.map((event) => ({
            ...event,
            date: new Date(event.date), // Ensure timeline event dates are Date objects
          }))
        : [],
    };
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return 'status-submitted';
      case ApplicationStatus.UNDER_REVIEW:
        return 'status-under-review';
      case ApplicationStatus.APPROVED:
        return 'status-approved';
      case ApplicationStatus.REJECTED:
        return 'status-rejected';
      case ApplicationStatus.ADDITIONAL_INFO_REQUIRED:
        return 'status-info-required';
      default:
        return 'status-default';
    }
  }

  getTimelineIcon(status: ApplicationStatus | string): string {
    // Handle potential string status from timeline events if not pre-mapped
    const statusEnum =
      typeof status === 'string'
        ? (ApplicationStatus as any)[status.toUpperCase().replace(/ /g, '_')]
        : status;
    switch (statusEnum) {
      case ApplicationStatus.SUBMITTED:
        return 'fas fa-file-alt';
      case ApplicationStatus.UNDER_REVIEW:
        return 'fas fa-clock';
      case ApplicationStatus.ADDITIONAL_INFO_REQUIRED:
        return 'fas fa-exclamation-circle';
      case ApplicationStatus.APPROVED:
        return 'fas fa-check-circle';
      case ApplicationStatus.REJECTED:
        return 'fas fa-times-circle';
      default:
        return 'fas fa-info-circle';
    }
  }

  // --- Demo Controls (remain client-side for now) ---
  changeDemoStatus(newStatus: ApplicationStatus): void {
    if (this.application) {
      this.application.currentStatus = newStatus;
      // Update progress based on status (simplified)
      switch (newStatus) {
        case ApplicationStatus.SUBMITTED:
          this.application.progress = 10;
          break;
        case ApplicationStatus.UNDER_REVIEW:
          this.application.progress = 50;
          break;
        case ApplicationStatus.ADDITIONAL_INFO_REQUIRED:
          this.application.progress = 65;
          break;
        case ApplicationStatus.APPROVED:
          this.application.progress = 100;
          break;
        case ApplicationStatus.REJECTED:
          this.application.progress = 100;
          break;
        default:
          this.application.progress = 0;
      }

      const newTimelineEvent: TimelineEvent = {
        status: newStatus,
        date: new Date(),
        description: `Status manually changed to ${newStatus}. (Demo)`,
        icon: this.getTimelineIcon(newStatus),
      };
      this.application.timeline.unshift(newTimelineEvent);
      this.application.timeline.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      console.log(`Demo: Status changed to ${newStatus}`);
      // In a real app, you would call a service to update status on backend, then reload or patch local data.
      // e.g., this.applicationService.updateStatus(this.application.id, newStatus).subscribe(() => this.loadApplicationData(this.applicationId!));
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
