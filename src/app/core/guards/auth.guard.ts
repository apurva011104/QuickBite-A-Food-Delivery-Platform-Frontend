import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getLoggedInUser();

  if (!user) {
      router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return false;
    }

  if (user.role !== 'CUSTOMER') {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};