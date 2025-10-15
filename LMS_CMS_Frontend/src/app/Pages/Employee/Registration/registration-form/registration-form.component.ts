import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistrationFormService } from '../../../../Services/Employee/Registration/registration-form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TokenData } from '../../../../Models/token-data';
import { RegistrationForm } from '../../../../Models/Registration/registration-form';
import { RegistrationFormSubmission } from '../../../../Models/Registration/registration-form-submission';
import { RegistrationFormForFormSubmission } from '../../../../Models/Registration/registration-form-for-form-submission';
import { HttpClient } from '@angular/common/http';
import * as countries from 'countries-list';
import { School } from '../../../../Models/school';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { Grade } from '../../../../Models/LMS/grade';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { SectionService } from '../../../../Services/Employee/LMS/section.service';
import { Section } from '../../../../Models/LMS/section';
import Swal from 'sweetalert2';
import { RegistrationFormForFormSubmissionForFiles } from '../../../../Models/Registration/registration-form-for-form-submission-for-files';
import { ParentService } from '../../../../Services/parent.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { Gender } from '../../../../Models/gender';
import { GenderService } from '../../../../Services/Employee/Inventory/gender.service';
import { Nationality } from '../../../../Models/nationality';
import { NationalityService } from '../../../../Services/Octa/nationality.service';
import { CountryService } from '../../../../Services/Octa/country.service';
import { Country } from '../../../../Models/Accounting/country';
import { RegistrationFormSubmissionService } from '../../../../Services/Employee/Registration/registration-form-submission.service';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.css',
})
export class RegistrationFormComponent {
  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  RegistrationFormData: RegistrationForm = new RegistrationForm();
  registrationForm: RegistrationFormForFormSubmission =
    new RegistrationFormForFormSubmission();
  // registrationFormSubmissionEdited: RegistrationFormSubmission[] = [];
  // registrationFormSubmissionNew: RegistrationFormSubmission[] = [];


  registrationFormForFiles: RegistrationFormForFormSubmissionForFiles[] = [];
  isFormSubmitted: boolean = false;
  isGuardianEmailValid: boolean = true;
  isGuardianEmailSameAsParent: boolean = true;
  isMotherEmailValid: boolean = true;

  // nationalities = Object.values(countries.countries).map(country => ({
  //   name: country.name
  // }));

  schools: School[] = [];
  selectedSchool: number | null = null;
  Grades: Grade[] = [];
  selectedGrade: number | null = null;
  AcademicYears: AcademicYear[] = [];
  selectedAcademicYear: number | null = null;
  Sections: Section[] = [];
  Gender: Gender[] = [];
  nationalities: Nationality[] = [];
  countries: Country[] = [];

  selectedOptions: any[] = [];

  currentCategory = 1;

  emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  ageIsCompatibleWithGrade = false;

  isSuccess: boolean = false;

  parent: any = null;
  isRtl: boolean = false;
  subscription!: Subscription;
  isLoading = false;
  path: string = '';
  RegistrationParentID: number = 0;
  StudentId: number = 0;
  mode: string = 'Create'

  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx', '.csv',
    '.mp4', '.avi', '.mkv', '.mov'
  ];

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    public schoolService: SchoolService,
    public CountryServ: CountryService,
    public activeRoute: ActivatedRoute,
    public registrationFormService: RegistrationFormService,
    public router: Router,
    public parentService: ParentService,
    public NationalityServ: NationalityService,
    public RegisterationFormSubmittionServ: RegistrationFormSubmissionService,
    public http: HttpClient,
    public academicYearServce: AcadimicYearService,
    public gradeServce: GradeService,
    public sectionServce: SectionService,
    private languageService: LanguageService,
    public GenderServ: GenderService,
    private realTimeService: RealTimeNotificationServiceService,
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
      this.RegistrationParentID = Number(
        this.activeRoute.snapshot.paramMap.get('RegisterationFormParentId')
      );
      this.StudentId = Number(
        this.activeRoute.snapshot.paramMap.get('StudentId')
      );
      if (this.path == 'Edit Student') {
        this.getRegisterationFormSubmittion();
        this.mode = 'Edit'
      }
    });
    if (this.User_Data_After_Login.type == 'parent') {
      this.getParentByID();
    }

    this.getRegistrationFormData();
    this.getSchools();
    this.getGenders();
    this.getNationalities();
    this.getCountry();

    this.registrationForm.registrationFormID = 1;

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
  getParentByID() {
    this.parentService
      .GetByID(this.UserID, this.DomainName)
      .subscribe((data) => {
        this.parent = data;
      });
  }

  getRegisterationFormSubmittion() {
    this.RegisterationFormSubmittionServ.GetByRegistrationParentID(this.RegistrationParentID, this.DomainName).subscribe((data) => {
      this.registrationForm.registerationFormSubmittions = data;
            console.log(this.registrationForm.registerationFormSubmittions)
      this.selectedSchool =this.registrationForm.registerationFormSubmittions.find((s) => s.categoryFieldID == 7)?.selectedFieldOptionID ?? 0;
      if (this.selectedSchool) {
        this.getAcademicYear();
        this.getSections();
      }
      this.selectedAcademicYear = this.registrationForm.registerationFormSubmittions.find((s) => s.categoryFieldID == 8)?.selectedFieldOptionID ?? 0;
      this.selectedGrade =this.registrationForm.registerationFormSubmittions.find((s) => s.categoryFieldID == 9 )?.selectedFieldOptionID ?? 0;
    });
  }

  getTextAnswer(fieldId: number): string | null {
    const entry = this.registrationForm.registerationFormSubmittions.find(
      (e) => e.categoryFieldID === fieldId
    );

    if (this.User_Data_After_Login.type == "parent" && fieldId == 21) {
      return entry?.textAnswer ?? this.parent.email;
    } else {
      return entry?.textAnswer ?? "";
    }
  }

  getSelectedOption(fieldId: number): any | null {
    const entry = this.registrationForm.registerationFormSubmittions.find(
      (e) => e.categoryFieldID === fieldId
    );
    if (fieldId == 6 || fieldId == 14) {
      return entry?.textAnswer ?? null;
    }
    return entry?.selectedFieldOptionID ?? null;
  }

  getRegistrationFormData() {
    this.registrationFormService
      .GetById(1, this.DomainName)
      .subscribe((data) => {
        this.RegistrationFormData = data;
        this.RegistrationFormData.categories.sort(
          (a, b) =>
            (a.orderInForm ? a.orderInForm : 0) -
            (b.orderInForm ? b.orderInForm : 0)
        );
        this.RegistrationFormData.categories.forEach((element) => {
          element.fields.sort((a, b) => a.orderInForm - b.orderInForm);
        });
      });
  }

  getSchools() {
    this.schoolService.Get(this.DomainName).subscribe((data) => {
      this.schools = data;
    });
  }

  getGenders() {
    this.GenderServ.Get(this.DomainName).subscribe((data) => {
      this.Gender = data;
    });
  }

  getNationalities() {
    this.NationalityServ.Get().subscribe((data) => {
      this.nationalities = data;
    });
  }

  getCountry() {
    this.CountryServ.Get().subscribe((data) => {
      this.countries = data;
    });
  }

  onSchoolChange(event: Event) {
    this.Grades = [];
    this.AcademicYears = [];
    this.Sections = [];
    this.selectedAcademicYear = null;
    this.selectedGrade = null;
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedSchool = Number(selectedValue);
    if (this.selectedSchool) {
      this.getAcademicYear();
      this.getSections();
    }
  }

  getAcademicYear() {
    this.academicYearServce.Get(this.DomainName).subscribe((data) => {
      this.AcademicYears = data.filter((ac) => this.checkSchool(ac));
    });
  }

  getSections() {
    this.sectionServce.Get(this.DomainName).subscribe((data) => {
      this.Sections = data.filter((ac) => this.checkSchool(ac));
      this.Sections.forEach((element) => {
        this.getGrades(element.id);
      });
    });
  }

  getGrades(sectionId: number) {
    this.gradeServce
      .GetBySectionId(sectionId, this.DomainName)
      .subscribe((data) => {
        data.forEach((element) => {
          this.Grades.push(element);
        });
      });
  }

  checkSchool(el: any) {
    return el.schoolID == this.selectedSchool;
  }

  handleFileUpload(event: any, fieldId: number) { 
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

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
      return;
    }else if(file.size > 25 * 1024 * 1024) {
      Swal.fire({
        title: 'The file size exceeds the maximum limit of 25 MB.',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      }) 
      input.value = '';
      return; 
    } 
    const existingElement = this.registrationFormForFiles.find(
      (element) => element.categoryFieldID === fieldId
    );

    this.registrationFormForFiles = this.registrationFormForFiles.filter(
      (option) => !(option.categoryFieldID === fieldId)
    );

    if (file != undefined) {
      if (existingElement) {
        existingElement.selectedFile = file;
      } else {
        this.registrationFormForFiles.push({
          categoryFieldID: fieldId,
          selectedFile: file,
        });
      }
    }
  }

  FillData(event: Event, fieldId: number, fieldTypeId: number) {
    const selectedValue = (event.target as HTMLSelectElement).value;

    let answer: string | null = null;
    let option: number | null = null;

    console.log(event)
    console.log(selectedValue)
    console.log(fieldTypeId)
    console.log(fieldId)

    if (fieldTypeId == 1 ||fieldTypeId == 2 ||fieldTypeId == 3 ||
      (fieldTypeId == 7 &&(fieldId == 3 || fieldId == 5 ||fieldId == 6 ||fieldId == 7 ||fieldId == 8 ||fieldId == 9 ||fieldId == 14))) {
      answer = selectedValue;
      option = null;
    } else if (fieldTypeId == 5 || fieldTypeId == 7) {
      option = parseInt(selectedValue);
      answer = null; 
    } 

    // if (fieldId == 3 || fieldId == 5) {
    //   option = parseInt(selectedValue);
    //   answer = null;
    // } else if (fieldId == 6 || fieldId == 14) {
    //   answer = selectedValue;
    //   option = null;
    // } else if (fieldTypeId == 5 || fieldTypeId == 7) {
    //   option = parseInt(selectedValue);
    //   answer = null;
    // } else {
    //   answer = selectedValue;
    //   option = null;
    // }

    const existingElement =
      this.registrationForm.registerationFormSubmittions.find(
        (element) => element.categoryFieldID === fieldId
      );

    if (existingElement) {
      if (answer !== null) {
        existingElement.textAnswer = answer;
        existingElement.selectedFieldOptionID = null;
      } else if (option !== null) {
        existingElement.selectedFieldOptionID = option;
        existingElement.textAnswer = null;
      }
    } else {
      this.registrationForm.registerationFormSubmittions.push({
        id: 0,
        categoryFieldID: fieldId,
        registerationFormParentID: this.RegistrationParentID,
        selectedFieldOptionID: option,
        textAnswer: answer,
      });
    } 
  }

  MultiOptionDataPush(
    fieldId: number,
    fieldTypeId: number,
    optionAnswer: number
  ) {
    if (fieldTypeId == 4) {
      this.registrationForm.registerationFormSubmittions.push({
        id: 0,
        registerationFormParentID: this.RegistrationParentID,
        categoryFieldID: fieldId,
        selectedFieldOptionID: optionAnswer,
        textAnswer: null,
      });
    }
  }

  FillOptionData() {
    this.selectedOptions.forEach((element) => {
      this.MultiOptionDataPush(
        element.fieldId,
        element.fieldTypeId,
        element.optionId
      );
    });
    this.selectedOptions = [];
  }

  multiCheckBoxesHandling(
    event: Event,
    fieldId: number,
    fieldTypeId: number,
    optionId: number
  ) {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.addOptionToArray(fieldId, fieldTypeId, optionId);
    } else {
      this.removeOptionFromArray(fieldId, fieldTypeId, optionId);
    }
  }

  private addOptionToArray(
    fieldId: number,
    fieldTypeId: number,
    optionId: number
  ): void {
    const option = { fieldId, fieldTypeId, optionId };
    this.selectedOptions.push(option);
  }

  private removeOptionFromArray(
    fieldId: number,
    fieldTypeId: number,
    optionId: number
  ): void {
    this.selectedOptions = this.selectedOptions.filter(
      (option) =>
        !(
          option.fieldId === fieldId &&
          option.fieldTypeId === fieldTypeId &&
          option.optionId === optionId
        )
    );
  }

  validateNumber(event: any, field: any): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      field = '';
    }
  }

  isFieldInvalid(field: any) {
    if (this.isFormSubmitted) {
      const fieldSubmission =
        this.registrationForm.registerationFormSubmittions.find(
          (submission) => submission.categoryFieldID === field.id
        );

      const fieldSubmissionFile = this.registrationFormForFiles.find(
        (submission) => submission.categoryFieldID === field.id
      );

      let fieldData;

      if (field.isMandatory) {
        if (field.fieldTypeID !== 6) {
          fieldData = fieldSubmission;
        }

        if (field.fieldTypeID === 6) {
          fieldData = fieldSubmissionFile;
        }

        if (fieldData) {
          return false;
        }

        if (field.fieldTypeID === 4) {
          return !this.selectedOptions.some(
            (option) => option.fieldId === field.id
          );
        }

        if (field.fieldTypeID === 6) {
          return (
            !fieldSubmissionFile ||
            !fieldSubmissionFile.selectedFile ||
            !this.selectedOptions.some((option) => option.fieldId === field.id)
          );
        }

        return (
          !fieldSubmission ||
          !fieldSubmission.textAnswer ||
          !fieldSubmission.selectedFieldOptionID
        );
      }
      return false;
    }
    return false;
  }

  IsEmailValid() {
    this.registrationForm.registerationFormSubmittions.forEach((element) => {
      if (element.categoryFieldID == 21) {
        if (element.textAnswer) {
          if (!this.emailPattern.test(element.textAnswer)) {
            this.isGuardianEmailValid = false;
            return false;
          } else if (this.User_Data_After_Login.type == 'parent') {
            if (element.textAnswer != this.parent.email) {
              this.isGuardianEmailSameAsParent = false;
              return false;
            } else {
              this.isGuardianEmailSameAsParent = true;
              return true;
            }
          } else {
            this.isGuardianEmailValid = true;
            return true;
          }
        }
        return true;
      } else if (element.categoryFieldID == 28) {
        if (element.textAnswer) {
          if (!this.emailPattern.test(element.textAnswer)) {
            this.isMotherEmailValid = false;
            return false;
          } else {
            this.isMotherEmailValid = true;
            return true;
          }
        }
      }
      return true;
    });

    return true;
  }

  CheckAgeForGrade() {
    this.ageIsCompatibleWithGrade = false;

    let choosedGradeID: string | number = 0;
    let ageDate = '';
    let grade = new Grade();

    this.registrationForm.registerationFormSubmittions.forEach((element) => {
      if (element.categoryFieldID == 4) {
        ageDate = element.textAnswer ? element.textAnswer : '';
      }
      if (element.categoryFieldID == 9 && this.mode == 'Edit') {
        choosedGradeID = element.selectedFieldOptionID ? element.selectedFieldOptionID : 0;
      }
      if (element.categoryFieldID == 9 && this.mode == 'Create') {
        choosedGradeID = element.textAnswer ? element.textAnswer : 0;
      }
    });
    this.Grades.forEach((element) => {
      if (choosedGradeID == element.id) {
        grade = element;
      }
    });

    const dateToCheckObj = new Date(ageDate);
    const fromDate = new Date(grade.dateFrom);
    const toDate = new Date(grade.dateTo);

    if (dateToCheckObj >= fromDate && dateToCheckObj <= toDate) {
      this.ageIsCompatibleWithGrade = true;
    }
  }

  async Save() {
    if (this.User_Data_After_Login.type == 'parent') {
      this.registrationForm.registerationFormSubmittions.push({
        id: 0,
        registerationFormParentID: this.RegistrationParentID,
        categoryFieldID: 21,
        selectedFieldOptionID: null,
        textAnswer: this.parent.email,
      });
    }
    this.isFormSubmitted = true;
    this.isGuardianEmailValid = true;
    this.isMotherEmailValid = true;
    this.isGuardianEmailSameAsParent = true;
    this.FillOptionData();

    let valid = true;
    let EmptyFieldCat = [];

    // Validate all fields
    for (const cat of this.RegistrationFormData.categories) {
      for (const field of cat.fields) {
        if (field.isMandatory && this.isFieldInvalid(field)) {
          valid = false;
          EmptyFieldCat.push(cat.orderInForm);
        }
      }
    }

    if (valid) {
      this.IsEmailValid();
      if (this.isMotherEmailValid && this.isGuardianEmailValid && this.isGuardianEmailSameAsParent) {
        await this.CheckAgeForGrade();
        if (this.ageIsCompatibleWithGrade) {
          this.isLoading = true;
          if (this.path == 'Create Student') {
            this.registrationForm.isStudent = true;
          }
          if (this.mode == 'Create') {
            this.registrationFormService.Add(this.registrationForm, this.registrationFormForFiles, this.DomainName).subscribe((data) => {
              this.isLoading = false;
              this.DoneSuccessfully();
            },
              (error) => {
                this.isLoading = false;
                if (error.error == 'Email Already Exists') {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Warning!',
                    text: 'Guardian’s Email Already Exists',
                    confirmButtonColor: '#089B41',
                  });
                  this.goToCategory(2);
                }
              }
            );
          } else if (this.mode == 'Edit') {
            console.log(this.registrationForm.registerationFormSubmittions)
            this.RegisterationFormSubmittionServ.Edit(this.StudentId,this.RegistrationParentID, this.registrationForm.registerationFormSubmittions, this.registrationFormForFiles, this.DomainName).subscribe(
              (s) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Student updated successfully',
                    confirmButtonText: 'Okay'
                });
                this.router.navigateByUrl(`Employee/Student`);
              },
              (error) => {
            console.log(12345,error)
                this.isLoading = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: error.error,
                  confirmButtonColor: '#089B41',
                });
            })
          }
        }
        else {
          Swal.fire({
            icon: 'warning',
            title: 'Warning!',
            text: "The selected grade is not compatible with the student's age. Please choose an appropriate grade.",
            confirmButtonColor: '#089B41',
          });
          this.goToCategory(1);
        }
      } else if (
        !this.isGuardianEmailValid ||
        !this.isGuardianEmailSameAsParent
      ) {
        this.goToCategory(2);
      } else if (!this.isMotherEmailValid) {
        this.goToCategory(3);
      }
    } else {
      this.goToCategory(EmptyFieldCat[0] ? EmptyFieldCat[0] : 0);
    }
  }

  navigateToNext() {
    if (this.currentCategory < this.RegistrationFormData.categories.length) {
      this.currentCategory++;
    }
  }

  goToCategory(categoryIndex: number) {
    this.currentCategory = categoryIndex;
  }

  DoneSuccessfully() {
    if (this.path == 'Create Student') {
      this.router.navigateByUrl(`Employee/Student`);
    }
    this.RegistrationFormData = new RegistrationForm();
    this.registrationForm = new RegistrationFormForFormSubmission();
    this.registrationFormForFiles = [];

    this.isFormSubmitted = false;
    this.isGuardianEmailValid = true;
    this.isMotherEmailValid = true;

    this.schools = [];
    this.selectedSchool = null;
    this.Grades = [];
    this.selectedGrade = null;
    this.AcademicYears = [];
    this.selectedAcademicYear = null;
    this.Sections = [];

    this.selectedOptions = [];

    //////

    this.isSuccess = true;
  }

  moveToStudents() {
    this.router.navigateByUrl(`Employee/Student`)
  }
}
