import { Component } from '@angular/core';
import { NotificationService } from '../../../Services/Employee/Communication/notification.service';
import { Notification } from '../../../Models/Communication/notification';
import { ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../Models/token-data';
import { AccountService } from '../../../Services/account.service';
import { ApiService } from '../../../Services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-notification.component.html',
  styleUrl: './my-notification.component.css'
})
export class MyNotificationComponent {
  TableData:Notification[] = []
  notification: Notification = new Notification() 
  DomainName: string = ''; 
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');  

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,  
    public activeRoute: ActivatedRoute, 
    public notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 

    this.DomainName = this.ApiServ.GetHeader();
 
    this.getAllData() 
  }

  getAllData(){
    this.TableData = []
    this.notificationService.ByUserID(this.DomainName).subscribe(
      data => {
        this.TableData = data
      }
    )
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

  viewNotification(notificationShared:Notification){
    notificationShared.seenOrNot = true
    this.notificationService.ByUserIDAndNotificationSharedByID(notificationShared.id, this.DomainName).subscribe(
      data => {
        this.notification = data
      }
    ) 
  }
}
