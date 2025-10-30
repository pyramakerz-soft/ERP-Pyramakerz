import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DirectMark } from '../../../../Models/LMS/direct-mark';
import { DirectMarkService } from '../../../../Services/Employee/LMS/direct-mark.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { firstValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Classroom } from '../../../../Models/LMS/classroom';
import { DirectMarkClasses } from '../../../../Models/LMS/direct-mark-classes';

@Component({
  selector: 'app-direct-mark',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './direct-mark.component.html',
  styleUrl: './direct-mark.component.css'
})
export class DirectMarkComponent {

  validationErrors: { [key in keyof DirectMark]?: string } = {};
  keysArray: string[] = ['id', 'englishName', 'arabicName', 'mark', 'subjectArabicName', 'subjectEnglishName'];
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
  subjects: Subject[] = [];
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
  classrooms: Classroom[] = [];
  @ViewChild('classDropdown') classDropdown!: ElementRef;
  classDropdownOpen = false;
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
    private translate: TranslateService,
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
    this.getSubjectData();

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

  SubjectChanged() {
    this.IsView = false
  }

  getAllSubject() {
    this.subjects = []
    this.IsView = false
    this.subjectService.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.subjects = d
    })
  }

  getAllGradesBySchoolId() {
    this.IsView = false
    this.Grades = []
    this.SelectedGradeId = 0
    this.subjects = []
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  GetClassroomsData() {
    this.classrooms = []
    if (!this.directMark.isSummerCourse && this.directMark.subjectID) {
      this.ClassroomServ.GetBySubjectId(this.directMark.subjectID, this.DomainName).subscribe((d) => {
        this.classrooms = d
      })
    }else if (this.directMark.isSummerCourse && this.directMark.date && this.directMark.subjectID) {
      this.ClassroomServ.GetFailedClassesBySubject(this.directMark.subjectID, this.directMark.date!, this.DomainName).subscribe((d) => {
        this.classrooms = d
      })
    }
  }

  toggleClassDropdown() {
    this.classDropdownOpen = !this.classDropdownOpen;
  }

  IfClassExist(classId: number) {
    return this.directMark.directMarkClasses.some(s => s.classroomID === classId);
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.directMark.directMarkClasses = []
      this.directMark.directMarkClasses = this.classrooms.map(s => ({
        directMarkEnglishName: '',
        directMarkArabicName: '',
        insertedByUserId: 0,
        directMarkID: 0,
        id: 0,
        classroomID: s.id,
        classroomName: s.name
      }));
      this.directMark.classids = this.directMark.directMarkClasses.map(c => c.classroomID);
      this.directMark.allClasses = true;
    } else {
      this.directMark.directMarkClasses = [];
      this.directMark.classids = [];
      this.directMark.allClasses = false;
    }
    this.onInputValueChange({ field: 'classids', value: this.directMark.classids });
  }

  toggleClass(event: Event, classroom: Classroom) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      var classMark = new DirectMarkClasses()
      classMark.classroomID = classroom.id
      classMark.classroomName = classroom.name
      this.directMark.directMarkClasses.push(classMark);
    } else {
      this.directMark.directMarkClasses = this.directMark.directMarkClasses.filter(s => s.classroomID != classroom.id)
    }
    this.directMark.allClasses = this.directMark.directMarkClasses.length === this.classrooms.length;
    this.directMark.classids = this.directMark.directMarkClasses.map(c => c.classroomID);

    this.onInputValueChange({ field: 'classids', value: this.directMark.classids });
  }

  GetAllData(pageNumber: number, pageSize: number) {
    this.TableData = []
    this.CurrentPage = 1
    this.TotalPages = 1
    this.TotalRecords = 0
    if (this.SelectedSchoolId != 0 && this.SelectedGradeId != 0 && this.SelectedSubjectId != 0) {
      this.IsView = true
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
    this.router.navigateByUrl(`Employee/Direct Mark/${id}`)
  }

  openModal(Id?: number) {
    if (Id) {
      this.getDirectById(Id);
    }

    this.directMark = new DirectMark();
    this.getSubjectData();

    this.classDropdownOpen = false
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};

    this.classDropdownOpen = false
    this.subjectWeightsForCreate = [];
    this.viewStudents = false
    this.viewClassStudents = false

    this.directMark = new DirectMark();
  }

  viewTable() {
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  getDirectById(Id: number) {
    this.directMark = new DirectMark()
    this.DirectMarkServ.GetById(Id, this.DomainName).subscribe(
      data => {
        this.directMark = data
        this.GradeServ.GetBySchoolId(this.directMark.schoolID, this.DomainName).subscribe((d) => {
          this.GradesForCreate = d
          this.subjectsForCreate = []
          this.subjectService.GetByGradeId(this.directMark.gradeID, this.DomainName).subscribe((d) => {
            this.subjectsForCreate = d
            this.getSubjectWeightData()
            this.ClassroomServ.GetBySubjectId(this.directMark.subjectID, this.DomainName).subscribe((d) => {
              this.classrooms = d
              this.directMark.allClasses = this.directMark.directMarkClasses.length === this.classrooms.length;
              this.directMark.classids = this.directMark.directMarkClasses.map(c => c.classroomID)
            })
          })
        })
      }
    )
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // if dropdown is open
    if (this.classDropdownOpen) {
      const clickedInside = this.classDropdown?.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.classDropdownOpen = false;
      }
    }
  }

  getSubjectData() {
    this.subjectsForCreate = []
    this.subjectService.GetByGradeId(this.directMark.gradeID, this.DomainName).subscribe((d) => {
      this.subjectsForCreate = d
    })
  }

  getSubjectWeightData() {
    this.subjectWeightsForCreate = []
    this.subjectWeightService.GetBySubjectId(this.directMark.subjectID, this.DomainName).subscribe(
      data => {
        this.subjectWeightsForCreate = data
      }
    )
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords
    this.CurrentPage = 1
    this.TotalPages = 1
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.DirectMarkServ.GetBySubjectID(this.SelectedSubjectId, this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.TableData = data.data || [];

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

  onInputValueChange(event: { field: keyof DirectMark; value: any }) {
    const { field, value } = event;
    (this.directMark as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.directMark) {
      if (this.directMark.hasOwnProperty(key)) {
        const field = key as keyof DirectMark;
        if (!this.directMark[field]) {
          if (field == 'englishName' || field == 'arabicName' || field == 'mark' || field == 'subjectID' || field == 'subjectWeightTypeID') {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof DirectMark): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  Save() {
    if (this.isFormValid()) {
      if (this.directMark.id == 0) {
        this.DirectMarkServ.Add(this.directMark, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.classDropdownOpen = false
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Created Successfully',
              confirmButtonColor: '#089B41',
            });
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      } else {
        this.DirectMarkServ.Edit(this.directMark, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
            this.classDropdownOpen = false
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updated Successfully',
              confirmButtonColor: '#089B41',
            });
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      }
    }
  }

  Delete(id: number) {
    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذه') + " " +this.translate.instant('Direct Mark') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.DirectMarkServ.Delete(id, this.DomainName).subscribe((D) => {
          this.GetAllData(this.CurrentPage, this.PageSize)
        })
      }
    });
  }

  removeClass(classroom: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.directMark.directMarkClasses = this.directMark.directMarkClasses.filter(s => s.classroomID != classroom)
    this.directMark.allClasses = this.directMark.directMarkClasses.length === this.classrooms.length;
    this.directMark.classids = this.directMark.directMarkClasses.map(c => c.classroomID);  
  }  

  onSchoolModalChange() {
    this.directMark.subjectWeightTypeID = 0
    this.viewStudents = false
    this.viewClassStudents = false
    this.GradesForCreate = []
    this.subjectsForCreate = []
    this.directMark.gradeID = 0
    this.directMark.subjectID = 0
    this.directMark.directMarkClasses = [];
    this.directMark.classids = [];
    this.directMark.allClasses = false;
    this.GradeServ.GetBySchoolId(this.directMark.schoolID, this.DomainName).subscribe((d) => {
      this.GradesForCreate = d
    }) 
  }

  onGradeModalChange() {
    this.directMark.subjectWeightTypeID = 0
    this.viewStudents = false
    this.viewClassStudents = false
    this.subjectsForCreate = []
    this.directMark.subjectID = 0
    this.directMark.directMarkClasses = [];
    this.directMark.classids = [];
    this.directMark.allClasses = false;
    this.subjectService.GetByGradeId(this.directMark.gradeID, this.DomainName).subscribe((d) => {
      this.subjectsForCreate = d
    })
  }

  onSubjectModalChange() {
    this.directMark.subjectWeightTypeID = 0
    this.getSubjectWeightData();
    this.GetClassroomsData()
    this.viewStudents = false
    this.viewClassStudents = false
  }

  onSummerChange(){
    this.directMark.directMarkClasses = [];
    this.directMark.classids = [];
    this.directMark.allClasses = false;
    if(this.directMark.isSummerCourse){
      this.directMark.subjectWeightTypeID = 0
    }
    this.GetClassroomsData()
  }

  onDateChange(){
    if (this.directMark.isSummerCourse && this.directMark.date) {
      this.directMark.directMarkClasses = [];
      this.directMark.classids = [];
      this.directMark.allClasses = false;
      this.GetClassroomsData()
    }
  }

  validateNumber(event: any, field: keyof DirectMark): void {
    const value = event.target.value;
    if (isNaN(value) || value === '' || Number(value) <= 0) {
      event.target.value = '';
      if (typeof this.directMark[field] === 'string') {
        this.directMark[field] = '' as never;
      }
    }
  }
}