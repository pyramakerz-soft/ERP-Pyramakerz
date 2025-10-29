import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisteredEmployee } from '../../../Models/Administrator/registered-employee';
import { RegisteredEmployeeService } from '../../../Services/Employee/Administration/registered-employee.service';
import { ApiService } from '../../../Services/api.service';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';

@Component({
  selector: 'app-sign-up-employee',
  standalone: true,
  imports: [FormsModule, CommonModule, RecaptchaModule, TranslateModule],
  templateUrl: './sign-up-employee.component.html',
  styleUrl: './sign-up-employee.component.css'
})
export class SignUpEmployeeComponent {
  DomainName: string = '';
  employee: RegisteredEmployee = new RegisteredEmployee()
  confirmPassword: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  validationErrors: { [key in keyof RegisteredEmployee]?: string } = {};
  isLoading = false;
  IsConfimPassEmpty = false

  // @ViewChild(RecaptchaComponent) captchaRef!: RecaptchaComponent;

  constructor(private router: Router, private languageService: LanguageService, private realTimeService: RealTimeNotificationServiceService, public registeredEmployeeService: RegisteredEmployeeService, public ApiServ: ApiService) { }

  ngOnInit() {
    this.DomainName = this.ApiServ.GetHeader();
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

  // onCaptchaResolved(token: string | null): void {
  //   if (token) {
  //     this.employee.recaptchaToken = token;
  //     this.validationErrors['recaptchaToken'] = ''
  //   } else {
  //     this.employee.recaptchaToken = '';
  //   }
  // }

  validateNumber(event: any, field: keyof RegisteredEmployee): void {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '')
    event.target.value = value;
    if (!/^\d+$/.test(value)) {
      event.target.value = '';
      if (typeof this.employee[field] === 'string') {
        this.employee[field] = '' as never;
      }
    }
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.employee) {
      if (this.employee.hasOwnProperty(key)) {
        const field = key as keyof RegisteredEmployee;
        if (!this.employee[field]) {
          if (field == "user_Name" || field == "en_name" || field == "ar_name" || field == "password" || field == "email" || field == "phone" || field == "mobile" || field == "address") {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          }
        }
      }
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (this.employee.email && !emailPattern.test(this.employee.email)) {
      this.validationErrors['email'] = 'Email is not valid';
      isValid = false;
    }

    if (this.employee.password && this.employee.password.length < 6) {
      this.validationErrors['password'] = 'Password must be between 6 and 100 characters ';
      isValid = false;
    }

    if (this.confirmPassword != "") {
      if (this.employee.password != this.confirmPassword) {
        this.validationErrors['password'] = 'Password And Confirm Password are not The Same';
        isValid = false;
      }
    } else {
      this.IsConfimPassEmpty = true
      isValid = false;
    }

    // if (this.employee.recaptchaToken == "") {
    //   this.validationErrors['recaptchaToken'] = 'You Need To Confirm That You are not a Robot';
    //   isValid = false;
    // } else {
    //   this.validationErrors['recaptchaToken'] = '';
    // }

    return isValid;
  }

  capitalizeField(field: keyof RegisteredEmployee): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof RegisteredEmployee, value: any }) {
    const { field, value } = event;
    (this.employee as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onConfirmPasswordChange() {
    this.validationErrors['password'] = '';
    this.IsConfimPassEmpty = false
  }

  SignUp() {
    if (this.isFormValid()) {
      this.isLoading = true;
      this.registeredEmployeeService.Add(this.employee, this.DomainName).subscribe(
        data => {
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'You have been registered successfully, Please Wait the Admin to confirm',
            confirmButtonColor: '#089B41',
          });

          this.employee = new RegisteredEmployee()
          this.confirmPassword = ''
          this.isLoading = false;
          // this.captchaRef.reset();
        },
        error => {
          this.employee.recaptchaToken = '';
          this.isLoading = false;
          // if (this.captchaRef) {
          //   this.captchaRef.reset();
          // }
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: {
              confirmButton: 'secondaryBg'
            }
          });
        }
      )
    }
  }

  login() {
    sessionStorage.setItem('fromEmployeeSignup', 'true');
    this.router.navigateByUrl("")
  }
}
