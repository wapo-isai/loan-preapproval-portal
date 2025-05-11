import { Component } from '@angular/core';
import {
  ApplicationStatus,
  LoanApplication,
  TimelineEvent,
} from '../models/application.model';
import { Subject, takeUntil, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-status-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-status-page.component.html',
  styleUrl: './application-status-page.component.css',
})
export class ApplicationStatusPageComponent {
  application: LoanApplication | null = null;
  applicationId: string | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  // For demo purposes
  readonly demoStatuses = ApplicationStatus;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router // private applicationService: ApplicationService // Example
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
          this.error = 'Application ID not found.';
          this.isLoading = false;
          // Optionally navigate away or show an error component
          // this.router.navigate(['/some-error-page']);
        }
      });
  }

  loadApplicationData(id: string): void {
    this.isLoading = true;
    this.error = null;

    // ** SIMULATED DATA FETCH **
    // Replace with actual service call: this.applicationService.getApplicationById(id).subscribe(...)
    setTimeout(() => {
      // Mock data - In a real app, this would come from a service
      const mockApplications: { [key: string]: LoanApplication } = {
        APP12345: {
          id: 'APP12345',
          submittedDate: new Date('2024-05-08T06:30:00Z'),
          currentStatus: ApplicationStatus.UNDER_REVIEW,
          progress: 50,
          loanAmount: 250000,
          homePrice: 300000,
          timeline: [
            {
              status: ApplicationStatus.UNDER_REVIEW,
              date: new Date('2024-05-09T10:15:00Z'),
              description: 'Application is being reviewed by our team.',
              icon: 'fas fa-clock',
            },
            {
              status: ApplicationStatus.SUBMITTED,
              date: new Date('2024-05-08T06:30:00Z'),
              description: 'Application submitted successfully.',
              icon: 'fas fa-file-alt',
            },
          ],
        },
        APP67890: {
          id: 'APP67890',
          submittedDate: new Date('2024-05-07T09:00:00Z'),
          currentStatus: ApplicationStatus.APPROVED,
          progress: 100,
          loanAmount: 150000,
          homePrice: 220000,
          timeline: [
            {
              status: ApplicationStatus.APPROVED,
              date: new Date('2024-05-10T14:30:00Z'),
              description: 'Congratulations! Your loan has been approved.',
              icon: 'fas fa-check-circle',
            },
            {
              status: ApplicationStatus.UNDER_REVIEW,
              date: new Date('2024-05-08T11:00:00Z'),
              description: 'Application review in progress.',
              icon: 'fas fa-clock',
            },
            {
              status: ApplicationStatus.SUBMITTED,
              date: new Date('2024-05-07T09:00:00Z'),
              description: 'Application submitted.',
              icon: 'fas fa-file-alt',
            },
          ],
        },
      };

      const foundApplication = mockApplications[id];
      if (foundApplication) {
        this.application = { ...foundApplication }; // Create a copy to avoid direct mutation for demo
        // Sort timeline by date descending
        this.application.timeline.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );
      } else {
        this.error = `Application with ID ${id} not found.`;
      }
      this.isLoading = false;
    }, 1000); // Simulate network delay
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

  getTimelineIcon(status: ApplicationStatus): string {
    // This could be stored in the TimelineEvent itself, or derived
    switch (status) {
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

  // --- Demo Controls ---
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
          break; // Or 0 if it means end of process
        default:
          this.application.progress = 0;
      }

      // Add to timeline (for demo)
      const newTimelineEvent: TimelineEvent = {
        status: newStatus,
        date: new Date(), // Current time
        description: `Status manually changed to ${newStatus}.`,
        icon: this.getTimelineIcon(newStatus),
      };
      this.application.timeline.unshift(newTimelineEvent); // Add to the beginning
      this.application.timeline.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      // In a real app, you'd call a service to update the status on the backend.
      // this.applicationService.updateStatus(this.application.id, newStatus).subscribe(...)
      console.log(`Demo: Status changed to ${newStatus}`);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
