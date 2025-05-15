// src/app/auth/admin.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  UrlTree,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Ensure correct path

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isLoggedIn) => {
        if (isLoggedIn && this.authService.hasRole('ROLE_ADMIN')) {
          // Use the hasRole method
          return true;
        }
        // If not logged in, AuthGuard would typically redirect to /signin first.
        // If logged in but not admin, redirect to a "not authorized" or home page.
        // Consider the user experience if !isLoggedIn - AuthGuard should handle that.
        // This guard assumes AuthGuard has already run or that isLoggedIn is a prerequisite.
        return this.router.createUrlTree(
          isLoggedIn ? ['/not-authorized'] : ['/signin']
        ); // Or just ['/'] if not an admin
      })
    );
  }
}
