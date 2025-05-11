import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent {
  profileForm!: FormGroup;
  employmentStatuses: string[] = [
    'Employed',
    'Self-Employed',
    'Unemployed',
    'Student',
    'Retired',
  ];

  // To store selected file names for display
  proofOfIncomeFileName: string | null = null;
  creditReportFileName: string | null = null;

  // To store the actual files
  private proofOfIncomeFile: File | null = null;
  private creditReportFile: File | null = null;

  constructor(
    private fb: FormBuilder // private userService: UserService, // Example
  ) // private http: HttpClient // Example
  {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      personalInformation: this.fb.group({
        fullName: ['', Validators.required],
        streetAddress: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required], // Could add pattern/length validators
        zipCode: [
          '',
          [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
        ],
      }),
      employmentInformation: this.fb.group({
        employmentStatus: ['', Validators.required],
        employmentDetails: [''], // Optional based on status, or add conditional validation
      }),
      // File inputs are handled separately but can be part of the conceptual form
    });

    // Example: Load existing profile data
    // this.userService.getProfile().subscribe(data => {
    //   this.profileForm.patchValue(data);
    //   // Note: File inputs cannot be programmatically set for security reasons.
    //   // You might display existing uploaded file names if available from backend.
    // });
  }

  onFileSelected(
    event: Event,
    documentType: 'proofOfIncome' | 'creditReport'
  ): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      if (documentType === 'proofOfIncome') {
        this.proofOfIncomeFile = file;
        this.proofOfIncomeFileName = file.name;
      } else if (documentType === 'creditReport') {
        this.creditReportFile = file;
        this.creditReportFileName = file.name;
      }
    } else {
      // Reset if no file is chosen or selection is cancelled
      if (documentType === 'proofOfIncome') {
        this.proofOfIncomeFile = null;
        this.proofOfIncomeFileName = null;
      } else if (documentType === 'creditReport') {
        this.creditReportFile = null;
        this.creditReportFileName = null;
      }
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Profile Form Data:', this.profileForm.value);
      console.log('Proof of Income File:', this.proofOfIncomeFile);
      console.log('Credit Report File:', this.creditReportFile);

      // **REAL IMPLEMENTATION for saving data and uploading files:**
      // const formData = new FormData();

      // // Append form data (excluding files initially if backend handles separately or nest)
      // formData.append('profileData', JSON.stringify(this.profileForm.value));

      // if (this.proofOfIncomeFile) {
      //   formData.append('proofOfIncome', this.proofOfIncomeFile, this.proofOfIncomeFile.name);
      // }
      // if (this.creditReportFile) {
      //   formData.append('creditReport', this.creditReportFile, this.creditReportFile.name);
      // }

      // // Example: Post to a backend service
      // this.http.post('/api/user/profile', formData).subscribe({
      //   next: (response) => console.log('Profile saved successfully', response),
      //   error: (err) => console.error('Error saving profile', err)
      // });

      // Or use a dedicated user service
      // this.userService.saveProfile(this.profileForm.value, this.proofOfIncomeFile, this.creditReportFile)
      // .subscribe(...)

      alert('Profile Saved (Simulated)! Check console for data.');
    } else {
      console.log('Profile form is invalid');
      this.profileForm.markAllAsTouched(); // Show validation errors
      alert('Please correct the errors in the form.');
    }
  }

  // Helper getters for easy template access
  get personalInfo() {
    return this.profileForm.get('personalInformation') as FormGroup;
  }
  get employmentInfo() {
    return this.profileForm.get('employmentInformation') as FormGroup;
  }
}
