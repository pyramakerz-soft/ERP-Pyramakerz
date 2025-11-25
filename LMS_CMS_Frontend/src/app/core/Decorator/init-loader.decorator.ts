import { LoadingService } from '../../Services/loading.service';

export function InitLoader() {
  return function (constructor: any) {
    const originalNgOnInit = constructor.prototype.ngOnInit;

    constructor.prototype.ngOnInit = function (...args: any[]) {
      const loadingService: LoadingService = this.loadingService;
      if (!loadingService) return originalNgOnInit?.apply(this, args);

      loadingService.startNgInitTracking(); // enable tracking

      const stopLoading = () => {
        const interval = setInterval(() => {
          if (loadingService.pendingRequests === 0) {
            loadingService.hide();
            loadingService.stopNgInitTracking();
            clearInterval(interval);
          }
        }, 50);
      };

      const result = originalNgOnInit?.apply(this, args);

      if (result instanceof Promise) {
        result.finally(stopLoading);
      } else {
        stopLoading();
      }

      return result;
    };
  };
}