import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isLoggedIn) => {
        if (isLoggedIn && this.authService.hasRole('ROLE_ADMIN')) {
          return true;
        }

        return this.router.createUrlTree(
          isLoggedIn ? ['/not-authorized'] : ['/signin']
        );
      })
    );
  }
}
