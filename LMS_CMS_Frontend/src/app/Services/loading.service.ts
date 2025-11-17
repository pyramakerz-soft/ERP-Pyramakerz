import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private activeRequests = 0;

  get pendingRequests(): number {
    return this.activeRequests;
  }

  show() {
    this.loadingSubject.next(true);
  }

  hide() {
    this.loadingSubject.next(false);
  }

  startRequest() {
    if (this.activeRequests === 0) this.show();
    this.activeRequests++;
  }

  finishRequest() {
    this.activeRequests = Math.max(this.activeRequests - 1, 0);
    if (this.activeRequests === 0) this.hide();
  }

  private trackNgOnInitRequests = false;

  startNgInitTracking() {
    this.trackNgOnInitRequests = true;
  }

  stopNgInitTracking() {
    this.trackNgOnInitRequests = false;
  }

}
