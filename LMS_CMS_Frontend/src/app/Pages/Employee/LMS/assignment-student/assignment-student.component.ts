import { Component } from '@angular/core';
import { AssignmentStudent } from '../../../../Models/LMS/assignment-student';
import { Classroom } from '../../../../Models/LMS/classroom';
import { AssignmentStudentService } from '../../../../Services/Employee/LMS/assignment-student.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { AssignmentService } from '../../../../Services/Employee/LMS/assignment.service';
import { Assignment } from '../../../../Models/LMS/assignment';
import Swal from 'sweetalert2';
import { Grade } from '../../../../Models/LMS/grade';
import { School } from '../../../../Models/school';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-assignment-student',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './assignment-student.component.html',
  styleUrl: './assignment-student.component.css',
})
export class AssignmentStudentComponent {
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  classes: Classroom[] = [];
  TableData: AssignmentStudent[] = [];
  isRtl: boolean = false;
  subscription!: Subscription;
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';

  CurrentPage: number = 1;
  PageSize: number = 10;
  TotalPages: number = 1;
  TotalRecords: number = 0;
  isDeleting: boolean = false;
  AssignmentId: number = 0;
  ClassId: number = 0;
  IsShowTabls: boolean = false;
  editDegreeId: number | null = null;
  assignment: Assignment = new Assignment();

  schools: School[] = [];
  Grades: Grade[] = [];

  SelectedSchoolId: number = 0;
  SelectedGradeId: number = 0;

  DegreeError: string = '';

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public BusTypeServ: BusTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public assignmentStudentServ: AssignmentStudentService,
    private SchoolServ: SchoolService,
    private GradeServ: GradeService,
    public classServ: ClassroomService,
    public assignmentServ: AssignmentService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) {}
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.AssignmentId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.GetAssignment();
    this.GetAllData(this.CurrentPage, this.PageSize);
    this.getAllSchools();

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  GetAssignment() {
    this.assignmentServ
      .GetByID(this.AssignmentId, this.DomainName)
      .subscribe((d) => {
        this.assignment = d;
      });
  }

  getAllSchools() {
    this.schools = [];
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d;
    });
  }

  getAllGradesBySchoolId() {
    this.Grades = [];
    this.IsShowTabls = false;
    this.SelectedGradeId = 0;
    this.ClassId = 0;
    this.GradeServ.GetBySchoolId(
      this.SelectedSchoolId,
      this.DomainName
    ).subscribe((d) => {
      this.Grades = d;
    });
  }

  getAllClassByGradeId() {
    this.classes = [];
    this.ClassId = 0;
    this.IsShowTabls = false;
    this.classServ
      .GetByGradeId(this.SelectedGradeId, this.DomainName)
      .subscribe((d) => {
        this.classes = d;
      });
  }

  GetAllData(pageNumber: number, pageSize: number) {
    this.TableData = [];
    this.assignmentStudentServ
      .GetByAssignmentClass(this.AssignmentId,this.ClassId,this.DomainName,pageNumber,pageSize)
      .subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage;
          this.PageSize = data.pagination.pageSize;
          this.TotalPages = data.pagination.totalPages;
          this.TotalRecords = data.pagination.totalRecords;
          this.TableData = data.data;
        },
        (error) => {
          if (error.status == 404) {
            if (this.TotalRecords != 0) {
              let lastPage = this.TotalRecords / this.PageSize;
              if (lastPage >= 1) {
                if (this.isDeleting) {
                  this.CurrentPage = Math.floor(lastPage);
                  this.isDeleting = false;
                } else {
                  this.CurrentPage = Math.ceil(lastPage);
                }
                this.GetAllData(this.CurrentPage, this.PageSize);
              }
            }
          }
        }
      );
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage;
    this.GetAllData(this.CurrentPage, this.PageSize);
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
  }

  validateNumber(event: any): void {
    const value = event.target.value;
    this.PageSize = 0;
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  Apply() {
    this.IsShowTabls = true;
    this.GetAllData(this.CurrentPage, this.PageSize);
  }

  moveToAssignment() {
    this.router.navigateByUrl(`Employee/Assignment/${this.AssignmentId}`);
  }

  classChanged() {
    this.IsShowTabls = false;
    this.TableData = [];
  }

  moveToDetails(id: number) {
    this.router.navigateByUrl(`Employee/Assignment Student Answer/${id}`);
  }

  openFile(link: string | null) {
    if (link) {
      window.open(link, '_blank');
    } else {
      console.warn('File link is missing');
    }
  }

  saveDegree(row: AssignmentStudent): void {
    const TheSubmittedDate = new Date(row.insertedAt); // current date
    const dueDate = new Date(row.dueDate);
    TheSubmittedDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0); // ensure dueDate is a Date object
    console.log(343, TheSubmittedDate, dueDate);
    if (this.IsFormValid(row)) {
      if (TheSubmittedDate > dueDate) {
        Swal.fire({
          title: 'Apply Late Submission Penalty?',
          text: 'The student submitted after the due date. Do you want to apply the late submission penalty?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#089B41',
          cancelButtonColor: '#17253E',
          confirmButtonText: 'Apply Penalty',
          cancelButtonText: 'Forgive Delay',
        }).then((result) => {
          row.evaluationConsideringTheDelay = result.isConfirmed;
          this.assignmentStudentServ.Edit(row, this.DomainName).subscribe(
            (d) => {
              this.editDegreeId = null;
              this.GetAllData(this.CurrentPage, this.PageSize);
            },
            (error) => {
              this.editDegreeId = null;
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.error,
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
              this.GetAllData(this.CurrentPage, this.PageSize);
            }
          );
        });
      } else {
        row.evaluationConsideringTheDelay = false;
        this.assignmentStudentServ.Edit(row, this.DomainName).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updated Successfully',
              confirmButtonColor: '#089B41',
            });
            this.editDegreeId = null;
            this.GetAllData(this.CurrentPage, this.PageSize);
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Something went wrong, please try again.',
              confirmButtonColor: '#d33',
            });
            this.editDegreeId = null;
            this.GetAllData(this.CurrentPage, this.PageSize);
            console.error('Edit error:', err);
          },
        });
      }
    }
  }

  validateNumberAssignmentStudent(
    event: any,
    field: keyof AssignmentStudent,
    row: AssignmentStudent
  ): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof row[field] === 'string') {
        row[field] = '' as never;
      }
    }
  }

  IsFormValid(row: AssignmentStudent): boolean {
    let isValid = true;
    if (row.degree == null) {
      isValid = false;
      this.DegreeError = 'Degree Can not be empty';
    }
    if (row.degree != null && row.degree > row.assignmentDegree) {
      isValid = false;
      this.DegreeError = 'Degree cannot exceed ' + row.assignmentDegree;
    }
    return isValid;
  }

  onInputValueChange() {
    this.DegreeError = '';
  }
}
