// src/app/models/loan-application.model.ts
export interface BackendLoanApplication {
  // Matches your Java LoanApplication entity
  id?: string; // Optional for new submissions, present for responses
  userId: string;
  homePrice: number;
  loanAmount: number;
  annualIncome: number;
  monthlyDebt: number; // Corresponds to 'currentDebt' from form
  creditScore: number;
  employmentStatus: string; // Added this field
  status: string; // e.g., "Submitted", "Draft", "Under Review"
  submittedAt?: Date; // Will be set by backend
  updatedAt?: Date; // Will be set by backend
  eligible?: boolean;
  evaluationReason?: string;
  // Add any other fields that are part of the request/response
}

// For submitting a new application or saving a draft
export interface NewLoanApplicationPayload {
  userId: string;
  homePrice: number;
  loanAmount: number;
  annualIncome: number;
  monthlyDebt: number;
  creditScore: number;
  employmentStatus: string;
  status: string; // "Draft" or "Submitted"
  // other relevant fields from the form if your backend takes them directly for new submissions
}
