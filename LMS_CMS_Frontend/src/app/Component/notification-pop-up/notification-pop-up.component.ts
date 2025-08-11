import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { Notification } from '../../Models/Communication/notification';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ApiService } from '../../Services/api.service';
import { NotificationService } from '../../Services/Employee/Communication/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notification-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-pop-up.component.html',
  styleUrl: './notification-pop-up.component.css'
})
export class NotificationPopUpComponent {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();
  notificationByID = new Notification()
  DomainName = "" 

  constructor(
    public ApiServ: ApiService,
    public notificationService: NotificationService,
    private dialogRef: MatDialogRef<NotificationPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { notification: Notification[] },
    private changeDetector: ChangeDetectorRef 
  ) {}

  ngOnInit() { 
    if (this.data.notification && this.data.notification.length > 0) {
      this.notifications = [...this.data.notification];
    } else {
      this.dialogRef.close();
    }
    this.DomainName = this.ApiServ.GetHeader();
    
    this.notificationService.notifyNotificationOpened();
  }

  addNotification(notification: Notification) {
    // Add new notification at the top of the list
    this.notifications.unshift(notification);
    this.changeDetector.detectChanges();
  } 
  
  DismissAll(){
    this.notificationService.DismissAll(this.DomainName).subscribe(
      data =>{}
    )
    this.notifications = this.notifications.filter(
      notification => notification.isAllowDismiss === false && notification.isLinkOpened === false
    );
    if(this.notifications.length == 0){
      this.dialogRef.close();
    }else{
      Swal.fire({
        title: 'Could not dismiss all notifications',
        text: 'Some require you to view the link first',
        icon: 'warning',
        confirmButtonColor: '#089B41'
      });
    }
  }

  close(notificationID:number) {   
    // Find the notification being closed
    const notificationToClose = this.notifications.find(n => n.id === notificationID);
    
    this.notifications = this.notifications.filter(
      notification => notification.id !== notificationID || (notification.id === notificationID && notification.isLinkOpened == false && notification.isAllowDismiss == false)
    );
    
    // If the notification was actually removed (not kept due to conditions)
    if (notificationToClose && 
        !(notificationToClose.isLinkOpened === false && notificationToClose.isAllowDismiss === false)) {
        this.notificationService.DismissOne(notificationID, this.DomainName).subscribe(data => {});
    }

    if(this.notifications.length == 0){
      this.dialogRef.close();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewNotification(notificationShared:Notification){
    this.notificationByID = new Notification()
    this.notificationService.ByUserIDAndNotificationSharedByID(notificationShared.id, this.DomainName).subscribe(
      data => {
        this.notificationByID = data 
        document.getElementById("NotificationModalForSideNotifications")?.classList.remove("hidden");
        document.getElementById("NotificationModalForSideNotifications")?.classList.add("flex");

        this.notificationService.notifyNotificationOpened(); 
      }
    )
  }  
 
  closeNotificationModal() {
    this.notificationByID = new Notification()

    document.getElementById("NotificationModalForSideNotifications")?.classList.remove("flex");
    document.getElementById("NotificationModalForSideNotifications")?.classList.add("hidden"); 
  }

  formatInsertedAt(dateString: string | Date): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) { 
      return `Today, ${time}`; 
    } else if (isYesterday) {
      return `Yesterday, ${time}`; 
    } else {
      const dateStr = date.toLocaleDateString();
      return `${dateStr}, ${time}`;
    }
  }

  getImageName(imageLink: string): string {
    const parts = imageLink.split('/');
    return parts[parts.length - 1];
  }
  
  LinkOpened(notificationSharedID:number){  
    this.notificationService.LinkOpened(notificationSharedID, this.DomainName).subscribe(
      data => {  
        this.notifications = this.notifications.map(notification => 
            notification.id === notificationSharedID 
              ? { ...notification, isLinkOpened: true } 
              : notification  
        );
        if(this.notificationByID.id != 0){
          this.notificationByID.isLinkOpened = true
        } 

        this.notificationService.notifyNotificationOpened(); 
      }
    )
  } 
}
