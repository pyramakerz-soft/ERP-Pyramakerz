import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { DiscussionRoom } from '../../../../Models/LMS/discussion-room';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { LoadingService } from '../../../../Services/loading.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DiscussionRoomService } from '../../../../Services/Employee/LMS/discussion-room.service';

@Component({
  selector: 'app-discussion-room',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './discussion-room.component.html',
  styleUrl: './discussion-room.component.css'
})

@InitLoader()
export class DiscussionRoomComponent {
  TableData: DiscussionRoom[] = []
  discussionRoom: DiscussionRoom = new DiscussionRoom()
  isLoading = false;

  validationErrors: { [key in keyof DiscussionRoom]?: string } = {};
  keysArray: string[] = ['id', 'title'];
  key: string = 'id';
  value: any = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  isRtl: boolean = false;
  subscription!: Subscription;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    private translate: TranslateService,
    public discussionRoomService: DiscussionRoomService,
    private languageService: LanguageService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();

    this.getAllData()
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getAllData() {
    this.TableData = []
    // Using GetForStudent endpoint for students
    this.discussionRoomService.GetForStudent(this.DomainName).subscribe(
      data => {
        this.TableData = data
      }
    )
  }

  // For students, we don't need create/edit/delete functionality
  // Only viewing and joining meetings

    getActiveDays(room: DiscussionRoom): string[] {
    const days: string[] = [];
    if (room.saturday) days.push('Sat');
    if (room.sunday) days.push('Sun');
    if (room.monday) days.push('Mon');
    if (room.tuesday) days.push('Tue');
    if (room.wednesday) days.push('Wed');
    if (room.thursday) days.push('Thu');
    if (room.friday) days.push('Fri');
    return days;
  }

  IsAllowDelete(InsertedByID: number): boolean {
    return false; // Students cannot delete
  }

  IsAllowEdit(InsertedByID: number): boolean {
    return false; // Students cannot edit
  }

  joinMeeting(meetingLink: string) {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  }

  watchRecording(recordLink: string) {
    if (recordLink) {
      window.open(recordLink, '_blank');
    }
  }

  // Status checking methods (same as in your current student component)
  isUpcoming(room: DiscussionRoom): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(room.startDate);
    return startDate >= today;
  }

  isOngoing(room: DiscussionRoom): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(room.startDate);
    const endDate = new Date(room.endDate);
    return startDate <= today && endDate >= today;
  }

  isPast(room: DiscussionRoom): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(room.endDate);
    return endDate < today;
  }

  getStatusClass(room: DiscussionRoom): string {
    if (this.isOngoing(room)) return 'bg-green-100 primaryTxt';
    if (this.isUpcoming(room)) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  }

  getStatusText(room: DiscussionRoom): string {
    if (this.isOngoing(room)) return 'Ongoing';
    if (this.isUpcoming(room)) return 'Upcoming';
    return 'Completed';
  }

  getDaysOfWeek(room: DiscussionRoom): string[] {
    const days: string[] = [];
    if (room.saturday) days.push('Saturday');
    if (room.sunday) days.push('Sunday');
    if (room.monday) days.push('Monday');
    if (room.tuesday) days.push('Tuesday');
    if (room.wednesday) days.push('Wednesday');
    if (room.thursday) days.push('Thursday');
    if (room.friday) days.push('Friday');
    return days;
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    
    try {
      const data: any = await this.discussionRoomService.GetForStudent(this.DomainName).toPromise();
      this.TableData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.TableData = this.TableData.filter((t) => {
          const fieldValue = t[this.key as keyof typeof t];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(this.value.toLowerCase());
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(numericValue.toString())
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }
}