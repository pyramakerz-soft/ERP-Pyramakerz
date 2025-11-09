import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { Classroom } from '../../../../Models/LMS/classroom';
import { Grade } from '../../../../Models/LMS/grade';
import { School } from '../../../../Models/school';
import { Attendance } from '../../../../Models/SocialWorker/attendance';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { BuildingService } from '../../../../Services/Employee/LMS/building.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AttendanceService } from '../../../../Services/Employee/SocialWorker/attendance.service';
import { AttendanceStudent } from '../../../../Models/SocialWorker/attendance-student';
import { StudentService } from '../../../../Services/student.service';
import Swal from 'sweetalert2';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-attendance-student',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './attendance-student.component.html',
  styleUrl: './attendance-student.component.css'
})
export class AttendanceStudentComponent {
  keysArray: string[] = ['id', 'date'];
  key: string = "id";
  value: any = "";

  attendance: Attendance = new Attendance()

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = ""
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = "";
  mode: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  Schools: School[] = []
  AcademicYears: AcademicYear[] = []
  Grades: Grade[] = []
  Classes: Classroom[] = []

  IsViewTable: boolean = false;
  AttendanceId: number = 0;
  allSelected: boolean = false;

  isLoading = false
  isLoadingSaveClassroom = false
  validationErrors: { [key in keyof Attendance]?: string } = {};
  validationIsLateErrors: { [studentId: number]: string } = {};

  constructor(public account: AccountService, private languageService: LanguageService, public buildingService: BuildingService, public ApiServ: ApiService, public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService, public activeRoute: ActivatedRoute, public schoolService: SchoolService, public classroomService: ClassroomService, public StudentServ: StudentService,
    public gradeService: GradeService, public acadimicYearService: AcadimicYearService, public router: Router, public AttendanceServ: AttendanceService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });
    this.AttendanceId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.GetAllSchools()
    if (!this.AttendanceId) {
      this.mode = "Create"
    } else {
      this.mode = "Edit"
      this.GetAttendance();
    }

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

  GetAttendance() {
    this.AttendanceServ.GetByID(this.AttendanceId, this.DomainName).subscribe((d) => {
      this.attendance = d
      this.allSelected = this.attendance.attendanceStudents.every(s => s.isPresent);
      this.gradeService.GetBySchoolId(this.attendance.schoolID, this.DomainName).subscribe((d) => {
        this.Grades = d
        this.classroomService.GetByGradeId(this.attendance.gradeID, this.DomainName).subscribe((d) => {
          this.Classes = d
        })
      })
      this.acadimicYearService.GetBySchoolId(this.attendance.schoolID, this.DomainName).subscribe((d) => {
        this.AcademicYears = d
      })
    })
  }

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.allSelected = isChecked;
    this.attendance.attendanceStudents.forEach(a => a.isPresent = this.allSelected);
  }

  validateNumber(event: any, field: keyof AttendanceStudent, row: AttendanceStudent): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof row[field] === 'string') {
        row[field] = '' as never;
      }
    }
  }

  GetStudentsByClass() {
    this.attendance.attendanceStudents = []
    this.StudentServ.GetByClassID(this.attendance.classroomID, this.DomainName)
      .subscribe(d => {
        this.attendance.attendanceStudents = d.map(stu => ({
          studentID: stu.id,
          studentArName: stu.ar_name,
          studentEnName: stu.en_name,
          lateTimeInMinutes : 0
        } as AttendanceStudent));
      });
  }

  onInputValueChange(event: { field: keyof Attendance; value: any }) {
    const { field, value } = event;
    (this.attendance as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onlateTimeMinuteChange(field: number) {
    this.validationIsLateErrors[field] = ''
  }  

  toggleStudentSelection(event: Event, row: AttendanceStudent): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    row.isPresent = isChecked;
    this.allSelected = this.attendance.attendanceStudents.every(s => s.isPresent);
    if(row.isPresent==false){
      row.isLate=false
      row.lateTimeInMinutes=0
      row.note=''
    }
  }

  GetAllSchools() {
    this.Schools = []
    this.Grades = []
    this.Classes = []
    this.AcademicYears = []
    this.attendance.schoolID = 0
    this.attendance.gradeID = 0
    this.attendance.classroomID = 0
    this.attendance.academicYearID = 0
    this.schoolService.Get(this.DomainName).subscribe((d) => {
      this.Schools = d
    })
  }

  GetAllGradesBySchool() {
    this.Grades = []
    this.Classes = []
    this.attendance.gradeID = 0
    this.attendance.classroomID = 0
    this.gradeService.GetBySchoolId(this.attendance.schoolID, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  GetAllAcademicYearsBySchool() {
    this.AcademicYears = []
    this.attendance.academicYearID = 0
    this.acadimicYearService.GetBySchoolId(this.attendance.schoolID, this.DomainName).subscribe((d) => {
      this.AcademicYears = d
    })
  }

  GetAllclassesBygrade() {
    this.Classes = []
    this.attendance.classroomID = 0
    this.classroomService.GetByGradeId(this.attendance.gradeID, this.DomainName).subscribe((d) => {
      this.Classes = d
    })
  }

  isFormValid(): boolean {
    console.log(this.attendance.attendanceStudents)
    let isValid = true;
    for (const key in this.attendance) {
      if (this.attendance.hasOwnProperty(key)) {
        const field = key as keyof Attendance;
        if (!this.attendance[field]) {
          if (
            field == 'date' ||
            field == 'gradeID' ||
            field == 'classroomID' ||
            field == 'academicYearID' ||
            field == 'schoolID'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            isValid = false;
          }
        }
        this.attendance.attendanceStudents.forEach(element => {
          if (element.isLate == true && element.lateTimeInMinutes == 0) {
            // here
            this.validationIsLateErrors[element.studentID] = 'late Time In Minutes Is Required If This Student Is Late'
            isValid = false;
          }
        });
      }
    }

    return isValid;
  }

  capitalizeField(field: keyof Attendance): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  moveToBack(){
    this.router.navigateByUrl('Employee/Attendance');
  }

  Save() {
    if (this.isFormValid()) {
      this.isLoading = true
      if (this.mode == 'Create') {
        this.AttendanceServ.Add(this.attendance, this.DomainName).subscribe((d) => {
          this.isLoading = false
          this.router.navigateByUrl(`Employee/Attendance`);
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Created Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        })
      }
      else if (this.mode == 'Edit') {
        this.AttendanceServ.Edit(this.attendance, this.DomainName).subscribe((d) => {
          this.isLoading = false
          this.router.navigateByUrl(`Employee/Attendance`);
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Updated Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          console.log(error)
          this.isLoading = false
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        })
      }
    }
  }

  IsLateChanged(event: Event, row: AttendanceStudent): void {
    // const isChecked = (event.target as HTMLInputElement).checked;
    if(!row.isLate){
      row.lateTimeInMinutes=0
    }
  }

}
