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
import Swal from 'sweetalert2';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule, PdfPrintComponent],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.css'
})

@InitLoader()
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
  SelectedSchool: School = new School()
  Grades: Grade[] = []
  Classes: Classroom[] = []
  Students: Student[] = []
  academicYears: AcademicYear[] = []
  semester: Semester[] = []
  LastColumn: CertificateSubjectTotalMark[] = []

  student: Student | any = new Student()
  studentOfParent: Student[] = []
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
  SearchType: string[] = ['Academic Year', 'Month', 'Semester', 'Summer Course'];
  SelectedSearchType: string = '';
  isSummerCourse: boolean = false;
  IsMonthChoosen: boolean = false;

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
    private loadingService: LoadingService 
  ) { }

isInfoRowsLoading: boolean = false;


  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path; 
      if (this.User_Data_After_Login.type == 'student') {
        this.mode = 'student'
        this.SelectedStudentId = this.UserID
        this.StudentServ.GetByID(this.SelectedStudentId, this.DomainName).subscribe((d) => {
          this.student = d
          this.SelectedSchoolId = this.student.currentSchoolId
          this.Grades=[]
          this.GradeServ.GetBySchoolAndStudent(this.SelectedSchoolId,this.SelectedStudentId,this.DomainName).subscribe((d=>{
            this.Grades=d
          }))
        })
      } else if (this.User_Data_After_Login.type == 'parent') {
        this.mode = 'parent'
        this.StudentServ.Get_By_ParentID(this.UserID, this.DomainName).subscribe((d) => {
          this.studentOfParent = d
        })
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
    if(this.User_Data_After_Login.type == 'employee'){
      this.Students = []
      this.SelectedStudentId = 0
    }
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
    if(this.User_Data_After_Login.type == 'parent'){
      this.Grades=[]
      this.student = this.studentOfParent.find(s=>s.id==this.SelectedStudentId) || null
      if(this.student){
       this.SelectedSchoolId = this.student.currentSchoolId
       this.GradeServ.GetBySchoolAndStudent(this.SelectedSchoolId,this.SelectedStudentId,this.DomainName).subscribe((d=>{
        this.Grades=d
       }))
      }
    }
  }

  loadInfoRows(): void {
    this.isInfoRowsLoading = true;
    
    // Use setTimeout to make it asynchronous and avoid blocking the UI
    setTimeout(() => {
      this.SelectedSchoolName = this.schools.find(s => s.id == this.SelectedSchoolId)?.name || '';

      this.infoRows = [
        { keyEn: 'School : ' + this.SelectedSchoolName },
      ];

      if (this.mode == 'employee') {
        this.SelectedGradeName = this.Grades.find(s => s.id == this.SelectedGradeId)?.name || '';
        this.SelectedClassName = this.Classes.find(s => s.id == this.SelectedClassId)?.name || '';
        this.SelectedStudentName = this.Students.find(s => s.id == this.SelectedStudentId)?.en_name || '';
        this.infoRows.push({ keyEn: 'Grade : ' + this.SelectedGradeName });
        this.infoRows.push({ keyEn: 'Class : ' + this.SelectedClassName });
        this.infoRows.push({ keyEn: 'Student : ' + this.SelectedStudentName });
      } else if (this.mode == 'student') {
        this.infoRows.push({ keyEn: 'Student : ' + (this.student?.en_name || '') });
      } else if (this.mode == 'parent') {
        this.SelectedStudentName = this.studentOfParent.find(s => s.id == this.SelectedStudentId)?.en_name || '';
        this.infoRows.push({ keyEn: 'Student : ' + this.SelectedStudentName });
      }

      if (this.SelectedSearchType === 'Academic Year') {
        this.SelectedAcademicYearName = this.academicYears.find(s => s.id == this.SelectedAcademicYearId)?.name || '';
        this.infoRows.push({ keyEn: 'Academic Year : ' + this.SelectedAcademicYearName });
      }

      if (this.SelectedSearchType === 'Semester') {
        this.SelectedAcademicYearName = this.academicYears.find(s => s.id == this.SelectedAcademicYearId)?.name || '';
        this.SelectedSemesterName = this.semester.find(s => s.id == this.SelectedSemesterId)?.name || '';
        this.infoRows.push({ keyEn: 'Academic Year : ' + this.SelectedAcademicYearName });
        this.infoRows.push({ keyEn: 'Semester : ' + this.SelectedSemesterName });
      }

      if (this.SelectedSearchType === 'Month') {
        this.infoRows.push({ keyEn: 'DateFrom : ' + this.DateFrom });
        this.infoRows.push({ keyEn: 'DateTo : ' + this.DateTo });
      }

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      this.infoRows.push({ keyEn: 'Printed At : ' + formattedDate });
      
      this.isInfoRowsLoading = false;
      this.cdr.detectChanges(); // Trigger change detection
    }, 0);
  }

  Apply() {
    this.IsShowTabls = true;
    this.GetAllData();
    this.loadInfoRows(); // Load info rows when view is applied
  }  

  clearAndReloadInfoRows(): void {
    this.infoRows = []; // Clear existing info rows
    this.loadInfoRows(); // Reload with new data
  }

  OnSearchTypeChange() {
    this.IsMonthChoosen = false
    if(this.User_Data_After_Login.type == 'employee'){
      this.Students = []
      this.SelectedStudentId = 0
    }
    this.academicYears = []
    this.Classes = []
    this.semester = []
    this.SelectedClassId = 0
    this.IsShowTabls = false
    this.TableData = []
    this.SelectedAcademicYearId = 0
    this.SelectedSemesterId = 0
    this.DateFrom = ''
    this.DateTo = ''
    if (this.SelectedSearchType == 'Academic Year' || this.SelectedSearchType == 'Summer Course' || this.SelectedSearchType == 'Semester') {
      this.getAcadimicYearsBySchool();
    }
    if (this.SelectedSearchType == 'Summer Course') {
      this.isSummerCourse = true
    }else{
      this.isSummerCourse = false
    }
    this.clearAndReloadInfoRows(); // Add this line
  }

  SelectAcadimicYear() {
    this.IsShowTabls = false
    this.TableData = []
    this.DateFrom = ''
    this.DateTo = ''
    const year = this.academicYears.find(y => y.id == this.SelectedAcademicYearId);
    if (year) {
      if(this.SelectedSearchType == 'Summer Course'){
        this.DateFrom = year.summerCourseDateFrom? year.summerCourseDateFrom : '';
        this.DateTo = year.summerCourseDateTo?  year.summerCourseDateTo: ''; 
      }else{
        this.DateFrom = year.dateFrom;
        this.DateTo = year.dateTo;
      }
    }

    if(this.DateFrom == null || this.DateTo == null){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "This Academic Year Doesn't have Dates For Summer Course",
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' },
      });
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
    this.IsMonthChoosen = true
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
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      this.DateFrom = formatDate(startDate);
      this.DateTo = formatDate(endDate);
 
      this.getAcademicYearByDateAndSchool()
    }
  }

  getAcademicYearByDateAndSchool() {
    if(this.User_Data_After_Login.type == 'employee'){
      this.Students = []
      this.SelectedStudentId = 0
    }
    this.academicYears = []
    this.Classes = []
    this.SelectedAcademicYearId = 0
    this.SelectedClassId = 0
    this.AcadimicYearServ.GetBySchoolIdAndDate(this.SelectedSchoolId, this.DateFrom, this.DateTo, this.DomainName).subscribe((d) => {
      this.academicYears = d
      this.getAllClassByGradeIdAndAcYearId()

    }, error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No academic year and classes in this month',
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' },
      });
    })
  }

  getAllGradesBySchoolId() {
    this.IsMonthChoosen = false
    this.isSummerCourse = false
    this.DateFrom = ''
    this.DateTo = ''
    this.IsShowTabls = false
    this.Grades = []
    this.Classes = []
    this.SelectedGradeId = 0
    this.SelectedClassId = 0
    var sc = this.schools.find(s => s.id == this.SelectedSchoolId);
    if (sc) {
      this.SelectedSchool = sc
    }
    if (this.mode == 'employee') {
      this.Students = []
      this.SelectedStudentId = 0
    }
    else if (this.mode == 'parent') {
      this.Students = []
      this.SelectedStudentId = 0
    }
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
      this.clearAndReloadInfoRows(); // Add this line after data is loaded
    })
  }

  getAllClassByGradeIdAndAcYearId() {
    if(this.User_Data_After_Login.type == 'employee'){
      this.Students = []
      this.SelectedStudentId = 0
    }
    this.IsShowTabls = false
    this.Classes = []
    this.SelectedClassId = 0
    if (this.SelectedGradeId, this.SelectedAcademicYearId) {
      if(this.User_Data_After_Login.type == 'employee'){
        this.classServ.GetByGradeAndAcYearId(this.SelectedGradeId, this.SelectedAcademicYearId, this.DomainName).subscribe((d) => {
          this.Classes = d
        })
      }else{
        this.classServ.ByGradeAndAcademicYearIDAndStudent(this.SelectedGradeId, this.SelectedAcademicYearId, this.SelectedStudentId, this.DomainName).subscribe((d) => {
          this.Classes = d
        })
      }
    }
  }

  getAllStudentByClass() {
    if(this.User_Data_After_Login.type == 'employee'){
      this.Students = []
      this.SelectedStudentId = 0
      this.StudentServ.GetByClassNotInActiveYear(this.SelectedClassId, this.DomainName).subscribe((d) => {
        this.Students = d
      })
    }
  }

  GetAllData() {
    this.TableData = []
    this.LastColumn = []
    this.CertificateServ.Get(this.SelectedSchoolId, this.SelectedClassId, this.SelectedStudentId, this.SelectedAcademicYearId, this.DateFrom, this.DateTo, this.isSummerCourse, this.DomainName).subscribe((d) => {
      this.subjects = d.subjectDTO
      this.TableData = d.cells
      this.weightTypes = d.header
      this.LastColumn = d.lastColumn
    })
  }

  // Apply() {
  //   this.IsShowTabls = true
  //   this.GetAllData()
  // }

  ValidateViewOr() {
    if (this.mode === 'employee') {
      return !this.SelectedSchoolId || !this.SelectedGradeId || !this.SelectedClassId ||
        !this.SelectedStudentId || !this.DateFrom || !this.DateTo;
    }
    else if (this.mode === 'student') {
      return !this.SelectedSchoolId || !this.DateFrom || !this.DateTo || !this.SelectedClassId;
    }
    else if (this.mode === 'parent') {
      return !this.SelectedSchoolId || !this.SelectedStudentId || !this.SelectedClassId || !this.DateFrom || !this.DateTo;
    }
    return true;
  }

  ValidateViewAnd() {
    if (this.mode === 'employee') {
      return this.SelectedSchoolId && this.SelectedGradeId && this.SelectedClassId && this.SelectedStudentId && this.DateFrom && this.DateTo;
    }
    else if (this.mode === 'student') {
      return this.SelectedSchoolId && this.SelectedClassId && this.DateFrom && this.DateTo;
    }
    else if (this.mode === 'parent') {
      return this.SelectedSchoolId && this.SelectedStudentId && this.SelectedClassId && this.DateFrom && this.DateTo;
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

  getSum(): string {
    const sumMark = this.LastColumn
      .map((c: CertificateSubjectTotalMark) => c.mark)
      .reduce((acc, val) => acc + val, 0);

    const sumDegree = this.LastColumn
      .map((c: CertificateSubjectTotalMark) => c.degree)
      .reduce((acc, val) => acc + val, 0);

    return sumMark > 0 ? `${sumDegree} / ${sumMark}` : '-';
  }

  getSumPercentage() {
    const sumMark = this.LastColumn
      .map((c: CertificateSubjectTotalMark) => c.mark)
      .reduce((acc, val) => acc + val, 0);

    const sumDegree = this.LastColumn
      .map((c: CertificateSubjectTotalMark) => c.degree)
      .reduce((acc, val) => acc + val, 0);

    if (sumMark > 0) {
      const percentage = (sumDegree / sumMark) * 100;
      return `${percentage.toFixed(2)} %`; // rounded to 2 decimals
    }

    return '-';
  }

  getPercentage(subjectId: number): string {
    const cell = this.LastColumn.find((c: CertificateSubjectTotalMark) => c.subjectID === subjectId);
    return cell ? `${Number(cell.percentage).toFixed(2)} %` : '-';
  }

  async getPDFData() {
    // Build headers dynamically
    this.tableHeadersForPDF = [
      'Subjects',
      ...this.weightTypes.map(wt => wt.englishName),
      'Total',
      'Percentage'
    ];

    // Build rows for each subject
    this.tableDataForPDF = this.subjects.map(subject => {
      const row: Record<string, string> = {};
      row['Subjects'] = subject.en_name;
      this.weightTypes.forEach(wt => {
        row[wt.englishName] = this.getDegree(subject.id, wt.id) || '-';
      });
      row['Total'] = this.getTotal(subject.id);
      row['Percentage'] = this.getPercentage(subject.id);
      return row;
    });

    // Add total row
    const totalRow: Record<string, string> = {};
    totalRow['Subjects'] = 'Total';

    this.weightTypes.forEach(wt => {
      totalRow[wt.englishName] = '-';
    });

    totalRow['Total'] = this.getSum();
    totalRow['Percentage'] = this.getSumPercentage();

    this.tableDataForPDF.push(totalRow); 
  }
// Update your print/PDF methods to use the pre-loaded infoRows
async Print() {
  // If info rows aren't loaded yet, wait for them
  if (this.isInfoRowsLoading) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  await this.getPDFData();
  // Remove the getInfoData() call here - use pre-loaded this.infoRows
  this.showPDF = true;
  setTimeout(() => {
    const printContents = document.getElementById('Data')?.innerHTML;
    if (!printContents) { 
      return;
    }

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

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.innerHTML = printStyle + printContents;

    document.body.appendChild(printContainer);
    window.print();

    setTimeout(() => {
      document.body.removeChild(printContainer);
      this.showPDF = false;
    }, 100);
  }, 500);
}

async DownloadAsPDF() {
  // If info rows aren't loaded yet, wait for them
  if (this.isInfoRowsLoading) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  await this.getPDFData();
  // Remove the getInfoData() call here - use pre-loaded this.infoRows
  this.showPDF = true;
  setTimeout(() => {
    if (this.pdfComponentRef) { 
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    } else {
      console.error('PDF Component not found at the time of generation');
    }
  }, 800);
}

async DownloadAsExcel() { 
  // If info rows aren't loaded yet, wait for them
  if (this.isInfoRowsLoading) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Use pre-loaded this.infoRows instead of calling getInfoData()
  const headerKeyMap = [
    { key: 'subject', header: 'Subjects' },
    ...this.weightTypes.map(wt => ({ key: wt.id.toString(), header: wt.englishName })),
    { key: 'total', header: 'Total' },
    { key: 'percentage', header: 'Percentage' }
  ];

  const dataMatrix = this.subjects.map(subject => {
    const row: any[] = [];
    row.push(subject.en_name);
    this.weightTypes.forEach(wt => {
      row.push(this.getDegree(subject.id, wt.id) || '-');
    });
    row.push(this.getTotal(subject.id));
    row.push(this.getPercentage(subject.id));
    return row;
  });

  const totalRow: any[] = [];
  totalRow.push('Total');
  this.weightTypes.forEach(() => totalRow.push('-'));
  totalRow.push(this.getSum());
  totalRow.push(this.getSumPercentage());
  dataMatrix.push(totalRow);

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} `
    + `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  // Add printed at to info rows if not already there
  if (!this.infoRows.some(row => row.keyEn.includes('Printed At'))) {
    this.infoRows.push({ keyEn: 'Printed At : ' + formattedDate });
  }

  await this.reportsService.generateExcelReport({
    infoRows: this.infoRows, // Use pre-loaded infoRows
    filename: 'Certificate.xlsx',
    reportImage: this.SelectedSchool.reportImage,
    tables: [
      {
        headers: headerKeyMap.map(h => h.header),
        data: dataMatrix
      }
    ]
  });
}

  // getInfoData() {
  //   this.SelectedSchoolName = this.schools.find(s => s.id == this.SelectedSchoolId)?.name || '';

  //   this.infoRows = [
  //     { keyEn: 'School : ' + this.SelectedSchoolName },
  //   ];

  //   if (this.mode == 'employee') {
  //     this.SelectedGradeName = this.Grades.find(s => s.id == this.SelectedGradeId)?.name || '';
  //     this.SelectedClassName = this.Classes.find(s => s.id == this.SelectedClassId)?.name || '';
  //     this.SelectedStudentName = this.Students.find(s => s.id == this.SelectedStudentId)?.en_name || '';
  //     this.infoRows.push({ keyEn: 'Grade : ' + this.SelectedGradeName });
  //     this.infoRows.push({ keyEn: 'Class : ' + this.SelectedClassName });
  //     this.infoRows.push({ keyEn: 'Student : ' + this.SelectedStudentName });
  //   } else if (this.mode == 'student') {
  //     this.infoRows.push({ keyEn: 'Student : ' + (this.student?.en_name || '') });
  //   } else if (this.mode == 'parent') {
  //     this.SelectedStudentName = this.studentOfParent.find(s => s.id == this.SelectedStudentId)?.en_name || '';
  //     this.infoRows.push({ keyEn: 'Student : ' + this.SelectedStudentName });
  //   }

  //   if (this.SelectedSearchType === 'Academic Year') {
  //     this.SelectedAcademicYearName = this.academicYears.find(s => s.id == this.SelectedAcademicYearId)?.name || '';
  //     this.infoRows.push({ keyEn: 'Academic Year : ' + this.SelectedAcademicYearName });
  //   }

  //   if (this.SelectedSearchType === 'Semester') {
  //     this.SelectedAcademicYearName = this.academicYears.find(s => s.id == this.SelectedAcademicYearId)?.name || '';
  //     this.SelectedSemesterName = this.semester.find(s => s.id == this.SelectedSemesterId)?.name || '';
  //     this.infoRows.push({ keyEn: 'Academic Year : ' + this.SelectedAcademicYearName });
  //     this.infoRows.push({ keyEn: 'Semester : ' + this.SelectedSemesterName });
  //   }

  //   if (this.SelectedSearchType === 'Month') {
  //     this.infoRows.push({ keyEn: 'DateFrom : ' + this.DateFrom });
  //     this.infoRows.push({ keyEn: 'DateTo : ' + this.DateTo });
  //   }

  //   const now = new Date();
  //   const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
  //     .toString()
  //     .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
  //     `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes()
  //       .toString()
  //       .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  //   this.infoRows.push({ keyEn: 'Printed At : ' + formattedDate });

  //   return this.infoRows;
  // }

}
