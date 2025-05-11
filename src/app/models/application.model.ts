// src/app/models/application.model.ts

export enum ApplicationStatus {
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  ADDITIONAL_INFO_REQUIRED = 'Additional Info Required', // Example of another status
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  AWAITING_REVIEW = 'Awaiting Review', // New status for "Mark for Review"
}

export interface TimelineEvent {
  status: ApplicationStatus; // Or a more general event type
  date: Date;
  description: string;
  actor?: 'customer' | 'admin' | 'system'; // Who performed the action
  icon?: string;
}

export interface LoanApplication {
  id: string;
  submittedDate: Date;
  currentStatus: ApplicationStatus;
  progress: number; // Percentage (0-100)
  loanAmount: number;
  homePrice: number;
  timeline: TimelineEvent[];
}

// For the list in admin portal
export interface ApplicationListItem {
  id: string;
  loanAmount: number;
  submissionDate: Date;
  currentStatus: ApplicationStatus;
  // Other summary fields if needed for display or filtering
  applicantName?: string; // Example
}

// For the detailed view in admin portal
export interface AdminApplicationDetail extends ApplicationListItem {
  homePrice: number;
  ltvRatio?: number; // Will calculate
  annualIncome: number;
  totalDebt: number;
  dtiRatio?: number; // Will calculate
  creditScore: number;
  statusHistory: TimelineEvent[]; // Or a more detailed history
  adminNotes?: string;
  // Potentially all fields from the original LoanApplication form
  // For now, focusing on what's visible in the screenshot
}
