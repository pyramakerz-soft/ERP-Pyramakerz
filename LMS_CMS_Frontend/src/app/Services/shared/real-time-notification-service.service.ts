import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationPopUpComponent } from '../../Component/notification-pop-up/notification-pop-up.component';
import * as signalR from '@microsoft/signalr';
import { ApiService } from '../api.service';
import { NotificationService } from '../Employee/Communication/notification.service';
import { Notification } from '../../Models/Communication/notification';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../account.service';
import { TokenData } from '../../Models/token-data';

@Injectable({
  providedIn: 'root'
})
export class RealTimeNotificationServiceService {
  private hubConnection: signalR.HubConnection| null = null; 
  BaseUrlOcta=""
  header = ""
  DomainName = "" 
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  
  private dialogRef: MatDialogRef<NotificationPopUpComponent> | null = null;
  public notificationReceived = new signalR.Subject<Notification>();
 
  private isConnected = false;

  constructor(
    private dialog: MatDialog,
    public http: HttpClient,
    public ApiServ: ApiService, public notificationService:NotificationService, public account: AccountService
  ) {
    this.BaseUrlOcta=ApiServ.BaseUrlOcta
    this.header = ApiServ.GetHeader()
    this.DomainName = this.ApiServ.GetHeader(); 
  }  

  startConnection(): void {
    if (this.isConnected && this.hubConnection) return;

    this.User_Data_After_Login = this.account.Get_Data_Form_Token()  

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.ApiServ.BaseUrlSignalR}notificationHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => localStorage.getItem("current_token") || '',
        headers: { "Domain-Name": this.DomainName }
      })
      .configureLogging(signalR.LogLevel.Debug)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => 
          Math.min(retryContext.previousRetryCount * 1000, 10000)
      })
      .build();

    // Connection state handlers
    this.hubConnection.onreconnecting(() => {
      this.isConnected = false; 
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected = true; 
      this.joinNotificationGroup();
    });

    this.hubConnection.onclose(() => {
      this.isConnected = false; 
      setTimeout(() => this.startConnection(), 5000);
    });

    this.hubConnection.start()
      .then(() => {
        this.isConnected = true; 
        this.joinNotificationGroup();
        this.loadOldNotifications();
      })
      .catch(err => { 
        setTimeout(() => this.startConnection(), 5000);
      });

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

  private joinNotificationGroup() {
    const userTypeString = this.getUserTypeNumber(this.User_Data_After_Login.type);
    const groupName = `${this.DomainName}_${userTypeString}_${this.User_Data_After_Login.id}`;
    
    this.hubConnection?.invoke('JoinGroup', groupName) 
      .catch(err => { 
        setTimeout(() => this.joinNotificationGroup(), 2000);
      });
  }

  private getUserTypeNumber(type: string): number {
    switch(type) {
      case "employee": return 1;
      case "student": return 2;
      case "parent": return 3;
      default: return 0;
    }
  }

  private showNotificationModal(newNotification: Notification) {
    // Check if dialog exists and is open
    if (this.dialogRef && this.dialogRef.componentInstance) {
      const instance = this.dialogRef.componentInstance;
      
      // Add new notification to existing dialog
      instance.addNotification(newNotification);
      
      // Bring dialog to front (if needed)
      this.dialogRef.updatePosition({
        top: '0',
        left: '0'
      });
    } else {
      // Create new dialog with the notification
      this.dialogRef = this.dialog.open(NotificationPopUpComponent, {
        data: { notification: [newNotification] },
        disableClose: true,
        panelClass: 'fullscreen-notification-modal',
      });
      
      // Handle dialog closing
      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
      });
    }
  }
}
