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
import {
  DocumentMetadata,
  UserDocumentResponse,
} from '../models/document.model';
import { DocumentService } from '../document.service';

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

  isLoadingProfile: boolean = false;
  profileSuccessMessage: string | null = null;
  profileErrorMessage: string | null = null;
  currentUserId: string | number | null = null;

  userDocuments: UserDocumentResponse[] = [];
  isDocumentsLoading: boolean = false;
  documentsError: string | null = null;

  proofOfIncomeFile: File | null = null;
  proofOfIncomeFileName: string | null = null;
  proofOfIncomeUploadProgress: number | null = null;
  proofOfIncomeUploadError: string | null = null;

  creditReportFile: File | null = null;
  creditReportFileName: string | null = null;
  creditReportUploadProgress: number | null = null;
  creditReportUploadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private documentService: DocumentService
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
      this.loadUserProfile();
      this.loadUserDocuments();
    } else {
      this.profileErrorMessage =
        'Could not identify user. Please try logging in again.';
      console.error('User ID not found in AuthService for profile page.');
    }
  }

  loadUserProfile(): void {
    if (!this.currentUserId) return;
    this.isLoadingProfile = true;
    this.userProfileService.getCurrentUserProfile().subscribe({
      next: (data: UserProfileData) => {
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
        this.isLoadingProfile = false;
      },
      error: (err) => {
        this.profileErrorMessage = `Failed to load profile: ${err.message}`;
        this.isLoadingProfile = false;
      },
    });
  }

  loadUserDocuments(): void {
    this.isDocumentsLoading = true;
    this.documentsError = null;
    this.documentService.getUserDocuments().subscribe({
      next: (docs) => {
        this.userDocuments = docs;
        this.isDocumentsLoading = false;
      },
      error: (err) => {
        this.documentsError = `Failed to load documents: ${err.message}`;
        this.isDocumentsLoading = false;
      },
    });
  }

  onFileSelected(
    event: Event,
    documentType: 'proofOfIncome' | 'creditReport'
  ): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      if (documentType === 'proofOfIncome') {
        this.proofOfIncomeFile = file;
        this.proofOfIncomeFileName = file.name;
        this.proofOfIncomeUploadError = null;
        this.proofOfIncomeUploadProgress = 0;
        this.uploadSelectedFile('proof-of-income', file, documentType);
      } else if (documentType === 'creditReport') {
        this.creditReportFile = file;
        this.creditReportFileName = file.name;
        this.creditReportUploadError = null;
        this.creditReportUploadProgress = 0;
        this.uploadSelectedFile('credit-report', file, documentType);
      }
    }

    element.value = '';
  }

  uploadSelectedFile(
    docTypeStringForBackend: string,
    file: File,
    progressErrorType: 'proofOfIncome' | 'creditReport'
  ): void {
    if (!file) return;

    if (progressErrorType === 'proofOfIncome')
      this.proofOfIncomeUploadProgress = 0;
    else if (progressErrorType === 'creditReport')
      this.creditReportUploadProgress = 0;

    this.documentService
      .uploadDocument(docTypeStringForBackend, file)
      .subscribe({
        next: (event: DocumentMetadata | number) => {
          if (typeof event === 'number') {
            if (progressErrorType === 'proofOfIncome')
              this.proofOfIncomeUploadProgress = event;
            else if (progressErrorType === 'creditReport')
              this.creditReportUploadProgress = event;
          } else if (event && typeof event === 'object') {
            this.profileSuccessMessage = `${event.fileName} uploaded successfully!`;
            if (progressErrorType === 'proofOfIncome') {
              this.proofOfIncomeFile = null;
              this.proofOfIncomeFileName = null;
              this.proofOfIncomeUploadProgress = null;
            } else if (progressErrorType === 'creditReport') {
              this.creditReportFile = null;
              this.creditReportFileName = null;
              this.creditReportUploadProgress = null;
            }
            this.loadUserDocuments();
          }
        },
        error: (err) => {
          const errorMsg = `Failed to upload ${file.name}: ${err.message}`;
          if (progressErrorType === 'proofOfIncome') {
            this.proofOfIncomeUploadError = errorMsg;
            this.proofOfIncomeUploadProgress = null;
          } else if (progressErrorType === 'creditReport') {
            this.creditReportUploadError = errorMsg;
            this.creditReportUploadProgress = null;
          }
          console.error(errorMsg, err);
        },
      });
  }

  onSubmitProfileData(): void {
    this.profileSuccessMessage = null;
    this.profileErrorMessage = null;

    if (!this.currentUserId) {
      this.profileErrorMessage =
        'Cannot save profile: User identity is missing. Please re-login.';
      return;
    }

    if (this.profileForm.valid) {
      this.isLoadingProfile = true;
      const personalInfo = this.profileForm.get('personalInformation')?.value;
      const employmentInfo = this.profileForm.get(
        'employmentInformation'
      )?.value;

      const updateRequestData: UpdateUserProfileRequest = {
        fullName: personalInfo.fullName,
        streetAddress: personalInfo.streetAddress,
        city: personalInfo.city,
        state: personalInfo.state,
        zipCode: personalInfo.zipCode,
        employmentStatus: employmentInfo.employmentStatus,
        employmentDetails: employmentInfo.employmentDetails,
      };

      this.userProfileService
        .updateUserProfile(this.currentUserId, updateRequestData)
        .subscribe({
          next: (response) => {
            this.profileSuccessMessage =
              'Profile text data updated successfully!';
            this.profileForm.markAsPristine();
            this.isLoadingProfile = false;
          },
          error: (err) => {
            this.profileErrorMessage = `Failed to update profile data: ${err.message}`;
            this.isLoadingProfile = false;
          },
        });
    } else {
      this.profileForm.markAllAsTouched();
      this.profileErrorMessage =
        'Please correct the errors in the profile form.';
    }
  }

  get personalInfo() {
    return this.profileForm.get('personalInformation') as FormGroup;
  }
  get employmentInfo() {
    return this.profileForm.get('employmentInformation') as FormGroup;
  }
}
