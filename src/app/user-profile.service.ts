import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service'; // To get user ID

// Interface for the data structure your backend's UpdateUserRequest expects
export interface UpdateUserProfileRequest {
  fullName: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  employmentStatus: string;
  employmentDetails?: string;
}

// Interface for the data structure your backend might return for GET profile
// This should ideally match all fields in your Angular form
export interface UserProfileData {
  id?: string; // Or number
  fullName?: string;
  email?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  employmentStatus?: string;
  employmentDetails?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/auth/user`; // Assuming gateway routes /api/user to your UserController

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Method to get the current user's profile data
  getCurrentUserProfile(): Observable<UserProfileData> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return throwError(
        () => new Error('User ID not found. User might not be logged in.')
      );
    }
    const userId = currentUser.id;
    // Assuming your backend has an endpoint like GET /api/user/{id} to fetch profile
    return this.http
      .get<UserProfileData>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  // Method to update the user's profile
  updateUserProfile(
    userId: string | number,
    profileData: UpdateUserProfileRequest
  ): Observable<any> {
    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // HttpClient usually sets this for objects
    return this.http
      .put(`${this.apiUrl}/${userId}`, profileData)
      .pipe(catchError(this.handleError));
  }

  // TODO: Implement file upload methods later when S3 backend is ready
  // uploadProofOfIncome(userId: string | number, file: File): Observable<any> { ... }
  // uploadCreditReport(userId: string | number, file: File): Observable<any> { ... }

  private handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${
        error.error?.message || error.message || error.statusText
      }`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
