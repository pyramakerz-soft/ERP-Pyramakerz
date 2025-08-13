import { Component } from '@angular/core';
import { Conduct } from '../../../../Models/SocialWorker/conduct';
import { ConductService } from '../../../../Services/Employee/SocialWorker/conduct.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { BusCompanyService } from '../../../../Services/Employee/Bus/bus-company.service';
import { EmployeeTypeService } from '../../../../Services/Employee/employee-type.service';
import { RoleService } from '../../../../Services/Employee/role.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Student } from '../../../../Models/student';
import { School } from '../../../../Models/school';
import { Grade } from '../../../../Models/LMS/grade';
import { ConductType } from '../../../../Models/SocialWorker/conduct-type';
import { ProcedureType } from '../../../../Models/SocialWorker/procedure-type';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { StudentService } from '../../../../Services/student.service';
import { ConductTypeSection } from '../../../../Models/SocialWorker/conduct-type-section';
import { ConductTypeService } from '../../../../Services/Employee/SocialWorker/conduct-type.service';
import { ProcedureTypeService } from '../../../../Services/Employee/SocialWorker/procedure-type.service';
import { Classroom } from '../../../../Models/LMS/classroom';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conduct-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './conduct-add-edit.component.html',
  styleUrl: './conduct-add-edit.component.css'
})
export class ConductAddEditComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  ConductID: number = 0;
  Data: Conduct = new Conduct();
  mode: string = '';
  validationErrors: { [key in keyof Conduct]?: string } = {};
  isLoading = false;
  schools: School[] = [];
  grades: Grade[] = [];
  classes: Classroom[] = [];
  students: Student[] = [];
  conductTypes: ConductType[] = [];
  proceduresType: ProcedureType[] = [];

  constructor(
    public RoleServ: RoleService,
    public empTypeServ: EmployeeTypeService,
    public BusCompanyServ: BusCompanyService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    private SchoolServ: SchoolService,
    private GradeServ: GradeService,
    private ClassroomServ: ClassroomService,
    private StudentServ: StudentService,
    private ConductTypeServ: ConductTypeService,
    private ProcedureTypeServ: ProcedureTypeService,
    private ConductServ: ConductService,
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    if (this.User_Data_After_Login.type === 'employee') {
      this.DomainName = this.ApiServ.GetHeader();
      this.activeRoute.url.subscribe((url: { path: string; }[]) => {
        this.path = url[0].path;

        if (this.path == 'Conduct Create') {
          this.mode = 'Create';
          this.GetAllSchools()
          this.GetProceduresTypes()
        } else if (this.path == 'Conduct Edit') {
          this.mode = 'Edit';
          this.ConductID = Number(this.activeRoute.snapshot.paramMap.get('id'));
          this.ConductServ.GetByID(this.ConductID, this.DomainName).subscribe((data) => {
            this.Data = data;
            console.log(this.Data)
            this.schools = []
            this.SchoolServ.Get(this.DomainName).subscribe((d) => {
              this.schools = d
              this.conductTypes = []
              this.ConductTypeServ.GetBySchool(this.Data.schoolID, this.DomainName).subscribe((d) => {
                this.conductTypes = d
              })
              this.proceduresType = []
              this.ProcedureTypeServ.Get(this.DomainName).subscribe((d) => {
                this.proceduresType = d
              })
              this.grades = []
              this.GradeServ.GetBySchoolId(this.Data.schoolID, this.DomainName).subscribe((d) => {
                this.grades = d
                this.classes = []
                this.ClassroomServ.GetByGradeId(this.Data.gradeID, this.DomainName).subscribe((d) => {
                  this.classes = d
                  this.students = []
                  this.StudentServ.GetByClassID(this.Data.classroomID, this.DomainName).subscribe((d) => {
                    this.students = d
                  })
                })
              })
            })
          });
        }
      });
    }
  }

  openFile(file: any) {
    if (typeof file === 'string') {
      window.open(file, '_blank');
    } else if (file instanceof File) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(fileUrl), 10000);
    } else {
      console.warn('Unknown file type:', file);
    }
  }

  openUrl(link: string) {
    if (link) {
      const fullUrl = `${link}`;
      window.open(fullUrl, '_blank');
    }
  }

  GetAllSchools() {
    this.schools = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d
    })
  }

  GetGrades() {
    this.grades = []
    this.GradeServ.GetBySchoolId(this.Data.schoolID, this.DomainName).subscribe((d) => {
      this.grades = d
    })
  }

  GetClasses() {
    this.classes = []
    this.ClassroomServ.GetByGradeId(this.Data.gradeID, this.DomainName).subscribe((d) => {
      this.classes = d
    })
  }

  GetStudents() {
    this.students = []
    this.StudentServ.GetByClassID(this.Data.classroomID, this.DomainName).subscribe((d) => {
      this.students = d
    })
  }

  GetConductTypes() {
    this.conductTypes = []
    this.ConductTypeServ.GetBySchool(this.Data.schoolID, this.DomainName).subscribe((d) => {
      this.conductTypes = d
    })
  }

  GetProceduresTypes() {
    this.proceduresType = []
    this.ProcedureTypeServ.Get(this.DomainName).subscribe((d) => {
      this.proceduresType = d
    })
  }

  moveToConduct() {
    this.router.navigateByUrl('Employee/Conduct');
  }

  Save() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.ConductServ.Add(this.Data, this.DomainName).subscribe(
          (d) => {
            this.moveToConduct();
            this.isLoading = false;
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
        this.ConductServ.Edit(this.Data, this.DomainName).subscribe(
          (d) => {
            Swal.fire({
              icon: 'success',
              title: 'Done',
              text: 'Updatedd Successfully',
              confirmButtonColor: '#089B41',
            });
            this.moveToConduct();
            this.isLoading = false;
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
    }
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.Data) {
      if (this.Data.hasOwnProperty(key)) {
        const field = key as keyof Conduct;
        if (!this.Data[field]) {
          if (
            field == 'date'
          ) {
            this.Data[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof Conduct): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Conduct; value: any }) {
    const { field, value } = event;
    (this.Data as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['file'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.Data.newFile = null;
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
      ];
      if (allowedTypes.includes(file.type)) {
        this.Data.newFile = file;
        this.Data.file = "";
        this.validationErrors['newFile'] = '';
        const reader = new FileReader();
        reader.readAsDataURL(file);
      } else {
        this.validationErrors['newFile'] = 'Invalid file type. Only Word (.doc, .docx) and PDF (.pdf) files are allowed.';
        this.Data.newFile = null;
      }
    }
    input.value = '';
  }

}
