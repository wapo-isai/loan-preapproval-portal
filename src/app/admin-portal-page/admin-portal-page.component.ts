import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Assuming models are in a shared location
import {
  ApplicationStatus,
  TimelineEvent,
  ApplicationListItem,
  AdminApplicationDetail,
} from '../models/application.model';
import { CommonModule } from '@angular/common';
// import { AdminService } from '../admin.service'; // Example service

@Component({
  selector: 'app-admin-portal-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-portal-page.component.html',
  styleUrl: './admin-portal-page.component.css',
})
export class AdminPortalPageComponent {
  applications: ApplicationListItem[] = [];
  selectedApplication: AdminApplicationDetail | null = null;
  isLoadingList: boolean = false;
  isLoadingDetails: boolean = false;
  adminNotesForm!: FormGroup;

  // For demo status changes
  readonly appStatuses = ApplicationStatus;

  // Mock data - replace with service calls
  private allApplicationDetails: AdminApplicationDetail[] = [
    {
      id: 'APP12345',
      loanAmount: 250000,
      submissionDate: new Date('2025-05-01T10:30:00Z'),
      currentStatus: ApplicationStatus.SUBMITTED,
      applicantName: 'John Doe',
      homePrice: 300000,
      annualIncome: 85000,
      totalDebt: 20000,
      creditScore: 720,
      statusHistory: [
        {
          status: ApplicationStatus.SUBMITTED,
          date: new Date('2025-05-01T10:30:00Z'),
          description: 'Application submitted by customer',
          actor: 'customer',
          icon: 'fas fa-file-alt',
        },
      ],
      adminNotes: '',
    },
    {
      id: 'APP12346',
      loanAmount: 180000,
      submissionDate: new Date('2025-05-02T14:00:00Z'),
      currentStatus: ApplicationStatus.UNDER_REVIEW,
      applicantName: 'Jane Smith',
      homePrice: 220000,
      annualIncome: 65000,
      totalDebt: 15000,
      creditScore: 680,
      statusHistory: [
        {
          status: ApplicationStatus.UNDER_REVIEW,
          date: new Date('2025-05-03T09:00:00Z'),
          description: 'Automatically moved to Under Review queue.',
          actor: 'system',
          icon: 'fas fa-cogs',
        },
        {
          status: ApplicationStatus.SUBMITTED,
          date: new Date('2025-05-02T14:00:00Z'),
          description: 'Application submitted by customer',
          actor: 'customer',
          icon: 'fas fa-file-alt',
        },
      ],
      adminNotes: 'Applicant has a short credit history.',
    },
    {
      id: 'APP12347',
      loanAmount: 350000,
      submissionDate: new Date('2025-04-28T11:15:00Z'),
      currentStatus: ApplicationStatus.APPROVED,
      applicantName: 'Alice Brown',
      homePrice: 450000,
      annualIncome: 120000,
      totalDebt: 25000,
      creditScore: 780,
      statusHistory: [
        {
          status: ApplicationStatus.APPROVED,
          date: new Date('2025-05-02T16:00:00Z'),
          description: 'Application approved by Admin X.',
          actor: 'admin',
          icon: 'fas fa-check-circle',
        },
        {
          status: ApplicationStatus.UNDER_REVIEW,
          date: new Date('2025-04-29T10:00:00Z'),
          description: 'Reviewed by loan officer.',
          actor: 'admin',
          icon: 'fas fa-user-tie',
        },
        {
          status: ApplicationStatus.SUBMITTED,
          date: new Date('2025-04-28T11:15:00Z'),
          description: 'Application submitted by customer',
          actor: 'customer',
          icon: 'fas fa-file-alt',
        },
      ],
      adminNotes: 'Strong candidate. Approved.',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router // private adminService: AdminService // Example
  ) {}

  ngOnInit(): void {
    this.loadApplicationsList();
    this.adminNotesForm = this.fb.group({
      notes: [''],
    });
  }

  loadApplicationsList(): void {
    this.isLoadingList = true;
    // Simulate API call
    // this.adminService.getApplications().subscribe(data => { ... })
    setTimeout(() => {
      this.applications = this.allApplicationDetails.map((app) => ({
        id: app.id,
        loanAmount: app.loanAmount,
        submissionDate: app.submissionDate,
        currentStatus: app.currentStatus,
        applicantName: app.applicantName,
      }));
      this.isLoadingList = false;
    }, 500);
  }

  viewApplicationDetails(applicationId: string): void {
    this.isLoadingDetails = true;
    this.selectedApplication = null; // Clear previous
    // Simulate API call for details
    // this.adminService.getApplicationDetails(applicationId).subscribe(data => { ... })
    setTimeout(() => {
      const detail = this.allApplicationDetails.find(
        (app) => app.id === applicationId
      );
      if (detail) {
        this.selectedApplication = { ...detail }; // Create a copy
        // Calculate LTV and DTI
        if (this.selectedApplication.homePrice > 0) {
          this.selectedApplication.ltvRatio =
            (this.selectedApplication.loanAmount /
              this.selectedApplication.homePrice) *
            100;
        }
        if (this.selectedApplication.annualIncome > 0) {
          // Assuming totalDebt is monthly, convert annual income to monthly
          const monthlyIncome = this.selectedApplication.annualIncome / 12;
          if (monthlyIncome > 0) {
            this.selectedApplication.dtiRatio =
              (this.selectedApplication.totalDebt / monthlyIncome) * 100;
          }
        }
        this.adminNotesForm.patchValue({
          notes: this.selectedApplication.adminNotes || '',
        });
        // Sort history if needed
        this.selectedApplication.statusHistory.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );
      }
      this.isLoadingDetails = false;
    }, 300);
  }

  getStatusClass(status: ApplicationStatus): string {
    // This can be refactored into a shared utility or pipe
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return 'status-submitted';
      case ApplicationStatus.UNDER_REVIEW:
        return 'status-under-review';
      case ApplicationStatus.AWAITING_REVIEW:
        return 'status-awaiting-review';
      case ApplicationStatus.APPROVED:
        return 'status-approved';
      case ApplicationStatus.REJECTED:
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }

  getTimelineIcon(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return 'fas fa-file-alt';
      case ApplicationStatus.UNDER_REVIEW:
        return 'fas fa-user-tie'; // Or fa-search
      case ApplicationStatus.AWAITING_REVIEW:
        return 'fas fa-clock'; // Or fa-hourglass-half
      case ApplicationStatus.APPROVED:
        return 'fas fa-check-circle';
      case ApplicationStatus.REJECTED:
        return 'fas fa-times-circle';
      default:
        return 'fas fa-info-circle';
    }
  }

  saveAdminNotes(): void {
    if (this.selectedApplication && this.adminNotesForm.valid) {
      this.selectedApplication.adminNotes = this.adminNotesForm.value.notes;
      console.log(
        `Saving notes for ${this.selectedApplication.id}:`,
        this.selectedApplication.adminNotes
      );
      // **REAL IMPLEMENTATION:**
      // this.adminService.updateAdminNotes(this.selectedApplication.id, this.selectedApplication.adminNotes)
      //   .subscribe(...);
      alert('Notes saved (simulated)!');
    }
  }

  updateApplicationStatus(newStatus: ApplicationStatus): void {
    if (this.selectedApplication) {
      const oldStatus = this.selectedApplication.currentStatus;
      this.selectedApplication.currentStatus = newStatus;

      // Add to status history
      this.selectedApplication.statusHistory.unshift({
        status: newStatus,
        date: new Date(),
        description: `Status changed from ${oldStatus} to ${newStatus} by admin.`,
        actor: 'admin',
        icon: this.getTimelineIcon(newStatus),
      });
      this.selectedApplication.statusHistory.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      // Update the main list item's status as well for immediate UI feedback
      const listItem = this.applications.find(
        (app) => app.id === this.selectedApplication!.id
      );
      if (listItem) {
        listItem.currentStatus = newStatus;
      }

      console.log(
        `Application ${this.selectedApplication.id} status changed to ${newStatus}`
      );
      this.saveAdminNotes(); // Optionally save notes when status changes

      // **REAL IMPLEMENTATION:**
      // this.adminService.updateApplicationStatus(this.selectedApplication.id, newStatus, this.selectedApplication.adminNotes)
      //   .subscribe(...);
      alert(`Application status changed to ${newStatus} (simulated)!`);
    }
  }

  goBackToProfile(): void {
    // Assuming '/profile' is the user's profile page route
    this.router.navigate(['/profile']);
  }
}
