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

@Component({
  selector: 'app-assignment-student',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './assignment-student.component.html',
  styleUrl: './assignment-student.component.css'
})
export class AssignmentStudentComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  classes: Classroom[] = []
  TableData: AssignmentStudent[] = [];

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  AssignmentId: number = 0;
  ClassId: number = 0;
  IsShowTabls: boolean = false
  assignment: Assignment = new Assignment()

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
    public classServ: ClassroomService,
    public assignmentServ: AssignmentService
  ) { }
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });
    this.AssignmentId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.GetAssignment()
    this.GetAllData(this.CurrentPage, this.PageSize)
    this.GetAllClasses()
  }

  GetAllClasses() {
    this.classServ.Get(this.DomainName).subscribe((d) => {
      this.classes = d
    })
  }

  GetAssignment() {
    this.assignmentServ.GetByID(this.AssignmentId, this.DomainName).subscribe((d) => {
      this.assignment = d
      console.log(this.assignment)
    })
  }

  GetAllData(pageNumber: number, pageSize: number) {
    this.TableData = []
    this.assignmentStudentServ.GetByAssignmentClass(this.AssignmentId, this.ClassId, this.DomainName, pageNumber, pageSize).subscribe(
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

  validateNumber(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  Apply() {
    this.IsShowTabls = true
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  moveToAssignment() {
    this.router.navigateByUrl(`Employee/Assignment/${this.AssignmentId}`)
  }

  classChanged() {
    this.IsShowTabls = false
    this.TableData = []
  }

  moveToDetails(id: number) {
    this.router.navigateByUrl(`Employee/Assignment Details/${id}`)
  }

  openFile(link: string | null) {
    if (link) {
      window.open(link, '_blank');
    } else {
      console.warn('File link is missing');
    }
  }

}
