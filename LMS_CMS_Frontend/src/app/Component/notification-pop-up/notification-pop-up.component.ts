import { Component, Inject, Input } from '@angular/core';
import { Notification } from '../../Models/Communication/notification';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-pop-up.component.html',
  styleUrl: './notification-pop-up.component.css'
})
export class NotificationPopUpComponent {
  constructor(
    private dialogRef: MatDialogRef<NotificationPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { notification: Notification[] }
  ) {}

  ngOnInit() {
    if (!this.data.notification || this.data.notification.length === 0) { 
      this.dialogRef.close();
    } 
  }

  close() {
    this.dialogRef.close();
  }
}
