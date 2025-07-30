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
  userId?: string;
  applicantName?: string;
  loanAmount: number;
  submissionDate: Date | string;
  currentStatus: ApplicationStatus | string;
}

export interface AdminApplicationDetail {
  id: string;
  userId?: string;
  applicantName?: string;
  loanAmount: number;
  homePrice: number;
  annualIncome: number;
  totalDebt: number;
  creditScore: number;
  employmentStatus?: string;
  currentStatus: ApplicationStatus | string;
  submissionDate?: Date | string;
  statusHistory: TimelineEvent[];
  adminNotes?: string;
  ltvRatio?: number;
  dtiRatio?: number;

  eligible?: boolean;
  evaluationReason?: string;
}

export interface StatusUpdateRequestPayload {
  status: string;
}
