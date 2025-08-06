import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationPopUpComponent } from '../../Component/notification-pop-up/notification-pop-up.component';
import * as signalR from '@microsoft/signalr';
import { ApiService } from '../api.service';
import { NotificationService } from '../Employee/Communication/notification.service';
import { Notification } from '../../Models/Communication/notification';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RealTimeNotificationServiceService {
  private hubConnection: signalR.HubConnection| null = null; 
  BaseUrlOcta=""
  header = ""
  DomainName = ""
  private dialogRef: MatDialogRef<NotificationPopUpComponent> | null = null;
  public notificationReceived = new signalR.Subject<Notification>();
 
  constructor(
    private dialog: MatDialog,
    public http: HttpClient,
    public ApiServ: ApiService, public notificationService:NotificationService
  ) {
    this.BaseUrlOcta=ApiServ.BaseUrlOcta
    this.header = ApiServ.GetHeader()
    this.DomainName = this.ApiServ.GetHeader();
  }

  startConnection(): void { 
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5094/notificationHub`, {
        accessTokenFactory: () => localStorage.getItem("current_token")!,
        headers: {
          "Domain-Name": this.DomainName
        }, 
        withCredentials: true  
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build(); 

    this.hubConnection
      .start()
      .then(() => { 
        this.loadOldNotifications();
      })
      .catch((err) => console.error('SignalR Connection Error:', err));

    this.hubConnection.on('ReceiveNotification', (data: any) => {
      this.showNotificationModal(data);
    });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          this.hubConnection = null;
        })
        .catch(err => console.error('Error stopping SignalR:', err));
    }
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  private loadOldNotifications() {
    this.notificationService.GetNotNotifiedYetByUserID(this.DomainName).subscribe((data) => {
      if (data && data.length > 0) {
        this.dialogRef = this.dialog.open(NotificationPopUpComponent, {
          data: { notification: data },
          disableClose: true,
          panelClass: 'fullscreen-notification-modal',
        });
      }
    });
  } 

  private showNotificationModal(newNotification: Notification) {
    if (this.dialogRef) {
      const instance = this.dialogRef.componentInstance;
      instance.addNotification(newNotification);
    } else {
      this.dialogRef = this.dialog.open(NotificationPopUpComponent, {
        data: { notification: [newNotification] },
        disableClose: true,
        panelClass: 'fullscreen-notification-modal',
      });
    }
  }
}
