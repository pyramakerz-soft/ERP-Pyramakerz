import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { EmployeeService } from '../../../../Services/Employee/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusCompanyService } from '../../../../Services/Employee/Bus/bus-company.service';
import { BusType } from '../../../../Models/Bus/bus-type';
import { RoleService } from '../../../../Services/Employee/role.service';
import { Role } from '../../../../Models/Administrator/role';
import { EmployeeTypeService } from '../../../../Services/Employee/employee-type.service';
import { EmployeeTypeGet } from '../../../../Models/Administrator/employee-type-get';
import Swal from 'sweetalert2';
import { EmployeeAttachment } from '../../../../Models/Employee/employee-attachment';
import { Floor } from '../../../../Models/LMS/floor';
import { FloorService } from '../../../../Services/Employee/LMS/floor.service';
import { Grade } from '../../../../Models/LMS/grade';
import { Subject } from '../../../../Models/LMS/subject';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LocationService } from '../../../../Services/Employee/HR/location.service';
import { Location } from '../../../../Models/HR/location';
import { Employee } from '../../../../Models/Employee/employee';

@Component({
  selector: 'app-employee-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './employee-add-edit.component.html',
  styleUrl: './employee-add-edit.component.css',
})
export class EmployeeAddEditComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  Data: Employee = new Employee();
  BusCompany: BusType[] = [];
  Roles: Role[] = [];
  empTypes: EmployeeTypeGet[] = [];
  mode: string = '';
  BusCompanyId: number = 0;
  RoleId: number = 0;
  EmpType: number = 0;
  EmpId: number = 0;
  validationErrors: { [key in keyof Employee]?: string } = {};
  emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  DeletedFiles: number[] = [];
  SelectedFiles: EmployeeAttachment[] = [];
  NewFile: EmployeeAttachment = new EmployeeAttachment();
  isLoading = false;
  floors: Floor[] = [];
  floorsSelected: Floor[] = [];
  locations: Location[] = [];
  locationsSelected: Location[] = [];
  grades: Grade[] = [];
  gradeSelected: Grade[] = [];
  subject: Subject[] = [];
  subjectSelected: Subject[] = [];
  isFloorMonitor = false;
  isGradeSupervisor = false;
  isSubjectSupervisor = false;

  dropdownOpen = false;
  LocationdropdownOpen = false;
  GradedropdownOpen = false;
  SubjectdropdownOpen = false;

  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx', '.csv',
    '.mp4', '.avi', '.mkv', '.mov'
  ];

    // Dropdown element references
  @ViewChild('locationDropdown') locationDropdown!: ElementRef;
  @ViewChild('floorDropdown') floorDropdown!: ElementRef;
  @ViewChild('gradeDropdown') gradeDropdown!: ElementRef;
  @ViewChild('subjectDropdown') subjectDropdown!: ElementRef;
  
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
    public EmpServ: EmployeeService,
    public FloorServ: FloorService,
    public LocationServ: LocationService,
    public GradeServ: GradeService,
    public SubjectServ: SubjectService,
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    if (this.User_Data_After_Login.type === 'employee') {
      this.DomainName = this.ApiServ.GetHeader();
      this.activeRoute.url.subscribe((url) => {
      this.path = url.map(segment => segment.path).join('/');

        if (this.path.endsWith("Employee/Create")) {
          this.mode = 'Create';
        }else{
          this.mode = 'Edit';
          this.EmpId = Number(this.activeRoute.snapshot.paramMap.get('id'));
          this.EmpServ.Get_Employee_By_ID(
            this.EmpId,
            this.DomainName
          ).subscribe(async (data) => {
            this.Data = data;
            this.Data.editedFiles = [];
            if (data.files == null) {
              this.Data.files = [];
            }
            this.Data.id = this.EmpId;
            this.FloorServ.Get(this.DomainName).subscribe((data) => {
              this.floors = data;
              if (this.Data.floorsSelected.length > 0) {
                this.isFloorMonitor = true
                this.floorsSelected = this.floors.filter((s) =>
                  this.Data.floorsSelected.includes(s.id)
                );
              }
            });
            this.LocationServ.Get(this.DomainName).subscribe((data) => {
              this.locations = data;
              if (this.Data.locationSelected.length > 0) {
                this.locationsSelected = this.locations.filter((s) =>
                  this.Data.locationSelected.includes(s.id)
                );
              }
            });
            this.GradeServ.Get(this.DomainName).subscribe((data) => {
              this.grades = data;
              if (this.Data.gradeSelected.length > 0) {
                this.isGradeSupervisor = true
                this.gradeSelected = this.grades.filter((s) =>
                  this.Data.gradeSelected.includes(s.id)
                );
              }
            });
            this.SubjectServ.Get(this.DomainName).subscribe((data) => {
              this.subject = data;
              if (this.Data.subjectSelected.length > 0) {
                this.isSubjectSupervisor = true
                this.subjectSelected = this.subject.filter((s) =>
                  this.Data.subjectSelected.includes(s.id)
                );
              }
            });
          });
        }
        this.GetBusCompany();
        this.GetRole();
        this.GetFloors();
        this.GetLocations();
        this.GetGrade();
        this.GetSubject();
        this.GetEmployeeType();
      });
    }
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


  GetBusCompany() {
    this.BusCompanyServ.Get(this.DomainName).subscribe((data) => {
      this.BusCompany = data;
    });
  }

  GetFloors() {
    this.floors = [];
    this.FloorServ.Get(this.DomainName).subscribe((data) => {
      this.floors = data;
    });
  }

  GetLocations() {
    this.locations = [];
    this.LocationServ.Get(this.DomainName).subscribe((data) => {
      this.locations = data;
    });
  }

  GetGrade() {
    this.grades = [];
    this.GradeServ.Get(this.DomainName).subscribe((data) => {
      this.grades = data;
    });
  }

  GetSubject() {
    this.subject = [];
    this.SubjectServ.Get(this.DomainName).subscribe((data) => {
      this.subject = data;
    });
  }

  GetRole() {
    this.RoleServ.Get_Roles(this.DomainName).subscribe((data) => {
      this.Roles = data;
    });
  }

  GetEmployeeType() {
    this.empTypeServ.Get(this.DomainName).subscribe((data) => {
      this.empTypes = data;
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!this.allowedExtensions.includes(fileExtension)) {
          Swal.fire({
            title: 'Invalid file type',
            html: `The file <strong>${file.name}</strong> is not an allowed type. Allowed types are:<br><strong>${this.allowedExtensions.join(', ')}</strong>`,
            icon: 'warning',
            confirmButtonColor: '#089B41',
            confirmButtonText: "OK"
          }); 
          input.value = '';
          continue;
        }else if(file.size > 25 * 1024 * 1024) {
          Swal.fire({
            title: 'The file size exceeds the maximum limit of 25 MB.',
            icon: 'warning', 
            confirmButtonColor: '#089B41', 
            confirmButtonText: "OK"
          }) 
          input.value = '';
          continue; 
        }else{
          this.NewFile = new EmployeeAttachment();
          this.NewFile.file = file;
          this.NewFile.name = file.name.replace(/\.[^/.]+$/, '');
          this.NewFile.link = '';
          this.NewFile.id = Date.now() + Math.floor(Math.random() * 10000);
          this.SelectedFiles.push(this.NewFile);
        } 
      }
    }
    input.value = '';
  }

  deleteFile(id: any): void {
    const file: any = this.Data.files[id];
    this.DeletedFiles.push(file.id);
    this.Data.files.splice(id, 1);
  }

  deleteFileFromSelectedFile(file: File): void {
    const index = this.SelectedFiles.findIndex((item) => item.file === file);
    if (index !== -1) {
      this.SelectedFiles.splice(index, 1);
    }
  }

  downloadFile(file: any): void {
    if (this.mode == 'Create') {
      const fileURL = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = file.name;
      a.click();
      // URL.revokeObjectURL(fileURL);
    } else if (this.mode == 'Edit') {
      const fileURL = file.link;
      const a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank'; // Open in a new tab
      a.click();
      // URL.revokeObjectURL(fileURL);
    }
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.Data) {
      if (this.Data.hasOwnProperty(key)) {
        const field = key as keyof Employee;
        if (!this.Data[field]) {
          if (
            field == 'user_Name' ||
            field == 'en_name' ||
            field == 'password' ||
            field == 'role_ID' ||
            field == 'employeeTypeID' ||
            field == 'email'
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }

    if (this.Data.employeeTypeID == 2) {
      if (this.Data.licenseNumber == '') {
        this.validationErrors['licenseNumber'] = `*License Number is required`;
        isValid = false;
      }
      if (this.Data.expireDate == '') {
        this.validationErrors['expireDate'] = `*Expire Data is required`;
        isValid = false;
      }
    }

    if (this.Data.email && !this.emailPattern.test(this.Data.email)) {
      this.validationErrors['email'] = `*Email is not valid`;
      isValid = false;
    }

    if (this.Data.user_Name.length > 100) {
      this.validationErrors['user_Name'] = `*UserName cannot be longer than 100 characters`;
      isValid = false;
    }

    if (this.Data.en_name && this.Data.en_name.length > 100) {
      this.validationErrors['en_name'] = `*English Name cannot be longer than 100 characters`;
      isValid = false;
    }

    if (this.Data.ar_name && this.Data.ar_name.length > 100) {
      this.validationErrors['ar_name'] = `*Arabic Name cannot be longer than 100 characters`;
      isValid = false;
    }

    return isValid;
  }

  capitalizeField(field: keyof Employee): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Employee; value: any }) {
    const { field, value } = event;
    (this.Data as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  validateNumber(event: any, field: keyof Employee): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.Data[field] === 'string') {
        this.Data[field] = '' as never;
      }
    }
  }

  async Save() {
    this.Data.floorsSelected = this.floorsSelected.map((s) => s.id);
    this.Data.gradeSelected = this.gradeSelected.map((s) => s.id);
    this.Data.locationSelected = this.locationsSelected.map((s) => s.id);
    this.Data.subjectSelected = this.subjectSelected.map((s) => s.id);
    if (this.isFormValid()) {
      this.isLoading = true;
      const initialLength = this.Data.files.length; 
      for (let i = 0; i < this.SelectedFiles.length; i++) {
        this.Data.files.push(this.SelectedFiles[i]);
      }
      if (this.mode == 'Create') {
        return this.EmpServ.Add(this.Data, this.DomainName)
          .toPromise()
          .then(
            (data) => {
              Swal.fire({
                icon: 'success',
                title: 'Done',
                text: 'Employee Added Succeessfully',
                confirmButtonColor: '#089B41',
              });
              this.moveToEmployee();
              this.isLoading = false;
              return true;
            },
            (error) => {
              switch (true) {
                case error.error == 'This User Name Already Exist':
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;

                case error.error.errors?.Password !== undefined:
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text:
                      error.error.errors.Password[0] ||
                      'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;

                case error.error === 'This Email Already Exist':
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;

                default:
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;
              }
              this.isLoading = false;
              this.Data.files.splice(initialLength);
              return false;
            }
          );
      } else if (this.mode == 'Edit') {
        if (this.DeletedFiles.length > 0) {
          for (const id of this.DeletedFiles) {
            await this.EmpServ.DeleteFile(id, this.DomainName).toPromise();
          }
        }
        return this.EmpServ.Edit(this.Data, this.DomainName)
          .toPromise()
          .then(
            (data) => {
              Swal.fire({
                icon: 'success',
                title: 'Done',
                text: 'Employee Edited Succeessfully',
                confirmButtonColor: '#089B41',
              });
              this.moveToEmployee();
              this.isLoading = false;
              return true;
            },
            (error) => {
              this.isLoading = false;
              switch (true) {
                case error.error == 'This User Name Already Exist':
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;

                case error.error === 'This Email Already Exist':
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;

                default:
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;
              }
              this.Data.files.splice(initialLength);
              return false;
            }
          );
      }
    }

    return Promise.resolve(true); // Default resolve if all logic completes
  }

  moveToEmployee() {
    this.router.navigateByUrl('Employee/Employee');
  }

  changeFileName(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    if (!newName) return;

    let selectedFile: EmployeeAttachment | undefined;

    if (this.SelectedFiles.length > 0) {
      selectedFile = this.SelectedFiles[index];
    } else {
      selectedFile = this.Data.files.find((f) => f.id === index);
    }

    if (!selectedFile) return;

    selectedFile.name = newName;

    const isExistingFile =
      !(selectedFile.file instanceof File) && selectedFile.link !== '';
    const alreadyTracked = this.Data.editedFiles.some(
      (f) => f.id === selectedFile!.id
    );

    if (isExistingFile && !alreadyTracked) {
      this.Data.editedFiles.push(selectedFile);
    }

  }
 
  isFileInSelected(file: any): boolean { 
    return this.SelectedFiles.some(
      (f) => f.file?.name === file.name || f.name === file.name
    );
  }
  
  //////////////////////////////////////////////////// floor

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectType(Type: Floor): void {
    if (!this.floorsSelected.some((e) => e.id === Type.id)) {
      this.floorsSelected.push(Type);
    }
    if (this.mode == 'Edit') {
      if (!Array.isArray(this.Data.newFloorsSelected)) {
        this.Data.newFloorsSelected = [];
      }
      this.Data.newFloorsSelected.push(Type.id);
    }
    this.dropdownOpen = false;
  }

  removeSelected(id: number): void {
    const index = this.floorsSelected.findIndex((tag) => tag.id === id);
    if (index === -1) return; // Tag not found
    const removed = this.floorsSelected.splice(index, 1)[0];
    if (this.floorsSelected.length == 0) {
      this.isFloorMonitor = false
    }
    if (this.mode === 'Edit' && removed?.id !== 0) {
      this.Data.deletedFloorsSelected = this.Data.deletedFloorsSelected || [];
      this.Data.deletedFloorsSelected.push(removed.id);
    }
    this.dropdownOpen = false;
  }

  onFloorsSupervisorChange() {
    if (!this.isFloorMonitor) {
      if (this.mode === 'Edit') {
        this.Data.deletedFloorsSelected = this.Data.deletedFloorsSelected || [];
        const selectedIds = (this.floorsSelected || []).map(s => s.id);
        this.Data.deletedFloorsSelected.push(...selectedIds);
      }
      this.floorsSelected = [];
    }
    this.dropdownOpen = false;
  }

  //////////////////////////////////////////////////// Locations

  LocationtoggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.LocationdropdownOpen = !this.LocationdropdownOpen;
  }

  LocationselectType(Type: Location): void {
    if (!this.locationsSelected.some((e) => e.id === Type.id)) {
      this.locationsSelected.push(Type);
    }
    if (this.mode == 'Edit') {
      if (!Array.isArray(this.Data.newLocationSelected)) {
        this.Data.newLocationSelected = [];
      }
      this.Data.newLocationSelected.push(Type.id);
    }
    this.LocationdropdownOpen = false;
  }

  LocationremoveSelected(id: number): void {
    const index = this.locationsSelected.findIndex((tag) => tag.id === id);
    if (index === -1) return; // Tag not found
    const removed = this.locationsSelected.splice(index, 1)[0];
    if (this.locationsSelected.length == 0) {
      this.isFloorMonitor = false
    }
    if (this.mode === 'Edit' && removed?.id !== 0) {
      this.Data.deletedLocationSelected = this.Data.deletedLocationSelected || [];
      this.Data.deletedLocationSelected.push(removed.id);
    }
    this.LocationdropdownOpen = false;
  }

  onLocationChange() {
    if (!this.Data.isRestrictedForLoctaion) {
      if (this.mode === 'Edit') {
        this.Data.deletedLocationSelected = this.Data.deletedLocationSelected || [];
        const selectedIds = (this.locationsSelected || []).map(s => s.id);
        this.Data.deletedLocationSelected.push(...selectedIds);
      }
      this.locationsSelected = [];
    }
    this.LocationdropdownOpen = false;
  }

  //////////////////////////////////////////////////// Grade

  GradetoggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.GradedropdownOpen = !this.GradedropdownOpen;
  }

  GradeselectType(Type: Grade): void {
    if (!this.gradeSelected.some((e) => e.id === Type.id)) {
      this.gradeSelected.push(Type);
    }
    if (this.mode == 'Edit') {
      if (!Array.isArray(this.Data.newGradesSelected)) {
        this.Data.newGradesSelected = [];
      }
      this.Data.newGradesSelected.push(Type.id);
    }
    this.GradedropdownOpen = false;
  }

  GraderemoveSelected(id: number): void {
    const index = this.gradeSelected.findIndex((tag) => tag.id === id);
    if (index === -1) return; // Tag not found
    const removed = this.gradeSelected.splice(index, 1)[0];
    if (this.gradeSelected.length == 0) {
      this.isGradeSupervisor = false
    }
    if (this.mode === 'Edit' && removed?.id !== 0) {
      this.Data.deletedGradesSelected = this.Data.deletedGradesSelected || [];
      this.Data.deletedGradesSelected.push(removed.id);
    }
    this.GradedropdownOpen = false;
  }

  onGradeSupervisorChange() {
    if (!this.isGradeSupervisor) {
      if (this.mode === 'Edit') {
        this.Data.deletedGradesSelected = this.Data.deletedGradesSelected || [];
        const selectedIds = (this.gradeSelected || []).map(s => s.id);
        this.Data.deletedGradesSelected.push(...selectedIds);
      }
      this.gradeSelected = [];
    }
    this.GradedropdownOpen = false;
  }
  //////////////////////////////////////////////////// Subject

  SubjecttoggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.SubjectdropdownOpen = !this.SubjectdropdownOpen;
  }

  SubjectselectType(Type: Subject): void {
    if (!this.subjectSelected.some((e) => e.id === Type.id)) {
      this.subjectSelected.push(Type);
    }
    if (this.mode == 'Edit') {
      if (!Array.isArray(this.Data.newSubjectsSelected)) {
        this.Data.newSubjectsSelected = [];
      }
      this.Data.newSubjectsSelected.push(Type.id);
    }
    this.SubjectdropdownOpen = false;
  }

  SubjectremoveSelected(id: number): void {
    const index = this.subjectSelected.findIndex((tag) => tag.id === id);
    if (index === -1) return; // Tag not found
    const removed = this.subjectSelected.splice(index, 1)[0];
    if (this.subjectSelected.length == 0) {
      this.isSubjectSupervisor = false
    }
    if (this.mode === 'Edit' && removed?.id !== 0) {
      this.Data.deletedSubjectsSelected = this.Data.deletedSubjectsSelected || [];
      this.Data.deletedSubjectsSelected.push(removed.id);
    }
    this.SubjectdropdownOpen = false;
  }

  onSubjectSupervisorChange(): void {
    if (!this.isSubjectSupervisor) {
      if (this.mode === 'Edit') {
        this.Data.deletedSubjectsSelected = this.Data.deletedSubjectsSelected || [];
        const selectedIds = (this.subjectSelected || []).map(s => s.id);
        this.Data.deletedSubjectsSelected.push(...selectedIds);
      }
      this.subjectSelected = [];
    }
    this.SubjectdropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const clickedInsideLocation = this.locationDropdown?.nativeElement.contains(target);
    const clickedInsideFloor = this.floorDropdown?.nativeElement.contains(target);
    const clickedInsideGrade = this.gradeDropdown?.nativeElement.contains(target);
    const clickedInsideSubject = this.subjectDropdown?.nativeElement.contains(target);

    if (!clickedInsideLocation) this.LocationdropdownOpen = false;
    if (!clickedInsideFloor) this.dropdownOpen = false;
    if (!clickedInsideGrade) this.GradedropdownOpen = false;
    if (!clickedInsideSubject) this.SubjectdropdownOpen = false;
  }

}
