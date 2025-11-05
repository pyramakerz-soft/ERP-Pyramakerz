import { Component } from '@angular/core'; 
import { TokenData } from '../../../Models/token-data';
import { AccountService } from '../../../Services/account.service';
import { Router } from '@angular/router';
import { Announcement } from '../../../Models/Administrator/announcement';
import { AnnouncementService } from '../../../Services/Employee/Administration/announcement.service';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../Services/api.service';

@Component({
  selector: 'app-home-parent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-parent.component.html',
  styleUrl: './home-parent.component.css'
})
export class HomeParentComponent {
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  greeting: string = '';
  announcements: Announcement[] = []  
  DomainName = ''
  selectedIndex = 0;
  private intervalId: any;
  
  constructor(public accountService: AccountService, private announcementService: AnnouncementService, private router: Router, public ApiServ: ApiService){}
  
  ngOnInit() { 
    this.DomainName = this.ApiServ.GetHeader();
    this.User_Data_After_Login = this.accountService.Get_Data_Form_Token();
    this.setGreeting();
    this.getMyAnnouncement()     
    this.startAutoSlide();
  }

  setGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      this.greeting = 'Good Morning';
    } else if (currentHour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  NavigateeToPage(route: string) {
    this.router.navigateByUrl(`Parent/${route}`)
  }
  
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getMyAnnouncement(){
    this.announcements = []
    this.announcementService.GetMyAnnouncement(this.DomainName).subscribe(
      data => {
        this.announcements = data
      }
    )
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex = index;
  }

  nextSlide(): void {
    if (this.selectedIndex < this.announcements.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;  
    }
  }

  prevSlide(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      this.selectedIndex = this.announcements.length - 1;  
    }
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();  
    }, 5000); 
  }
}
