import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  UpdateUserProfileRequest,
  UserProfileData,
  UserProfileService,
} from '../user-profile.service';
import { AuthService } from '../auth/auth.service';

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

  proofOfIncomeFileName: string | null = null;
  creditReportFileName: string | null = null;
  private proofOfIncomeFile: File | null = null;
  private creditReportFile: File | null = null;

  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  currentUserId: string | number | null = null;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService, // Inject UserProfileService
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      personalInformation: this.fb.group({
        fullName: ['', Validators.required],
        streetAddress: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: [
          '',
          [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
        ],
      }),
      employmentInformation: this.fb.group({
        employmentStatus: ['', Validators.required],
        employmentDetails: [''],
      }),
    });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.currentUserId = currentUser.id;
      this.loadUserProfile(this.currentUserId!); // Load existing data
    } else {
      this.errorMessage =
        'Could not identify user. Please try logging in again.';
      console.error('User ID not found in AuthService for profile page.');
    }
  }

  loadUserProfile(userId: string | number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.userProfileService.getCurrentUserProfile().subscribe({
      // getCurrentUserProfile now gets ID internally
      next: (data: UserProfileData) => {
        // Map backend data to form structure
        this.profileForm.patchValue({
          personalInformation: {
            fullName: data.fullName,
            streetAddress: data.streetAddress,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
          },
          employmentInformation: {
            employmentStatus: data.employmentStatus,
            employmentDetails: data.employmentDetails,
          },
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile data', err);
        this.errorMessage = `Failed to load profile: ${
          err.message || 'Please try again later.'
        }`;
        this.isLoading = false;
      },
    });
  }

  onFileSelected(
    event: Event,
    documentType: 'proofOfIncome' | 'creditReport'
  ): void {
    // ... (your existing file selection logic remains the same) ...
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
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.currentUserId) {
      this.errorMessage =
        'Cannot save profile: User identity is missing. Please re-login.';
      return;
    }

    if (this.profileForm.valid) {
      this.isLoading = true;

      const personalInfo = this.profileForm.get('personalInformation')?.value;
      const employmentInfo = this.profileForm.get(
        'employmentInformation'
      )?.value;

      // **IMPORTANT: Map to what your backend UpdateUserRequest DTO expects**
      const updateRequestData: UpdateUserProfileRequest = {
        fullName: personalInfo.fullName,
        employmentStatus: employmentInfo.employmentStatus,
        // If you expand UpdateUserRequest.java on the backend, add other fields here:
        // streetAddress: personalInfo.streetAddress,
        // city: personalInfo.city,
        // state: personalInfo.state,
        // zipCode: personalInfo.zipCode,
        // employmentDetails: employmentInfo.employmentDetails,
      };

      console.log('Submitting Profile Form Data:', updateRequestData);
      // console.log('Proof of Income File:', this.proofOfIncomeFile); // Keep for when file upload is implemented
      // console.log('Credit Report File:', this.creditReportFile);

      this.userProfileService
        .updateUserProfile(this.currentUserId, updateRequestData)
        .subscribe({
          next: (response) => {
            console.log('Profile saved successfully', response);
            this.successMessage = 'Profile updated successfully!';
            this.isLoading = false;
            // Optionally, reload profile data or update form with response if backend returns updated object
            // this.loadUserProfile(this.currentUserId!);
          },
          error: (err) => {
            console.error('Error saving profile', err);
            this.errorMessage = `Failed to update profile: ${
              err.message || 'Please try again.'
            }`;
            this.isLoading = false;
          },
        });

      // File upload logic will be separate and likely happen after text data is saved or concurrently.
      // For now, we are not submitting files.
      // if (this.proofOfIncomeFile) { /* Call service to upload this.proofOfIncomeFile */ }
      // if (this.creditReportFile) { /* Call service to upload this.creditReportFile */ }
    } else {
      console.log('Profile form is invalid');
      this.profileForm.markAllAsTouched(); // Show validation errors
      this.errorMessage =
        'Please correct the errors in the form before submitting.';
    }
  }

  // Helper getters
  get personalInfo() {
    return this.profileForm.get('personalInformation') as FormGroup;
  }
  get employmentInfo() {
    return this.profileForm.get('employmentInformation') as FormGroup;
  }
}
