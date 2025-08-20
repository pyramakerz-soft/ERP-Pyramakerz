import { Component } from '@angular/core';
import { StudentIssue } from '../../../../Models/SocialWorker/student-issue';
import { Grade } from '../../../../Models/LMS/grade';
import { Classroom } from '../../../../Models/LMS/classroom';
import { Student } from '../../../../Models/student';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../../Services/student.service';
import { IssueType } from '../../../../Models/SocialWorker/issue-type';
import { IssueTypeService } from '../../../../Services/Employee/SocialWorker/issue-type.service';
import { StudentIssueService } from '../../../../Services/Employee/SocialWorker/student-issue.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-student-issues',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent , TranslateModule],
  templateUrl: './student-issues.component.html',
  styleUrl: './student-issues.component.css'
})
export class StudentIssuesComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: StudentIssue[] = [];
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name'];

  studentIssue: StudentIssue = new StudentIssue();
  isRtl: boolean = false;
  subscription!: Subscription;
  validationErrors: { [key in keyof StudentIssue]?: string } = {};
  isLoading = false;

  schools: School[] = [];
  grades: Grade[] = [];
  classrooms: Classroom[] = [];
  students: Student[] = [];
  issueTypes: IssueType[] = [];

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private languageService: LanguageService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SchoolServ: SchoolService,
    public GradeServ: GradeService,
    public ClassroomServ: ClassroomService,
    public StudentServ: StudentService,
    public IssueTypeServ: IssueTypeService,
    public StudentIssueServ: StudentIssueService,
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

    this.GetAllData();
        this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  GetAllData() {
    this.TableData = [];
    this.StudentIssueServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  }

  GetSchools() {
    this.schools = []
    this.grades = []
    this.classrooms = []
    this.students = []
    this.studentIssue.schoolID = 0
    this.studentIssue.gradeID = 0
    this.studentIssue.classroomID = 0
    this.studentIssue.studentID = 0
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  GetAllGradesBySchool() {
    this.grades = []
    this.classrooms = []
    this.students = []
    this.studentIssue.gradeID = 0
    this.studentIssue.classroomID = 0
    this.studentIssue.studentID = 0
    this.GradeServ.GetBySchoolId(this.studentIssue.schoolID, this.DomainName).subscribe((d) => {
      this.grades = d
    })
  }

  GetAllClassesByGrade() {
    this.classrooms = []
    this.students = []
    this.studentIssue.classroomID = 0
    this.studentIssue.studentID = 0
    this.ClassroomServ.GetByGradeId(this.studentIssue.gradeID, this.DomainName).subscribe((d) => {
      this.classrooms = d
    })
  }

  GetAllStudentsByClass() {
    this.students = []
    this.studentIssue.studentID = 0
    this.StudentServ.GetByClassID(this.studentIssue.classroomID, this.DomainName).subscribe((d) => {
      this.students = d
    })
  }

  GetAllIssueTypes() {
    this.issueTypes = []
    this.IssueTypeServ.Get(this.DomainName).subscribe((d) => {
      this.issueTypes = d
    })
  }

  Create() {
    this.mode = 'Create';
    this.studentIssue = new StudentIssue();
    this.validationErrors = {};
    this.GetAllIssueTypes()
    this.GetSchools();
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Student Issue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.StudentIssueServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
        });
      }
    });
  }

  Edit(id: number) {
    this.mode = 'Edit';
    this.StudentIssueServ.GetByID(id, this.DomainName).subscribe((d) => {
      this.studentIssue = d
      this.SchoolServ.Get(this.DomainName).subscribe((d) => {
        this.schools = d
        this.GradeServ.GetBySchoolId(this.studentIssue.schoolID, this.DomainName).subscribe((d) => {
          this.grades = d
          this.ClassroomServ.GetByGradeId(this.studentIssue.gradeID, this.DomainName).subscribe((d) => {
            this.classrooms = d
            this.StudentServ.GetByClassID(this.studentIssue.classroomID, this.DomainName).subscribe((d) => {
              this.students = d
            })
          })
        })
      })
    });
    this.openModal();
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

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.StudentIssueServ.Add(this.studentIssue, this.DomainName).subscribe(
          (d) => {
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Created Successfully',
              confirmButtonColor: '#089B41',
            });
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
      }
      if (this.mode == 'Edit') {
        this.StudentIssueServ.Edit(this.studentIssue, this.DomainName).subscribe(
          (d) => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updatedd Successfully',
              confirmButtonColor: '#089B41',
            });
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            console.log(error)
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
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.studentIssue = new StudentIssue()
    this.schools = []
    this.grades = []
    this.classrooms = []
    this.students = []
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.studentIssue) {
      if (this.studentIssue.hasOwnProperty(key)) {
        const field = key as keyof StudentIssue;
        if (!this.studentIssue[field]) {
          if (
            field == 'date' ||
            field == 'studentID' ||
            field == 'classroomID' ||
            field == 'gradeID' ||
            field == 'schoolID' ||
            field == 'issuesTypeID'
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

  capitalizeField(field: keyof StudentIssue): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof StudentIssue; value: any }) {
    const { field, value } = event;
    (this.studentIssue as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: StudentIssue[] = await firstValueFrom(
        this.StudentIssueServ.Get(this.DomainName)
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
