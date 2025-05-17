import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Adjust path
import { LoanApplicationService } from '../loan-application.service'; // Adjust path
import { BackendLoanApplication } from '../models/loan-application.model'; // Adjust path

export const loanApplicationGuard: CanActivateFn = (
  route,
  state
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const loanService = inject(LoanApplicationService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Should be caught by AuthGuard first, but as a safeguard
    return of(router.createUrlTree(['/signin']));
  }

  return loanService.getUserApplications().pipe(
    map((applications: BackendLoanApplication[]) => {
      // Filter out drafts, or applications that shouldn't block creating a new one
      // For this example, any application NOT in "Draft" status is considered active.
      // And we'll pick the most recent one by 'submittedAt' or 'updatedAt'.
      const activeApplications = applications
        .filter((app) => app.status && app.status.toLowerCase() !== 'draft')
        .sort((a, b) => {
          const dateA = a.updatedAt || a.submittedAt || new Date(0);
          const dateB = b.updatedAt || b.submittedAt || new Date(0);
          return new Date(dateB).getTime() - new Date(dateA).getTime(); // Most recent first
        });

      if (activeApplications.length > 0 && activeApplications[0].id) {
        // User has an active/submitted application, redirect to its status page
        console.log(
          `User has active application ${activeApplications[0].id}, redirecting to status.`
        );
        return router.createUrlTree([
          '/application-status',
          activeApplications[0].id,
        ]);
      } else {
        // No active/submitted application found, or only drafts exist, allow access to the new application form
        console.log(
          'No active application found, allowing access to new application form.'
        );
        return true;
      }
    }),
    catchError((error) => {
      console.error(
        'Error fetching user applications in LoanApplicationGuard:',
        error
      );
      // Allow access to the form if there's an error fetching applications,
      // or redirect to an error page, or handle as per your app's error strategy.
      // For now, let's allow access to the form to avoid blocking the user due to a backend issue.
      return of(true);
    })
  );
};
