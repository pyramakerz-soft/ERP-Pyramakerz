import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { RegisteredEmployeeService } from '../../../../Services/Employee/Administration/registered-employee.service';
import { RegisteredEmployeeAdd } from '../../../../Models/Administrator/registered-employee';
import { EmployeeAttachment } from '../../../../Models/Employee/employee-attachment';
import { DepartmentService } from '../../../../Services/Employee/Administration/department.service';
import { Department } from '../../../../Models/Administrator/department';

@Component({
  selector: 'app-registered-employee-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './registered-employee-view.component.html',
  styleUrl: './registered-employee-view.component.css',
})
@InitLoader()
export class RegisteredEmployeeViewComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  
  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  
  Data: RegisteredEmployeeAdd = new RegisteredEmployeeAdd();
  departments: Department[] = [];
  mode: string = '';
  EmpId: number = 0;
  
  validationErrors: { [key: string]: string } = {};
  emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  
  DeletedFiles: number[] = [];
  SelectedFiles: EmployeeAttachment[] = [];
  NewFile: EmployeeAttachment = new EmployeeAttachment();
  isLoading = false;
  
  currentSection: number = 1;
  
  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx', '.csv',
    '.mp4', '.avi', '.mkv', '.mov'
  ];
  
  experiences: {
    previousExperiencePlace: string;
    position: string;
    fromDate: string;
    toDate: string;
  }[] = [
    { previousExperiencePlace: '', position: '', fromDate: '', toDate: '' }
  ];
  
  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    public RegisteredEmployeeServ: RegisteredEmployeeService,
    public DepartmentServ: DepartmentService,
    private languageService: LanguageService,
    private loadingService: LoadingService
  ) { }
  
  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    
    if (this.User_Data_After_Login.type === 'employee') {
      this.DomainName = this.ApiServ.GetHeader();
      
      this.loadDepartments();
      
      this.activeRoute.url.subscribe((url) => {
        this.path = url.map(segment => segment.path).join('/');
        
        if (this.path.endsWith("RegisteredEmployee/Create")) {
          this.mode = 'Create';
        } else {
          this.mode = 'View';
          this.EmpId = Number(this.activeRoute.snapshot.paramMap.get('id'));
          
          // this.RegisteredEmployeeServ.GetById(this.EmpId, this.DomainName).subscribe(async (data) => {
          //   this.Data = data;
          //   this.Data.editedFiles = [];
          //   if (data.files == null) {
          //     this.Data.files = [];
          //   }
          //   this.Data.id = this.EmpId;
          // });
        }
      });
    }
    
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  loadDepartments() {
    this.DepartmentServ.Get(this.DomainName).subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

    moveToEmployee() {
    this.router.navigateByUrl('Employee/Employee');
  }
  
  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    
    const Swal = await import('sweetalert2').then(m => m.default);
    
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
        } else if (file.size > 25 * 1024 * 1024) {
          Swal.fire({
            title: 'The file size exceeds the maximum limit of 25 MB.',
            icon: 'warning',
            confirmButtonColor: '#089B41',
            confirmButtonText: "OK"
          });
          input.value = '';
          continue;
        } else {
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
      URL.revokeObjectURL(fileURL);
    } else if (this.mode == 'View') {
      const fileURL = file.link;
      const a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank';
      a.click();
      URL.revokeObjectURL(fileURL);
    }
  }
  
  addExperience() {
    this.experiences.push({ previousExperiencePlace: '', position: '', fromDate: '', toDate: '' });
  }
  
onInputValueChangeExp(index: number, field: string, value: any) {
  (this.experiences[index] as any)[field] = value;
  
  if (value) {
    const errorKey = `experience_${index}_${field}`;
    if (this.validationErrors[errorKey]) {
      this.validationErrors[errorKey] = '';
    }
  }
}
  isFormValid(): boolean {
    let isValid = true;
    this.validationErrors = {};
    
    const requiredFields = [
      'en_name', 'ar_name', 'email', 'mobile', 'departmentID',
      'positionAppliedFor', 'gender', 'birthdayDate', 'passportNumber',
      'maritalStatus', 'university', 'graduationYear', 'faculty',
      'major', 'schoolYouGraduatedFrom', 'nationality'
    ];
    
    for (const field of requiredFields) {
      const value = (this.Data as any)[field];
      
      if (field === 'departmentID' || field === 'nationality') {
        if (!value || value === 0) {
          this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
          isValid = false;
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
        isValid = false;
      }
      
      if (field === 'en_name' && value && typeof value === 'string' && value.trim().length < 2) {
        this.validationErrors['en_name'] = `*English Name must be at least 2 characters`;
        isValid = false;
      }
      
      if (field === 'email' && value && typeof value === 'string' && !this.emailPattern.test(value.trim())) {
        this.validationErrors['email'] = `*Email is not valid`;
        isValid = false;
      }
    }
    
    return isValid;
  }

  
  
  goToNextPage() {
    if (this.currentSection === 1) {
      const firstSectionRequired = [
        'en_name', 'ar_name', 'email', 'mobile', 'departmentID',
        'positionAppliedFor', 'gender', 'birthdayDate'
      ];
      
      let firstValid = true;
      this.validationErrors = {};
      
      for (const field of firstSectionRequired) {
        const value = (this.Data as any)[field];
        
        if (field === 'departmentID') {
          if (!value || value === 0) {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
            firstValid = false;
          }
        } else if (!value || (typeof value === 'string' && value.trim() === '')) {
          this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
          firstValid = false;
        }
        
        if (field === 'en_name' && typeof value === 'string' && value.trim().length < 2) {
          this.validationErrors['en_name'] = '*English Name must be at least 2 characters';
          firstValid = false;
        }
        
        if (field === 'email' && typeof value === 'string' && !this.emailPattern.test(value.trim())) {
          this.validationErrors['email'] = '*Email is not valid';
          firstValid = false;
        }
      }
      
      if (!firstValid) {
        import('sweetalert2').then(Swal => {
          Swal.default.fire({
            icon: 'warning',
            title: 'Required Fields',
            text: 'Please fill all required fields in the first section before proceeding.',
            confirmButtonColor: '#089B41',
          });
        });
        return;
      }
      this.currentSection = 2;
      return;
    } else if (this.currentSection === 2) {
      this.currentSection = 3;
      return;
    }
  }
  
  capitalizeField(field: string): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
  }
  
onInputValueChange(event: { field: string; value: any }) {
  const { field, value } = event;
  (this.Data as any)[field] = value;
  if (value) {
    this.validationErrors[field] = '';
  }
}
  
  validateNumber(event: any, field: string): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    event.target.value = value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      (this.Data as any)[field] = '';
    }
  }
  
  goToPreviousPage() {
    if (this.currentSection > 1) {
      this.currentSection--;
    }
  }
  
  showMissingFields(): string[] {
    const missing: string[] = [];
    
    const requiredFields = [
      'en_name', 'ar_name', 'email', 'mobile', 'departmentID',
      'positionAppliedFor', 'gender', 'birthdayDate', 'passportNumber',
      'maritalStatus', 'university', 'graduationYear', 'faculty',
      'major', 'schoolYouGraduatedFrom', 'nationality'
    ];
    
    requiredFields.forEach(field => {
      const value = (this.Data as any)[field];
      
      if (field === 'departmentID' || field === 'nationality') {
        if (!value || value === 0) {
          let label = field.replace(/([A-Z])/g, ' $1').trim();
          label = label.charAt(0).toUpperCase() + label.slice(1);
          missing.push(label);
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        let label = field.replace(/([A-Z])/g, ' $1').trim();
        label = label.charAt(0).toUpperCase() + label.slice(1);
        missing.push(label);
      }
    });
    
    if (this.Data.email && this.Data.email.trim() !== '' && !this.emailPattern.test(this.Data.email.trim())) {
      missing.push('Email (Invalid format)');
    }
    
    const firstExperience = this.experiences[0];
    if (
      !firstExperience?.previousExperiencePlace?.trim() ||
      !firstExperience?.position?.trim() ||
      !firstExperience?.fromDate ||
      !firstExperience?.toDate
    ) {
      missing.push('Previous Experience (First row must be fully filled)');
    }
    
    return missing;
  }
  
  async Save() {
    if (!this.isFormValid()) {
      const missingFields = this.showMissingFields();
      
      const Swal = await import('sweetalert2').then(m => m.default);
      
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Data!',
        html: `
          <p class="text-right dir-rtl">Please fill the following fields before saving:</p>
          <ul class="text-right dir-rtl list-disc mr-8 mt-4 space-y-1">
            ${missingFields.map(field => `<li><strong>${field}</strong></li>`).join('')}
          </ul>
        `,
        confirmButtonColor: '#089B41',
        confirmButtonText: 'OK',
        width: '600px'
      });
      return;
    }
    
    this.isLoading = true;
    
    let allExperiences = this.experiences
      .filter(exp => exp.previousExperiencePlace?.trim() || exp.position?.trim())
      .map((exp, index) => 
        `${index + 1}. Place: ${exp.previousExperiencePlace || 'Not specified'}\n   Position: ${exp.position || 'Not specified'}\n   From: ${exp.fromDate || 'Not specified'} - To: ${exp.toDate || 'Not specified'}`
      )
      .join('\n\n');
    
    this.Data.previousExperiencePlace = allExperiences || 'No previous experience.';
    this.Data.position = '';
    this.Data.fromDate = '';
    this.Data.toDate = '';
    
    const initialLength = this.Data.files.length;
    for (let i = 0; i < this.SelectedFiles.length; i++) {
      this.Data.files.push(this.SelectedFiles[i]);
    }
    
    const Swal = await import('sweetalert2').then(m => m.default);
    
    try {
      let response;
      if (this.mode === 'Create') {
        response = await this.RegisteredEmployeeServ.Add(this.Data, this.DomainName).toPromise();
        
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          html: '<strong>The application was successfully submitted to the Human Resources department.</strong>',
          confirmButtonColor: '#089B41',
          confirmButtonText: 'OK',
          timer: 5000,
          timerProgressBar: true
        });
        
        this.moveToRegisteredEmployees();
        
      } else if (this.mode === 'View') {
        // يمكنك إضافة منطق للتحديث إذا كنت تسمح بتعديل الطلبات
        console.log('View mode - no save action');
      }
      
    } catch (error: any) {
      console.error('Error saving registered employee:', error);
      
      let errorMessage = 'An unexpected error occurred during saving.';
      
      if (error.error === 'This Email Already Exist') {
        errorMessage = 'Email address is already used.';
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#089B41'
      });
      
      this.Data.files.splice(initialLength);
    } finally {
      this.isLoading = false;
    }
  }
  
  moveToRegisteredEmployees() {
    this.router.navigateByUrl('Administration/RegisteredEmployee');
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
    
    const isExistingFile = !(selectedFile.file instanceof File) && selectedFile.link !== '';
    const alreadyTracked = this.Data.editedFiles.some((f) => f.id === selectedFile!.id);
    
    if (isExistingFile && !alreadyTracked) {
      this.Data.editedFiles.push(selectedFile);
    }
  }
  
  isFileInSelected(file: any): boolean {
    return this.SelectedFiles.some(
      (f) => f.file?.name === file.name || f.name === file.name
    );
  }
  
  goToSection(section: number) {
    if (section === 2 && this.currentSection === 1) {
      this.goToNextPage();
      return;
    }
    if (section === 3 && this.currentSection < 2) {
      return;
    }
    
    this.currentSection = section;
  }
}