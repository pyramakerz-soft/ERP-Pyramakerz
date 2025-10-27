import { ChangeDetectorRef, Component } from '@angular/core';
import { RemedialClassroomService } from '../../../../Services/Employee/LMS/remedial-classroom.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Employee } from '../../../../Models/Employee/employee';
import { Classroom } from '../../../../Models/LMS/classroom';
import { RemedialClassroom } from '../../../../Models/LMS/remedial-classroom';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Grade } from '../../../../Models/LMS/grade';
import { Subject } from '../../../../Models/LMS/subject';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { ClassroomSubjectService } from '../../../../Services/Employee/LMS/classroom-subject.service';
import { SearchStudentComponent } from '../../../../Component/Employee/search-student/search-student.component';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-remedial-classroom',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './remedial-classroom.component.html',
  styleUrl: './remedial-classroom.component.css'
})
export class RemedialClassroomComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  DomainName: string = '';
  UserID: number = 0;
  mode: string = 'Create';
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name', 'numberOfSession', 'schoolName', 'gradeName', "subjectEnglishName", 'teacherEnName'];

  TableData: RemedialClassroom[] = [];
  schools: School[] = [];
  SchoolsForCreate: School[] = [];
  academicYears: AcademicYear[] = [];
  grades: Grade[] = [];
  subjects: Subject[] = [];
  Teachers: Employee[] = [];
  students: Employee[] = [];
  SelectedSchoolId: number = 0;
  SelectedSchoolIdForFilter: number = 0;
  SelectedTimeTableId: number = 0;
  preSelectedClassroom: number | null = null;
  remedialClassroom: RemedialClassroom = new RemedialClassroom();
  validationErrors: { [key in keyof RemedialClassroom]?: string } = {};
  isLoading = false;
  isModalOpen: boolean = false;
  hiddenInputs: string[] = [];
  hiddenColumns: string[] = ['Actions'];
  isRtl: boolean = false;
  subscription!: Subscription;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SchoolServ: SchoolService,
    public remedialClassroomServ: RemedialClassroomService,
    public AcademicYearServ: AcadimicYearService,
    public GradeServ: GradeService,
    public SubjectServ: SubjectService,
    public EmployeeServ: EmployeeService,
    public ClassroomSubjectServ: ClassroomSubjectService,
    private cdRef: ChangeDetectorRef,
    private realTimeService: RealTimeNotificationServiceService,
    private languageService: LanguageService,
    private translate: TranslateService,
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
    this.GetAllSchools();
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



  GetAllSchools() {
    this.schools = [];
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d;
      this.SchoolsForCreate = d;
    });
  }

  GetAllData() {
    this.TableData = [];
    if(this.SelectedSchoolIdForFilter != 0){
      this.remedialClassroomServ.GetBySchoolId(this.SelectedSchoolIdForFilter, this.DomainName).subscribe((d) => {
        this.TableData = d;
      });
    }
  }

  GetAllAcademicYearBySchool() {
    this.academicYears = [];
    this.remedialClassroom.academicYearID = 0;
    this.AcademicYearServ.GetBySchoolId(this.remedialClassroom.schoolID, this.DomainName).subscribe((d) => {
      this.academicYears = d;
    });
  }

  GetAllGrades() {
    this.remedialClassroom.subjectID = 0
    this.remedialClassroom.gradeID = 0
    this.grades = [];
    this.subjects = [];
    this.GradeServ.GetBySchoolId(this.remedialClassroom.schoolID, this.DomainName).subscribe((d) => {
      this.grades = d;
    });
  }

  GetAllSubjectGradeId() {
    this.subjects = [];
    this.remedialClassroom.subjectID = 0
    this.SubjectServ.GetByGradeId(this.remedialClassroom.gradeID, this.DomainName).subscribe((d) => {
      this.subjects = d;
    });
  }

  GetAllTeachers() {
    this.Teachers = [];
    this.EmployeeServ.GetWithTypeId(4, this.DomainName).subscribe((d) => {
      this.Teachers = d;
    });
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true
      if (this.mode == 'Create') {
        this.remedialClassroomServ.Add(this.remedialClassroom, this.DomainName).subscribe((d) => {
          this.GetAllData()
          this.closeModal()
          this.isLoading = false
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Created Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          this.isLoading = false
          if (error.error?.toLowerCase().includes('name') && error.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'This Name Already Exists',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }

        })
      }
      else if (this.mode == 'Edit') {
        console.log(this.remedialClassroom)
        this.remedialClassroomServ.Edit(this.remedialClassroom, this.DomainName).subscribe((d) => {
          this.GetAllData()
          this.closeModal()
          this.isLoading = false
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Updated Successfully',
            confirmButtonColor: '#089B41',
          });
        }, error => {
          console.log(error)
          this.isLoading = false
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' }
          });
        })
      }
    }
  }

  handleStudentSelected(students: number[]) {
    if (!Array.isArray(this.remedialClassroom.studentIds)) {
      this.remedialClassroom.studentIds = [];
    }
    const existingIds = new Set(this.remedialClassroom.studentIds);
    for (const id of students) {
      existingIds.add(id);
    }
    this.remedialClassroom.studentIds = Array.from(existingIds);
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: RemedialClassroom[] = await firstValueFrom(
        this.remedialClassroomServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName)
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
            return fieldValue.toString().includes(numericValue.toString());
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }

  delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('the') + this.translate.instant('Remedial Classroom') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.remedialClassroomServ.Delete(id, this.DomainName).subscribe({
          next: (data) => {
            this.GetAllData();
          },
          error: (error) => {
            console.error('Error while deleting the Violation:', error);
            Swal.fire({
              title: 'Error',
              text: 'An error occurred while deleting the Remedial Classroom. Please try again later.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }

  View(id: number) {
    this.router.navigateByUrl('Employee/Remedial Classes/' + id);
  }

  openModal() {
    this.remedialClassroom = new RemedialClassroom();
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    this.remedialClassroom = new RemedialClassroom();
    this.validationErrors = {}
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.isModalOpen = false;
  }

  onInputValueChange(event: { field: keyof RemedialClassroom; value: any }) {
    const { field, value } = event;
    if (field == 'name' || field == 'schoolID' || field == 'numberOfSession' || field == 'academicYearID' || field == 'gradeID' || field == 'subjectID' || field == 'teacherID') {
      (this.remedialClassroom as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

  SerachOnStudents() {
    this.isModalOpen = true;
  }

  closeModalStudent() {
    this.isModalOpen = false;
  }

  capitalizeField(field: keyof RemedialClassroom): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  // validateNumber(event: any, field: keyof RemedialClassroom): void {
  //   const value = event.target.value;
  //   if (isNaN(value) || value === '') {
  //     event.target.value = '';
  //     if (typeof this.remedialClassroom[field] === 'string') {
  //       this.remedialClassroom[field] = '' as never;
  //     }
  //   }
  // }

  validateNumber(event: any, field: keyof RemedialClassroom): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value;
    if (isNaN(value) || value === '') {
      event.target.value = ''; 
      if (typeof this.remedialClassroom[field] === 'string') {
        this.remedialClassroom[field] = '' as never;  
      }
    }
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

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.remedialClassroom) {
      if (this.remedialClassroom.hasOwnProperty(key)) {
        const field = key as keyof RemedialClassroom;
        if (!this.remedialClassroom[field]) {
          if (
            field == 'name' ||
            field == 'numberOfSession' ||
            field == 'gradeID' ||
            field == 'subjectID' ||
            field == 'teacherID' ||
            field == 'academicYearID' ||
            field == 'schoolID'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  Edit(id: number) {
    this.mode = "Edit"
    if (this.mode == 'Edit') {
      this.remedialClassroomServ.GetById(id, this.DomainName).subscribe((d) => {
        this.remedialClassroom = d
        this.Teachers = [];
        this.EmployeeServ.GetWithTypeId(4, this.DomainName).subscribe((d) => {
          this.Teachers = d;
        });
        this.SchoolsForCreate = [];
        this.SchoolServ.Get(this.DomainName).subscribe((d) => {
          this.SchoolsForCreate = d;
          this.academicYears = [];
          this.AcademicYearServ.GetBySchoolId(this.remedialClassroom.schoolID, this.DomainName).subscribe((d) => {
            this.academicYears = d;
          });
          this.grades = [];
          this.GradeServ.GetBySchoolId(this.remedialClassroom.schoolID, this.DomainName).subscribe((d) => {
            this.grades = d;
            this.subjects = [];
            this.SubjectServ.GetByGradeId(this.remedialClassroom.gradeID, this.DomainName).subscribe((d) => {
              this.subjects = d;
            });
          });
        });
      })

    }
    this.openModal()
  }

  Create() {
    this.mode = "Create"
    this.GetAllTeachers()
    this.openModal()
  }
}
