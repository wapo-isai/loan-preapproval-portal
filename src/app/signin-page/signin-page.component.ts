import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService, AuthResponse } from '../auth/auth.service';

@Component({
  selector: 'app-signin-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signin-page.component.html',
  styleUrls: ['./signin-page.component.css'],
})
export class SigninPageComponent implements OnInit {
  signinForm!: FormGroup;
  passwordVisible: boolean = false;
  loginError: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

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
