import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenData } from '../../Models/token-data';
import { AccountService } from '../../Services/account.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { NewTokenService } from '../../Services/shared/new-token.service';
import { LogOutService } from '../../Services/shared/log-out.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../Services/shared/language.service';
import { EditPass } from '../../Models/Employee/edit-pass';
import Swal from 'sweetalert2';
import { EmployeeService } from '../../Services/Employee/employee.service';
import { ApiService } from '../../Services/api.service';
import { OctaService } from '../../Services/Octa/octa.service';
import { NotificationService } from '../../Services/Employee/Communication/notification.service';
import { Notification } from '../../Models/Communication/notification';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  dropdownOpen: boolean = false;
  selectedLanguage: string = "English";
  User_Type: string = "";
  userName: string = "";
  isPopupOpen = false;
  isNotificationPopupOpen = false;
  allTokens: { id: number, key: string; KeyInLocal: string; value: string; UserType: string }[] = [];
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  subscription: Subscription | undefined;
  PasswordError: string = ""; 
  OldPasswordError: string = ""; 
  password:string =""
  confirmPassword:string =""
  isLoading = false;
  editpasss:EditPass=new EditPass();
  DomainName: string = "";

  notifications: Notification[] = []

  constructor(private router: Router, public account: AccountService, public languageService: LanguageService, public ApiServ: ApiService, public octaService:OctaService,
    private translate: TranslateService, private communicationService: NewTokenService, private logOutService: LogOutService, private notificationService: NotificationService) { }

  ngOnInit() {
    this.GetUserInfo();
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.selectedLanguage = savedLanguage === 'ar' ? 'العربية' : 'English';
    this.getAllTokens();
    this.subscription = this.communicationService.action$.subscribe((state) => {
      this.GetUserInfo();
    });
    this.DomainName = this.ApiServ.GetHeader();
  }

  getAllTokens(): void {
    let count = 0;
    this.allTokens = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || ''); 
      if (key && key.includes('token') && key != "current_token" && key != "token") {
        if (value) {
          var user:TokenData = jwtDecode(value)
          if (user.user_Name)
            this.allTokens.push({ id: count, key: user.user_Name, KeyInLocal: key, value: value || '', UserType: user.type });
          count++;
        }

      }
    }
  }
 
  gotologin() {
    localStorage.setItem("GoToLogin", "true");
    this.router.navigateByUrl('')
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('language', language);
    this.selectedLanguage = language === 'ar' ? 'العربية' : 'English';
    this.updateDirection(language);
    this.dropdownOpen = false;

    const direction = language === 'ar' ? 'rtl' : 'ltr';
    this.languageService.setLanguage(direction);
  }
  
  updateDirection(language: string) {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction); 
    this.dropdownOpen = false;
  }

  GetUserInfo() {
    let token = localStorage.getItem("current_token") 
    this.User_Data_After_Login = this.account.Get_Data_Form_Token()
    this.User_Type = this.User_Data_After_Login.type
    this.userName = this.User_Data_After_Login.user_Name 
  }

  togglePopup(): void {
    this.getAllTokens();
    this.isPopupOpen = !this.isPopupOpen;
    this.isNotificationPopupOpen = false;
  }
  
  toggleNotificationPopup(){
    this.notifications = []
    this.isPopupOpen = false;
    this.isNotificationPopupOpen = !this.isNotificationPopupOpen;
    this.notificationService.ByUserIDFirst5(this.DomainName).subscribe(
      data => {
        this.notifications = data
      }
    )
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) { 
    const target = event.target as HTMLElement;
    const dropdowns = document.querySelectorAll('.dropdown-container');

    let clickedInsideAny = false;
    dropdowns.forEach(dropdown => {
      if (dropdown.contains(target)) {
        clickedInsideAny = true;
      }
    });

    if (!clickedInsideAny) {
      this.isPopupOpen = false;
      this.isNotificationPopupOpen = false;
    }
  }

  // Cleanup event listener
  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick);
  } 

  ChangeAccount(id: number): void {
    const tokenObject = this.allTokens.find(s => s.id === id);
    const token = localStorage.getItem("current_token")
    this.togglePopup();
    if (tokenObject && token != tokenObject.value) {
      localStorage.removeItem("current_token");
      localStorage.setItem("current_token", tokenObject.value);
      this.User_Data_After_Login = jwtDecode(tokenObject.value)
      this.userName = this.User_Data_After_Login.user_Name
      this.communicationService.sendAction(true);
      this.router.navigateByUrl("")
    }
  }

  logOutAll() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key || '');

      if (key && value && key.includes('token')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.removeItem("current_token");
    localStorage.removeItem("count");
    this.router.navigateByUrl("")

  }

  async logOut() {
    // const count = parseInt(localStorage.getItem("count") ?? "0", 10);
    // let currentTokenn = localStorage.getItem("current_token") ?? "";

    // const currentIndex = this.allTokens.findIndex(token => token.value === currentTokenn);

    // if (currentIndex === -1) {
    //   return;
    // }

    // const currentToken = this.allTokens[currentIndex];
    // localStorage.removeItem(currentToken.KeyInLocal);

    // this.allTokens.splice(currentIndex, 1);

    // if (this.allTokens.length > 0) {
    //   const newToken = this.allTokens[currentIndex] || this.allTokens[currentIndex - 1];

    //   localStorage.setItem("current_token", newToken.value);
    // } else {
    //   localStorage.removeItem("current_token");
    // }

    // localStorage.setItem("count", this.allTokens.length.toString());
    if(this.User_Type=="octa"){
      this.router.navigateByUrl("Octa/login");
    }else{
      this.router.navigateByUrl("");
    }
    this.isPopupOpen = false
    await this.logOutService.logOut();
    this.GetUserInfo();
    this.getAllTokens();
  }

  openModal() {
    document.getElementById("ChangePassModal")?.classList.remove("hidden");
    document.getElementById("ChangePassModal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("ChangePassModal")?.classList.remove("flex");
    document.getElementById("ChangePassModal")?.classList.add("hidden");

    this.PasswordError = ""; 
    this.OldPasswordError = ""; 
    this.password = ""; 
    this.confirmPassword = ""; 
    this.isLoading = false;
    this.editpasss = new EditPass();
  }

  onPasswordChange() {
    this.PasswordError = "" 
  } 

  onoldPasswordChange() {
    this.OldPasswordError = "" 
  } 
  
  Save(){ 
    if(this.password != this.confirmPassword){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Password and Confirm Password is not the same',
        confirmButtonColor: '#089B41',
      });
    }else{
      if(this.password != "" && this.editpasss.oldPassword != ""){
        this.editpasss.id=this.User_Data_After_Login.id;
        this.editpasss.password=this.password 
        this.isLoading = true
        if(this.User_Data_After_Login.type == "octa"){
          this.octaService.EditPassword(this.editpasss,this.DomainName).subscribe(()=>{
              this.closeModal()
              Swal.fire({
                icon: 'success',
                title: 'Done',
                text: 'Updatedd Successfully',
                confirmButtonColor: '#089B41',
              });
            },
            (error) => {   
              this.isLoading = false
              switch(true) {
                case error.error.errors?.Password !== undefined:
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error.errors.Password[0] || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break; 
                case error.error == "Old Password isn't right":
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: error.error,
                      confirmButtonColor: '#089B41',
                    });
                    break;
                default:
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error.errors || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;
              }
            } 
          ) 
        }else{
          this.account.EditPassword(this.editpasss,this.DomainName).subscribe(()=>{
              this.closeModal()
              Swal.fire({
                icon: 'success',
                title: 'Done',
                text: 'Updatedd Successfully',
                confirmButtonColor: '#089B41',
              });
            },
            (error) => {   
              this.isLoading = false
              switch(true) {
                case error.error.errors?.Password !== undefined:
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error.errors.Password[0] || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break; 
                case error.error == "Old Password isn't right":
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: error.error,
                      confirmButtonColor: '#089B41',
                    });
                    break;
                default:
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.error.errors || 'An unexpected error occurred',
                    confirmButtonColor: '#089B41',
                  });
                  break;
              }
            } 
          ) 
        }
      } else{
        if(this.password == ""){
          this.PasswordError = "Password Can't be Empty"
        }
        if(this.editpasss.oldPassword == ""){
          this.OldPasswordError = "Old Password Can't be Empty"
        }
      }
    }
  }

  viewAllNotifications() {
    this.router.navigateByUrl('Communication/My Notifications')
  }

  formatInsertedAt(dateString: string | Date): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) { 
      return `Today, ${time}`; 
    } else if (isYesterday) {
      return `Yesterday, ${time}`; 
    } else {
      const dateStr = date.toLocaleDateString();
      return `${dateStr}, ${time}`;
    }
  }

  getImageName(imageLink: string): string {
    const parts = imageLink.split('/');
    return parts[parts.length - 1];
  }

  viewNotification(notificationShared:Notification){

  }
}
