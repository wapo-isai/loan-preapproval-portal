import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
})
export class SignupPageComponent implements OnInit {
  signupForm!: FormGroup;
  passwordVisible: boolean = false;
  registrationError: string | null = null;
  registrationSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    this.registrationError = null;
    this.registrationSuccess = null;
    if (this.signupForm.valid) {
      this.authService.performRegistration(this.signupForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.registrationSuccess =
            'Registration successful! Please proceed to sign in.';
          this.router.navigate(['/signin']);
        },
        error: (err) => {
          console.error('Registration failed', err);
          this.registrationError =
            err.error?.message ||
            err.statusText ||
            'Registration failed. Please try again.';
        },
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  get firstName() {
    return this.signupForm.get('firstName');
  }
  get lastName() {
    return this.signupForm.get('lastName');
  }
  get email() {
    return this.signupForm.get('email');
  }
  get password() {
    return this.signupForm.get('password');
  }
}
