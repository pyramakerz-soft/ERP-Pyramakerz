import { Component, ViewChild } from '@angular/core';
import { Student } from '../../../../../Models/student';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { School } from '../../../../../Models/school';
import { AcademicYear } from '../../../../../Models/LMS/academic-year';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../../Services/shared/menu.service';
import { TokenData } from '../../../../../Models/token-data';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { AcadimicYearService } from '../../../../../Services/Employee/LMS/academic-year.service';
import { StudentService } from '../../../../../Services/student.service';
import { ReportsService } from '../../../../../Services/shared/reports.service';
import { PdfPrintComponent } from '../../../../../Component/pdf-print/pdf-print.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-student-information',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './student-information.component.html',
  styleUrl: './student-information.component.css',
})
export class StudentInformationComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  showViewReportBtn = false;

  File: any;
  DomainName: string = '';
  UserID: number = 0;
  path: string = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  schools: School[] = [];
  academicYears: AcademicYear[] = [];
  Students: Student[] = [];
  isLoading: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  SelectedSchoolId: number = 0;
  SelectedStudentId: number = 0;
  SelectedYearId: number = 0;
  showPDF: boolean = false;

  school: School = new School();
  showTable: boolean = false;
  SelectedStudent: Student = new Student();
  searchQuery: string = '';
  isSearching: boolean = false; // Track search mode
  filteredStudents: Student[] = [];

  DataToPrint: any = null;
  CurrentDate: any = new Date();
  direction: string = '';

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  
  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private languageService: LanguageService,
    private SchoolServ: SchoolService,
    private academicYearServ: AcadimicYearService,
    private studentServ: StudentService,
    public reportsService: ReportsService,
    private realTimeService: RealTimeNotificationServiceService,
  ) {}

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
    this.getAllSchools();
    // Don't call getAllYears() here - wait for school selection
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
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d;
    });
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
      // Reset to the full list when exiting search mode
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
      this.filteredStudents = this.Students.filter((student) =>
        student.user_Name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredStudents = this.Students;
    }
  }

  GetStudentById() {
    if (this.SelectedStudentId && this.SelectedStudentId > 0) {
      this.studentServ.GetByID(this.SelectedStudentId, this.DomainName).subscribe((d) => {
        this.SelectedStudent = d;
      });
    }
  }

  async ViewReport() {
    if (this.SelectedSchoolId && this.SelectedYearId && this.SelectedStudentId) {
      await this.GetData();
      this.showTable = true;
      this.GetStudentById();
      this.displayDetailedData();
    }
  }

  displayDetailedData() {
    if (this.DataToPrint && this.DataToPrint.length > 0) {
      console.log('Detailed Data:', this.DataToPrint);
    }
  }

  Print() {
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

  DownloadAsPDF() {
    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  formatDate(dateString: string, dir: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = dir === 'rtl' ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  async DownloadAsExcel() {
    // Helper function to format dates for Excel
    const formatDateForExcel = (dateString: string): string => {
      if (!dateString || dateString === '-') return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US'); // Format: MM/DD/YYYY
      } catch {
        return dateString;
      }
    };

    // Transform DataToPrint into Excel tables with formatted dates
    const tables = this.DataToPrint.map(
      (section: { header: any; data: any[] }) => ({
        title: section.header,
        headers: ['Field', 'Value'],
        data: section.data.map((item: { key: any; value: any }) => [
          item.key,
          // Format date values
          (item.key.includes('Date') || item.key.includes('Expiration')) 
            ? formatDateForExcel(item.value) 
            : item.value,
        ]),
      })
    );

    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: this.school.reportHeaderOneEn,
        ar: this.school.reportHeaderOneAr,
      },
      subHeaders: [
        {
          en: this.school.reportHeaderTwoEn,
          ar: this.school.reportHeaderTwoAr,
        },
      ],
      infoRows: [
        { key: 'Date', value: this.CurrentDate },
        { key: 'Student', value: this.SelectedStudent.user_Name },
        { key: 'School', value: this.school.name },
      ],
      // reportImage: this.school.reportImage,
      filename: 'Student Information Report.xlsx',
      tables: tables,
    });
  }

  GetData(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.SelectedSchoolId || !this.SelectedYearId || !this.SelectedStudentId) {
        reject(new Error('School, Year, and Student must be selected'));
        return;
      }

      this.studentServ.GetByYear(
        this.SelectedYearId,
        this.SelectedStudentId,
        this.SelectedSchoolId,
        this.DomainName
      ).subscribe({
        next: (d) => {
          this.DataToPrint = []; // Clear existing data
          this.school = d.school;
          this.CurrentDate = d.date;
          this.CurrentDate = this.formatDate(
            this.CurrentDate,
            this.direction
          );
          
          const formatDateString = (dateString: string): string => {
            if (!dateString || dateString === '-') return '-';
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            } catch {
              return dateString;
            }
          };

          const generalInfo = {
            header: 'General Information',
            data: [
              {
                key: 'Student Full Name',
                value: d.student?.en_name || '-',
              },
              { key: 'Arabic Name', value: d.student?.ar_name || '-' },
              {
                key: 'Admission Date',
                value: formatDateString(d.student?.insertedAt) || '-',
              },
              // { key: 'Mobile', value: d.student?.mobile || '-' },
              // { key: 'Alternative Mobile', value: d.student?.phone || '-' },
              {
                key: 'Date of Birth',
                value: formatDateString(d.student?.dateOfBirth) || '-',
              },
              { key: 'Gender', value: d.student?.genderName || '-' },
              {
                key: 'Nationality',
                value: d.student?.nationalityEnName || '-',
              },
              {
                key: "Student' Passport Number",
                value: d.student?.passportNo || '-',
              },
              {
                key: "Student's Id Number",
                value: d.student?.nationalID || '-',
              },
              { key: 'Religion', value: d.student?.religion || '-' },
              // {
              //   key: 'Place To Birth',
              //   value: d.student?.placeOfBirth || '-',
              // },
              {
                key: 'Pre-School',
                value: d.student?.previousSchool || '-',
              },
            ],
          };
          this.DataToPrint.push(generalInfo);

          const classInfo = {
            header: 'Class Information',
            data: [{ key: 'Class', value: d.class?.name || '-' }],
          };
          this.DataToPrint.push(classInfo);

          const GuardianInformation = {
            header: 'Guardian Information',
            data: [
              {
                key: "Guardian's Name",
                value: d.student?.guardianName || '-',
              },
              // {
              //   key: 'Relationship',
              //   value: d.student?.guardianRelation || '-',
              // },
              {
                key: 'Passport',
                value: d.student?.guardianPassportNo || '-',
              },
              {
                key: 'Identity',
                value: d.student?.guardianNationalID || '-',
              },
              {
                key: 'Qualification',
                value: d.student?.guardianQualification || '-',
              },
              // {
              //   key: 'Profession',
              //   value: d.student?.guardianProfession || '-',
              // },
              {
                key: 'WorkPlace',
                value: d.student?.guardianWorkPlace || '-',
              },
              {
                key: 'E-mail Address',
                value: d.student?.guardianEmail || '-',
              },
              // {
              //   key: 'Identity Expiration',
              //   value: formatDateString(d.student?.guardianNationalIDExpiredDate) || '-',
              // },
              // {
              //   key: 'Passport Expiration',
              //   value: formatDateString(d.student?.guardianPassportExpireDate) || '-',
              // },
            ],
          };
          this.DataToPrint.push(GuardianInformation);

          const MotherInformation = {
            header: 'Mother Information',
            data: [
              { key: "Mother's Name", value: d.student?.motherName || '-' },
              {
                key: 'Passport',
                value: d.student?.motherPassportNo || '-',
              },
              {
                key: 'Identity',
                value: d.student?.motherNationalID || '-',
              },
              // {
              //   key: 'Passport Expiration',
              //   value: formatDateString(d.student?.motherPassportExpireDate) || '-',
              // },
              {
                key: 'Qualification',
                value: d.student?.motherQualification || '-',
              },
              // {
              //   key: 'Profession',
              //   value: d.student?.motherProfession || '-',
              // },
              {
                key: 'WorkPlace',
                value: d.student?.motherWorkPlace || '-',
              },
              {
                key: 'E-mail Address',
                value: d.student?.motherEmail || '-',
              },
              // {
              //   key: 'Experiences',
              //   value: d.student?.motherExperiences || '-',
              // },
            ],
          };
          this.DataToPrint.push(MotherInformation);

          // const EmergencyContactPerson = {
          //   header: 'Emergency Contact Person',
          //   data: [
          //     {
          //       key: 'Name',
          //       value: d.student?.emergencyContactName || '-',
          //     },
          //     {
          //       key: 'RelationShip',
          //       value: d.student?.emergencyContactRelation || '-',
          //     },
          //     {
          //       key: 'Mobile',
          //       value: d.student?.emergencyContactMobile || '-',
          //     },
          //   ],
          // };
          // this.DataToPrint.push(EmergencyContactPerson);

          // const AddressInformation = {
          //   header: 'Address Information',
          //   data: [{ key: 'Address', value: d.student?.address || '-' }],
          // };
          // this.DataToPrint.push(AddressInformation);

          // const PersonResponsibleToPickUpAndReceiveTheStudent = {
          //   header: 'Person Responsible To Pick Up And Receive The Student',
          //   data: [
          //     {
          //       key: 'Pick_name',
          //       value: d.student?.pickUpContactName || '-',
          //     },
          //     {
          //       key: 'Pick_Relation',
          //       value: d.student?.pickUpContactRelation || '-',
          //     },
          //     {
          //       key: 'Pick_mobile',
          //       value: d.student?.pickUpContactMobile || '-',
          //     },
          //   ],
          // };
          // this.DataToPrint.push(
          //   PersonResponsibleToPickUpAndReceiveTheStudent
          // );
          resolve();
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
}