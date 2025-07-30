import { TimelineEvent } from './application.model';

export interface BackendLoanApplication {
  id: string;
  userId: string;
  homePrice: number;
  loanAmount: number;
  annualIncome: number;
  monthlyDebt: number;
  creditScore: number;
  employmentStatus: string;
  status: string;
  submittedAt?: Date | string;
  updatedAt?: Date | string;
  eligible?: boolean;
  evaluationReason?: string;
  timeline: TimelineEvent[];
  adminNotes?: string;
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
