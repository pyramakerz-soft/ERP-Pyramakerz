import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const generalErrorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => { 
      if (err.status === 500) {
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Something went wrong on the server. Please try again later.'
        });
      } else if (err.status === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Network Error',
          text: 'Unable to reach the server. Please check your internet connection.'
        });
      } 

      return throwError(() => err);
    })
  );
};
