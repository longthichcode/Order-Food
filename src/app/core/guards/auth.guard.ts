import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth-service.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Lấy role từ localStorage
  const userRole = localStorage.getItem('role');
  const allowedRoles = route.data['roles'] as string[]; // lấy roles gán trong route

  if (allowedRoles && !allowedRoles.includes(userRole!)) {
    // nếu role không hợp lệ thì đưa về trang cấm hoặc home
    router.navigate(['/forbidden']);
    return false;
  }

  return true;
};
