import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { Notification } from '../../Models/Communication/notification';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

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

  constructor(
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
  }

  addNotification(notification: Notification) {
    // Add new notification at the top of the list
    this.notifications.unshift(notification);
    this.changeDetector.detectChanges();
  } 
  
  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
