import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { School } from '../../../../Models/school';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { TokenData } from '../../../../Models/token-data';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { UpgradeStudentsService } from '../../../../Services/Employee/LMS/upgrade-students.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upgrade-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upgrade-student.component.html',
  styleUrl: './upgrade-student.component.css'
})
export class UpgradeStudentComponent {
  schools: School[] = [];
  SelectedSchoolId: number = 0;
  academicYearFrom: AcademicYear[] = [];
  SelectedFromAcademicYearId: number = 0;
  academicYearTo: AcademicYear[] = [];
  SelectedToAcademicYearId: number = 0; 
  isSummerCourse = false;
  filteredAcademicYearFrom: AcademicYear[] = [];
  filteredAcademicYearTo: AcademicYear[] = [];

  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  isLoading: boolean = false;

  constructor(public account: AccountService, public ApiServ: ApiService, public schoolService: SchoolService, public acadimicYearService: AcadimicYearService, public upgradeStudentsService: UpgradeStudentsService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();
 
    this.getSchools() 
  }

  getSchools(){
    this.schools = [];
    this.schoolService.Get(this.DomainName).subscribe(
      data =>{
        this.schools = data;
      }
    )
  }

  getAcademicYearBySchoolId(){
    this.academicYearFrom = [];
    this.academicYearTo = [];
    this.filteredAcademicYearFrom = [];
    this.filteredAcademicYearTo = [];
    this.acadimicYearService.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe(
      data =>{
        this.academicYearFrom = data;
        this.academicYearTo = data;
        this.filteredAcademicYearFrom = [...this.academicYearFrom];
        this.filteredAcademicYearTo = [...this.academicYearTo];
      }
    )
  } 

  onFromAcademicYearChange() {
    if (this.SelectedFromAcademicYearId === 0) { 
      this.filteredAcademicYearTo = [...this.academicYearTo];
    } else {
      this.filteredAcademicYearTo = this.academicYearTo.filter(year => year.id !== +this.SelectedFromAcademicYearId);
    } 
  }
 
  onToAcademicYearChange() {
    if (this.SelectedToAcademicYearId === 0) { 
      this.filteredAcademicYearFrom = [...this.academicYearFrom];
    } else {
      this.filteredAcademicYearFrom = this.academicYearFrom.filter(year => year.id !== +this.SelectedToAcademicYearId);
    } 
  }

  UpgradeStudents(){
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will upgrade students to the new academic year.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, upgrade',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#6F6F6F'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        const upgradeStudents = {
          fromAcademicYearID: this.SelectedFromAcademicYearId,
          toAcademicYearID: this.SelectedToAcademicYearId
        };
 
        const upgradeObservable = this.isSummerCourse
          ? this.upgradeStudentsService.UpgradeStudentAfterSummerCourse(upgradeStudents, this.DomainName)
          : this.upgradeStudentsService.UpgradeStudent(upgradeStudents, this.DomainName);
 
        upgradeObservable.subscribe({
          next: (data) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Upgrade Complete',
              text: 'Students have been successfully upgraded.',
              confirmButtonColor: '#089B41'
            });
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Upgrade Failed',
              text: 'Something went wrong while upgrading students.',
              confirmButtonColor: '#6F6F6F'
            });
          }
        });
      }
    }); 
  }
}
