import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LogOutService } from '../Services/shared/log-out.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export const forSuspendInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(LogOutService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 403 && err.error === 'User is suspended.') {  
        authService.logOut();
        router.navigateByUrl('') 
        Swal.fire({
          icon: 'warning',
          title: 'Account suspended',
          text: 'Your account has been suspended. You will be logged out.',
          confirmButtonText: 'OK'
        })
      }
      return throwError(() => err);
    }) 
  );
};
