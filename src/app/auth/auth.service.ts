import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  type?: string;
  id: number;
  email: string;
  firstName: string;
  roles: string[];
}
export interface SignInRequest {
  email: string;
  password: string;
}
export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$: Observable<boolean> =
    this.loggedInStatus.asObservable();
  private currentUserSubject = new BehaviorSubject<any | null>(
    this.getCurrentUserFromStorage()
  );
  public currentUser$: Observable<any | null> =
    this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private getCurrentUserFromStorage(): any | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  performLogin(credentials: SignInRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.login(response.token, {
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            roles: response.roles,
          });
        })
      );
  }

  performRegistration(userInfo: SignUpRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userInfo);
  }

  login(token: string, userDetails?: any): void {
    localStorage.setItem('authToken', token);
    if (userDetails) {
      localStorage.setItem('currentUser', JSON.stringify(userDetails));
      this.currentUserSubject.next(userDetails);
    }
    this.loggedInStatus.next(true);
    this.router.navigate(['/profile']);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.loggedInStatus.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/signin']);
  }

  public isLoggedIn(): boolean {
    return this.loggedInStatus.value;
  }

  getCurrentUser(): any | null {
    return this.currentUserSubject.value;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.roles && user.roles.includes(role);
  }
}
