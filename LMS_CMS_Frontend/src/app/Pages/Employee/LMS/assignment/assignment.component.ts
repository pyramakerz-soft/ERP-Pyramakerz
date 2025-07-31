import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { Assignment } from '../../../../Models/LMS/assignment';
import { AssignmentService } from '../../../../Services/Employee/LMS/assignment.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { Subject } from '../../../../Models/LMS/subject';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { AssignmentType } from '../../../../Models/LMS/assignment-type';
import { AssignmentTypeService } from '../../../../Services/Employee/LMS/assignment-type.service';
import { SubjectWeightService } from '../../../../Services/Employee/LMS/subject-weight.service';
import { SubjectWeight } from '../../../../Models/LMS/subject-weight';
import { StudentClassWhenSubject } from '../../../../Models/LMS/student-class-when-subject';
import { ClassroomSubjectService } from '../../../../Services/Employee/LMS/classroom-subject.service';
import { Classroom } from '../../../../Models/LMS/classroom';
import { ClassroomStudent } from '../../../../Models/LMS/classroom-student';
import { Grade } from '../../../../Models/LMS/grade';
import { School } from '../../../../Models/school';
import { Student } from '../../../../Models/student';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SchoolService } from '../../../../Services/Employee/school.service';

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.css'
})
export class AssignmentComponent {
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

  assignment: Assignment = new Assignment();
  assignmentData: Assignment[] = [];
  assignmentTypes: AssignmentType[] = [];
  subjects: Subject[] = [];
  subjectWeights: SubjectWeight[] = [];
  choosedStudentsClass: ClassroomStudent[] = [];
  choosedClass: StudentClassWhenSubject[] = [];
  studentClassWhenSubject: StudentClassWhenSubject[] = [];
  studentClassWhenSelectClass: StudentClassWhenSubject = new StudentClassWhenSubject();
  subjectID: number = 0

  CurrentPage: number = 1
  PageSize: number = 10
  TotalPages: number = 1
  TotalRecords: number = 0
  isDeleting: boolean = false;
  viewClassStudents: boolean = false;
  viewStudents: boolean = false;

  SelectedSchoolId: number = 0;
  SelectedYearId: number = 0;
  SelectedGradeId: number = 0;
  schools: School[] = []
  students: Student[] = []
  Grades: Grade[] = []
  GradesForCreate: Grade[] = []
  subjectsForCreate: Subject[] = [];
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
    public assignmentTypeService: AssignmentTypeService,
    public router: Router
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
  }

  getAllSchools() {
    this.schools = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  getAllSubject() {
    this.subjects = []
    this.IsView = false
    this.subjectID = 0
    this.subjectService.GetByGradeId(this.SelectedGradeId, this.DomainName).subscribe((d) => {
      this.subjects = d
    })
  }

  getAllGradesBySchoolId() {
    this.IsView = false
    this.Grades = []
    this.SelectedGradeId = 0
    this.subjects = []
    this.subjectID = 0
    this.GradeServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  SubjectChanged() {
    this.IsView = false
  }

  GetAllData(pageNumber: number, pageSize: number) {
    this.assignmentData = []
    this.IsView = true
    this.CurrentPage = 1
    this.TotalPages = 1
    this.TotalRecords = 0
    if (this.subjectID != 0) {
      this.assignmentService.GetBySubjectID(this.subjectID, this.DomainName, pageNumber, pageSize).subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords
          this.assignmentData = data.data
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
    } else {
      this.assignmentService.Get(this.DomainName, pageNumber, pageSize).subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords
          this.assignmentData = data.data
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

  View(id: number) {
    this.router.navigateByUrl(`Employee/Assignment/${id}`)
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  openModal(Id?: number) {
    if (Id) {
      this.getAssignmentById(Id);
    }

    this.assignment = new Assignment();
    this.getSubjectData();
    this.getAssignmentTypeData();

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};

    this.choosedStudentsClass = [];
    this.choosedClass = [];
    this.subjectWeights = [];
    this.assignmentTypes = [];
    this.studentClassWhenSubject = [];
    this.viewStudents = false
    this.viewClassStudents = false
    this.studentClassWhenSelectClass = new StudentClassWhenSubject()

    this.assignment = new Assignment();
  }

  viewTable() {
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  getAssignmentById(Id: number) {
    this.assignment = new Assignment()
    this.assignmentService.GetByID(Id, this.DomainName).subscribe(
      data => {
        this.assignment = data
        console.log(this.assignment)
        this.GradeServ.GetBySchoolId(this.assignment.schoolID, this.DomainName).subscribe((d) => {
          this.GradesForCreate = d
          this.subjectsForCreate = []
          this.subjectService.GetByGradeId(this.assignment.gradeID, this.DomainName).subscribe((d) => {
            this.subjectsForCreate = d
          })

        })
        this.getSubjectWeightData()
        this.getClassesData()
      }
    )
  }

  getSubjectData() {
    this.subjects = []
    this.subjectService.Get(this.DomainName).subscribe(
      data => {
        this.subjects = data
      }
    )
  }

  getSubjectWeightData() {
    this.subjectWeights = []
    this.subjectWeightService.GetBySubjectId(this.assignment.subjectID, this.DomainName).subscribe(
      data => {
        this.subjectWeights = data
      }
    )
  }

  getAssignmentTypeData() {
    this.assignmentTypes = []
    this.assignmentTypeService.Get(this.DomainName).subscribe(
      data => {
        this.assignmentTypes = data
      }
    )
  }

  getClassesData() {
    this.studentClassWhenSubject = []
    this.choosedClass = [];
    this.choosedStudentsClass = [];
    this.classroomSubjectService.GetClassBySubjectIDWithStudentsIncluded(this.assignment.subjectID, this.DomainName).subscribe(
      data => {
        this.studentClassWhenSubject = data
        if (this.assignment.assignmentStudentIsSpecifics.length != 0) {
          const classroomMap = new Map<number, StudentClassWhenSubject>();

          this.assignment.assignmentStudentIsSpecifics.forEach(element => {
            var classStud = new ClassroomStudent()
            classStud.id = element.studentClassroomID
            classStud.studentID = element.studentID
            classStud.studentEnglishName = element.studentEnglishName
            classStud.studentArabicName = element.studentArabicName
            classStud.classID = element.classroomID
            classStud.className = element.classroomName

            this.choosedStudentsClass.push(classStud)

            if (!classroomMap.has(classStud.classID)) {
              classroomMap.set(classStud.classID, new StudentClassWhenSubject(classStud.classID, classStud.className));
            }

            const classroomSubject = classroomMap.get(classStud.classID);
            if (classroomSubject) {
              classroomSubject.studentClassrooms.push(classStud);
            }
          });
          this.choosedClass = Array.from(classroomMap.values());
        }
      }
    )
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

  onInputValueChange(event: { field: keyof Assignment; value: any }) {
    const { field, value } = event;
    (this.assignment as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }

    if (field == 'openDate' || field == 'dueDate' || field == 'cutOfDate') {
      this.validationErrors['openDate'] = ''
      this.validationErrors['dueDate'] = ''
      this.validationErrors['cutOfDate'] = ''
    }
  }


  onSchoolModalChange() {
    this.assignment.subjectWeightTypeID = 0
    this.choosedClass = []
    this.choosedStudentsClass = []
    this.viewStudents = false
    this.viewClassStudents = false
    this.studentClassWhenSelectClass = new StudentClassWhenSubject()
    this.studentClassWhenSubject = []
    this.GradesForCreate = []
    this.subjectsForCreate = []
    this.assignment.gradeID = 0
    this.assignment.subjectID = 0
    this.GradeServ.GetBySchoolId(this.assignment.schoolID, this.DomainName).subscribe((d) => {
      this.GradesForCreate = d
    })
  }

  onGradeModalChange() {
    this.assignment.subjectWeightTypeID = 0
    this.choosedClass = []
    this.choosedStudentsClass = []
    this.viewStudents = false
    this.viewClassStudents = false
    this.studentClassWhenSelectClass = new StudentClassWhenSubject()
    this.studentClassWhenSubject = []
    this.subjectsForCreate = []
    this.assignment.subjectID = 0
    this.subjectService.GetByGradeId(this.assignment.gradeID, this.DomainName).subscribe((d) => {
      this.subjectsForCreate = d
    })
  }

  onSubjectModalChange() {
    this.assignment.subjectWeightTypeID = 0
    this.choosedClass = []
    this.choosedStudentsClass = []
    this.getSubjectWeightData();
    this.getClassesData();
    this.viewStudents = false
    this.viewClassStudents = false
    this.studentClassWhenSelectClass = new StudentClassWhenSubject()
    this.studentClassWhenSubject = []
  }

  onIsSpecificChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.assignment.isSpecificStudents = isChecked
    this.viewStudents = false
    this.studentClassWhenSelectClass = new StudentClassWhenSubject()
    this.validationErrors['studentClassroomIDs'] = '';
  }

  removeStudentFromClass(classroom: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.choosedClass = this.choosedClass.filter(item => item.classroomID !== classroom);
    this.choosedStudentsClass = this.choosedStudentsClass.filter(item => item.classID !== classroom);
  }

  getStudentCount(classroomID: number): number {
    return this.choosedStudentsClass.filter(student => student.classID === classroomID).length;
  }

  onClassSelectChange(classroom: StudentClassWhenSubject) {
    this.validationErrors['studentClassroomIDs'] = '';

    const index = this.choosedClass.findIndex(item => item.classroomID === classroom.classroomID);
    if (index !== -1) {
      this.choosedClass.splice(index, 1);
      this.choosedStudentsClass = this.choosedStudentsClass.filter(item => item.classID !== classroom.classroomID);
    } else {
      this.choosedClass.push(classroom);
      this.choosedStudentsClass.push(...classroom.studentClassrooms);
    }
  }

  onStudentSelectChange(studentClass: ClassroomStudent) {
    this.validationErrors['studentClassroomIDs'] = '';

    const index = this.choosedStudentsClass.findIndex(item => item.id === studentClass.id);
    if (index !== -1) {
      this.choosedStudentsClass.splice(index, 1);
    } else {
      this.choosedStudentsClass.push(studentClass);
    }

    const indexForClasss = this.choosedClass.findIndex(item => item.classroomID === studentClass.classID);
    if (indexForClasss === -1) {
      let found: StudentClassWhenSubject | undefined = this.studentClassWhenSubject.find((element) => element.classroomID == studentClass.classID);
      if (found) {
        this.choosedClass.push(found);
      }
    } else {
      const hasStudentInClass = this.choosedStudentsClass.some(item => item.classID === studentClass.classID);

      if (!hasStudentInClass) {
        this.choosedClass.splice(indexForClasss, 1);
      }
    }
  }

  onSelectAllChange(classroomID: number, event: Event): void {
    this.validationErrors['studentClassroomIDs'] = '';

    const isChecked = (event.target as HTMLInputElement).checked;
    const studentsInClass = this.studentClassWhenSelectClass.studentClassrooms.filter(student => student.classID === classroomID);

    if (isChecked) {
      studentsInClass.forEach(student => {
        if (!this.choosedStudentsClass.some(s => s.id === student.id)) {
          this.choosedStudentsClass.push(student);
        }
      });
    } else {
      this.choosedStudentsClass = this.choosedStudentsClass.filter(student => student.classID !== classroomID);
    }

    const indexForClasss = this.choosedClass.findIndex(item => item.classroomID === classroomID);
    if (indexForClasss === -1) {
      let found: StudentClassWhenSubject | undefined = this.studentClassWhenSubject.find((element) => element.classroomID == classroomID);
      if (found) {
        this.choosedClass.push(found);
      }
    } else {
      const hasStudentInClass = this.choosedStudentsClass.some(item => item.classID === classroomID);

      if (!hasStudentInClass) {
        this.choosedClass.splice(indexForClasss, 1);
      }
    }
  }

  isClassSelected(classroomID: number): boolean {
    return this.choosedClass.some(item => item.classroomID == classroomID)
  }

  isStudentSelected(studentClassID: number): boolean {
    return this.choosedStudentsClass.some(item => item.id == studentClassID)
  }

  isSelectAllChecked(classroomID: number): boolean {
    const studentsInClass = this.studentClassWhenSelectClass.studentClassrooms.filter(student => student.classID === classroomID);
    return studentsInClass.every(student => this.choosedStudentsClass.some(selectedStudent => selectedStudent.id === student.id));
  }

  openStudent(classroom: StudentClassWhenSubject) {
    this.viewStudents = true
    this.studentClassWhenSelectClass = classroom
  }

  returnToClases() {
    this.viewStudents = false
    this.studentClassWhenSelectClass = new StudentClassWhenSubject()
  }

  toggleClassesToChooseStudents() {
    this.viewStudents = false
    this.validationErrors['studentClassroomIDs'] = '';
    this.studentClassWhenSelectClass = new StudentClassWhenSubject()
    if (this.assignment.subjectID) {
      if (this.viewClassStudents == false) {
        this.viewClassStudents = true
      } else {
        this.viewClassStudents = false
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please Choose Subject First',
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' },
      });
    }
  }

  validateNumber(event: any, field: keyof Assignment): void {
    const value = event.target.value;
    if (isNaN(value) || value === '' || Number(value) <= 0) {
      event.target.value = '';
      if (typeof this.assignment[field] === 'string') {
        this.assignment[field] = '' as never;
      }
    }
  }

  capitalizeField(field: keyof Assignment): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.assignment) {
      if (this.assignment.hasOwnProperty(key)) {
        const field = key as keyof Assignment;
        if (!this.assignment[field]) {
          if (field == 'englishName' || field == 'arabicName' || field == 'mark' || field == 'assignmentTypeID' || field == 'subjectID' || field == 'subjectWeightTypeID' || field == 'openDate' || field == 'cutOfDate') {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            isValid = false;
          }
        } else {
          if (field == 'englishName' || field == 'arabicName') {
            if (this.assignment.englishName.length > 100 || this.assignment.arabicName.length > 100) {
              this.validationErrors[field] = `*${this.capitalizeField(field)} cannot be longer than 100 characters`;
              isValid = false;
            }
          } else if (field == 'studentClassroomIDs') {
            if (this.choosedStudentsClass.length == 0 && this.assignment.isSpecificStudents == true) {
              this.validationErrors[field] = `*You have to choose students as you already selected that this assignment is for specific students`;
              isValid = false;
            }
          } else if (field === 'openDate' || field === 'dueDate' || field === 'cutOfDate') {
            const openDate = new Date(this.assignment.openDate);
            const cutOfDate = new Date(this.assignment.cutOfDate);
            const dueDate = this.assignment.dueDate ? new Date(this.assignment.dueDate) : cutOfDate;

            if (this.assignment.openDate && this.assignment.dueDate && openDate > dueDate) {
              this.validationErrors['openDate'] = '*Open Date must be before or equal to Due Date';
              this.validationErrors['dueDate'] = '*Due Date must be after or equal to Open Date';
              isValid = false;
            }

            if (this.assignment.dueDate && this.assignment.cutOfDate && dueDate > cutOfDate) {
              this.validationErrors['dueDate'] = '*Due Date must be before or equal to Cut Off Date';
              this.validationErrors['cutOfDate'] = '*Cut Off Date must be after or equal to Due Date';
              isValid = false;
            }

            if (this.assignment.dueDate && openDate > dueDate || cutOfDate < dueDate) {
              this.validationErrors['dueDate'] = '*Due Date must be between Open Date and Cut Off Date';
              isValid = false;
            }

            if (this.assignment.cutOfDate && (cutOfDate < openDate || cutOfDate < dueDate)) {
              this.validationErrors['cutOfDate'] = '*Cut Off Date must be after both Open Date and Due Date';
              isValid = false;
            }
          } else {
            this.validationErrors[field] = '';
          }
        }
      }
    }
    return isValid;
  }

  Save() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.assignment.isSpecificStudents == true) {
        this.assignment.studentClassroomIDs = []
        this.choosedStudentsClass.forEach(element => {
          this.assignment.studentClassroomIDs.push(element.id)
        });
      } else {
        this.assignment.studentClassroomIDs = []
      }

      if (this.assignment.id == 0) {
        this.assignmentService.Add(this.assignment, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      } else {
        this.assignmentService.Edit(this.assignment, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
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
      title: 'Are you sure you want to delete this Assignment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assignmentService.Delete(id, this.DomainName).subscribe((D) => {
          this.GetAllData(this.CurrentPage, this.PageSize)
        })
      }
    });
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.PageSize = this.TotalRecords
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.assignmentService.GetBySubjectID(this.subjectID, this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.assignmentData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.assignmentData = this.assignmentData.filter((t) => {
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
      this.assignmentData = [];
    }
  }
}
