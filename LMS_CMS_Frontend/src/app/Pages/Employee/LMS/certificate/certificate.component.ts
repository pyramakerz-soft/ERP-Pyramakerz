import { Component } from '@angular/core';
import { Student } from '../../../../Models/student';
import { Classroom } from '../../../../Models/LMS/classroom';
import { StudentService } from '../../../../Services/student.service';
import { CertificateService } from '../../../../Services/Employee/LMS/certificate.service';
import { WeightType } from '../../../../Models/LMS/weight-type';
import { Subject } from '../../../../Models/LMS/subject';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Grade } from '../../../../Models/LMS/grade';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Certificate } from '../../../../Models/LMS/certificate';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { SemesterComponent } from '../semester/semester.component';
import { SemesterService } from '../../../../Services/Employee/LMS/semester.service';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { Semester } from '../../../../Models/LMS/semester';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.css'
})
export class CertificateComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';

  TableData: Certificate[] = [];
  subjects: Subject[] = [];
  weightTypes: WeightType[] = [];
  schools: School[] = []
  Grades: Grade[] = []
  Classes: Classroom[] = []
  Students: Student[] = []
  academicYears: AcademicYear[] = []
  semester: Semester[] = []

  SelectedSchoolId: number = 0;
  SelectedGradeId: number = 0;
  SelectedClassId: number = 0;
  SelectedStudentId: number = 0;
  SelectedAcademicYearId: number = 0;
  SelectedSemesterId: number = 0;
  DateFrom: string = '';
  DateTo: string = '';
  IsShowTabls: boolean = false

  SearchType: string[] = ['Academic Year', 'Month', 'Semester'];
  SelectedSearchType: string = '';

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    private SchoolServ: SchoolService,
    private GradeServ: GradeService,
    public classServ: ClassroomService,
    public StudentServ: StudentService,
    public AcadimicYearServ: AcadimicYearService,
    public SemesterServ: SemesterService,
    public CertificateServ: CertificateService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.getAllSchools()

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
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

  getAcadimicYearsBySchool() {
    this.academicYears = []
    this.AcadimicYearServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.academicYears = d
    })
  }

  getSemestersBySchool() {
    this.semester = []
    this.SemesterServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.semester = d
    })
  }

  OnStudentChange() {
    this.IsShowTabls = false
    this.TableData = []
  }

  OnSearchTypeChange() {
    this.IsShowTabls = false
    this.TableData = []
    this.SelectedAcademicYearId = 0
    this.SelectedSemesterId = 0
    this.DateFrom = ''
    this.DateTo = ''
    if (this.SelectedSearchType == 'Academic Year') {
      this.getAcadimicYearsBySchool();
    }
    else if (this.SelectedSearchType == 'Semester') {
      this.getSemestersBySchool();
    }
  }

  SelectAcadimicYear() {
    this.IsShowTabls = false
    this.TableData = []
    this.DateFrom = ''
    this.DateTo = ''
    const year = this.academicYears.find(y => y.id == this.SelectedAcademicYearId);
    if (year) {
      this.DateFrom = year.dateFrom;
      this.DateTo = year.dateTo;
    }
  }

  SelectSemester() {
    this.IsShowTabls = false
    this.TableData = []
    this.DateFrom = ''
    this.DateTo = ''
    const sem = this.semester.find(s => s.id == this.SelectedSemesterId);
    if (sem) {
      this.DateFrom = sem.dateFrom;
      this.DateTo = sem.dateTo;
    }
  }

  onMonthChange(event: any): void {
    this.IsShowTabls = false
    this.TableData = []
    this.DateFrom = ''
    this.DateTo = ''
    const monthValue = event.target.value; // Format: "YYYY-MM"
    if (monthValue) {
      const [year, month] = monthValue.split('-').map(Number);

      // Create start and end of month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // last day of month

      // Format to yyyy-MM-dd
      const formatDate = (date: Date) =>
        date.toISOString().split('T')[0];

      this.DateFrom = formatDate(startDate);
      this.DateTo = formatDate(endDate);

      console.log('DateFrom:', this.DateFrom);
      console.log('DateTo:', this.DateTo);
    }
  }

  getAllGradesBySchoolId() {
    this.IsShowTabls = false
    this.Grades = []
    this.Classes = []
    this.Students = []
    this.SelectedGradeId = 0
    this.SelectedClassId = 0
    this.SelectedStudentId = 0
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  getAllClassByGradeId() {
    this.IsShowTabls = false
    this.Classes = []
    this.Students = []
    this.SelectedClassId = 0
    this.SelectedStudentId = 0
    this.classServ.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.Classes = d
    })
  }

  getAllStudentByClass() {
    this.Students = []
    this.SelectedStudentId = 0
    this.StudentServ.GetByClassID(this.SelectedClassId, this.DomainName).subscribe((d) => {
      this.Students = d
    })
  }

  GetAllData() {
    this.TableData = []
    this.CertificateServ.Get(this.SelectedSchoolId, this.SelectedStudentId, this.DateFrom, this.DateTo, this.DomainName).subscribe((d) => {
      console.log(d)
      this.subjects = d.subjectDTO
      this.TableData = d.cells
      this.weightTypes = d.header
    },error=>{
      console.log(error)
    })
  }

  Apply() {
    this.IsShowTabls = true
    this.GetAllData()
  }

  getDegree(subjectId: number, weightTypeId: number): string {
    const cell = this.TableData.find(
      (c: Certificate) => c.subjectID === subjectId && c.weightTypeId === weightTypeId
    );
    return cell ? `${cell.degree} /${cell.mark} `  : '-';
  }

}
