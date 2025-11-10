import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../../Component/reuse-table/reuse-table.component';
import Swal from 'sweetalert2';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ApiService } from '../../../../../Services/api.service';
import { SchoolService } from '../../../../../Services/Employee/school.service';
import { GradeService } from '../../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../../Services/student.service';
import { DoctorMedicalHistory } from '../../../../../Models/Clinic/MedicalHistory';
import { SearchComponent } from '../../../../../Component/search/search.component';
import { MedicalHistoryModalComponent } from "../medical-history-modal/medical-history-modal.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { TokenData } from '../../../../../Models/token-data';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../../Services/account.service';
import { Student } from '../../../../../Models/student';
@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [FormsModule, CommonModule, TableComponent, SearchComponent, MedicalHistoryModalComponent, TranslateModule],
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css'],
})
export class MedicalHistoryComponent implements OnInit {
  headers: string[] = ['ID', 'School', 'Grade', 'Class', 'Student', 'Details', 'Permanent Drug', 'Date', 'Actions'];
  headersarabic: string[] = ['المعرف', 'المدرسة', 'الصف', 'الفصل', 'الطالب', 'التفاصيل', 'الدواء الدائم', 'التاريخ', 'الإجراءات'];

  keys: string[] = ['id', 'school', 'grade', 'classRoom', 'student', 'details', 'permanentDrug', 'insertedAt'];
  keysArray: string[] = ['id', 'school', 'grade', 'classRoom', 'student', 'details', 'permanentDrug'];
  medicalHistories: DoctorMedicalHistory[] = [];
  isModalVisible = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  searchKey: string = 'id';
  searchValue: string = '';
  students: Student[] = [];

  reportType: string = 'employee';
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  DomainName: string = '';
  UserID: number = 0;

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private apiService: ApiService, 
    private studentService: StudentService,
    private languageService: LanguageService,
    public account: AccountService,
    public ApiServ: ApiService,
    private route: ActivatedRoute,
    private translate: TranslateService

  ) { }

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.reportType = this.route.snapshot.data['reportType'] || 'employee';
    console.log(12, this.reportType)
    if (this.reportType == 'parent') {
      this.GetStudentsData()
    }

    this.loadMedicalHistories();
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

  private showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');

    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.searchKey = event.key;
    this.searchValue = event.value;
    await this.loadMedicalHistories();

    if (this.searchValue) {
      this.medicalHistories = this.medicalHistories.filter(mh => {
        const fieldValue = mh[this.searchKey as keyof typeof mh]?.toString().toLowerCase() || '';
        return fieldValue.includes(this.searchValue.toString().toLowerCase());
      });
    }
  }

  GetStudentsData() {
    this.students = []
    this.studentService.Get_By_ParentID(this.UserID, this.DomainName).subscribe((d) => {
      this.students = d
    })
  }

  async loadMedicalHistories() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.medicalHistoryService.GetByDoctor(domainName));
      this.medicalHistories = data.map(item => ({
        ...item,
        insertedAt: new Date(item.insertedAt).toLocaleDateString(),
        actions: { edit: true, delete: true },
      }));

      if (this.searchValue) {
        this.medicalHistories = this.medicalHistories.filter(mh => {
          const fieldValue = mh[this.searchKey as keyof typeof mh]?.toString().toLowerCase() || '';
          return fieldValue.includes(this.searchValue.toString().toLowerCase());
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.error,
        confirmButtonColor: '#d33',
      });
    }
  }

  onModalVisibilityChange(visible: boolean) {
    this.isModalVisible = visible;
    if (!visible) {
      this.selectedMedicalHistory = null;
    }
  }

  selectedMedicalHistory: DoctorMedicalHistory | null = null;
  @ViewChild(MedicalHistoryModalComponent) medicalHistoryModal!: MedicalHistoryModalComponent;

  openModal(row?: DoctorMedicalHistory) {
    this.isModalVisible = true;
    if (row) {
      this.selectedMedicalHistory = row;
    } else {
      this.selectedMedicalHistory = null;
    }
  }


  closeModal() {
    this.isModalVisible = false;
  }

  deleteMedicalHistory(row: any) {
    const translatedTitle = this.translate.instant('Are you sure?');
    const translatedText = this.translate.instant('You will not be able to recover this medical history!');
    const translatedConfirm = this.translate.instant('Yes, delete it!');
    const translatedCancel = this.translate.instant('No, keep it');
    const successMessage = this.translate.instant('Deleted successfully');

    Swal.fire({
      title: translatedTitle,
      text: translatedText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#2E3646',
      confirmButtonText: translatedConfirm,
      cancelButtonText: translatedCancel,
    }).then((result) => {
      if (result.isConfirmed) {
        const domainName = this.apiService.GetHeader();
        this.medicalHistoryService.Delete(row.id, domainName).subscribe({
          next: () => {
            if (this.medicalHistories.length === 1) {
              this.medicalHistories = [];
            }
            this.loadMedicalHistories();
            this.showSuccessAlert(successMessage);
          },
          error: (error) => {
            const errorMessage = error.error?.message || error.error || this.translate.instant('Failed to delete the item');
            this.showErrorAlert(errorMessage);
          },
        });
      }
    });
  }


  GetTableHeaders() {

    if (!this.isRtl) {
      return this.headers
    } else {
      return this.headersarabic
    }
  }




}
