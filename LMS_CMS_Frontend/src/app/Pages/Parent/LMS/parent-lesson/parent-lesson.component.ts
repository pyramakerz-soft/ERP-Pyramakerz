import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QuillModule, QuillEditorComponent } from 'ngx-quill';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { Grade } from '../../../../Models/LMS/grade';
import { Lesson } from '../../../../Models/LMS/lesson';
import { Semester } from '../../../../Models/LMS/semester';
import { SemesterWorkingWeek } from '../../../../Models/LMS/semester-working-week';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { LessonService } from '../../../../Services/Employee/LMS/lesson.service';
import { SemesterWorkingWeekService } from '../../../../Services/Employee/LMS/semester-working-week.service';
import { SemesterService } from '../../../../Services/Employee/LMS/semester.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Subject } from '../../../../Models/LMS/subject';
import { Student } from '../../../../Models/student';
import { StudentService } from '../../../../Services/student.service';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';

@Component({
  selector: 'app-parent-lesson',
  standalone: true,
  imports: [FormsModule, CommonModule, PdfPrintComponent, QuillModule, TranslateModule],
  templateUrl: './parent-lesson.component.html',
  styleUrl: './parent-lesson.component.css'
})
export class ParentLessonComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: Lesson[] = [];

  DomainName: string = '';
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'englishTitle', 'arabicTitle', 'order', 'subjectEnglishName', 'subjectArabicName'];

  lesson: Lesson = new Lesson();

  validationErrors: { [key in keyof Lesson]?: string } = {};
  isLoading = false;
  editLesson = false;
  showTable = false;

  SubjectId: number = 0
  StudentId: number = 0
  Students: Student[] = []
  Subjects: Subject[] = []
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;
  reportsForExport: any[] = [];
  reportsForPDF: any[] = [];

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private translate: TranslateService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public lessonService: LessonService,
    public SchoolServ: SchoolService,
    public StudentService: StudentService,
    public GradeServ: GradeService,
    public SubjectServ: SubjectService,
    public SemesterServ: SemesterService,
    public SemesterWorkingWeekServ: SemesterWorkingWeekService,
    public acadimicYearService: AcadimicYearService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService,  
    private reportsService: ReportsService 
    
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
    this.GetStudentsData()
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


  GetSubjectData() {
    this.Subjects = []
    this.SubjectId=0
    this.SubjectServ.GetByStudentId(this.StudentId, this.DomainName).subscribe((d) => {
      this.Subjects = d
      console.log(this.Subjects)
    },error=>{
      console.log(error)

    })
  }

  GetStudentsData() {
    this.Students = []
    this.StudentService.Get_By_ParentID(this.UserID, this.DomainName).subscribe((d) => {
      this.Students = d
    })
  }

  GetAllData() {
    this.TableData = [];
    this.lessonService.GetBySubjectIDAndStudent(this.StudentId, this.SubjectId, this.DomainName).subscribe((data) => {
      this.TableData = data;
      this.prepareExportData()
    });
  }

  Apply() {
    this.showTable = true
    this.GetAllData()
  }

  DownloadAsPDF() {
      if (this.reportsForExport.length === 0) {
        Swal.fire('Warning', 'No data to export!', 'warning');
        return;
      }
  
      this.showPDF = true;
      setTimeout(() => {
        this.pdfComponentRef.downloadPDF();
        setTimeout(() => (this.showPDF = false), 2000);
      }, 500);
    }
  
    Print() {
      if (this.reportsForExport.length === 0) {
        Swal.fire('Warning', 'No data to print!', 'warning');
        return;
      }
      
      this.showPDF = true;
      setTimeout(() => {
        const printContents = document.getElementById('Data')?.innerHTML;
        if (!printContents) {
          console.error('Element not found!');
          return;
        }
        
        const printStyle = `
          <style>
            @page { size: auto; margin: 0mm; }
            body { margin: 0; }
            @media print {
              body > *:not(#print-container) { display: none !important; }
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


  getSubjectName(): string {
    return this.Subjects.find(c => c.id == this.SubjectId)?.en_name || '';
  }

  getStudentName(): string {
    return this.Students.find(s => s.id == this.StudentId)?.en_name || '';
  }

  private prepareExportData(): void {
    // For Excel (array format)
    this.reportsForExport = this.TableData.map((report) => [
      report.englishTitle,
      report.arabicTitle,
      report.order,
      report.subjectEnglishName,
      report.subjectArabicName,
      report.semesterWorkingWeekEnglishName,
      report.semesterWorkingWeekArabicName
    ]);

    // For PDF (object format with proper keys)
    this.reportsForPDF = this.TableData.map((report) => ({
      'English Name': report.englishTitle,
      'Arabic Name': report.arabicTitle,
      'Order': report.order ,
      'Subject English Name': report.subjectEnglishName || '-',
      'Subject Arabic Name': report.subjectArabicName || '-',
      'Week English Name': report.semesterWorkingWeekEnglishName || '-',
      'Week Arabic Name': report.semesterWorkingWeekArabicName || '-'
    }));
  }

  getInfoRows(): any[] {
      return [
        { keyEn: 'Subject: ' + this.getSubjectName() },
        { keyEn: 'Student: ' + this.getStudentName() },
      ];
  }

  getInfoRowsExcel(): any[] {
      return [
        { key: 'Subject', value: this.getSubjectName() },
        { key: 'Student', value: this.getStudentName() },
      ]; 
  }
  
  async exportExcel() {
    if (this.reportsForExport.length === 0) {
      Swal.fire('Warning', 'No data to export!', 'warning');
      return;
    }
  
    try {
      await this.reportsService.generateExcelReport({
        mainHeader: {
          en: 'Lesson Report',
          ar: 'تقرير الدوس التعليمية'
        },
        infoRows: this.getInfoRowsExcel(),
        tables: [
          {
            // title: 'Conduct Report Data',
            headers: ['Date', 'Student Name', 'Conduct Type', 'Procedure Type', 'Details'],
            data: this.reportsForExport
          }
        ],
        filename: `Lesson_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Swal.fire('Error', 'Failed to export to Excel', 'error');
    }
  }
 
}
