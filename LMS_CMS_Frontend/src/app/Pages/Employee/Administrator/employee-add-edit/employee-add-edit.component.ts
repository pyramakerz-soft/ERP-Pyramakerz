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
// import Swal from 'sweetalert2';
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
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-employee-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './employee-add-edit.component.html',
  styleUrl: './employee-add-edit.component.css',
})

@InitLoader()
export class EmployeeAddEditComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  Data: Employee = new Employee();
  // BusCompany: BusType[] = [];
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
  dropdownOpen = false;
 showRegistrationForm: boolean = false;
 showFirstSection: boolean = true;
  currentSection: number = 1;

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
    private loadingService: LoadingService
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
        
      } else {
        this.mode = 'Edit';
        this.EmpId = Number(this.activeRoute.snapshot.paramMap.get('id'));

        this.EmpServ.Get_Employee_By_ID(this.EmpId, this.DomainName).subscribe(async (data) => {
          this.Data = data;
          this.Data.editedFiles = [];
          if (data.files == null) {
            this.Data.files = [];
          }
          this.Data.id = this.EmpId;

         
        });
      }
    });
  }

  this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
  });
  this.isRtl = document.documentElement.dir === 'rtl';
}
//--

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


goBackToFirstPart() {
  this.showRegistrationForm = false;
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
      URL.revokeObjectURL(fileURL);
    } else if (this.mode == 'Edit') {
      const fileURL = file.link;
      const a = document.createElement('a');
      a.href = fileURL;
      a.target = '_blank'; // Open in a new tab
      a.click();
      URL.revokeObjectURL(fileURL);
    }
  }
 
  experiences: {
    previousExperiencePlace: string;
    position: string;
    fromDate: string;
    toDate: string;
  }[] = [
    { previousExperiencePlace: '', position: '', fromDate: '', toDate: '' } // الصف الأول موجود افتراضياً
  ];

  addExperience() {
    this.experiences.push({ previousExperiencePlace: '', position: '', fromDate: '', toDate: '' });
  }

  onInputValueChangeExp(index: number, field: string, value: any) {
    (this.experiences[index] as any)[field] = value;
  }

  isFormValid(): boolean {
  let isValid = true;
  this.validationErrors = {}; 

  // قائمة كل الحقول الإلزامية في نموذج التقديم
  const requiredStringFields: (keyof Employee)[] = [
    'maritalStatus',
    'university',
    'faculty',
    'major',
    'schoolYouGraduatedFrom',
    'otherStudies',
    'computerSkills',
    'hobbies',
    'applicationDate',
    'positionAppliedFor',
    // 'previousExperiencePlace',
    // 'position',
    // 'fromDate',
    // 'toDate',
    'howDidYouFindUs',
    'reasonforLeavingtheJob',
    'didYouHaveAnyRelativeHere',
    'yourLevelInEnglish',
    'yourLevelInFrensh',
    'doYouSpeakAnyOtherLanguages',
    'currentJob',
    'fullName',
    'enterDate',
    'signature',
    'en_name', // أضفت en_name هنا لأنه مش موجود في القائمة السابقة
    'email'   // أضفت email هنا لأنه مش موجود في القائمة السابقة
  ];

  for (const field of requiredStringFields) {
   const value = this.Data[field] || '';
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
      isValid = false;
    }

    // تحقق إضافي لـ en_name و email
    if (field === 'en_name' && value && typeof value === 'string' && value.trim().length < 2) {
      this.validationErrors['en_name'] = `*English Name must be at least 2 characters`;
      isValid = false;
    }
    if (field === 'email' && value && typeof value === 'string' && !this.emailPattern.test(value.trim())) {
      this.validationErrors['email'] = `*Email is not valid`;
      isValid = false;
    }
  }

  if (!this.Data.lastSalary || this.Data.lastSalary <= 0) {
    this.validationErrors['lastSalary'] = `*Last Salary is required and must be greater than 0`;
    isValid = false;
  }

  if (!this.Data.authorizeInvestigation) {
    this.validationErrors['authorizeInvestigation'] = `*You must certify and authorize the investigation`;
    isValid = false;
  }
return isValid;
}




//   console.log('First section values:', this.Data);

//   // الحقول الإلزامية في الجزء الأول فقط
//   const firstSectionRequired: (keyof Employee)[] = [
//     'applicationDate',
//     'positionAppliedFor',
//     'maritalStatus',
//     'university',
//     'faculty',
//     'major',
//     'schoolYouGraduatedFrom',
//     'otherStudies',
//     'en_name',
//     'email'
//   ];

//   let firstValid = true;
//   this.validationErrors = {}; 

//   for (const field of firstSectionRequired) {
//     const value = this.Data[field] || '';
//     console.log(`Checking field "${field}":`, value);

//     if (!value || (typeof value === 'string' && value.trim() === '')) {
//       this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
//       firstValid = false;
//     }

//     if (field === 'en_name' && value && typeof value === 'string' && value.trim().length < 2) {
//       this.validationErrors['en_name'] = `*English Name must be at least 2 characters`;
//       firstValid = false;
//     }
//     if (field === 'email' && value && typeof value === 'string' && !this.emailPattern.test(value.trim())) {
//       this.validationErrors['email'] = `*Email is not valid`;
//       firstValid = false;
//     }
//   }





// الانتقال للصفحة التالية
goToNextPage() {


  if (this.currentSection === 1) {

    const firstSectionRequired: (keyof Employee)[] = [
      'applicationDate',
      'positionAppliedFor',
      'maritalStatus',
      'university',
      'faculty',
      'major',
      'schoolYouGraduatedFrom',
      'otherStudies',
      'en_name',
      'email'
    ];

    let firstValid = true;
    this.validationErrors = {};

    for (const field of firstSectionRequired) {
      const value = this.Data[field];

      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.validationErrors[field] = `*${this.capitalizeField(field)} is required`;
        firstValid = false;
      }

      if (
        field === 'en_name' &&
        typeof value === 'string' &&
        value.trim().length < 2
      ) {
        this.validationErrors['en_name'] =
          '*English Name must be at least 2 characters';
        firstValid = false;
      }

      if (
        field === 'email' &&
        typeof value === 'string' &&
        !this.emailPattern.test(value.trim())
      ) {
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
  }

  else if (this.currentSection === 2) {
    this.currentSection = 3;
    return;
  }
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

 goToPreviousPage() {
  if (this.currentSection > 1) {
    this.currentSection--;
  }
}
  // async Save() {
  //   // this.Data.floorsSelected = this.floorsSelected.map((s) => s.id);
  //   // this.Data.gradeSelected = this.gradeSelected.map((s) => s.id);
  //   // this.Data.locationSelected = this.locationsSelected.map((s) => s.id);
  //   // this.Data.subjectSelected = this.subjectSelected.map((s) => s.id);
  //  // إضافة الملاحظات من الصفحة الثالثة
  // this.Data.note = this.Data.note || '';

  // // استدعاء دالة Save الموجودة بالفعل
  // const result = await this.Save();

  // if(result) {
  //   console.log('Employee saved successfully', this.Data);
  // }

  //   if (this.isFormValid()) {
  //     this.isLoading = true;

  //     const Swal = await import('sweetalert2').then(m => m.default);

  //     const initialLength = this.Data.files.length; 
  //     for (let i = 0; i < this.SelectedFiles.length; i++) {
  //       this.Data.files.push(this.SelectedFiles[i]);
  //     }
  //     if (this.mode == 'Create') {
  //       return this.EmpServ.Add(this.Data, this.DomainName)
  //         .toPromise()
  //         .then(
  //           (data) => {
  //             Swal.fire({
  //               icon: 'success',
  //               title: 'Done',
  //               text: 'Employee Added Successfully',
  //               confirmButtonColor: '#089B41',
  //             });
  //             this.moveToEmployee();
  //             this.isLoading = false;
  //             return true;
  //           },
  //           (error) => {
  //             switch (true) {
  //               case error.error == 'This User Name Already Exist':
  //                 Swal.fire({
  //                   icon: 'error',
  //                   title: 'Error',
  //                   text: error.error || 'An unexpected error occurred',
  //                   confirmButtonColor: '#089B41',
  //                 });
  //                 break;

  //               case error.error.errors?.Password !== undefined:
  //                 Swal.fire({
  //                   icon: 'error',
  //                   title: 'Error',
  //                   text:
  //                     error.error.errors.Password[0] ||
  //                     'An unexpected error occurred',
  //                   confirmButtonColor: '#089B41',
  //                 });
  //                 break;

  //               case error.error === 'This Email Already Exist':
  //                 Swal.fire({
  //                   icon: 'error',
  //                   title: 'Error',
  //                   text: error.error || 'An unexpected error occurred',
  //                   confirmButtonColor: '#089B41',
  //                 });
  //                 break;

  //               default:
  //                 Swal.fire({
  //                   icon: 'error',
  //                   title: 'Error',
  //                   text: error.error || 'An unexpected error occurred',
  //                   confirmButtonColor: '#089B41',
  //                 });
  //                 break;
  //             }
  //             this.isLoading = false;
  //             this.Data.files.splice(initialLength);
  //             return false;
  //           }
  //         );
  //     } else if (this.mode == 'Edit') {
  //       if (this.DeletedFiles.length > 0) {
  //         for (const id of this.DeletedFiles) {
  //           await this.EmpServ.DeleteFile(id, this.DomainName).toPromise();
  //         }
  //       }
  //       return this.EmpServ.Edit(this.Data, this.DomainName)
  //         .toPromise()
  //         .then(
  //           (data) => {
  //             Swal.fire({
  //               icon: 'success',
  //               title: 'Done',
  //               text: 'Employee Edited Successfully',
  //               confirmButtonColor: '#089B41',
  //             });
  //             this.moveToEmployee();
  //             this.isLoading = false;
  //             return true;
  //           },
  //           (error) => {
  //             this.isLoading = false;
  //             switch (true) {
  //               case error.error == 'This User Name Already Exist':
  //                 Swal.fire({
  //                   icon: 'error',
  //                   title: 'Error',
  //                   text: error.error || 'An unexpected error occurred',
  //                   confirmButtonColor: '#089B41',
  //                 });
  //                 break;

  //               case error.error === 'This Email Already Exist':
  //                 Swal.fire({
  //                   icon: 'error',
  //                   title: 'Error',
  //                   text: error.error || 'An unexpected error occurred',
  //                   confirmButtonColor: '#089B41',
  //                 });
  //                 break;

  //               default:
  //                 Swal.fire({
  //                   icon: 'error',
  //                   title: 'Error',
  //                   text: error.error || 'An unexpected error occurred',
  //                   confirmButtonColor: '#089B41',
  //                 });
  //                 break;
  //             }
  //             this.Data.files.splice(initialLength);
  //             return false;
  //           }
  //         );
  //     }
  //   }

  //   return Promise.resolve(true); // Default resolve if all logic completes
  // }

showMissingFields(): string[] {
  const missing: string[] = [];

  // كل الحقول الإلزامية بالظبط زي اللي في isFormValid()
  const requiredFields: (keyof Employee)[] = [
    'maritalStatus',
    'university',
    'faculty',
    'major',
    'schoolYouGraduatedFrom',
    'otherStudies',
    'computerSkills',        // موجود في الموديل بس مش في الـ HTML؟ لو موجود في الفورم أضيفه
    'hobbies',               // نفس الكلام
    'applicationDate',
    'positionAppliedFor',
    'previousExperiencePlace',
    'position',
    'fromDate',
    'toDate',
    'howDidYouFindUs',
    'reasonforLeavingtheJob',
    'didYouHaveAnyRelativeHere',
    'yourLevelInEnglish',
    'yourLevelInFrensh',
    'doYouSpeakAnyOtherLanguages',
    'currentJob',
    'fullName',
    'enterDate',
    'signature',
    'en_name',
    'email'
  ];

  requiredFields.forEach(field => {
    const value = (this.Data as any)[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      let label = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim();
      label = label.charAt(0).toUpperCase() + label.slice(1);
      missing.push(label);
    }
  });

  // تحقق خاص للإيميل
  if (this.Data.email && this.Data.email.trim() !== '' && !this.emailPattern.test(this.Data.email.trim())) {
    missing.push('Email (صيغة غير صحيحة)');
  }

  // تحقق خاص للراتب
  if (!this.Data.lastSalary || this.Data.lastSalary <= 0) {
    missing.push('Last Salary (يجب أن يكون أكبر من 0)');
  }

  // تحقق خاص للـ checkbox
  if (!this.Data.authorizeInvestigation) {
    missing.push('موافقة على التصريح (يجب تفعيل الـ checkbox)');
  }

  // تحقق من الخبرات السابقة (الصف الأول على الأقل)
  const firstExperience = this.experiences[0];
  if (
    !firstExperience?.previousExperiencePlace?.trim() ||
    !firstExperience?.position?.trim() ||
    !firstExperience?.fromDate ||
    !firstExperience?.toDate
  ) {
    missing.push('الخبرة السابقة (الصف الأول يجب ملؤه كاملاً)');
  }

  return missing;
}

async Save() {if (!this.isFormValid()) {
  const missingFields = this.showMissingFields();

  const Swal = await import('sweetalert2').then(m => m.default);

  await Swal.fire({
    icon: 'warning',
    title: 'بيانات ناقصة!',
    html: `
      <p class="text-right dir-rtl">يرجى تعبئة الحقول التالية قبل الحفظ:</p>
      <ul class="text-right dir-rtl list-disc mr-8 mt-4 space-y-1">
        ${missingFields.map(field => `<li><strong>${field}</strong></li>`).join('')}
      </ul>
      ${missingFields.length === 0 ? '<p class="text-red-600 mt-4">تحقق من الكود - قد يكون هناك حقل مخفي ناقص</p>' : ''}
    `,
    confirmButtonColor: '#089B41',
    confirmButtonText: 'حسنًا',
    width: '600px'
  });
  return;
}

  this.isLoading = true;

  
  // دمج الخبرات السابقة في كائن Data قبل الإرسال

  let allExperiences = this.experiences
    .filter(exp => exp.previousExperiencePlace?.trim() || exp.position?.trim())
    .map((exp, index) => 
      `${index + 1}. المكان: ${exp.previousExperiencePlace || 'غير محدد'}\n   الوظيفة: ${exp.position || 'غير محدد'}\n   من: ${exp.fromDate || 'غير محدد'} - إلى: ${exp.toDate || 'غير محدد'}`
    )
    .join('\n\n');

  this.Data.previousExperiencePlace = allExperiences || 'No previous experience.';
  this.Data.position = ''; 
  this.Data.fromDate = '';
  this.Data.toDate = '';

  // إضافة الملفات الجديدة إلى القائمة
  const initialLength = this.Data.files.length;
  for (let i = 0; i < this.SelectedFiles.length; i++) {
    this.Data.files.push(this.SelectedFiles[i]);
  }

  const Swal = await import('sweetalert2').then(m => m.default);

  try {
    let response;
    if (this.mode === 'Create') {
      response = await this.EmpServ.Add(this.Data, this.DomainName).toPromise();
    } else {
      // حذف الملفات المحذوفة أولاً في وضع التعديل
      if (this.DeletedFiles.length > 0) {
        for (const id of this.DeletedFiles) {
          await this.EmpServ.DeleteFile(id, this.DomainName).toPromise();
        }
      }
      response = await this.EmpServ.Edit(this.Data, this.DomainName).toPromise();
    }

    // رسالة النجاح المطلوبة
    await Swal.fire({
      icon: 'success',
      title: 'success',
      html: '<strong>The data was successfully sent to the Human Resources department.</strong>',
      confirmButtonColor: '#089B41',
      confirmButtonText: 'Good',
      timer: 5000,
      timerProgressBar: true
    });

    // الانتقال إلى صفحة الموظفين 
    this.moveToEmployee();

  } catch (error: any) {
    console.error('Error saving employee:', error);

    let errorMessage = 'An unexpected error occurred during saving.';

    if (error.error === 'This Email Already Exist') {
      errorMessage = 'Email address used by.';
    } else if (error.error === 'This User Name Already Exist') {
      errorMessage = 'Username already in use';
    } else if (error.error?.errors?.Password) {
      errorMessage = error.error.errors.Password[0];
    }

    await Swal.fire({
      icon: 'error',
      title: 'error',
      text: errorMessage,
      confirmButtonColor: '#089B41'
    });

    // إزالة الملفات المضافة مؤقتًا في حالة الفشل
    this.Data.files.splice(initialLength);
  } finally {
    this.isLoading = false;
  }
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




