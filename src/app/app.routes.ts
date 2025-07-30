import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignupPageComponent } from './signup-page/signup-page.component';
import { SigninPageComponent } from './signin-page/signin-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { LoanApplicationPageComponent } from './loan-application-page/loan-application-page.component';
import { ApplicationStatusPageComponent } from './application-status-page/application-status-page.component';
import { AdminPortalPageComponent } from './admin-portal-page/admin-portal-page.component';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { NotAuthorizedPageComponent } from './not-authorized-page/not-authorized-page.component';
import { loanApplicationGuard } from './auth/loan-application.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home Page',
  },
  {
    path: 'signup',
    component: SignupPageComponent,
    title: 'Sign Up - MortgageEase',
  },
  {
    path: 'signin',
    component: SigninPageComponent,
    title: 'Sign In - MortgageEase',
  },
  {
    path: 'profile',
    component: ProfilePageComponent,
    canActivate: [AuthGuard],
    title: 'My Profile - MortgageEase',
  },
  {
    path: 'loan-application',
    component: LoanApplicationPageComponent,
    canActivate: [AuthGuard, loanApplicationGuard],
    title: 'Loan Application - MortgageEase',
  },
  {
    path: 'application-status/:id',
    component: ApplicationStatusPageComponent,
    canActivate: [AuthGuard],
    title: 'Application Status - MortgageEase',
  },
  {
    path: 'admin-portal',
    component: AdminPortalPageComponent,
    canActivate: [AdminGuard],
    title: 'Admin Portal - MortgageEase',
  },
  {
    path: 'not-authorized',
    component: NotAuthorizedPageComponent,
    title: 'Access Denied - MortgageEase',
  },
];
