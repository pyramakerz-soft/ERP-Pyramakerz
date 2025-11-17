import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { FollowUpService } from '../../../../Services/Employee/Clinic/follow-up.service';
import { DiagnosisService } from '../../../../Services/Employee/Clinic/diagnosis.service';
import { ApiService } from '../../../../Services/api.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { StudentService } from '../../../../Services/student.service';
import { TableComponent } from '../../../../Component/reuse-table/reuse-table.component';
import { DrugService } from '../../../../Services/Employee/Clinic/drug.service';
import { DoseService } from '../../../../Services/Employee/Clinic/dose.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { FollowUp } from '../../../../Models/Clinic/FollowUp';
import { Dose } from '../../../../Models/Clinic/dose';
import { ModalComponent } from '../../../../Component/modal/modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { DrugClass } from '../../../../Models/Clinic/drug-class';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';
@Component({
  selector: 'app-follow-up',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchComponent,
    TableComponent,
    ModalComponent,
    TranslateModule,
  ],
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.css'],
})
export class FollowUpComponent implements OnInit {
  headers: string[] = [
    'ID',
    'School',
    'Grade',
    'Class',
    'Student',
    'Complaints',
    'Diagnosis',
    'Recommendation',
    'Date',
    'Actions',
  ];
  followUps: any[] = [];
  isModalVisible = false;
  keys: string[] = [
    'id',
    'schoolName',
    'gradeName',
    'className',
    'studentName',
    'complaints',
    'diagnosisName',
    'recommendation'
  ];
  followUp: FollowUp = new FollowUp();
  schools: any[] = [];
  grades: any[] = [];
  classroom: any[] = [];
  classes: any[] = [];
  students: any[] = [];
  diagnoses: any[] = [];
  drugs: any[] = [];
  doses: any[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  selectedDrugId: number | null = null;
  selectedDoseId: number | null = null;
  drugDoseList: any[] = [];
  isAddingDrugDose: boolean = false;
  keysArray: string[] = [
    'id',
    'schoolName',
    'gradeName',
    'className',
    'studentName',
    'diagnosisName',
    'recommendation',
  ];
  searchKey: string = 'schoolName';
  searchValue: string = '';
  validationErrors: { [key: string]: string } = {};

  isDrugModalVisible: boolean = false;
  drug: DrugClass = new DrugClass(0, '', new Date().toISOString());
  editDrug: boolean = false;
  drugValidationErrors: { [key: string]: string } = {};

  isDoseModalVisible: boolean = false;
  dose: Dose = new Dose(0, '', new Date().toISOString());
  editDose: boolean = false;
  doseValidationErrors: { [key: string]: string } = {};

  isSavingDrug: boolean = false;
  isSavingDose: boolean = false;

  constructor(
    private followUpService: FollowUpService,
    private schoolService: SchoolService,
    private gradeService: GradeService,
    private classroomService: ClassroomService,
    private studentService: StudentService,
    private diagnosisService: DiagnosisService,
    private drugService: DrugService,
    private doseService: DoseService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadFollowUps();
    this.loadDropdownOptions();
    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
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

  async onSearchEvent(event: { key: string; value: any }) {
    this.searchKey = event.key;
    this.searchValue = event.value;

    await this.loadFollowUps();

    if (this.searchValue) {
      this.followUps = this.followUps.filter((f) => {
        const fieldValue =
          f[this.searchKey as keyof typeof f]?.toString() || '';

        return fieldValue
          .toLowerCase()
          .includes(this.searchValue.toString().toLowerCase());
      });
    }
  }

  onSchoolChange(event: Event) {
    const selectedSchoolId = (event.target as HTMLSelectElement).value;
    this.followUp.gradeId = 0;
    this.followUp.classroomId = 0;
    this.followUp.studentId = 0;
    this.grades = [];
    this.classes = [];
    this.students = [];

    // Clear school validation error when school changes
    delete this.validationErrors['schoolId'];

    if (selectedSchoolId) {
      this.loadGrades(Number(selectedSchoolId));
    }
  }

  onGradeChange(event: Event) {
    const selectedGradeId = (event.target as HTMLSelectElement).value;
    this.followUp.classroomId = 0;
    this.followUp.studentId = 0;
    this.classes = [];
    this.students = [];

    // Clear grade validation error when grade changes
    delete this.validationErrors['gradeId'];

    if (selectedGradeId) {
      this.loadClasses(Number(selectedGradeId));
    }
  }

  onClassChange(event: Event) {
    const selectedClassId = (event.target as HTMLSelectElement).value;
    this.followUp.studentId = 0;
    this.students = [];

    // Clear class validation error when class changes
    delete this.validationErrors['classroomId'];

    if (selectedClassId) {
      this.loadStudents(Number(selectedClassId));
    }
  }

  onStudentChange(event: Event) {
    const selectedStudentId = (event.target as HTMLSelectElement).value;
    // Clear student validation error when student changes
    delete this.validationErrors['studentId'];
  }

  onDateChange(event: Event) {
    const selectedStudentId = (event.target as HTMLSelectElement).value;
    // Clear student validation error when student changes
    delete this.validationErrors['date'];
  }

  onDiagnosisChange(event: Event) {
    const selectedDiagnosisId = (event.target as HTMLSelectElement).value;
    // Clear diagnosis validation error when diagnosis changes
    delete this.validationErrors['diagnosisId'];
  }

  async loadGrades(schoolId: number) {
    try {
      const domainName = this.apiService.GetHeader();
      this.grades = await firstValueFrom(
        this.gradeService.GetBySchoolId(schoolId, domainName)
      );
    } catch (error) {
console.log(error);
    }
  }

  async loadClasses(gradeId: number) {
    try {
      const domainName = this.apiService.GetHeader();
      this.classes = await firstValueFrom(
        this.classroomService.GetByGradeId(gradeId, domainName)
      );
    } catch (error) {
      console.log(error);
    }
  }

  async loadStudents(classId: number) {
    try {
      const domainName = this.apiService.GetHeader();
      const studentsData = await firstValueFrom(
        this.studentService.GetByClassID(classId, domainName)
      );
      this.students = studentsData.map((student) => ({
        id: student.id,
        name: student.en_name,
      }));
    } catch (error) {
console.log(error);
    }
  }

  async loadFollowUps() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(this.followUpService.Get(domainName));

      // Load diagnoses first if not already loaded
      if (this.diagnoses.length === 0) {
        this.diagnoses = await firstValueFrom(
          this.diagnosisService.Get(domainName)
        );
      }

      this.followUps = data.map((item) => {
        return {
          id: item.id,
          schoolId: item.schoolId,
          schoolName: item.school || '-',
          gradeId: item.gradeId,
          gradeName: item.grade || '-',
          classroomId: item.classroomId,
          className: item.classroom || '-',
          studentId: item.studentId,
          studentName: item.student || '-',
          complains: item.complains || 'No Complaints',
          diagnosisId: item.diagnosisId,
          date: item.date,
          diagnosisName:
            this.diagnoses.find((d) => d.id === item.diagnosisId)?.name || '-',
          recommendation: item.recommendation || '-',
          sendSMS: item.sendSMS || false,
          followUpDrugs: item.followUpDrugs || [],
          actions: { edit: true, delete: true },
        };
      });
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  }

  async loadDropdownOptions() {
    try {
      const domainName = this.apiService.GetHeader();
      this.schools = await firstValueFrom(this.schoolService.Get(domainName));
      this.grades = await firstValueFrom(this.gradeService.Get(domainName));
      this.diagnoses = await firstValueFrom(
        this.diagnosisService.Get(domainName)
      );
      this.drugs = await firstValueFrom(this.drugService.Get(domainName));
      this.doses = await firstValueFrom(this.doseService.Get(domainName));
      this.classes = await firstValueFrom(
        this.classroomService.Get(domainName)
      );
      const studentsData = await firstValueFrom(
        this.studentService.GetAll(domainName)
      );
      this.students = studentsData.map((student) => ({
        id: student.id,
        name: student.en_name,
      }));
    } catch (error) {
      console.error('Error loading dropdown options:', error);
    }
  }

  openDrugModal() {
    this.isDrugModalVisible = true;
    this.drug = new DrugClass(0, '', new Date().toISOString());
    this.editDrug = false;
    this.drugValidationErrors = {};
  }

  closeDrugModal() {
    this.isDrugModalVisible = false;
    this.drugValidationErrors = {};
    this.validationErrors = {};
    this.doseValidationErrors = {};
  }

  async saveDrug() {
    this.drugValidationErrors = {};
    if (!this.drug.name) {
      this.drugValidationErrors['name'] = `${this.translate.instant(
        'Field Is Required'
      )} ${this.translate.instant('name')}`;
      return;
    }

    if (this.isSavingDrug) return;

    this.isSavingDrug = true;

    try {
      const domainName = this.apiService.GetHeader();
      await firstValueFrom(this.drugService.Add(this.drug, domainName));
      this.loadDropdownOptions();
      this.closeDrugModal();
      this.showSuccessAlert(this.translate.instant('Saved successfully'));
    } catch (error) {
      console.error('Error saving drug:', error);
      const errorMessage = this.translate.instant('Failed to save the item');
      this.showErrorAlert(errorMessage);
    } finally {
      this.isSavingDrug = false;
    }
  }

  openDoseModal() {
    this.isDoseModalVisible = true;
    this.dose = new Dose(0, '', new Date().toISOString());
    this.editDose = false;
    this.doseValidationErrors = {};
  }

  closeDoseModal() {
    this.isDoseModalVisible = false;
    this.drugValidationErrors = {};
    this.validationErrors = {};
    this.doseValidationErrors = {};
  }

  async saveDose() {
    this.doseValidationErrors = {};
    if (!this.dose.doseTimes) {
      this.doseValidationErrors['doseTimes'] = `${this.translate.instant(
        'Field Is Required'
      )} ${this.translate.instant('dose times')}`;
      return;
    }

    if (this.isSavingDose) return;

    this.isSavingDose = true;

    try {
      const domainName = this.apiService.GetHeader();
      await firstValueFrom(this.doseService.Add(this.dose, domainName));
      this.loadDropdownOptions();
      this.closeDoseModal();
      this.showSuccessAlert(this.translate.instant('Saved successfully'));
    } catch (error) {
      console.error('Error saving dose:', error);
      const errorMessage = this.translate.instant('Failed to save the item');
      this.showErrorAlert(errorMessage);
    } finally {
      this.isSavingDose = false;
    }
  }

  openModal(id?: number) {
    this.isModalVisible = true;
    if (id) {
      const existingFollowUp = this.followUps.find((f) => f.id === id);
      if (existingFollowUp) {
        // Clone the existing follow-up to avoid reference issues
        this.followUp = JSON.parse(JSON.stringify(existingFollowUp));

        // Load the related data for the existing follow-up
        if (this.followUp.schoolId) {
          this.loadGrades(this.followUp.schoolId).then(() => {
            if (this.followUp.gradeId) {
              this.loadClasses(this.followUp.gradeId).then(() => {
                if (this.followUp.classroomId) {
                  this.loadStudents(this.followUp.classroomId);
                }
              });
            }
          });
        }

        // Load drug-dose combinations
        this.drugDoseList =
          this.followUp.followUpDrugs?.map((fd) => {
            const drug = this.drugs.find((d) => d.id === fd.drugId);
            const dose = this.doses.find((d) => d.id === fd.doseId);
            return {
              drugName: drug ? drug.name : '-',
              doseTimes: dose ? dose.doseTimes : '-',
            };
          }) || [];
      }
    } else {
      this.followUp = new FollowUp();
      this.followUp.schoolId = 0;
      this.followUp.gradeId = 0;
      this.followUp.classroomId = 0;
      this.followUp.studentId = 0;
      this.grades = [];
      this.classes = [];
      this.students = [];
      this.drugDoseList = [];
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.drugDoseList = [];
    this.followUp = new FollowUp();
    this.grades = [];
    this.classes = [];
    this.students = [];
    this.drugValidationErrors = {};
    this.validationErrors = {};
    this.doseValidationErrors = {};
  }

  isSaving: boolean = false;
  async saveFollowUp() {
    this.validationErrors = {};
    let isValid = true;

    if (!this.followUp.schoolId || this.followUp.schoolId === 0) {
      this.validationErrors['schoolId'] = this.isRtl
        ? `${this.translate.instant('Is Required')} ${this.translate.instant(
            'School'
          )}`
        : `${this.translate.instant('School')} ${this.translate.instant(
            'Is Required'
          )}`;
      isValid = false;
    }
    if (!this.followUp.gradeId || this.followUp.gradeId === 0) {
      this.validationErrors['gradeId'] = this.isRtl
        ? `${this.translate.instant('Is Required')} ${this.translate.instant(
            'Grade'
          )}`
        : `${this.translate.instant('Grade')} ${this.translate.instant(
            'Is Required'
          )}`;
      isValid = false;
    }
    if (!this.followUp.classroomId || this.followUp.classroomId === 0) {
      this.validationErrors['classroomId'] = this.isRtl
        ? `${this.translate.instant('Is Required')} ${this.translate.instant(
            'Class'
          )}`
        : `${this.translate.instant('Class')} ${this.translate.instant(
            'Is Required'
          )}`;
      isValid = false;
    }
    if (!this.followUp.studentId || this.followUp.studentId === 0) {
      this.validationErrors['studentId'] = this.isRtl
        ? `${this.translate.instant('Is Required')} ${this.translate.instant(
            'Student'
          )}`
        : `${this.translate.instant('Student')} ${this.translate.instant(
            'Is Required'
          )}`;
      isValid = false;
    }
    if (!this.followUp.diagnosisId || this.followUp.diagnosisId === 0) {
      this.validationErrors['diagnosisId'] = this.isRtl
        ? `${this.translate.instant('Is Required')} ${this.translate.instant(
            'Diagnosis'
          )}`
        : `${this.translate.instant('Diagnosis')} ${this.translate.instant(
            'Is Required'
          )}`;
      isValid = false;
    }
    if (!this.followUp.date) {
      this.validationErrors['date'] = this.isRtl
        ? `${this.translate.instant('Is Required')} ${this.translate.instant(
            'Date'
          )}`
        : `${this.translate.instant('Date')} ${this.translate.instant(
            'Is Required'
          )}`;
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      this.isSaving = true;
      const domainName = this.apiService.GetHeader();

      if (this.followUp.id) {
        await firstValueFrom(
          this.followUpService.Edit(this.followUp, domainName)
        );
        this.showSuccessAlert(this.translate.instant('Updated successfully'));
      } else {
        await firstValueFrom(
          this.followUpService.Add(this.followUp, domainName)
        );
        this.showSuccessAlert(this.translate.instant('Created successfully'));
      }

      this.loadFollowUps();
      this.closeModal();
    } catch (error) { 
      const errorMessage = this.translate.instant('Failed to save the item');
      this.showErrorAlert(errorMessage);
    } finally {
      this.isSaving = false;
    }
  }
  addDrugAndDose() {
    if (this.isAddingDrugDose) return;
    if (this.selectedDrugId && this.selectedDoseId) {
      this.isAddingDrugDose = true;
      setTimeout(() => {
        let selectedDrug = new DrugClass();
        let selectedDose = new Dose();

        this.drugs.forEach((element) => {
          if (element.id == this.selectedDrugId) {
            selectedDrug = element;
          }
        });

        this.doses.forEach((element) => {
          if (element.id == this.selectedDoseId) {
            selectedDose = element;
          }
        });

        if (selectedDrug && selectedDose) {
          this.drugDoseList.push({
            drugName: selectedDrug.name,
            doseTimes: selectedDose.doseTimes,
          });

          this.followUp.followUpDrugs.push({
            drugId: selectedDrug.id,
            doseId: selectedDose.id,
          });

          this.selectedDrugId = null;
          this.selectedDoseId = null;
        }
        this.isAddingDrugDose = false;
      }, 500); // simulate async, can be removed if not needed
    } else {
      Swal.fire('Error', 'Please select both a drug and a dose.', 'error');
    }
  }

  deleteDrugDoseRow(index: number) {
    this.drugDoseList.splice(index, 1);
    this.followUp.followUpDrugs.splice(index, 1);
  }

  deleteFollowUp(row: any) {
    const translatedTitle = this.translate.instant('Are you sure?');
    const translatedText = this.translate.instant(
      'You will not be able to recover this item!'
    );
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
        this.followUpService.Delete(row.id, domainName).subscribe({
          next: () => {
            if (this.followUps.length === 1) {
              this.followUps = [];
            }
            this.loadFollowUps();
            this.showSuccessAlert(successMessage);
          },
          error: (error) => {
            console.error('Error deleting follow-up:', error);
            const errorMessage =
              error.error?.message ||
              this.translate.instant('Failed to delete the item');
            this.showErrorAlert(errorMessage);
          },
        });
      }
    });
  }

  GetTableHeaders() {
    if (!this.isRtl) {
      return [
        'ID',
        'School',
        'Grade',
        'Class',
        'Student',
        'Diagnosis',
        'Recommendation',
        'Date',
        'Actions',
      ];
    } else {
      return [
        'المعرف',
        'المدرسة',
        'الصف',
        'الفصل',
        'الطالب',
        'التشخيص',
        'التوصية',
        'التاريخ',
        'الإجراءات',
      ];
    }
  }
}
