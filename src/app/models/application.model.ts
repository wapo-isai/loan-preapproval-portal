export enum ApplicationStatus {
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  ADDITIONAL_INFO_REQUIRED = 'Additional Info Required',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  AWAITING_REVIEW = 'Awaiting Review',
}

export interface TimelineEvent {
  status: ApplicationStatus;
  date: Date;
  description: string;
  actor?: 'customer' | 'admin' | 'system';
  icon?: string;
}

export interface LoanApplication {
  id: string;
  submittedDate: Date;
  currentStatus: ApplicationStatus;
  progress: number;
  loanAmount: number;
  homePrice: number;
  timeline: TimelineEvent[];
}

export interface ApplicationListItem {
  id: string;
  userId?: string; // From backend
  applicantName?: string;
  loanAmount: number;
  submissionDate: Date | string; // Backend likely sends string
  currentStatus: ApplicationStatus | string; // Backend likely sends string
}

export interface AdminApplicationDetail {
  id: string;
  userId?: string;
  applicantName?: string; // To be populated if possible
  loanAmount: number;
  homePrice: number;
  annualIncome: number;
  totalDebt: number; // This is 'monthlyDebt' from your backend LoanApplication.java
  creditScore: number;
  employmentStatus?: string; // From backend
  currentStatus: ApplicationStatus | string; // Backend likely sends string
  submissionDate?: Date | string;
  statusHistory: TimelineEvent[];
  adminNotes?: string;
  ltvRatio?: number; // Calculated
  dtiRatio?: number; // Calculated
  // Add other fields from backend LoanApplication if needed for display
  eligible?: boolean;
  evaluationReason?: string;
}

// For PATCH request to update status
export interface StatusUpdateRequestPayload {
  status: string;
}
