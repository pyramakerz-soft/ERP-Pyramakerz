import { Injectable } from '@angular/core';
import { NotificationPopUpComponent } from '../../Component/notification-pop-up/notification-pop-up.component';
import { NotificationService } from '../Employee/Communication/notification.service'; 
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class IterativeNotificcationService {
  private intervalId: any;  

  constructor( 
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) { } 

  startInterval(domainName: string) {
    this.intervalId = setInterval(() => {
      this.fetchAndShow(domainName);
    }, 3000);
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
 
  private fetchAndShow(domainName: string) {
    this.notificationService.GetNotNotifiedYetByUserID(domainName).subscribe((data) => {
      if (data && data.length > 0) { 
        this.stopInterval();

        const dialogRef = this.dialog.open(NotificationPopUpComponent, {
          data: { notification: data },
          disableClose: true,
          panelClass: 'fullscreen-notification-modal'
        });

        dialogRef.afterClosed().subscribe(() => { 
          this.startInterval(domainName);
        });
      }
    });
  }

}
