import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { RegisterationFormTestService } from '../../../../Services/Employee/Registration/registeration-form-test.service';
import { RegisterationFormTest } from '../../../../Models/Registration/registeration-form-test';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestWithRegistrationForm } from '../../../../Models/Registration/test-with-registration-form';
import { TestService } from '../../../../Services/Employee/Registration/test.service';
import { Test } from '../../../../Models/Registration/test';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-registration-confirmation-test-details',
  standalone: true,
  imports: [CommonModule , FormsModule , TranslateModule],
  templateUrl: './registration-confirmation-test-details.component.html',
  styleUrl: './registration-confirmation-test-details.component.css'
})
export class RegistrationConfirmationTestDetailsComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  DomainName: string = '';
  UserID: number = 0;
  path: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  mode: string = 'Create'

  RegisterFormParentID: number = 0;
  Data: TestWithRegistrationForm[] = [];
  test: Test = new Test()
  RegesterForm: RegisterationFormTest = new RegisterationFormTest();
  isModalVisible: boolean = false;

  StudentName: string = ""
  StudentEnName: string = ""
  StudentArName: string = ""

  MarkIsEmpty : boolean=false;
  isLoading=false

  constructor(
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
     private languageService: LanguageService,
    private menuService: MenuService,
    public EditDeleteServ: DeleteEditPermissionService,
    private router: Router,
    public testServ: TestService,
    public registrationserv: RegisterationFormTestService,
    private realTimeService: RealTimeNotificationServiceService,
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
      this.RegisterFormParentID = Number(this.activeRoute.snapshot.paramMap.get('id'))
      this.GetAllData();
    });


    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName("Registration Confirmation", items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
      }
    });


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

  validateNumber(event: any, field: keyof RegisterationFormTest): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = ''; 
      if (typeof this.RegesterForm[field] === 'string') {
        this.RegesterForm[field] = '' as never;  
      }
    }
  }

  GetAllData() {
    this.Data=[]
    this.testServ.GetByRegistrationFormParentIDFromEmployee(this.RegisterFormParentID, this.DomainName).subscribe((d:any) => {
      this.Data = d.tests;
      this.StudentName=d.studentName
      this.StudentEnName=d.studentEnName
      this.StudentArName=d.studentArName
    })
  }
 
  Save() { 
    if(!this.RegesterForm.mark){
      this.MarkIsEmpty=true
    }else if(Number(this.RegesterForm.mark) > Number(this.RegesterForm.totalMark)){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Assigned Mark Shouldn't be Greater than Total Mark For Test ${this.test.totalMark}`,
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' },
      });
    }else{
      this.isLoading=true
      this.registrationserv.Edit(this.RegesterForm, this.DomainName).subscribe(() => {
        this.GetAllData();
        this.closeModal();
        this.isLoading=false
      },
      error => {
        this.isLoading=false
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error,
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
      })
    }
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  moveToRegistrationConfirmation() {
    this.router.navigateByUrl(`Employee/Registration Confirmation`)
  }

  Edit(row: TestWithRegistrationForm) { 
    this.mode = 'Edit';
    this.RegesterForm.id = row.registrationTestID ;
    this.RegesterForm.visibleToParent = row.registrationTestVisibleToParent ;
    this.RegesterForm.mark = row.registrationTestMark ;
    this.RegesterForm.totalMark = row.totalMark ;
    this.RegesterForm.registerationFormParentID = this.RegisterFormParentID ;
    this.RegesterForm.testID = row.id ;
    this.RegesterForm.stateID = row.registrationTestStateId ;

    this.openModal();
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  View(row:TestWithRegistrationForm){
    this.router.navigateByUrl(`Employee/Registration Confirmation Test/${row.registrationTestID}/${this.RegisterFormParentID}/${row.id}`)
  }

}
