import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, from, mergeMap, throwError } from 'rxjs';
import Swal from 'sweetalert2';

// export const generalErrorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req).pipe(
//     catchError(err => { 
//       if (err.status === 500) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Server Error',
//           text: 'Something went wrong on the server. Please try again later.'
//         });
//       } else if (err.status === 0) {
//         Swal.fire({
//           icon: 'warning',
//           title: 'Network Error',
//           text: 'Unable to reach the server. Please check your internet connection.'
//         });
//       } 

//       return throwError(() => err);
//     })
//   );
// };

export const generalErrorHandlingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => {
      let messageData: { icon: any, title: string, text: string } | null = null;

      if (err.status === 500) {
        messageData = {
          icon: 'error',
          title: 'Server Error',
          text: 'Something went wrong on the server. Please try again later.'
        };
      } else if (err.status === 0) {
        messageData = {
          icon: 'warning',
          title: 'Network Error',
          text: 'Unable to reach the server. Please check your internet connection.'
        };
      }
 
      if (!messageData) {
        return throwError(() => err);
      }
 
      return from(import('sweetalert2')).pipe(
        mergeMap(module => {
          const Swal = module.default;

          Swal.fire({
            icon: messageData.icon,
            title: messageData.title,
            text: messageData.text,
            confirmButtonText: 'OK'
          });

          return throwError(() => err);
        })
      );
    })
  );
};