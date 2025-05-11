import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css',
})
export class SignupPageComponent {
  signupForm!: FormGroup;
  passwordVisible: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Form Submitted!', this.signupForm.value);
      // Here you would typically send the data to your backend service
      // e.g., this.authService.signup(this.signupForm.value).subscribe(...)
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to display validation messages
      this.signupForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Helper getters for easy access to form controls in the template for validation
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
