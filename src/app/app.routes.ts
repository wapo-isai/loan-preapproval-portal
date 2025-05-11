import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { SigninPageComponent } from './signin-page/signin-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { LoanApplicationPageComponent } from './loan-application-page/loan-application-page.component';
import { ApplicationStatusPageComponent } from './application-status-page/application-status-page.component';
import { AdminPortalPageComponent } from './admin-portal-page/admin-portal-page.component';

export const routes: Routes = [
  {
    path: '', // Default route
    component: HomeComponent, // Example: your home page component
    title: 'Home Page', // Optional: for setting the browser tab title
  },
  {
    path: 'signup', // The URL path for the signup page
    component: SignupPageComponent, // The component to render for this path
    title: 'Sign Up - MortgageEase', // Optional: for setting the browser tab title
  },
  {
    path: 'signin', // The URL path for the signin page
    component: SigninPageComponent, // The component to render for this path
    title: 'Sign In - MortgageEase',
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    // canActivate: [authGuard], // <-- Protect this route
    title: 'My Profile - MortgageEase',
  },
  {
    path: 'loan-application',
    component: LoanApplicationPageComponent,
    // canActivate: [authGuard], // <-- Protect this route
    title: 'Loan Application - MortgageEase',
  },
  {
    path: 'application-status/:id', // Route with an 'id' parameter
    component: ApplicationStatusPageComponent,
    // canActivate: [authGuard], // <-- Protect this route
    title: 'Application Status - MortgageEase', // Title can be dynamic later
  },
  {
    path: 'admin-portal',
    component: AdminPortalPageComponent,
    // canActivate: [adminGuard], // <-- Protect this route
    title: 'Admin Portal - MortgageEase',
  },
];
