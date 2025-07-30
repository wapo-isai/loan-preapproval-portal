import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ApplicationStatus,
  ApplicationListItem,
  AdminApplicationDetail,
} from '../models/application.model';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';

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

  readonly appStatuses = ApplicationStatus;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadApplicationsList();
    this.adminNotesForm = this.fb.group({
      notes: [''],
    });
  }

  loadApplicationsList(): void {
    this.isLoadingList = true;
    this.errorMessage = null;
    this.adminService.getAllApplications().subscribe({
      next: (data) => {
        this.applications = data;
        this.isLoadingList = false;
      },
      error: (err) => {
        console.error('Error loading applications list', err);
        this.errorMessage = `Failed to load applications: ${err.message}`;
        this.isLoadingList = false;
      },
    });
  }

  viewApplicationDetails(applicationId: string): void {
    this.isLoadingDetails = true;
    this.selectedApplication = null;
    this.errorMessage = null;
    this.successMessage = null;
    this.adminNotesForm.reset({ notes: '' });

    this.adminService.getApplicationDetails(applicationId).subscribe({
      next: (detail) => {
        this.selectedApplication = detail;

        this.adminNotesForm.patchValue({
          notes: this.selectedApplication.adminNotes || '',
        });
        if (this.selectedApplication.statusHistory) {
          this.selectedApplication.statusHistory.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        }
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error(
          `Error loading details for application ${applicationId}`,
          err
        );
        this.errorMessage = `Failed to load application details: ${err.message}`;
        this.isLoadingDetails = false;
      },
    });
  }

  getStatusClass(status: ApplicationStatus | string): string {
    const statusString = status as string;
    switch (statusString) {
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
      case ApplicationStatus.ADDITIONAL_INFO_REQUIRED:
        return 'status-info-required';
      default:
        return 'status-default';
    }
  }

  getTimelineIcon(status: ApplicationStatus | string): string {
    const statusString = status as string;
    switch (statusString) {
      case ApplicationStatus.SUBMITTED:
        return 'fas fa-file-alt';
      case ApplicationStatus.UNDER_REVIEW:
        return 'fas fa-user-tie';
      case ApplicationStatus.AWAITING_REVIEW:
        return 'fas fa-clock';
      case ApplicationStatus.APPROVED:
        return 'fas fa-check-circle';
      case ApplicationStatus.REJECTED:
        return 'fas fa-times-circle';
      case ApplicationStatus.ADDITIONAL_INFO_REQUIRED:
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-info-circle';
    }
  }

  saveAdminNotes(): void {
    this.clearMessages();
    if (this.selectedApplication && this.adminNotesForm.valid) {
      const notes = this.adminNotesForm.value.notes;
      this.isLoadingDetails = true;

      this.adminService
        .saveAdminNotes(this.selectedApplication.id, notes)
        .subscribe({
          next: (updatedApplication) => {
            this.selectedApplication = updatedApplication;
            this.adminNotesForm.patchValue({
              notes: updatedApplication.adminNotes || '',
            });
            this.adminNotesForm.markAsPristine();
            this.successMessage = 'Admin notes updated successfully!';
            this.isLoadingDetails = false;
          },
          error: (err) => {
            this.errorMessage = `Error saving notes: ${err.message}`;
            this.isLoadingDetails = false;
          },
        });
    }
  }

  updateApplicationStatus(newStatus: ApplicationStatus): void {
    this.clearMessages();
    if (this.selectedApplication) {
      const applicationId = this.selectedApplication.id;
      this.isLoadingDetails = true;

      this.adminService
        .updateApplicationStatus(applicationId, newStatus)
        .subscribe({
          next: (updatedApplicationDetail) => {
            this.selectedApplication = updatedApplicationDetail;
            const index = this.applications.findIndex(
              (app) => app.id === applicationId
            );
            if (index > -1) {
              this.applications[index].currentStatus =
                updatedApplicationDetail.currentStatus;
            }

            this.adminNotesForm.patchValue({
              notes: this.selectedApplication.adminNotes || '',
            });
            this.adminNotesForm.markAsPristine();

            this.successMessage = `Application ${applicationId} status successfully changed to ${newStatus}.`;
            this.isLoadingDetails = false;
          },
          error: (err) => {
            this.errorMessage = `Failed to update status: ${err.message}`;
            this.isLoadingDetails = false;
          },
        });
    }
  }

  private clearMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

  goBackToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
