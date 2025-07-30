import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoanApplicationService } from '../loan-application.service';
import { BackendLoanApplication } from '../models/loan-application.model';

export const loanApplicationGuard: CanActivateFn = (): Observable<
  boolean | UrlTree
> => {
  const authService = inject(AuthService);
  const loanService = inject(LoanApplicationService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return of(router.createUrlTree(['/signin']));
  }

  return loanService.getUserApplications().pipe(
    map((applications: BackendLoanApplication[]) => {
      const activeApplications = applications
        .filter((app) => app.status && app.status.toLowerCase() !== 'draft')
        .sort((a, b) => {
          const dateA = a.updatedAt || a.submittedAt || new Date(0);
          const dateB = b.updatedAt || b.submittedAt || new Date(0);
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

      if (activeApplications.length > 0 && activeApplications[0].id) {
        console.log(
          `User has active application ${activeApplications[0].id}, redirecting to status.`
        );
        return router.createUrlTree([
          '/application-status',
          activeApplications[0].id,
        ]);
      } else {
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
      return of(true);
    })
  );
};
