import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // private loadingSubject = new BehaviorSubject<boolean>(false);
  // loading$ = this.loadingSubject.asObservable();

  // show() {
  //   this.loadingSubject.next(true);
  // }

  // hide() {
  //   this.loadingSubject.next(false);
  // }

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private activeRequests = 0;

  show() {
    this.loadingSubject.next(true);
  }

  hide() {
    this.loadingSubject.next(false);
  }

  startRequest() {
    if (this.activeRequests === 0) {
      this.show();
    }
    this.activeRequests++;
  }

  finishRequest() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.hide();
    }
  }
}
