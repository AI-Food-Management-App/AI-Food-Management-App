import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.services';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};