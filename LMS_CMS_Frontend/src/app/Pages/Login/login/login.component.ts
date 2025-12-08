import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../../Services/account.service';
import { Login } from '../../../Models/login';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenData } from '../../../Models/token-data';
// import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';
import { EmployeeService } from '../../../Services/Employee/employee.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  userInfo: Login = new Login("", "", "", "");
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  employeeImage = 'https://d393tpgdl2mqkp.cloudfront.net/public/Images/employee.png';
  studentImage = 'https://d393tpgdl2mqkp.cloudfront.net/public/Images/student.png';
  parentImage = 'https://d393tpgdl2mqkp.cloudfront.net/public/Images/parent.png';
  isRtl: boolean = false;
  subscription!: Subscription;
  isEmployeeHovered = false;
  isStudentHovered = false;
  isParentHovered = false;

  userNameError: string = "";
  passwordError: string = "";
  somthingError: string = "";

  allTokens: { id: number, key: string; KeyInLocal: string; value: string; UserType: string }[] = [];
  User_Data_After_Login2 = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  isLoading: boolean = false

  constructor(private router: Router, private languageService: LanguageService, public accountService: AccountService, private employeeService: EmployeeService, private translate: TranslateService
  ) { }

  ngOnInit() {
    window.addEventListener('popstate', this.checkLocalStorageOnNavigate);

    const fromSignup = sessionStorage.getItem('fromSignup') === 'true';
    const fromSignupEmployee = sessionStorage.getItem('fromEmployeeSignup') === 'true';
    this.selectType(fromSignup ? 'parent' : fromSignupEmployee ? 'employee' : 'student');
    sessionStorage.removeItem('fromSignup');
    sessionStorage.removeItem('fromEmployeeSignup');
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.checkLocalStorageOnNavigate); 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  // Helper method to show translated error messages
  private async showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  // Helper method to show warning messages
  private async showWarningAlert(message: string) {
    const translatedTitle = this.translate.instant('Warning');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'warning',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  checkLocalStorageOnNavigate(): void {
    const current_tokenValue = localStorage.getItem('current_token');
    if (current_tokenValue) {
      localStorage.setItem("GoToLogin", "false");
    } else {
      localStorage.setItem("GoToLogin", "true");
    }
  }

  onUserNameChange() {
    this.userNameError = ""
    this.somthingError = ""
  }

  onPasswordChange() {
    this.passwordError = ""
    this.somthingError = ""
  }

  isFormValid() {
    let isValid = true
    this.userNameError = "";
    this.passwordError = "";

    if (this.userInfo.user_Name.trim() === "" && this.userInfo.password.trim() === "") {
      isValid = false;
      this.userNameError = this.translate.instant('Username cannot be empty');
      this.passwordError = this.translate.instant('Password cannot be empty');
    } else if (this.userInfo.user_Name.trim() === "") {
      isValid = false;
      this.userNameError = this.translate.instant('Username cannot be empty');
    } else if (this.userInfo.password.trim() === "") {
      isValid = false;
      this.passwordError = this.translate.instant('Password cannot be empty');
    }
    return isValid
  }

  SignIN() {
    if (this.isFormValid()) {
      this.isLoading = true
      this.accountService.Login(this.userInfo).subscribe(
        (d: any) => {
          localStorage.removeItem("GoToLogin");
          localStorage.setItem("GoToLogin", "false");
          localStorage.removeItem("current_token");
          let count = localStorage.getItem("count")
          this.getAllTokens();

          this.accountService.isAuthenticated = true;
          const token = JSON.parse(d).token;
          let add = true;
          let Counter = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key || '');
            if (key && value && key.includes('token') && key != "current_token" && key != "token") {
              let decodedToken1: TokenData = jwtDecode(token);
              let decodedToken2: TokenData = jwtDecode(value);
              if (decodedToken1.user_Name === decodedToken2.user_Name && decodedToken1.type === decodedToken2.type)
                add = false;
            }
          }

          localStorage.setItem("current_token", token);
          if (add == true) {
            if (count === null) {
              // localStorage.removeItem("count");
              // localStorage.setItem("count", "1");
              localStorage.setItem("token 1", token);

            } else {
              let countNum = parseInt(count) + 1;
              // localStorage.setItem("count", countNum.toString());
              let T = localStorage.getItem("token " + countNum)
              if (T != null) {
                let i = countNum + 1;
                let Continue = true;
                while (Continue) {
                  let T2 = localStorage.getItem("token " + i);
                  if (T2 == null) {
                    localStorage.setItem("token " + i, token);
                    Continue = false;
                  }
                  i++;
                }
              }
              else {
                localStorage.setItem("token " + countNum, token);
              }
            }
            this.User_Data_After_Login = this.accountService.Get_Data_Form_Token(true)
          }
          else if (add == false) {
            this.User_Data_After_Login = this.accountService.Get_Data_Form_Token(true)
            const currentIndex = this.allTokens.findIndex(token => token.UserType === this.User_Data_After_Login.type && token.key === this.User_Data_After_Login.user_Name);
            const currentToken = this.allTokens[currentIndex];
            localStorage.setItem(currentToken.KeyInLocal, token);
          }

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key || '');
            if (key && value && key.includes('token') && key != "current_token" && key != "token") {
              Counter++;
            }
          }
          localStorage.removeItem("count");
          localStorage.setItem("count", Counter.toString());

          if (this.User_Data_After_Login.type == "parent") {
            this.router.navigateByUrl("/Parent")
          } else if (this.User_Data_After_Login.type == "student") {
            this.router.navigateByUrl("/Student")
          } else if (this.User_Data_After_Login.type == "employee") {
            this.router.navigateByUrl("/Employee")
          }
          this.isLoading = false


        }, (error) => {
          this.isLoading = false
          if (error.error === "UserName or Password is Invalid") {
            this.somthingError = this.translate.instant('Username or password is invalid');
          } else if (error.status == 400) {
            this.somthingError = this.translate.instant('Username, password or type may be incorrect');
          } else if (error.status == 404) {
            this.somthingError = this.translate.instant('Username, password or type may be incorrect');
          } else if (error.status === 403) {
            this.showWarningAlert(this.translate.instant('Your account has been suspended'));
          } else {
            this.somthingError = this.translate.instant('An unexpected error occurred');
          }
        }
      );
    }
  }

  getAllTokens(): void {
    let count = 0;
    this.allTokens = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || '');

      if (key && key.includes('token') && key != "current_token" && key != "token") {
        if (value) {
          this.User_Data_After_Login2 = jwtDecode(value)

          this.allTokens.push({
            id: count,
            key: this.User_Data_After_Login2.user_Name,
            KeyInLocal: key, value: value || '',
            UserType: this.User_Data_After_Login2.type
          });
          count++;
        }
      }
    }
  }

  selectType(type: string) {
    this.somthingError = ""
    this.userInfo.type = type;
    if (this.userInfo.type == "employee") {
      this.isEmployeeHovered = true;
      this.isStudentHovered = false;
      this.isParentHovered = false;
    }
    else if (this.userInfo.type == "student") {
      this.isEmployeeHovered = false;
      this.isStudentHovered = true;
      this.isParentHovered = false;
    }
    else if (this.userInfo.type == "parent") {
      this.isEmployeeHovered = false;
      this.isStudentHovered = false;
      this.isParentHovered = true;
    }

  }
  SignUp() {
    if (this.isEmployeeHovered) {
      this.router.navigateByUrl("EmployeeSignUp")
    } else if (this.isParentHovered) {
      this.router.navigateByUrl("SignUp")
    }
  }
}
