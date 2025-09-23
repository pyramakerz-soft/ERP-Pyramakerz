import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../Services/account.service';
import { RoleDetailsService } from '../Services/Employee/role-details.service';
import { MenuService } from '../Services/shared/menu.service';
import { catchError, map, of, switchMap } from 'rxjs';
import Swal from 'sweetalert2';

export const navigateIfHaveSettingPageGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accountService = inject(AccountService);
  const roleDetailsService = inject(RoleDetailsService);
  const menuService = inject(MenuService);

  const token = localStorage.getItem('current_token');
  
  if (!token) {
    router.navigateByUrl('/login');
    return false;
  }

  const userData = accountService.Get_Data_Form_Token();

  if (userData.type==="octa") {
    return true;  
  } 

  if (!userData || !userData.role) { 
    router.navigateByUrl('');
    return false;
  }

  const pageName = route.routeConfig?.path || '';

  return roleDetailsService.CheckPageAccess(userData.role, pageName).pipe(
    map(() => true),
    catchError(() => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You Have No Access To This Page',
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' },
      });
      router.navigateByUrl('');
      return of(false);
    })
  );
};
