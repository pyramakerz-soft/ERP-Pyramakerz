import { Component } from '@angular/core'; 
import { AnnouncementService } from '../../../Services/Employee/Administration/announcement.service';
import { Announcement } from '../../../Models/Administrator/announcement';
import { ApiService } from '../../../Services/api.service';
import { CommonModule } from '@angular/common';
import { InitLoader } from '../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../Services/loading.service';
@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-home.component.html',
  styleUrl: './employee-home.component.css',
})

@InitLoader()
export class EmployeeHomeComponent { 
  announcements: Announcement[] = []  
  DomainName = ''
  selectedIndex = 0;
  private intervalId: any;

  constructor(private announcementService: AnnouncementService, public ApiServ: ApiService,
    private loadingService: LoadingService ){}
    
  ngOnInit(){ 
    this.DomainName = this.ApiServ.GetHeader();
    this.getMyAnnouncement()     
    this.startAutoSlide();
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
