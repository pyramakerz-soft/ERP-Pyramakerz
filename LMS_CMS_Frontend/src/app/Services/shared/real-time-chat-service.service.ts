import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { TokenData } from '../../Models/token-data';
import { ApiService } from '../api.service';
import { AccountService } from '../account.service';
import { ChatMessageService } from './chat-message.service';

@Injectable({
  providedIn: 'root'
})
export class RealTimeChatServiceService {
  private chatMessageHubConnection: signalR.HubConnection|null = null;
  DomainName = ""
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  private isConnected = false;

  constructor(public ApiServ: ApiService, public account: AccountService, public chatMessageService:ChatMessageService) { 
    this.DomainName = this.ApiServ.GetHeader(); 
  } 
  
  startChatMessageConnection() {
    if (this.isConnected && this.chatMessageHubConnection) return;
    this.User_Data_After_Login = this.account.Get_Data_Form_Token()  
  
    this.chatMessageHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.ApiServ.BaseUrlSignalR}appHub`, {
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
  
    // this.chatMessageHubConnection = new signalR.HubConnectionBuilder()
    //   .withUrl(`${this.ApiServ.BaseUrlSignalR}chatMessageHub`, {
    //     skipNegotiation: true,
    //     transport: signalR.HttpTransportType.WebSockets,
    //     accessTokenFactory: () => localStorage.getItem("current_token") || '',
    //     headers: { "Domain-Name": this.DomainName }
    //   })
    //   .configureLogging(signalR.LogLevel.Debug)
    //   .withAutomaticReconnect({
    //     nextRetryDelayInMilliseconds: retryContext => 
    //       Math.min(retryContext.previousRetryCount * 1000, 10000)
    //   })
    //   .build();

    // Connection state handlers
    this.chatMessageHubConnection.onreconnecting(() => {
      this.isConnected = false; 
    });

    this.chatMessageHubConnection.onreconnected(() => {
      this.isConnected = true; 
      this.joinChatMessageGroup();
    });

    this.chatMessageHubConnection.onclose(() => {
      this.isConnected = false; 
      setTimeout(() => this.startChatMessageConnection(), 5000);
    });

    this.chatMessageHubConnection.start()
      .then(() => {
        this.isConnected = true; 
        this.joinChatMessageGroup(); 
      })
      .catch(err => { 
        setTimeout(() => this.startChatMessageConnection(), 5000);
      });

    this.chatMessageHubConnection.on('ReceiveChatMessage', (data: any) => { 
      this.chatMessageService.notifyMessageOpened(); 
    }); 

    // this.chatMessageHubConnection.on('ReceiveMessage', (data: any) => { 
    //   this.chatMessageService.notifyMessageOpened(); 
    // }); 
  } 

  private joinChatMessageGroup() { 
    const groupName = `${this.DomainName}_chat_${this.User_Data_After_Login.type}_${this.User_Data_After_Login.id}`;
    
    this.chatMessageHubConnection?.invoke('JoinGroup', groupName) 
      .catch(err => { 
        setTimeout(() => this.joinChatMessageGroup(), 2000);
      });
  } 

  stopConnection(): void {
    if (this.chatMessageHubConnection) {
      this.chatMessageHubConnection.stop() 
        .then(() => { 
          this.chatMessageHubConnection = null;
        }) 
    } 
  }
}
