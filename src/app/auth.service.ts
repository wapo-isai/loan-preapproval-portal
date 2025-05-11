// src/app/auth/auth.service.ts (create this file/folder if it doesn't exist)
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root', // Provided in root for application-wide singleton
})
export class AuthService {
  // Use BehaviorSubject to store the current authentication state
  // It emits the last value to new subscribers
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());
  // Expose the authentication status as an Observable
  public isAuthenticated$: Observable<boolean> =
    this.loggedInStatus.asObservable();

  constructor(private router: Router) {}

  private hasToken(): boolean {
    // Check if a token exists in localStorage (or your preferred storage)
    return !!localStorage.getItem('authToken');
  }

  // Call this method after successful login
  login(token: string, userDetails?: any): void {
    localStorage.setItem('authToken', token);
    if (userDetails) {
      localStorage.setItem('currentUser', JSON.stringify(userDetails)); // Optional: store user details
    }
    this.loggedInStatus.next(true);
    // Navigate to a default page after login, e.g., profile or dashboard
    this.router.navigate(['/profile']); // Or your desired redirect path
  }

  // Call this method for logout
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser'); // Clear user details if stored
    this.loggedInStatus.next(false);
    this.router.navigate(['/signin']); // Navigate to signin page after logout
  }

  // Helper to get current auth state synchronously if needed, though observable is preferred
  public isLoggedIn(): boolean {
    return this.loggedInStatus.value;
  }

  // Optional: Get current user details
  getCurrentUser(): any | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}
