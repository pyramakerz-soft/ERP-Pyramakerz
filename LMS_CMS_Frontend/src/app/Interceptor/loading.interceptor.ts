import { HttpInterceptorFn } from '@angular/common/http';
import { LoadingService } from '../Services/loading.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
 
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  if (loadingService['trackNgOnInitRequests']) {
    loadingService.startRequest();
    return next(req).pipe(
      finalize(() => loadingService.finishRequest())
    );
  }

  return next(req); // other requests ignored
};