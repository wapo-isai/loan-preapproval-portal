// src/app/signin-page/signin-page.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router'; // Router is already imported
import { AuthService, AuthResponse } from '../auth/auth.service'; // Ensure correct path and import AuthResponse

@Component({
  selector: 'app-signin-page',
  standalone: true, // Assuming standalone
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.css'], // Corrected 'styleUrl' to 'styleUrls'
})
export class SigninPageComponent implements OnInit {
  signinForm!: FormGroup;
  passwordVisible: boolean = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // AuthService is injected
    private router: Router // Router is injected
  ) {}

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.loginError = null;
    if (this.signinForm.valid) {
      this.authService.performLogin(this.signinForm.value).subscribe({
        next: (response: AuthResponse) => {
          console.log('Login successful', response);
          // AuthService.performLogin already calls the local .login() method which handles token storage and navigation
        },
        error: (err) => {
          console.error('Login failed', err);
          this.loginError =
            err.error?.message ||
            err.statusText ||
            'Invalid email or password. Please try again.';
        },
      });
    } else {
      this.signinForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  get email() {
    return this.signinForm.get('email');
  }
  get password() {
    return this.signinForm.get('password');
  }
}
