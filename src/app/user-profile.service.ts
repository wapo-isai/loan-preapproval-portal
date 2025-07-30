import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';

export interface UpdateUserProfileRequest {
  fullName: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  employmentStatus: string;
  employmentDetails?: string;
}

export interface UserProfileData {
  id?: string;
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
  private apiUrl = `${environment.apiUrl}/auth/user`;

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
    return this.http
      .get<UserProfileData>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateUserProfile(
    userId: string | number,
    profileData: UpdateUserProfileRequest
  ): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${userId}`, profileData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Error Code: ${error.status}\nMessage: ${
        error.error?.message || error.message || error.statusText
      }`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
