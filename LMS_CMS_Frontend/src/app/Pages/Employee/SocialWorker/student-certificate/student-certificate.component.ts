import { Component } from '@angular/core';
import { CertificateStudentService } from '../../../../Services/Employee/SocialWorker/certificate-student.service';
import { CertificateTypeService } from '../../../../Services/Employee/SocialWorker/certificate-type.service';
import { CertificateStudent } from '../../../../Models/SocialWorker/certificate-student';
import { CertificateType } from '../../../../Models/SocialWorker/certificate-type';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { Classroom } from '../../../../Models/LMS/classroom';
import { Grade } from '../../../../Models/LMS/grade';
import { School } from '../../../../Models/school';
import { Student } from '../../../../Models/student';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { StudentService } from '../../../../Services/student.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-student-certificate',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './student-certificate.component.html',
  styleUrl: './student-certificate.component.css'
})
export class StudentCertificateComponent {

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
  students: Student[] = []
  Grades: Grade[] = []
  class: Classroom[] = []
  isLoading: boolean = false
  Certificates: CertificateType[] = []

  SelectedSchoolId: number = 0;
  SelectedYearId: number = 0;
  SelectedGradeId: number = 0;
  SelectedClassId: number = 0;
  SelectedStudentId: number = 0;
  SelectedStudent: Student = new Student()

  school: School = new School()
  showTable: boolean = false
  searchQuery: string = '';
  isSearching: boolean = false;
  TableData: CertificateStudent[] = [];
  certificateStudent: CertificateStudent = new CertificateStudent()

  isModalVisible: boolean = false;
  mode: string = '';

  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'englishName', 'arabicName'];

  validationErrors: { [key in keyof CertificateStudent]?: string } = {};
  SelectedMedalId: number | null = null;
  IsView: boolean = false

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
    public CertificateStudentServ: CertificateStudentService,
    public CertificateTypeServ: CertificateTypeService,
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

  getAllStudents() {
    this.IsView = false
    this.students = []
    this.SelectedStudentId = 0
    this.studentServ.GetBySchoolGradeClassID(this.SelectedSchoolId, this.SelectedGradeId, this.SelectedClassId, this.DomainName).subscribe((d: any) => {
      this.students = d.students
    })
  }

  getAllGradesBySchoolId() {
    this.Grades = []
    this.IsView = false
    this.SelectedGradeId = 0
    this.SelectedClassId = 0
    this.SelectedStudentId = 0
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  getAllClassByGradeId() {
    this.class = []
    this.SelectedClassId = 0
    this.SelectedStudentId = 0
    this.IsView = false
    this.ClassroomServ.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.class = d
    })
  }
  selectMedal(id: number) {
    this.SelectedMedalId = id;
    this.certificateStudent.certificateTypeID = id;
    this.validationErrors['certificateTypeID'] = '';
  }

  GetAllMedals() {
    this.Certificates = []
    this.CertificateTypeServ.Get(this.DomainName).subscribe((d) => {
      this.Certificates = d
    })
  }

  GetAllData() {
    this.TableData = [];
    this.CertificateStudentServ.GetByStudentID(this.SelectedStudentId, this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  }

  Create() {
    this.mode = 'Create';
    this.certificateStudent = new CertificateStudent();
    this.certificateStudent.studentID = this.SelectedStudentId
    this.GetAllMedals()
    this.validationErrors = {};
    this.openModal();
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      this.CertificateStudentServ.Add(
        this.certificateStudent,
        this.DomainName
      ).subscribe(
        (d) => {
          this.GetAllData();
          this.isLoading = false;
          this.closeModal();
        },
        (error) => {
          this.isLoading = false; // Hide spinner
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        }
      );
      this.GetAllData();
    }
  }

  closeModal() {
    this.isModalVisible = false;
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  View() {
    this.IsView = true
    this.SelectedStudent = new Student()
    this.TableData = []
    this.studentServ.GetByID(this.SelectedStudentId, this.DomainName).subscribe((d) => {
      this.SelectedStudent = d
    })
    this.CertificateStudentServ.GetByStudentID(this.SelectedStudentId, this.DomainName).subscribe((d => {
      this.TableData = d
    }))
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.certificateStudent) {
      if (this.certificateStudent.hasOwnProperty(key)) {
        const field = key as keyof CertificateStudent;
        if (!this.certificateStudent[field]) {
          if (
            field == 'studentID' ||
            field == 'certificateTypeID'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof CertificateStudent): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof CertificateStudent; value: any }) {
    const { field, value } = event;
    (this.certificateStudent as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: CertificateStudent[] = await firstValueFrom(
        this.CertificateStudentServ.GetByStudentID(this.SelectedStudentId, this.DomainName)
      );
      this.TableData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.TableData = this.TableData.filter((t) => {
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

  downloadCertificate(row: CertificateStudent) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = encodeURI(row.certificateTypeFile);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const leftPx = (row.leftSpace / 100) * img.width;
      const topPx = (row.topSpace / 100) * img.height;
      const fontSize = Math.floor(img.height * 0.05);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'top';
      ctx.fillText(row.studentEnName, leftPx, topPx);
      const link = document.createElement('a');
      link.download = `${row.studentEnName}-certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }

  ViewCertificate(row: CertificateStudent) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = encodeURI(row.certificateTypeFile);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw background
      ctx.drawImage(img, 0, 0);

      // Convert % to pixels
      const leftPx = (row.leftSpace / 100) * img.width;
      const topPx = (row.topSpace / 100) * img.height;

      // Draw student name
      ctx.font = `${Math.floor(img.height * 0.05)}px Arial`; // font size = 5% of image height
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'top';
      ctx.fillText(row.studentEnName, leftPx, topPx);

      // Get image URL
      const dataUrl = canvas.toDataURL('image/png');

      // Open centered in new tab
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
        <html>
        <head>
          <style>
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background: #f0f0f0;
            }
            img {
              max-width: 100%;
              height: auto;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}">
        </body>
        </html>
      `);
        win.document.close();
      }
    };
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
    return IsAllow;
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Certificate Type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.CertificateStudentServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
        });
      }
    });
  }
}
