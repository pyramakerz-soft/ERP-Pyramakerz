import { Component, ViewChild } from '@angular/core';
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
import { CertificateSubjectTotalMark } from '../../../../Models/LMS/certificate-subject-total-mark';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
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
  LastColumn: CertificateSubjectTotalMark[] = []

  SelectedSchoolId: number = 0;
  SelectedGradeId: number = 0;
  SelectedClassId: number = 0;
  SelectedStudentId: number = 0;
  SelectedAcademicYearId: number = 0;
  SelectedSemesterId: number = 0;
  SelectedSchoolName: string = '';
  SelectedGradeName: string = '';
  SelectedClassName: string = '';
  SelectedStudentName: string = '';
  SelectedAcademicYearName: string = '';
  SelectedSemesterName: string = '';
  DateFrom: string = '';
  DateTo: string = '';
  IsShowTabls: boolean = false
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  tableHeadersForPDF: any[] = [];
  tableDataForPDF: any[] = [];
  infoRows: any[] = [];
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
    public reportsService: ReportsService,
    private cdr: ChangeDetectorRef,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
      console.log("path", this.path)
      if (this.path == 'Student Certificate') {
        this.mode = 'student'
        this.SelectedStudentId = this.UserID
      } else if (this.path == 'Parent Certificate') {
        this.mode = 'parent'
      } else {
        this.mode = 'employee'
      }
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
    this.IsShowTabls = false
    this.TableData = []
    this.semester = []
    this.SelectedSemesterId = 0
    this.DateFrom = ''
    this.DateTo = ''
    this.SemesterServ.GetByAcademicYearId(this.SelectedAcademicYearId, this.DomainName).subscribe((d) => {
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
      this.getAcadimicYearsBySchool();
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
    this.DateFrom = ''
    this.DateTo = ''
    this.IsShowTabls = false
    this.Grades = []
    this.Classes = []
    this.SelectedGradeId = 0
    this.SelectedClassId = 0
    if (this.mode == 'employee') {
      this.Students = []
      this.SelectedStudentId = 0
    }
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
      this.LastColumn = d.lastColumn
    }, error => {
      console.log(error)
    })
  }

  Apply() {
    this.IsShowTabls = true
    this.GetAllData()
  }

  ValidateViewOr() {
    if (this.mode === 'employee') {
      return !this.SelectedSchoolId || !this.SelectedGradeId || !this.SelectedClassId ||
        !this.SelectedStudentId || !this.DateFrom || !this.DateTo;
    }
    else if (this.mode === 'student') {
      return !this.SelectedSchoolId || !this.DateFrom || !this.DateTo;
    }
    else if (this.mode === 'parent') {
      return !this.SelectedSchoolId || !this.SelectedStudentId || !this.DateFrom || !this.DateTo;
    }
    return true;
  }

  ValidateViewAnd() {
    if (this.mode === 'employee') {
      return this.SelectedSchoolId && this.SelectedGradeId && this.SelectedClassId && this.SelectedStudentId && this.DateFrom && this.DateTo;
    }
    else if (this.mode === 'student') {
      return this.SelectedSchoolId && this.DateFrom && this.DateTo;
    }
    else if (this.mode === 'parent') {
      return this.SelectedSchoolId && this.SelectedStudentId && this.DateFrom && this.DateTo;
    }
    return true;
  }

  getDegree(subjectId: number, weightTypeId: number): string {
    const cell = this.TableData.find(
      (c: Certificate) => c.subjectID === subjectId && c.weightTypeId === weightTypeId
    );
    return cell ? `${cell.degree} /${cell.mark} ` : '-';
  }

  getTotal(subjectId: number): string {

    const cell = this.LastColumn.find((c: CertificateSubjectTotalMark) => c.subjectID === subjectId);
    return cell ? `${cell.degree} /${cell.mark} ` : '-';
  }

  async getPDFData() {
    // Build headers dynamically
    this.tableHeadersForPDF = [
      'Subjects',
      ...this.weightTypes.map(wt => wt.englishName),
      'Total'
    ];

    this.tableDataForPDF = this.subjects.map(subject => {
      const row: Record<string, string> = {};
      row['Subjects'] = subject.en_name;
      this.weightTypes.forEach(wt => {
        row[wt.englishName] = this.getDegree(subject.id, wt.id);
      });
      row['Total'] = this.getTotal(subject.id);
      return row;
    });
    console.log('Prepared data:', this.tableDataForPDF);
  }


  async Print() {
    await this.getInfoData()
    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('Data')?.innerHTML;
      if (!printContents) {
        console.error('Element not found!');
        return;
      }

      // Create a print-specific stylesheet
      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { 
            margin: 0; 
          }

          @media print {
            body > *:not(#print-container) {
              display: none !important;
            }
            #print-container {
              display: block !important;
              position: static !important;
              top: auto !important;
              left: auto !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          }
        </style>
      `;

      // Create a container for printing
      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = printStyle + printContents;

      // Add to body and print
      document.body.appendChild(printContainer);
      window.print();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(printContainer);
        this.showPDF = false;
      }, 100);
    }, 500);
  }

  async DownloadAsPDF() {
    await this.getPDFData();
    await this.getInfoData()
    this.showPDF = true;
    // this.cdr.detectChanges();
    setTimeout(() => {
      if (this.pdfComponentRef) {
        console.log('PDF Component is ready');
        this.pdfComponentRef.downloadPDF();
        setTimeout(() => (this.showPDF = false), 2000);
      } else {
        console.error('PDF Component not found at the time of generation');
      }
    }, 800); // Slight delay to ensure render is complete
  }

  async DownloadAsExcel() {
    await this.getInfoData()
    const headerKeyMap = [
      { key: 'subject', header: 'Subjects' },
      ...this.weightTypes.map(wt => ({ key: wt.id.toString(), header: wt.englishName })),
      { key: 'total', header: 'Total' }
    ];

    const dataMatrix = this.subjects.map(subject => {
      const row: any[] = [];
      row.push(subject.en_name);
      this.weightTypes.forEach(wt => {
        row.push(this.getDegree(subject.id, wt.id) || '-');
      });
      row.push(this.getTotal(subject.id));
      return row;
    });

    const infoRows = [
      { key: 'School Name', value: this.SelectedSchoolName },
      { key: 'Grade Name', value: this.SelectedGradeName },
      { key: 'Class Name', value: this.SelectedClassName },
      { key: 'Student Name', value: this.SelectedStudentName },
      { key: 'Created At', value: new Date().toLocaleString() }
    ];

    if (this.SelectedSearchType === 'Academic Year') {
      infoRows.push({ key: 'Academic Year', value: this.SelectedAcademicYearName });
    }
    if (this.SelectedSearchType === 'Semester') {
      infoRows.push({ key: 'Academic Year', value: this.SelectedAcademicYearName });
      infoRows.push({ key: 'Semester', value: this.SelectedSemesterName });
    }
    if (this.SelectedSearchType === 'Month') {
      infoRows.push({ key: 'DateFrom', value: this.DateFrom });
      infoRows.push({ key: 'DateTo', value: this.DateTo });
    }

    await this.reportsService.generateExcelReport({
      infoRows: infoRows,
      filename: 'Certificate.xlsx',
      tables: [
        {
          title: '',
          headers: headerKeyMap.map(h => h.header),
          data: dataMatrix
        }
      ]
    });
  }

  getInfoData() {
    this.SelectedSchoolName = this.schools.find(s => s.id == this.SelectedSchoolId)!.name || '';
    this.SelectedGradeName = this.Grades.find(s => s.id == this.SelectedGradeId)!.name || ''
    this.SelectedClassName = this.Classes.find(s => s.id == this.SelectedClassId)!.name || ''
    this.SelectedStudentName = this.Students.find(s => s.id == this.SelectedStudentId)!.en_name || ''

    this.infoRows = [
      { keyEn: 'School Name : ' + this.SelectedSchoolName },
      { keyEn: 'Grade Name : ' + this.SelectedGradeName },
      { keyEn: 'Class Name : ' + this.SelectedClassName },
      { keyEn: 'Student Name : ' + this.SelectedStudentName },
    ];

    if (this.SelectedSearchType === 'Academic Year') {
      this.SelectedAcademicYearName = this.academicYears.find(s => s.id == this.SelectedSchoolId)!.name || ''
      this.infoRows.push({ keyEn: 'Academic Year : ' + this.SelectedAcademicYearName });
    }
    if (this.SelectedSearchType === 'Semester') {
      this.SelectedAcademicYearName = this.academicYears.find(s => s.id == this.SelectedAcademicYearId)!.name || ''
      this.SelectedSemesterName = this.semester.find(s => s.id == this.SelectedSemesterId)!.name || ''
      this.infoRows.push({ keyEn: 'Academic Year : ' + this.SelectedAcademicYearName });
      this.infoRows.push({ keyEn: 'Semester : ' + this.SelectedSemesterName });
    }
    if (this.SelectedSearchType === 'Month') {
      this.infoRows.push({ keyEn: 'DateFrom : ' + this.DateFrom });
      this.infoRows.push({ keyEn: 'DateTo : ' + this.DateTo });
    }
    return this.infoRows
  }

}
