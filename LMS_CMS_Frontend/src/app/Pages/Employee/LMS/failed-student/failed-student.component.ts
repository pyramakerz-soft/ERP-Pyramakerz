import { Component } from '@angular/core';
import { FailedStudents } from '../../../../Models/LMS/failed-students';
import { TokenData } from '../../../../Models/token-data';
import { FailedStudentsService } from '../../../../Services/Employee/LMS/failed-students.service';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';

@Component({
  selector: 'app-failed-student',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './failed-student.component.html',
  styleUrl: './failed-student.component.css'
})
export class FailedStudentComponent {
  keysArray: string[] = ['id', 'StudentEnglishName', 'StudentArabicName', 'GradeName', 'SubjectEnglishName', 'SubjectArabicName', 'AcademicYearName'];
  key: string = 'id';
  value: any = ''; 
  FailedStudentsData: FailedStudents[] = []; 
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
 
  constructor(
    public account: AccountService,
    public ApiServ: ApiService,  
    public failedStudentsService: FailedStudentsService, 
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();
 
    this.getFailedStudentData(); 
  }
 
  getFailedStudentData() {
    this.FailedStudentsData = []
    this.failedStudentsService.Get(this.DomainName).subscribe((data) => {
      this.FailedStudentsData = data;
    });
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: FailedStudents[] = await firstValueFrom(
        this.failedStudentsService.Get(this.DomainName)
      );
      this.FailedStudentsData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.FailedStudentsData = this.FailedStudentsData.filter((t) => {
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
      this.FailedStudentsData = [];
    }
  }
}
