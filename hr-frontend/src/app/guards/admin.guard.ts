import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const userRole = authService.getUserRole();
  
  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }
  
  if (userRole === 'ADMIN') {
    return true;
  }
  
  router.navigate(['/dashboard']);
  return false;
};