import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-loan-application-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './loan-application-page.component.html',
  styleUrl: './loan-application-page.component.css',
})
export class LoanApplicationPageComponent {
  loanApplicationForm!: FormGroup;
  private unsubscribe$ = new Subject<void>();

  // Configuration for sliders/inputs
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

  constructor(
    private fb: FormBuilder // private loanService: LoanService // Example
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
      ],
      creditScore: [
        700,
        [
          Validators.required,
          Validators.min(this.minCreditScore),
          Validators.max(this.maxCreditScore),
        ],
      ],
      saveProgress: [false],
    });

    // Synchronize sliders with input fields and vice-versa
    this.syncFormControl('loanAmount');
    this.syncFormControl('homePrice');
    this.syncFormControl('annualIncome');
    this.syncFormControl('currentDebt');
    this.syncFormControl('creditScore');

    // Example: Load saved draft if available
    // this.loanService.getDraftApplication().subscribe(draft => {
    //   if (draft) {
    //     this.loanApplicationForm.patchValue(draft);
    //   }
    // });
  }

  private syncFormControl(controlName: string): void {
    const control = this.loanApplicationForm.get(controlName);
    if (control) {
      // Update slider when input changes (with debounce)
      control.valueChanges
        .pipe(
          debounceTime(300), // Avoid rapid updates, useful for text inputs
          takeUntil(this.unsubscribe$)
        )
        .subscribe((value) => {
          // This is primarily for text input to slider. Slider to text is direct.
          // Ensure the value is a number before patching
          const numericValue =
            typeof value === 'string'
              ? parseFloat(value.replace(/[^0-9.-]+/g, ''))
              : value;
          if (!isNaN(numericValue)) {
            const sliderControl = this.loanApplicationForm.get(
              controlName + 'Slider'
            ); // Assuming slider has name like 'loanAmountSlider'
            if (sliderControl && sliderControl.value !== numericValue) {
              // This logic is if you had separate form controls for sliders,
              // but since we bind [value] and (input), it's simpler.
              // For direct binding, this specific sync might be less critical FROM text TO slider,
              // but important for validation and formatting.
            }
          }
        });
    }
  }

  // Update text input when slider changes
  onSliderChange(event: Event, controlName: string): void {
    const sliderValue = (event.target as HTMLInputElement).value;
    this.loanApplicationForm
      .get(controlName)
      ?.setValue(parseFloat(sliderValue), { emitEvent: false });
  }

  // Ensure text input value updates the form correctly (e.g. on blur or direct input)
  onTextInput(event: Event, controlName: string): void {
    let inputValue = (event.target as HTMLInputElement).value;
    // Remove non-numeric characters except for a potential decimal point
    inputValue = inputValue.replace(/[^0-9]/g, '');
    const numericValue = parseFloat(inputValue);

    if (!isNaN(numericValue)) {
      this.loanApplicationForm
        .get(controlName)
        ?.setValue(numericValue, { emitEvent: true });
    } else if (inputValue === '') {
      // Allow clearing the field, handle as per validation (e.g. required)
      this.loanApplicationForm
        .get(controlName)
        ?.setValue(null, { emitEvent: true });
    }
    // Update the input element's value to the cleaned one if necessary,
    // or let Angular's form control handle it.
    (event.target as HTMLInputElement).value = inputValue;
  }

  onSaveDraft(): void {
    console.log('Saving Draft:', this.loanApplicationForm.value);
    // **REAL IMPLEMENTATION:**
    // this.loanService.saveDraft(this.loanApplicationForm.value).subscribe({
    //   next: () => alert('Draft saved successfully!'),
    //   error: (err) => alert('Failed to save draft: ' + err.message)
    // });
    alert('Draft Saved (Simulated)!');
  }

  onSubmitApplication(): void {
    if (this.loanApplicationForm.valid) {
      console.log('Submitting Application:', this.loanApplicationForm.value);
      // **REAL IMPLEMENTATION:**
      // const finalApplicationData = { ...this.loanApplicationForm.value, isDraft: false };
      // this.loanService.submitApplication(finalApplicationData).subscribe({
      //   next: () => alert('Application submitted successfully!'),
      //   error: (err) => alert('Failed to submit application: ' + err.message)
      // });
      alert('Application Submitted (Simulated)!');
    } else {
      this.loanApplicationForm.markAllAsTouched();
      alert('Please correct the errors in the form.');
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Helper getters
  get loanAmount() {
    return this.loanApplicationForm.get('loanAmount');
  }
  get homePrice() {
    return this.loanApplicationForm.get('homePrice');
  }
  get annualIncome() {
    return this.loanApplicationForm.get('annualIncome');
  }
  get currentDebt() {
    return this.loanApplicationForm.get('currentDebt');
  }
  get creditScore() {
    return this.loanApplicationForm.get('creditScore');
  }
}
