import { Component } from '@angular/core';
import { Attendance } from '../../../../Models/SocialWorker/attendance';
import { Classroom } from '../../../../Models/LMS/classroom';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { Grade } from '../../../../Models/LMS/grade';
import { School } from '../../../../Models/school';
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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent {
  keysArray: string[] = ['id', 'date'];
  key: string = "id";
  value: any = "";

  TableData: Attendance[] = []

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = ""
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = "";
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  Schools: School[] = []
  AcademicYears: AcademicYear[] = []
  Grades: Grade[] = []
  Classes: Classroom[] = []

  SelectedSchoolId: number = 0
  SelectedAcademicYearId: number = 0
  SelectedGradeId: number = 0
  SelectedClassId: number = 0

  IsViewTable: boolean = false;

  isLoading = false
  isLoadingSaveClassroom = false

  constructor(public account: AccountService, private languageService: LanguageService, public buildingService: BuildingService, public ApiServ: ApiService, public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService, public activeRoute: ActivatedRoute, public schoolService: SchoolService, public classroomService: ClassroomService,
    public gradeService: GradeService, public acadimicYearService: AcadimicYearService, public router: Router, public AttendanceService: AttendanceService) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
      }
    });

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
    this.GetAllSchools()
  }

  Create() {

  }

  Edit(id: number) {

  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Attendance?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.AttendanceService.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllAttendance();
        });
      }
    });
  }

  GetAllSchools() {
    this.Schools = []
    this.Grades = []
    this.Classes = []
    this.AcademicYears = []
    this.SelectedSchoolId = 0
    this.SelectedGradeId = 0
    this.SelectedClassId = 0
    this.SelectedAcademicYearId = 0
    this.schoolService.Get(this.DomainName).subscribe((d) => {
      this.Schools = d
    })
  }

  GetAllGradesBySchool() {
    this.Grades = []
    this.Classes = []
    this.SelectedGradeId = 0
    this.SelectedClassId = 0
    this.gradeService.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  GetAllAcademicYearsBySchool() {
    this.AcademicYears = []
    this.SelectedAcademicYearId = 0
    this.acadimicYearService.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.AcademicYears = d
    })
  }

  GetAllclassesBygrade() {
    this.Classes = []
    this.SelectedClassId = 0
    this.classroomService.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.Classes = d
    })
  }

  GetAllAttendance() {
    this.TableData = []
    this.IsViewTable = true
    this.AttendanceService.GetByAcademicYearAndClass(this.SelectedAcademicYearId, this.SelectedClassId, this.DomainName).subscribe((d) => {
      this.TableData = d
    })
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Attendance[] = await firstValueFrom(this.AttendanceService.GetByAcademicYearAndClass(this.SelectedAcademicYearId, this.SelectedClassId, this.DomainName));
      this.TableData = data || [];

      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);

        this.TableData = this.TableData.filter(t => {
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
