import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { LoanApplicationService } from '../loan-application.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { NewLoanApplicationPayload } from '../models/loan-application.model';

@Component({
  selector: 'app-loan-application-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './loan-application-page.component.html',
  styleUrl: './loan-application-page.component.css',
})
export class LoanApplicationPageComponent implements OnInit, OnDestroy {
  loanApplicationForm!: FormGroup;
  private unsubscribe$ = new Subject<void>();

  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  readonly minLoanAmount = 50000;
  readonly maxLoanAmount = 1000000;
  readonly loanStep = 1000;

  readonly minHomePrice = 50000;
  readonly maxHomePrice = 2000000;
  readonly homePriceStep = 1000;

  readonly minAnnualIncome = 10000;
  readonly maxAnnualIncome = 500000;
  readonly incomeStep = 1000;

  readonly minCurrentDebt = 0;
  readonly maxCurrentDebt = 200000;
  readonly debtStep = 500;

  readonly minCreditScore = 300;
  readonly maxCreditScore = 850;
  readonly creditScoreStep = 1;

  employmentStatuses: string[] = [
    'Employed',
    'Self-Employed',
    'Unemployed',
    'Student',
    'Retired',
    'Other',
  ];

  constructor(
    private fb: FormBuilder,
    private loanApplicationService: LoanApplicationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loanApplicationForm = this.fb.group({
      loanAmount: [
        200000,
        [
          Validators.required,
          Validators.min(this.minLoanAmount),
          Validators.max(this.maxLoanAmount),
        ],
      ],
      homePrice: [
        250000,
        [
          Validators.required,
          Validators.min(this.minHomePrice),
          Validators.max(this.maxHomePrice),
        ],
      ],
      annualIncome: [
        75000,
        [
          Validators.required,
          Validators.min(this.minAnnualIncome),
          Validators.max(this.maxAnnualIncome),
        ],
      ],
      currentDebt: [
        10000,
        [
          Validators.required,
          Validators.min(this.minCurrentDebt),
          Validators.max(this.maxCurrentDebt),
        ],
      ], // Maps to monthlyDebt
      creditScore: [
        700,
        [
          Validators.required,
          Validators.min(this.minCreditScore),
          Validators.max(this.maxCreditScore),
        ],
      ],
      employmentStatus: ['', Validators.required],
      saveProgress: [false],
    });

    this.loadDraftApplication();
  }

  loadDraftApplication(): void {
    this.isLoading = true;
    this.loanApplicationService
      .getUserApplications()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((apps) => apps.find((app) => app.status === 'Draft'))
      )
      .subscribe({
        next: (draft) => {
          if (draft) {
            console.log('Found draft application:', draft);
            this.loanApplicationForm.patchValue({
              loanAmount: draft.loanAmount,
              homePrice: draft.homePrice,
              annualIncome: draft.annualIncome,
              currentDebt: draft.monthlyDebt,
              creditScore: draft.creditScore,
              employmentStatus: draft.employmentStatus,
              saveProgress: true,
            });
            this.successMessage = 'Previously saved draft loaded.';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.warn(
            'Could not load draft applications or no draft found:',
            err
          );

          if (!err.message.toLowerCase().includes('user not authenticated')) {
            // Be more specific with error checking
            // this.errorMessage = `Error loading draft: ${err.message}`;
          }
          this.isLoading = false;
        },
      });
  }

  private syncFormControl(controlName: string): void {
    const control = this.loanApplicationForm.get(controlName);
    if (control) {
      control.valueChanges
        .pipe(debounceTime(300), takeUntil(this.unsubscribe$))
        .subscribe((value) => {
          const numericValue =
            typeof value === 'string'
              ? parseFloat(value.replace(/[^0-9.-]+/g, ''))
              : value;
          if (!isNaN(numericValue)) {
            const sliderControl = this.loanApplicationForm.get(
              controlName + 'Slider'
            );
            if (sliderControl && sliderControl.value !== numericValue) {
            }
          }
        });
    }
  }

  onSliderChange(event: Event, controlName: string): void {
    const sliderValue = (event.target as HTMLInputElement).value;
    this.loanApplicationForm
      .get(controlName)
      ?.setValue(parseFloat(sliderValue), { emitEvent: false });
  }

  onTextInput(event: Event, controlName: string): void {
    let inputValue = (event.target as HTMLInputElement).value;
    inputValue = inputValue.replace(/[^0-9]/g, '');
    const numericValue = parseFloat(inputValue);

    if (!isNaN(numericValue)) {
      this.loanApplicationForm.get(controlName)?.setValue(numericValue);
    } else if (inputValue === '') {
      this.loanApplicationForm.get(controlName)?.setValue(null);
    }
    (event.target as HTMLInputElement).value =
      this.loanApplicationForm.get(controlName)?.value || '';
  }

  private preparePayload(
    status: 'Draft' | 'Submitted'
  ): NewLoanApplicationPayload | null {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.errorMessage = 'User not identified. Please login again.';
      this.isLoading = false;
      return null;
    }

    const formValue = this.loanApplicationForm.value;
    return {
      userId: userId,
      homePrice: formValue.homePrice,
      loanAmount: formValue.loanAmount,
      annualIncome: formValue.annualIncome,
      monthlyDebt: formValue.currentDebt,
      creditScore: formValue.creditScore,
      employmentStatus: formValue.employmentStatus,
      status: status,
    };
  }

  onSaveDraft(): void {
    this.clearMessages();
    if (
      !this.loanApplicationForm.valid &&
      !this.loanApplicationForm.get('saveProgress')?.value
    ) {
      this.loanApplicationForm.markAllAsTouched();
      this.errorMessage =
        'Please fill all required fields to save a draft, or check "Save progress".';
      return;
    }

    const payload = this.preparePayload('Draft');
    if (!payload) return;

    this.isLoading = true;
    this.loanApplicationService.submitOrSaveApplication(payload).subscribe({
      next: (response) => {
        this.successMessage = 'Draft saved successfully!';
        console.log('Draft Saved:', response);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Failed to save draft: ${err.message}`;
        console.error('Error saving draft', err);
        this.isLoading = false;
      },
    });
  }

  onSubmitApplication(): void {
    this.clearMessages();
    if (this.loanApplicationForm.valid) {
      const payload = this.preparePayload('Submitted');
      if (!payload) return;

      this.isLoading = true;
      this.loanApplicationService.submitOrSaveApplication(payload).subscribe({
        next: (response) => {
          this.successMessage = 'Application submitted successfully!';
          console.log('Application Submitted:', response);
          this.isLoading = false;
          if (response.id) {
            this.router.navigate(['/application-status', response.id]);
          } else {
            this.router.navigate(['/profile']);
          }
        },
        error: (err) => {
          this.errorMessage = `Failed to submit application: ${err.message}`;
          console.error('Error submitting application', err);
          this.isLoading = false;
        },
      });
    } else {
      this.loanApplicationForm.markAllAsTouched();
      this.errorMessage =
        'Please correct all errors in the form before submitting.';
    }
  }

  private clearMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get loanAmountCtrl() {
    return this.loanApplicationForm.get('loanAmount');
  }
  get homePriceCtrl() {
    return this.loanApplicationForm.get('homePrice');
  }
  get annualIncomeCtrl() {
    return this.loanApplicationForm.get('annualIncome');
  }
  get currentDebtCtrl() {
    return this.loanApplicationForm.get('currentDebt');
  }
  get creditScoreCtrl() {
    return this.loanApplicationForm.get('creditScore');
  }
  get employmentStatusCtrl() {
    return this.loanApplicationForm.get('employmentStatus');
  }
}
