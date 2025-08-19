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
  
  constructor(public ApiServ: ApiService, public account: AccountService, public requestService:RequestService) { 
    this.DomainName = this.ApiServ.GetHeader(); 

    this.User_Data_After_Login = this.account.Get_Data_Form_Token()  
  } 

  initRequestHub() {
    this.requestHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.ApiServ.BaseUrlSignalR}requestHub`, {
        accessTokenFactory: () => localStorage.getItem("current_token") || '',
        headers: { "Domain-Name": this.DomainName }
      })
      .build();

    this.requestHubConnection.on("NewRequest", () => {
      this.requestService.notifyRequestOpened(); 
    });

    this.requestHubConnection.on("RequestUpdated", () => {
      this.requestService.notifyRequestOpened(); 
    });

    this.requestHubConnection.start();
  } 
}
