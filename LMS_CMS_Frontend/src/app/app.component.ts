import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from './Services/api.service';
import { RealTimeNotificationServiceService } from './Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ERP_System';
  // DomainName = ''  
  
  // constructor(private realTimeService: RealTimeNotificationServiceService, private ApiServ: ApiService) {}

  // ngOnInit() {
  //   this.DomainName = this.ApiServ.GetHeader();  
  //   this.realTimeService.startConnection();
  // }
}
