import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatMessageService } from '../../../Services/shared/chat-message.service';
import { ChatMessage } from '../../../Models/Communication/chat-message';
import { TokenData } from '../../../Models/token-data';
import { ApiService } from '../../../Services/api.service';
import { AccountService } from '../../../Services/account.service';

@Component({
  selector: 'app-my-messages',
  standalone: true,
  imports: [],
  templateUrl: './my-messages.component.html',
  styleUrl: './my-messages.component.css'
})
export class MyMessagesComponent {
  DomainName: string = ''; 
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', ''); 

  otherUserID: number | null = null;
  otherUserTypeID: number | null = null;

  chatMessages:ChatMessage[]= []

  constructor(private route: ActivatedRoute, public chatMessageService:ChatMessageService, public account: AccountService, public ApiServ: ApiService) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 

    this.DomainName = this.ApiServ.GetHeader();

    this.route.queryParams.subscribe(params => {
      this.otherUserID = params['otherUserID'] ? +params['otherUserID'] : null;
      this.otherUserTypeID = params['otherUserTypeID'] ? +params['otherUserTypeID'] : null;
      
      if (this.otherUserID && this.otherUserTypeID) {
        this.loadSpecificChat(this.otherUserID, this.otherUserTypeID);
      } else {
        this.loadAllMessages();
      }
    });
  }

  loadSpecificChat(userID: number, userTypeID: number) { 
    this.chatMessages = []
    this.chatMessageService.BySenderAndReceiverID(userID, userTypeID, this.DomainName).subscribe(
      data => {
        this.chatMessages = data
      }
    )
  }

  loadAllMessages() { 
    this.chatMessages = []
    this.chatMessageService.ByUserIDWithAllOtherUsers(this.DomainName).subscribe(
      data => {
        this.chatMessages = data
      }
    )
  }
}
