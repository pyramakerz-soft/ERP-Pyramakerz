import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AcademicYear } from '../../../../../Models/LMS/academic-year';
import { School } from '../../../../../Models/school';
import { Student } from '../../../../../Models/student';
import { TokenData } from '../../../../../Models/token-data';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { AcadimicYearService } from '../../../../../Services/Employee/LMS/academic-year.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../../Services/shared/menu.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { StudentService } from '../../../../../Services/student.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-transfered-from-kindergarten-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './transfered-from-kindergarten-report.component.html',
  styleUrl: './transfered-from-kindergarten-report.component.css'
})
export class TransferedFromKindergartenReportComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  File: any;
  DomainName: string = '';
  UserID: number = 0;
  path: string = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  schools: School[] = []
  academicYears: AcademicYear[] = []
  Students: Student[] = []
  isLoading: boolean = false

  SelectedSchoolId: number = 0;
  SelectedStudentId: number = 0;
  SelectedYearId: number = 0;
  showPDF: boolean = false
  isRtl: boolean = false;
  subscription!: Subscription;
  school: School = new School()
  showTable: boolean = false
  SelectedStudent: Student = new Student()
  searchQuery: string = '';
  isSearching: boolean = false;
  filteredStudents: Student[] = [];

  DataToPrint: any = null
  CurrentDate: any = new Date()
  ArabicCurrentDate: any = new Date()
  direction: string = "";
  
  // Add this property to match student-information component
  showViewReportBtn: boolean = false;

  @ViewChild('kindergartenContainer') kindergartenContainer!: ElementRef;

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    private languageService: LanguageService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private SchoolServ: SchoolService,
    private academicYearServ: AcadimicYearService,
    private studentServ: StudentService,
    public reportsService: ReportsService, 
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
      this.showTable = false;
      this.showViewReportBtn = false;
    });
    this.direction = document.dir || 'ltr';
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
    this.getAllSchools()
    // Don't call getAllYears() here - wait for school selection
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
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  getAllYears() {
    // Clear previous academic years immediately
    this.academicYears = [];
    
    // Only call API if a school is selected
    if (this.SelectedSchoolId && this.SelectedSchoolId > 0) {
      this.academicYearServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe({
        next: (d) => {
          this.academicYears = d || [];
        },
        error: (err) => {
          console.error('Error fetching academic years:', err);
          this.academicYears = [];
        }
      });
    } else {
      this.academicYears = [];
    }
  }

  toggleSearchMode() {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.filteredStudents = this.Students;
    }
  }

  getAllStudents() {
    // Clear previous students immediately
    this.Students = [];
    this.filteredStudents = [];
    
    // Only call API if a year is selected
    if (this.SelectedYearId && this.SelectedYearId > 0) {
      this.studentServ.GetByAcademicYearID(this.SelectedYearId, this.DomainName).subscribe({
        next: (d) => {
          this.Students = d || [];
          this.filteredStudents = d || [];
        },
        error: (err) => {
          console.error('Error fetching students:', err);
          this.Students = [];
          this.filteredStudents = [];
        }
      });
    } else {
      this.Students = [];
      this.filteredStudents = [];
    }
  }

  // Updated change handlers to match student-information component
  onSchoolChange() {
    console.log('School changed to:', this.SelectedSchoolId);
    
    // Reset all dependent fields
    this.SelectedYearId = 0;
    this.SelectedStudentId = 0;
    this.Students = [];
    this.filteredStudents = [];
    this.showTable = false;
    this.showViewReportBtn = this.SelectedSchoolId !== 0;
    
    // Get academic years for the selected school
    this.getAllYears();
  }

  onYearChange() {
    console.log('Year changed to:', this.SelectedYearId);
    
    // Reset dependent fields
    this.SelectedStudentId = 0;
    this.Students = [];
    this.filteredStudents = [];
    this.showTable = false;
    this.showViewReportBtn = this.SelectedSchoolId !== 0 && this.SelectedYearId !== 0;
    
    // Get students for the selected academic year
    this.getAllStudents();
  }

  onStudentChange() {
    this.showTable = false;
    this.showViewReportBtn =
      this.SelectedSchoolId !== 0 &&
      this.SelectedYearId !== 0 &&
      this.SelectedStudentId !== 0;
  }

  searchStudents() {
    if (this.searchQuery) {
      this.filteredStudents = this.Students.filter(student =>
        student.user_Name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredStudents = this.Students;
    }
  }

  GetStudentById() {
    if (this.SelectedStudentId && this.SelectedStudentId > 0) {
      this.studentServ.GetByID(this.SelectedStudentId, this.DomainName).subscribe((d) => {
        this.SelectedStudent = d
      });
    }
  }

  async ViewReport() {
    if (this.SelectedSchoolId && this.SelectedYearId && this.SelectedStudentId) {
      await this.GetData();
      this.showTable = true;
      this.GetStudentById();
    }
  }

  DownloadAsPDF() {
    this.showPDF = true;
    setTimeout(() => {
      if (this.school?.reportImage?.startsWith('http')) {
        this.convertImgToBase64URL(this.school.reportImage).then((base64Img) => {
          this.school.reportImage = base64Img;
          setTimeout(() => this.printKindergartenPDF(), 100);
        });
      } else {
        setTimeout(() => this.printKindergartenPDF(), 100);
      }
    }, 500);
  }

  Print() {
    this.showPDF = true;
    setTimeout(() => {
      this.printKindergartenCertificate();
      setTimeout(() => this.showPDF = false, 500);
    }, 500);
  }

  // PDF Generation Methods
  convertImgToBase64URL(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (e) {
          console.error('toDataURL failed:', e);
          resolve('');
        }
      };
      img.onerror = (e) => {
        console.error('Failed to load image', e);
        resolve('');
      };
      img.src = url;
    });
  }

  printKindergartenPDF() {
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `Kindergarten-Transfer-Certificate-${this.SelectedStudent?.en_name || 'student'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, allowTaint: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait', compress: true }
    };

    const container = this.kindergartenContainer.nativeElement as HTMLElement;

    // Create a visible clone so html2canvas can render it reliably (not positioned off-screen)
    const clone = container.cloneNode(true) as HTMLElement;

    // Apply styles to clone to match print layout and ensure it's visible in DOM
    clone.style.position = 'static';
    clone.style.top = 'auto';
    clone.style.left = 'auto';
    clone.style.right = 'auto';
    clone.style.bottom = 'auto';
    clone.style.display = 'block';
    clone.style.width = '210mm';
    clone.style.maxWidth = '210mm';
    clone.style.margin = '0 auto';
    clone.style.background = 'white';
    clone.style.padding = '40px';
    clone.style.boxSizing = 'border-box';
    clone.style.color = '#000';
    clone.style.fontFamily = 'Arial, sans-serif';

    // If images are relative or base64 they will render; ensure useCORS true in options above
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.display = 'block';
    wrapper.style.background = 'white';
    wrapper.style.padding = '0';
    wrapper.className = 'pdf-clone-wrapper';
    wrapper.appendChild(clone);

    document.body.appendChild(wrapper);

    html2pdf()
      .from(clone)
      .set(opt)
      .save()
      .then(() => {
        // cleanup
        document.body.removeChild(wrapper);
        this.showPDF = false;
      })
      .catch((error: any) => {
        console.error('PDF generation failed:', error);
        document.body.removeChild(wrapper);
        this.showPDF = false;
      });
  }

  printKindergartenCertificate() {
    const printContents = this.kindergartenContainer.nativeElement.innerHTML;

    const printStyle = `
      <style>
        @page { size: auto; margin: 0mm; }
        body { 
          margin: 0; 
          font-family: Arial, sans-serif;
        }
        .print-container {
          padding: 40px;
          background: white;
          max-width: 210mm;
          margin: 0 auto;
        }
        @media print {
          body > *:not(.print-container) {
            display: none !important;
          }
          .print-container {
            display: block !important;
            position: static !important;
            top: auto !important;
            left: auto !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
          }
        }
      </style>
    `;

    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    printContainer.innerHTML = printStyle + printContents;

    document.body.appendChild(printContainer);
    window.print();

    setTimeout(() => {
      document.body.removeChild(printContainer);
      this.showPDF = false;
    }, 100);
  }

  formatDate(dateString: string, dir: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = dir === 'rtl' ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  GetData(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Validate all required fields
      if (!this.SelectedSchoolId || !this.SelectedYearId || !this.SelectedStudentId) {
        reject(new Error('School, Year, and Student must be selected'));
        return;
      }

      this.studentServ.GetStudentProofRegistration(this.SelectedYearId, this.SelectedStudentId, this.SelectedSchoolId, this.DomainName)
        .subscribe({
          next: (d) => {
            this.DataToPrint = d;
            this.school = d.school;
            this.CurrentDate = d.date;
            this.CurrentDate = this.formatDate(this.CurrentDate, this.direction);
            this.ArabicCurrentDate = new Date(d.date).toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            resolve();
          },
          error: (err) => {
            console.error('Error fetching certificate data:', err);
            reject(err);
          }
        });
    });
  }

  getSchoolNameEn(): string {
    return this.school?.name || this.school?.reportHeaderOneEn || '-';
  }

  getSchoolNameAr(): string {
    return this.school?.name || this.school?.reportHeaderOneAr || '-';
  }

  getPromotedToGrade(): string {
    return this.DataToPrint?.student?.currentGradeName || '-';
  }

  getNextAcademicYear(): string {
    return this.DataToPrint?.student?.startAcademicYearName || '-';
  }
}