import { Component } from '@angular/core';
import { SocialWorkerMedalStudent } from '../../../../Models/SocialWorker/social-worker-medal-student';
import { SocialWorkerMedalStudentService } from '../../../../Services/Employee/SocialWorker/social-worker-medal-student.service';
import { SocialWorkerMedalService } from '../../../../Services/Employee/SocialWorker/social-worker-medal.service';
import { SocialWorkerMedal } from '../../../../Models/SocialWorker/social-worker-medal';
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

@Component({
  selector: 'app-social-worker-medal-student',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './social-worker-medal-student.component.html',
  styleUrl: './social-worker-medal-student.component.css'
})
export class SocialWorkerMedalStudentComponent {

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
  socialWorkerMedals: SocialWorkerMedal[] = []

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
  TableData: SocialWorkerMedalStudent[] = [];
  socialWorkerMedalStudent: SocialWorkerMedalStudent = new SocialWorkerMedalStudent()

  isModalVisible: boolean = false;
  mode: string = '';

  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'englishName', 'arabicName'];

  validationErrors: { [key in keyof SocialWorkerMedalStudent]?: string } = {};
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
    public SocialWorkerMedalStudentServ: SocialWorkerMedalStudentService,
    public SocialWorkerMedalServ: SocialWorkerMedalService,
    private languageService: LanguageService,
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
    this.socialWorkerMedalStudent.socialWorkerMedalID = id;
    this.validationErrors['socialWorkerMedalID'] = '';
  }

  GetAllMedals() {
    this.socialWorkerMedals = []
    this.SocialWorkerMedalServ.Get(this.DomainName).subscribe((d) => {
      this.socialWorkerMedals = d
    })
  }

  GetAllData() {
    this.TableData = [];
    this.SocialWorkerMedalStudentServ.GetByStudentID(this.SelectedStudentId, this.DomainName).subscribe((d) => {
      this.TableData = d;
      console.log(this.TableData)
    });
  }

  Create() {
    this.mode = 'Create';
    this.socialWorkerMedalStudent = new SocialWorkerMedalStudent();
    this.socialWorkerMedalStudent.studentID = this.SelectedStudentId
    this.GetAllMedals()
    this.validationErrors = {};
    this.openModal();
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      this.SocialWorkerMedalStudentServ.Add(
        this.socialWorkerMedalStudent,
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
            text: 'Try Again Later!',
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
    this.SocialWorkerMedalStudentServ.GetByStudentID(this.SelectedStudentId, this.DomainName).subscribe((d => {
      this.TableData = d
    }))
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.socialWorkerMedalStudent) {
      if (this.socialWorkerMedalStudent.hasOwnProperty(key)) {
        const field = key as keyof SocialWorkerMedalStudent;
        if (!this.socialWorkerMedalStudent[field]) {
          if (
            field == 'studentID' ||
            field == 'socialWorkerMedalID'
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

  capitalizeField(field: keyof SocialWorkerMedalStudent): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof SocialWorkerMedalStudent; value: any }) {
    const { field, value } = event;
    (this.socialWorkerMedalStudent as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: SocialWorkerMedalStudent[] = await firstValueFrom(
        this.SocialWorkerMedalStudentServ.GetByStudentID(this.SelectedStudentId, this.DomainName)
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
}
