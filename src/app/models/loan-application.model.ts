import { TimelineEvent } from './application.model';

export interface BackendLoanApplication {
  id: string; // Changed from id?: string - ID should be present for fetched app details
  userId: string;
  homePrice: number;
  loanAmount: number;
  annualIncome: number;
  monthlyDebt: number;
  creditScore: number;
  employmentStatus: string;
  status: string; // This will be the raw string status from the backend
  submittedAt?: Date | string; // Allow string as backend usually sends ISO strings
  updatedAt?: Date | string; // Allow string
  eligible?: boolean;
  evaluationReason?: string;
  timeline: TimelineEvent[]; // This field is correctly named here
  adminNotes?: string; // <-- ADDED adminNotes field (optional as it might not always be present)
  // Add any other fields that your backend LoanApplication.java entity returns
}

export interface NewLoanApplicationPayload {
  userId: string;
  homePrice: number;
  loanAmount: number;
  annualIncome: number;
  monthlyDebt: number;
  creditScore: number;
  employmentStatus: string;
  status: string;
}
