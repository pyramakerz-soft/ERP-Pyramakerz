import { Component } from '@angular/core';
import { DirectMark } from '../../../../Models/LMS/direct-mark';
import { DirectMarkService } from '../../../../Services/Employee/LMS/direct-mark.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SearchComponent } from '../../../../Component/search/search.component';
import { School } from '../../../../Models/school';
import { ActivatedRoute, Router } from '@angular/router';
import { Assignment } from '../../../../Models/LMS/assignment';
import { Grade } from '../../../../Models/LMS/grade';
import { SubjectWeight } from '../../../../Models/LMS/subject-weight';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { AssignmentService } from '../../../../Services/Employee/LMS/assignment.service';
import { ClassroomSubjectService } from '../../../../Services/Employee/LMS/classroom-subject.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SubjectWeightService } from '../../../../Services/Employee/LMS/subject-weight.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Subject } from '../../../../Models/LMS/subject';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-direct-mark',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent , TranslateModule],
  templateUrl: './direct-mark.component.html',
  styleUrl: './direct-mark.component.css'
})
export class DirectMarkComponent {

  validationErrors: { [key in keyof Assignment]?: string } = {};
  keysArray: string[] = ['id', 'englishName', 'arabicName', 'mark', 'assignmentTypeEnglishName', 'assignmentTypeArabicName'];
  key: string = 'id';
  value: any = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  isRtl: boolean = false;
  subscription!: Subscription;
  directMark: DirectMark = new DirectMark();
  TableData: DirectMark[] = [];
  schools: School[] = [];
  Grades: Grade[] = []

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  viewClassStudents: boolean = false;
  viewStudents: boolean = false;

  SelectedSchoolId: number = 0;
  SelectedGradeId: number = 0;
  SelectedSubjectId: number = 0;
  schoolsForCreate: School[] = []
  GradesForCreate: Grade[] = []
  subjectsForCreate: Subject[] = [];
  subjectWeightsForCreate: SubjectWeight[] = [];

  IsView: boolean = false

  isLoading = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,
    public assignmentService: AssignmentService,
    public activeRoute: ActivatedRoute,
    private SchoolServ: SchoolService,
    private GradeServ: GradeService,
    private ClassroomServ: ClassroomService,
    public subjectService: SubjectService,
    public subjectWeightService: SubjectWeightService,
    public classroomSubjectService: ClassroomSubjectService,
    public DirectMarkServ: DirectMarkService,
    public router: Router,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    // this.GetAllData(this.CurrentPage, this.PageSize)
    // this.getSubjectData();

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

  getAllSubject() {
    // this.subjects = []
    this.IsView = false
    this.subjectService.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      // this.subjects = d
    })
  }

  getAllGradesBySchoolId() {
    this.IsView = false
    this.Grades = []
    this.SelectedGradeId = 0
    // this.subjects = []
    this.SelectedSchoolId = 0
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  GetAllData(pageNumber: number, pageSize: number) {
    this.TableData = []
    this.IsView = true
    this.CurrentPage = 1
    this.TotalPages = 1
    this.TotalRecords = 0
    if (this.SelectedSchoolId != 0) {
      this.DirectMarkServ.GetBySubjectID(this.SelectedSubjectId, this.DomainName, pageNumber, pageSize).subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords
          this.TableData = data.data
        },
        (error) => {
          if (error.status == 404) {
            if (this.TotalRecords != 0) {
              let lastPage = this.TotalRecords / this.PageSize
              if (lastPage >= 1) {
                if (this.isDeleting) {
                  this.CurrentPage = Math.floor(lastPage)
                  this.isDeleting = false
                } else {
                  this.CurrentPage = Math.ceil(lastPage)
                }
                this.GetAllData(this.CurrentPage, this.PageSize)
              }
            }
          }
        }
      )
    } 
  }

  changeCurrentPage(currentPage: number) {
    this.CurrentPage = currentPage
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  validatePageSize(event: any) {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
    }
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

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  View(id: number) {
    this.router.navigateByUrl(`Employee/Assignment/${id}`)
  }

  openModal(Id?: number) {
    if (Id) {
      // this.getAssignmentById(Id);
    }

    this.directMark = new DirectMark();
    // this.getSubjectData();

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};

    this.subjectWeightsForCreate = [];
    this.viewStudents = false
    this.viewClassStudents = false
  }

  viewTable() {
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  // getDirectById(Id: number) {
  //   this.assignment = new Assignment()
  //   this.assignmentService.GetByID(Id, this.DomainName).subscribe(
  //     data => {
  //       this.assignment = data
  //       this.GradeServ.GetBySchoolId(this.assignment.schoolID, this.DomainName).subscribe((d) => {
  //         this.GradesForCreate = d
  //         this.subjectsForCreate = []
  //         this.subjectService.GetByGradeId(this.assignment.gradeID, this.DomainName).subscribe((d) => {
  //           this.subjectsForCreate = d
  //         })

  //       })
  //       this.getSubjectWeightData()
  //       this.getClassesData()
  //     }
  //   )
  // }

  // getSubjectData() {
  //   this.subjects = []
  //   this.subjectService.Get(this.DomainName).subscribe(
  //     data => {
  //       this.subjects = data
  //     }
  //   )
  // }

  // getSubjectWeightData() {
  //   this.subjectWeights = []
  //   this.subjectWeightService.GetBySubjectId(this.assignment.subjectID, this.DomainName).subscribe(
  //     data => {
  //       this.subjectWeights = data
  //     }
  //   )
  // }

}
