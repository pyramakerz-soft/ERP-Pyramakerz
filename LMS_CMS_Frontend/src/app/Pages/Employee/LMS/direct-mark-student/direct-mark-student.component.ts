import { Component } from '@angular/core';
import { DirectMark } from '../../../../Models/LMS/direct-mark';
import { DirectMarkService } from '../../../../Services/Employee/LMS/direct-mark.service';
import { DirectMarkClassesStudent } from '../../../../Models/LMS/direct-mark-classes-student';
import { DirectMarkClassesStudentService } from '../../../../Services/Employee/LMS/direct-mark-classes-student.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Classroom } from '../../../../Models/LMS/classroom';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusTypeService } from '../../../../Services/Employee/Bus/bus-type.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { AssignmentStudentService } from '../../../../Services/Employee/LMS/assignment-student.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { DirectMarkClassesService } from '../../../../Services/Employee/LMS/direct-mark-classes.service';
import { DirectMarkClasses } from '../../../../Models/LMS/direct-mark-classes';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-direct-mark-student',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './direct-mark-student.component.html',
  styleUrl: './direct-mark-student.component.css'
})
export class DirectMarkStudentComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  isRtl: boolean = false;
  subscription!: Subscription;
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
  DirectMarkId: number = 0;
  ClassId: number = 0;
  classRoomId: number = 0;
  IsShowTabls: boolean = false
  // editDegree: boolean = false
  editDegreeId: number | null = null

  classes: DirectMarkClasses[] = []
  TableData: DirectMarkClassesStudent[] = []
  OriginalData: DirectMarkClassesStudent[] = []
  directMark: DirectMark = new DirectMark()

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
    public DirectMarkClassesStudentServ: DirectMarkClassesStudentService,
    public DirectMarkClassesServ: DirectMarkClassesService,
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
    this.DirectMarkId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.getAllClass()
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

  getAllClass() {
    this.classes = []
    this.IsShowTabls = false
    this.DirectMarkClassesServ.GetByDirectMarkId(this.DirectMarkId, this.DomainName).subscribe((d) => {
      this.classes = d
    })
  }

  GetAllData(pageNumber: number, pageSize: number) {
    this.TableData = []
    this.classRoomId = this.classes.find(s => s.id == this.ClassId)?.classroomID || 0
    this.DirectMarkClassesStudentServ.GetByDirectMarkId(this.DirectMarkId, this.classRoomId, this.DomainName, pageNumber, pageSize).subscribe(
      (data) => {
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords
        this.TableData = data.data
        console.log(this.TableData)
        this.directMark = data.directMark
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
    this.IsShowTabls = true
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  moveToDirectMark() {
    this.router.navigateByUrl(`Employee/Direct Mark`)
  }

  classChanged() {
    this.IsShowTabls = false
    this.TableData = []
  }

  save(row: DirectMarkClassesStudent): void {
    if (row.degree <= this.directMark.mark) {
      // this.editDegree = false
      this.DirectMarkClassesStudentServ.Edit(row, this.DomainName).subscribe((d) => {
        this.GetAllData(this.CurrentPage, this.PageSize)
        this.editDegreeId = null
      }, error => {
        this.editDegreeId = null
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Try Again Later!',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
        this.GetAllData(this.CurrentPage, this.PageSize)
      })
    }
  }
}
