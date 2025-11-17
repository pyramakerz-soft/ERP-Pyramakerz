import { Component } from '@angular/core';
import { FailedStudents } from '../../../../Models/LMS/failed-students';
import { TokenData } from '../../../../Models/token-data';
import { FailedStudentsService } from '../../../../Services/Employee/LMS/failed-students.service';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-failed-student',
  standalone: true,
  imports: [CommonModule, SearchComponent, FormsModule],
  templateUrl: './failed-student.component.html',
  styleUrl: './failed-student.component.css'
})

@InitLoader()
export class FailedStudentComponent {
  keysArray: string[] = ['id', 'StudentEnglishName', 'StudentArabicName', 'GradeName', 'SubjectEnglishName', 'SubjectArabicName', 'AcademicYearName'];
  key: string = 'id';
  value: any = ''; 
  FailedStudentsData: FailedStudents[] = []; 
  yearID: number = 0; 
  AcademicYearsData: AcademicYear[] = []; 
  isView: boolean = false
  
  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  
  constructor(
    public account: AccountService,
    public ApiServ: ApiService,  
    public failedStudentsService: FailedStudentsService, 
    public acadimicYearService: AcadimicYearService ,
    private loadingService: LoadingService 
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader(); 
    this.getAcademicYear()
  }
 
  getAcademicYear() {
    this.AcademicYearsData = []
    this.acadimicYearService.Get(this.DomainName).subscribe((data) => {
      this.AcademicYearsData = data;
    });
  }
 
  getFailedStudentDataByAcademicYear() {
    this.FailedStudentsData = []
    this.failedStudentsService.GetByAcademicYearID(this.yearID, this.DomainName).subscribe((data) => {
      this.FailedStudentsData = data;
    });
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: FailedStudents[] = await firstValueFrom(
        this.failedStudentsService.GetByAcademicYearID(this.yearID, this.DomainName)
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
