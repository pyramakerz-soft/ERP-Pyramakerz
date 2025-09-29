import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Classroom } from '../../../../Models/LMS/classroom';
import { DailyPerformance } from '../../../../Models/LMS/daily-performance';
import { Grade } from '../../../../Models/LMS/grade';
import { School } from '../../../../Models/school';
import { Student } from '../../../../Models/student';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { DailyPerformanceService } from '../../../../Services/Employee/LMS/daily-performance.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { MedalService } from '../../../../Services/Employee/LMS/medal.service';
import { PerformanceTypeService } from '../../../../Services/Employee/LMS/performance-type.service';
import { StudentMedalService } from '../../../../Services/Employee/LMS/student-medal.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { StudentService } from '../../../../Services/student.service';
import { Subject } from '../../../../Models/LMS/subject';
import { DailyPerformanceMaster } from '../../../../Models/LMS/daily-performance-master';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-daily-performance-master',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './daily-performance-master.component.html',
  styleUrl: './daily-performance-master.component.css'
})
export class DailyPerformanceMasterComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  File: any;
  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  schools: School[] = []
  Grades: Grade[] = []
  class: Classroom[] = []
  subjects: Subject[] = []

  SelectedSchoolId: number = 0;
  SelectedYearId: number = 0;
  SelectedGradeId: number = 0;
  SelectedClassId: number = 0;
  SelectedSubjectId: number = 0;

  TableData: DailyPerformanceMaster[] = [];
  isModalVisible: boolean = false;

  IsView: boolean = false
  selectedTypeIds: number[] = []; // Array to store selected type IDs
  dropdownOpen = false;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private SchoolServ: SchoolService,
    private academicYearServ: AcadimicYearService,
    private studentServ: StudentService,
    private GradeServ: GradeService,
    private ClassroomServ: ClassroomService,
    public studentMedalServ: StudentMedalService,
    public MedalServ: MedalService,
    public subjectServ: SubjectService,
    public PerformanceTypeServ: PerformanceTypeService,
    public DailyPerformanceServ: DailyPerformanceService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

    this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
    this.getAllSchools()

  }

   ngOnDestroy(): void {
      this.realTimeService.stopConnection(); 
       if (this.subscription) {
        this.subscription.unsubscribe();
      }
  }


  getAllSchools() {
    this.schools = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  getAllSubject() {
    this.subjects = []
    this.SelectedSubjectId = 0
    this.subjectServ.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.subjects = d
    })
  }

  getAllGradesBySchoolId() {
    this.Grades = []
    this.IsView = false
    this.SelectedGradeId = 0
    this.SelectedClassId = 0
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  getAllClassByGradeId() {
    this.class = []
    this.SelectedClassId = 0
    this.IsView = false
    this.ClassroomServ.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.class = d
    })
  }

  Done() {
    this.IsView = true;
    this.DailyPerformanceServ.Get(this.SelectedClassId, this.SelectedSubjectId, this.DomainName).subscribe((d) => {
      this.TableData = d
    })
  }

  Create() {
    this.router.navigateByUrl('Employee/Daily Performance')
  }

  View(id: number) {
    this.router.navigateByUrl('Employee/Daily Performance/'+id)
  }
}
