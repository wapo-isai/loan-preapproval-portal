import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signin-page.component.html',
  styleUrl: './signin-page.component.css',
})
export class SigninPageComponent implements OnInit {
  signinForm!: FormGroup;
  passwordVisible: boolean = false;
  loginError: string | null = null; // To display login errors

  constructor(
    private fb: FormBuilder, // private authService: AuthService, // Example // private
    private authService: AuthService, // Inject AuthService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.loginError = null; // Reset error on new submission
    if (this.signinForm.valid) {
      console.log('Sign In Attempt:', this.signinForm.value);
      const email = this.signinForm.value.email;
      const password = this.signinForm.value.password;
      // **REAL IMPLEMENTATION:**
      // this.authService.login(this.signinForm.value.email, this.signinForm.value.password)
      //   .subscribe({
      //     next: (response) => {
      //       console.log('Login successful', response);
      //       this.router.navigate(['/dashboard']); // Navigate to a protected route
      //     },
      //     error: (err) => {
      //       console.error('Login failed', err);
      //       this.loginError = err.error?.message || 'Invalid email or password. Please try again.';
      //     }
      //   });
    } else {
      console.log('Form is invalid');
      this.signinForm.markAllAsTouched(); // Mark fields to show validation errors
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Helper getters for template validation
  get email() {
    return this.signinForm.get('email');
  }
  get password() {
    return this.signinForm.get('password');
  }
}
