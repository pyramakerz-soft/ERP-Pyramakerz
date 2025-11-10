import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { AccountService } from '../account.service';
import { TokenData } from '../../Models/token-data';
import * as signalR from '@microsoft/signalr';
import { ChatMessageService } from './chat-message.service';
import { NotificationPopUpComponent } from '../../Component/notification-pop-up/notification-pop-up.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../Employee/Communication/notification.service';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class RealTimeServiceService {
 private hubConnection: signalR.HubConnection | null = null;
  DomainName = "";
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "");
  private isConnected = false;

  public chatReceived = new signalR.Subject<any>();
  public notificationReceived = new signalR.Subject<any>();
  public requestReceived = new signalR.Subject<any>();

  private notificationDialogRef: MatDialogRef<NotificationPopUpComponent> | null = null

  constructor(
    private apiServ: ApiService,
    private account: AccountService,
    private chatMessageService: ChatMessageService,
    private notificationService: NotificationService,
    private requestService: RequestService,
    private dialog: MatDialog
  ) {
    this.DomainName = this.apiServ.GetHeader();
  }
  
  startConnection() {
    if (this.isConnected && this.hubConnection) return;

    this.User_Data_After_Login = this.account.Get_Data_Form_Token();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiServ.BaseUrlSignalR}appHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => localStorage.getItem('current_token') || '',
        headers: { 'Domain-Name': this.DomainName }
      })
      .configureLogging(signalR.LogLevel.Debug)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext =>
          Math.min(retryContext.previousRetryCount * 1000, 10000)
      })
      .build();
 
    // connection events
    this.hubConnection.onreconnecting(() => this.isConnected = false);
    this.hubConnection.onreconnected(() => {
      this.isConnected = true;
      this.joinAllGroups();
    });
    this.hubConnection.onclose(() => {
      this.isConnected = false;
      setTimeout(() => this.startConnection(), 5000);
    });

    // listeners
    this.hubConnection.on('ReceiveChatMessage', (data: any) => { 
      this.chatMessageService.notifyMessageOpened();
      this.chatReceived.next(data);
    }); 
    this.hubConnection.on('ReceiveNotification', (data: any) => {
      this.showNotificationModal(data) 
    });
    this.hubConnection.on('ReceiveRequestUpdate', (data: any) => {
      this.requestService.notifyRequestOpened();
      this.requestReceived.next(data);
    }); 

    // start connection
    this.hubConnection.start()
      .then(() => {
        this.isConnected = true;
        this.joinAllGroups();
      })
      .catch(() => setTimeout(() => this.startConnection(), 5000));
  }

  private joinAllGroups() {
    const userType = this.User_Data_After_Login.type; 
    const userId = this.User_Data_After_Login.id;

    const chatGroup = `${this.DomainName}_chat_${userType}_${userId}`;
    const notificationGroup = `${this.DomainName}_notification_${userType}_${userId}`;
    const requestGroup = `${this.DomainName}_request_${userType}_${userId}`;
 
    [chatGroup, notificationGroup, requestGroup].forEach(group => {
      this.hubConnection?.invoke('JoinGroup', group)
        .catch(() => setTimeout(() => this.joinAllGroups(), 2000));
    });
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => this.hubConnection = null);
    }
    if (this.notificationDialogRef) {
      this.notificationDialogRef.close();
      this.notificationDialogRef = null;
    }
  }

  private showNotificationModal(newNotification: any) {
    if (this.notificationDialogRef && this.notificationDialogRef.componentInstance) {
      const instance = this.notificationDialogRef.componentInstance;
      instance.addNotification(newNotification);
      this.notificationDialogRef.updatePosition({ top: '0', left: '0' });
    } else {
      this.notificationDialogRef = this.dialog.open(NotificationPopUpComponent, {
        data: { notification: [newNotification] },
        disableClose: true,
        panelClass: 'fullscreen-notification-modal',
      });

      this.notificationDialogRef.afterClosed().subscribe(() => this.notificationDialogRef = null);
    }
  }
}
