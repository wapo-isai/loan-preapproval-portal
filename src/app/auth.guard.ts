// src/app/auth/auth.guard.ts (Example - requires AuthService)
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from './auth.service'; // Your actual auth service

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAuthenticated()) { // isAuthenticated() would be a method in your AuthService
//     return true;
//   } else {
//     router.navigate(['/signin']);
//     return false;
//   }
// };
