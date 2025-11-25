import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ApiService } from '../api.service';
import { TokenData } from '../../Models/token-data';
import { AccountService } from '../account.service';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class RealTimeRequestServiceService {
  private requestHubConnection: signalR.HubConnection|null = null;
  DomainName = ""
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  private isConnected = false;

  constructor(public ApiServ: ApiService, public account: AccountService, public requestService:RequestService) { 
    this.DomainName = this.ApiServ.GetHeader(); 
  } 
  
  startRequestConnection() {
    if (this.isConnected && this.requestHubConnection) return;
    this.User_Data_After_Login = this.account.Get_Data_Form_Token()  
 
    this.requestHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.ApiServ.BaseUrlSignalR}  `, {
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
 
    // this.requestHubConnection = new signalR.HubConnectionBuilder()
    //   .withUrl(`${this.ApiServ.BaseUrlSignalR}requestHub`, {
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
    this.requestHubConnection.onreconnecting(() => {
      this.isConnected = false; 
    });

    this.requestHubConnection.onreconnected(() => {
      this.isConnected = true; 
      this.joinRequestGroup();
    });

    this.requestHubConnection.onclose(() => {
      this.isConnected = false; 
      setTimeout(() => this.startRequestConnection(), 5000);
    });

    this.requestHubConnection.start()
      .then(() => {
        this.isConnected = true; 
        this.joinRequestGroup(); 
      })
      .catch(err => { 
        setTimeout(() => this.startRequestConnection(), 5000);
      });

    this.requestHubConnection.on('ReceiveRequestUpdate', (data: any) => { 
      this.requestService.notifyRequestOpened(); 
    }); 

    // this.requestHubConnection.on('NewRequest', (data: any) => { 
    //   this.requestService.notifyRequestOpened(); 
    // }); 
  } 

  private joinRequestGroup() { 
    const groupName = `${this.DomainName}_request_${this.User_Data_After_Login.type}_${this.User_Data_After_Login.id}`;
    
    this.requestHubConnection?.invoke('JoinGroup', groupName) 
      .catch(err => { 
        setTimeout(() => this.joinRequestGroup(), 2000);
      });
  } 

  stopConnection(): void {
    if (this.requestHubConnection) {
      this.requestHubConnection.stop() 
        .then(() => { 
          this.requestHubConnection = null;
        }) 
    } 
  }
}
