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
import { Subject as RxSubject, Subscription } from 'rxjs';
import { LanguageService } from '../../Services/shared/language.service';
import { EditPass } from '../../Models/Employee/edit-pass';
// import Swal from 'sweetalert2';
import { EmployeeService } from '../../Services/Employee/employee.service';
import { ApiService } from '../../Services/api.service';
import { OctaService } from '../../Services/Octa/octa.service';
import { NotificationService } from '../../Services/Employee/Communication/notification.service';
import { Notification } from '../../Models/Communication/notification';
import { RealTimeNotificationServiceService } from '../../Services/shared/real-time-notification-service.service';
import { RequestService } from '../../Services/shared/request.service';
import { Request } from '../../Models/Communication/request';
import { DepartmentService } from '../../Services/Employee/Administration/department.service';
import { Department } from '../../Models/Administrator/department';
import { Employee } from '../../Models/Employee/employee';
import { SchoolService } from '../../Services/Employee/school.service';
import { SectionService } from '../../Services/Employee/LMS/section.service';
import { StudentService } from '../../Services/student.service';
import { ParentService } from '../../Services/parent.service';
import { ClassroomService } from '../../Services/Employee/LMS/classroom.service';
import { GradeService } from '../../Services/Employee/LMS/grade.service';
import { SubjectService } from '../../Services/Employee/LMS/subject.service';
import { Parent } from '../../Models/parent';
import { School } from '../../Models/school'; 
import { Grade } from '../../Models/LMS/grade';
import { Classroom } from '../../Models/LMS/classroom';
import { Student } from '../../Models/student'; 
import { Subject } from '../../Models/LMS/subject';
import { Section } from '../../Models/LMS/section';
import { RealTimeRequestServiceService } from '../../Services/shared/real-time-request-service.service';
import { ChatMessageService } from '../../Services/shared/chat-message.service';
import { ChatMessage } from '../../Models/Communication/chat-message';
import { ConnectionStatus } from '../../Models/connection-status';
import { ConnectionStatusServiceService } from '../../Services/shared/connection-status-service.service';
import { RoleDetailsService } from '../../Services/Employee/role-details.service';
import { RealTimeServiceService } from '../../Services/shared/real-time-service.service';

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
  isRequuestPopupOpen = false;
  isMessagePopupOpen = false;
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
  notificationByID:Notification = new Notification()
  requests: Request[] = []
  requestByID:Request = new Request()
  requestToBeForwarded:Request = new Request()
  requestToBeSend:Request = new Request()
  chatMessages: ChatMessage[] = []
  
  private destroy$ = new RxSubject<void>();
  
  notificationsUnSeenCount = 0
  requestsUnSeenCount = 0
  messagesUnSeenCount = 0
 
  isTeacherHovered = false;
  isEmployeeHovered = false;
  isStudentHovered = false;
  isParentHovered = false;
  
  departments: Department[] = []
  employees: Employee[] = []
  schools: School[] = []
  sections:Section[] = []
  grades:Grade[] = []
  classrooms:Classroom[] = []
  students:Student[] = []
  subjects:Subject[] = []
  parent:Parent = new Parent()

  departmentID = 0
  schoolID = 0
  sectionID = 0
  gradeID = 0
  classroomID = 0
  
  subjectID = 0 

  connectionStatus:ConnectionStatus[] = []
  isStateDropdownOpen = false;
  currentState:ConnectionStatus = new ConnectionStatus()

  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx', '.csv',
    '.mp4', '.avi', '.mkv', '.mov'
  ];

  /////////////////////////////// Search Bar ///////////////////////////////
  allKeywords: string[] = []; 
  filteredKeywords: string[] = []; 
  searchText: string = ''; 
  showSuggestions: boolean = false;
 
  /////////////////////////////////////////////////////////////////////////

  constructor(private router: Router, public account: AccountService, public languageService: LanguageService, public ApiServ: ApiService, public octaService:OctaService,
    private translate: TranslateService, private communicationService: NewTokenService, private logOutService: LogOutService, public roleDetailsService:RoleDetailsService,
    private notificationService: NotificationService, public realTimeService:RealTimeServiceService, public requestService:RequestService,
    public departmentService: DepartmentService, public employeeService: EmployeeService, public schoolService: SchoolService, public sectionService: SectionService,
    public gradeService: GradeService, public classroomService: ClassroomService, public studentService: StudentService, public parentService: ParentService, 
    public subjectService: SubjectService, public chatMessageService:ChatMessageService, public connectionStatusService:ConnectionStatusServiceService) { }
  // constructor(private router: Router, public account: AccountService, public languageService: LanguageService, public ApiServ: ApiService, public octaService:OctaService,
  //   private translate: TranslateService, private communicationService: NewTokenService, private logOutService: LogOutService, public roleDetailsService:RoleDetailsService,
  //   private notificationService: NotificationService, private realTimeService: RealTimeNotificationServiceService, private realTimeRequestService: RealTimeRequestServiceService, public requestService:RequestService,
  //   public departmentService: DepartmentService, public employeeService: EmployeeService, public schoolService: SchoolService, public sectionService: SectionService,
  //   public gradeService: GradeService, public classroomService: ClassroomService, public studentService: StudentService, public parentService: ParentService, 
  //   public subjectService: SubjectService, public chatMessageService:ChatMessageService, public connectionStatusService:ConnectionStatusServiceService) { }

  ngOnInit() {
    this.GetUserInfo();
    const savedLanguage = localStorage.getItem('language') || 'en';
    this.selectedLanguage = savedLanguage === 'ar' ? 'العربية' : 'English';
    this.getAllTokens();
    this.subscription = this.communicationService.action$.subscribe((state) => {
      this.GetUserInfo();
    });
    this.DomainName = this.ApiServ.GetHeader();
    
    if(this.User_Data_After_Login.type != 'octa'){
      this.getConnectionStatus()
      this.getUserStatus()
      
      this.loadUnseenNotifications()
      this.loadUnseenRequests()
      this.loadUnseenMessages()
  
      // Subscribe to notification opened events
      this.notificationService.notificationOpened$.subscribe(() => {
        this.loadUnseenNotifications();
      });
  
      // Subscribe to request opened events
      this.requestService.requestOpened$.subscribe(() => {
        this.loadUnseenRequests();
      });
  
      // Subscribe to message opened events
      this.chatMessageService.messageOpened$.subscribe(() => {
        this.loadUnseenMessages();
      });
    }

    if(this.User_Data_After_Login.type == 'employee'){ 
      this.roleDetailsService.GetPagesNameForSearch(this.DomainName).subscribe(
        data => {
          this.allKeywords = data
        }
      )
    }else if(this.User_Data_After_Login.type == 'student'){
      this.allKeywords = [
        'Subject', 'Student Certificate', 'Certificate To Student Report', 'Students Medal', 'Lessons', 'Time Table', 'Lesson Live', 
        'The Shop', 'Cart', 'Order'
      ]
    }else if(this.User_Data_After_Login.type == 'parent'){
      this.allKeywords = [
        'Registration Form', 'Admission Test', 'Interview Registration', 'Certificate', 'Student Daily Performance Report', 'Student Issue Report', 'Lessons',
        'Students Medal', 'Student Report', 'Attendance Report', 'Conducts Report', 'Account Statement', 'Medical History', 'Medical Report', 
        'The Shop', 'Cart', 'Order', 'Appointment' ,'Meetings'
      ]
    }else if(this.User_Data_After_Login.type == 'octa'){
      this.allKeywords = [
        'Domains', 'School Types', 'School', 'Account'
      ]
    } 
  }

  getConnectionStatus() {
    this.connectionStatusService.Get(this.DomainName).subscribe(
      data => this.connectionStatus = data
    );
  }

  getUserStatus() {
    this.connectionStatusService.GetUserState(this.DomainName).subscribe(
      data => this.currentState = data
    );
  }
 
  toggleStateDropdown() {
    this.isStateDropdownOpen = !this.isStateDropdownOpen;
  }

  // Set the selected state
  selectState(state: ConnectionStatus) {
    this.connectionStatusService.ChangeConnectionStatus(state.id, this.DomainName).subscribe(
      data => {
        this.currentState = state;
      }
    )
    this.isStateDropdownOpen = false; 
  }

  loadUnseenNotifications() {
    this.notificationService.UnSeenNotificationCount(this.DomainName).subscribe(
      data => this.notificationsUnSeenCount = data
    );
  }

  loadUnseenRequests() {
    this.requestService.UnSeenRequestCount(this.DomainName).subscribe(
      data => this.requestsUnSeenCount = data
    );
  }

  loadUnseenMessages() {
    this.chatMessageService.UnSeenRequestCount(this.DomainName).subscribe(
      data => this.messagesUnSeenCount = data
    );  
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
    this.isRequuestPopupOpen = false;
    this.isMessagePopupOpen = false;
  }
  
  toggleNotificationPopup(){
    this.notifications = []
    this.isPopupOpen = false;
    this.isRequuestPopupOpen = false;
    this.isMessagePopupOpen = false;
    this.isNotificationPopupOpen = !this.isNotificationPopupOpen;
    this.notificationService.ByUserIDFirst5(this.DomainName).subscribe(
      data => {
        this.notifications = data
      }
    )
  }

  toggleRequestPopup(){
    this.requests = []
    this.isPopupOpen = false;
    this.isNotificationPopupOpen = false;
    this.isMessagePopupOpen = false;
    this.isRequuestPopupOpen = !this.isRequuestPopupOpen;
    this.requestService.ByUserIDFirst5(this.DomainName).subscribe(
      data => {
        this.requests = data
      }
    )
  }

  toggleMessagePopup(){
    this.chatMessages = []
    this.isPopupOpen = false;
    this.isNotificationPopupOpen = false;
    this.isRequuestPopupOpen = false;
    this.isMessagePopupOpen = !this.isMessagePopupOpen;
    this.chatMessageService.ByUserIDFirst5(this.DomainName).subscribe(
      data => {
        this.chatMessages = data
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
      this.isStateDropdownOpen = false
      this.isNotificationPopupOpen = false;
      this.isRequuestPopupOpen = false;
      this.isMessagePopupOpen = false;
    }
  }

  // Cleanup event listener
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.onDocumentClick);
    this.realTimeService.stopConnection();
    // this.realTimeRequestService.stopConnection();
  } 

  ChangeAccount(id: number): void {
    const tokenObject = this.allTokens.find(s => s.id === id);
    const token = localStorage.getItem("current_token")
    this.togglePopup();
    if (tokenObject && token != tokenObject.value) {
      // First stop any existing SignalR connection
      this.realTimeService.stopConnection();
      // this.realTimeRequestService.stopConnection();

      localStorage.removeItem("current_token");
      localStorage.setItem("current_token", tokenObject.value);
      this.User_Data_After_Login = jwtDecode(tokenObject.value)
      this.userName = this.User_Data_After_Login.user_Name

      // Restart SignalR connection for the new account
      setTimeout(() => {
        this.realTimeService.startConnection();
        // this.realTimeRequestService.startRequestConnection();
      }, 100);
      
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

    this.employeeService.clearMyDataCache()
  }

  async logOut() { 
    if(this.User_Type=="octa"){
      this.router.navigateByUrl("Octa/login");
    }else{
      this.router.navigateByUrl("");
    }
    this.isPopupOpen = false
    await this.logOutService.logOut();
    this.GetUserInfo();
    this.getAllTokens();
    this.employeeService.clearMyDataCache()
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
  
  async Save(){ 
    const Swal = await import('sweetalert2').then(m => m.default);

    if(this.password != this.confirmPassword){
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Password and Confirm Password is not the same',
        confirmButtonColor: '#089B41',
      });
    }else{
      if(this.password != "" ){
        this.editpasss.id=this.User_Data_After_Login.id;
        this.editpasss.password=this.password 
        this.isLoading = true
        if(this.User_Data_After_Login.type == "octa"){
          this.octaService.EditPassword(this.editpasss,this.DomainName).subscribe(()=>{
              this.closeModal()
              Swal.fire({
                icon: 'success',
                title: 'Done',
                text: 'Updated Successfully',
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
                text: 'Updated Successfully',
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
        // if(this.editpasss.oldPassword == ""){
        //   this.OldPasswordError = "Old Password Can't be Empty"
        // }
      }
    }
  }

  viewAllNotifications() {
    this.router.navigateByUrl('CommunicationModule/My Notifications')
  }

  viewAllRequests() {
    this.router.navigateByUrl('CommunicationModule/My Requests')
  }

  viewAllMessages() {
    this.router.navigateByUrl('CommunicationModule/My Messages')
  }
  
  moveToMessageInMyChat(chatMessage: ChatMessage) {
    this.router.navigateByUrl('CommunicationModule/My Messages')
    if(chatMessage.senderID == this.User_Data_After_Login.id && chatMessage.senderUserTypeName == this.User_Data_After_Login.type){
      this.router.navigate(['CommunicationModule/My Messages'], {
        queryParams: {
          otherUserID: chatMessage.receiverID,
          otherUserTypeID: chatMessage.receiverUserTypeID,
          englishNameForConversation: chatMessage.receiverEnglishName,
          arabicNameForConversation: chatMessage.receiverArabicName,
          connectionStatusForConversation: chatMessage.receiverConnectionStatusID
        }
      }); 
    }else{
      this.router.navigate(['CommunicationModule/My Messages'], {
        queryParams: {
          otherUserID: chatMessage.senderID,
          otherUserTypeID: chatMessage.senderUserTypeID,
          englishNameForConversation: chatMessage.senderEnglishName,
          arabicNameForConversation: chatMessage.senderArabicName,
          connectionStatusForConversation: chatMessage.senderConnectionStatusID
        }
      });
    }
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

  getFileName(imageLink: string): string {
    const parts = imageLink.split('/');
    return parts[parts.length - 1];
  }

  viewNotification(notificationShared:Notification){
    this.notificationByID = new Notification()
    this.notificationService.ByUserIDAndNotificationSharedByID(notificationShared.id, this.DomainName).subscribe(
      data => {
        this.notificationByID = data
        document.getElementById("NotificationModal")?.classList.remove("hidden");
        document.getElementById("NotificationModal")?.classList.add("flex");
        // call the subscribe again for the other pages
        this.notificationService.notifyNotificationOpened(); 
      }
    )
  } 

  viewRequest(request:Request){
    this.requestByID = new Request()
    this.requestService.ByUserIDAndRequestID(request.id, this.DomainName).subscribe(
      data => {
        this.requestByID = data
        document.getElementById("RequestModal")?.classList.remove("hidden");
        document.getElementById("RequestModal")?.classList.add("flex"); 
        // call the subscribe again for the other pages
        this.requestService.notifyRequestOpened(); 
      }
    )
  }

  LinkOpened(notificationShared:Notification){ 
    this.notificationService.LinkOpened(notificationShared.id, this.DomainName).subscribe(
      data => { 
        this.loadUnseenNotifications() 
        // call the subscribe again for the other pages
        this.notificationService.notifyNotificationOpened(); 
        notificationShared.seenOrNot = true
      }
    )
  } 

  closeNotificationModal() {
    document.getElementById("NotificationModal")?.classList.remove("flex");
    document.getElementById("NotificationModal")?.classList.add("hidden"); 
  }

  closeRequestModal() {
    document.getElementById("RequestModal")?.classList.remove("flex");
    document.getElementById("RequestModal")?.classList.add("hidden"); 
  }

  async Accept(request:Request){
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: 'Are you sure you want to Accept this Request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Accept',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.requestService.Accept(request.id, this.DomainName).subscribe((d) => {
          request.approvedOrNot=true
          request.seenOrNot=true
          // call the subscribe again for the other pages
          this.requestService.notifyRequestOpened(); 
        });
      }
    });
  }

  async Decline(request:Request){
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: 'Are you sure you want to Decline this Request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Decline',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.requestService.Decline(request.id, this.DomainName).subscribe((d) => {
          request.approvedOrNot=false
          request.seenOrNot=true
          // call the subscribe again for the other pages
          this.requestService.notifyRequestOpened(); 
        });
      }
    });
  }

  Forward(request:Request){
    this.requestToBeForwarded.requestID = request.id
    this.getDepartment()
    document.getElementById('Forward_Modal')?.classList.remove('hidden');
    document.getElementById('Forward_Modal')?.classList.add('flex');
  }

  getDepartment(){
    this.departments = [] 
    this.departmentService.Get(this.DomainName).subscribe(
      data => {
        this.departments = data
      }
    )
  }
 
  onDepartmentChange(event: Event) {
    this.employees = [] 
    this.requestToBeSend.receiverID = 0
    this.requestToBeForwarded.forwardToID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.departmentID = Number(selectedValue)
    if (this.departmentID) {
      if(this.User_Data_After_Login.type == "employee"){
        this.getWhoCanAcceptRequestsFromEmployeeByDepartmentId(); 
      }else{
        this.getWhoCanAcceptRequestsFromParentAndStudentByDepartmentId()
      }
    }
  }
 
  async SendForward(){
    if(this.requestToBeForwarded.forwardToID == 0 || this.requestToBeForwarded.forwardToID == null){
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'You have to select an employee to forward the request to',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else{
      this.isLoading = true; 
      this.requestService.Forward(this.requestToBeForwarded, this.DomainName).subscribe(
        (result: any) => { 
          this.closeForwardModal(); 
          // call the subscribe again for the other pages
          this.requestService.notifyRequestOpened(); 
        },
        async error => {
          const Swal = await import('sweetalert2').then(m => m.default);

          Swal.fire({
            icon: 'error',
            text: error.error,
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' },
          });
          this.isLoading = false;
        }
      ); 
    } 
  }

  closeForwardModal(){
    document.getElementById('Forward_Modal')?.classList.remove('flex');
    document.getElementById('Forward_Modal')?.classList.add('hidden');

    this.isLoading = false

    this.departments = []
    this.employees = []

    this.departmentID = 0
    this.requestToBeForwarded = new Request() 
  }
 

  sendRequest(){
    if(this.User_Data_After_Login.type=='employee'){
      this.isStudentHovered = true; 
      this.getSchool()
    } else{
      this.isEmployeeHovered = true
      this.getDepartment()
    }
    document.getElementById('SendRequest_Modal')?.classList.remove('hidden');
    document.getElementById('SendRequest_Modal')?.classList.add('flex');
  } 

  getSchool(){
    this.schools = [] 
    this.schoolService.Get(this.DomainName).subscribe(
      data => {
        this.schools = data
      }
    )
  }

  getWhoCanAcceptRequestsFromEmployeeByDepartmentId(){
    this.employees = [] 
    this.employeeService.GetWhoCanAcceptRequestsFromEmployeeByDepartmentId(this.departmentID, this.DomainName).subscribe(
      data => {  
        if(this.User_Data_After_Login.type == 'employee'){
          this.employees = data.filter(
            (employee) => Number(employee.id) !== Number(this.User_Data_After_Login.id)
          );
        }
      }
    )
  }

  getWhoCanAcceptRequestsFromParentAndStudentByDepartmentId(){
    this.employees = [] 
    this.employeeService.GetWhoCanAcceptRequestsFromParentAndStudentByDepartmentId(this.departmentID, this.DomainName).subscribe(
      data => {  
        this.employees = data
      }
    )
  }

  GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId(){
    this.employees = [] 
    this.employeeService.GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId(this.subjectID, this.requestToBeSend.studentID, this.DomainName).subscribe(
      data => {  
        this.employees = data
      }
    )
  }

  getSection(){
    this.sections = [] 
    this.sectionService.GetBySchoolId(this.schoolID, this.DomainName).subscribe(
      data => {
        this.sections = data
      }
    )
  }
  
  getGrade(){
    this.grades = [] 
    this.gradeService.GetBySectionId(this.sectionID, this.DomainName).subscribe(
      data => {
        this.grades = data
      }
    )
  }
  
  getClassroom(){
    this.classrooms = [] 
    this.classroomService.GetByGradeId(this.gradeID, this.DomainName).subscribe(
      data => {
        this.classrooms = data
      }
    )
  }
  
  getStudent(){
    this.students = [] 
    this.studentService.GetByClassID(this.classroomID, this.DomainName).subscribe(
      data => {
        this.students = data
      }
    )
  }
  
  getStudentByParentID(){
    this.students = [] 
    this.studentService.Get_By_ParentID(this.User_Data_After_Login.id, this.DomainName).subscribe(
      data => {
        this.students = data
      }
    )
  }
  
  getSubjects(){
    this.subjects = [] 
    this.subjectService.GetClassroomAndRemedialSubjectsByStudent(this.requestToBeSend.studentID, this.DomainName).subscribe(
      data => {
        this.subjects = data
      }
    )
  }
  
  getParent(){
    this.parent = new Parent()
    this.parentService.GetByStudentID(this.requestToBeSend.receiverID, this.DomainName).subscribe(
      data => {
        this.parent = data
        this.requestToBeSend.receiverID = this.parent.id
        this.SendTheRequest()
      },
      async error => {
        const Swal = await import('sweetalert2').then(m => m.default);

        Swal.fire({
          title: "This student doesn't have a parent to send the request to",
          icon: 'warning', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: "OK"
        })
      }
    )
  } 

  onSchoolChange(event: Event) {
    this.sections = [] 
    this.grades = [] 
    this.classrooms = [] 
    this.students = [] 
    this.sectionID = 0
    this.gradeID = 0
    this.classroomID = 0
    this.requestToBeSend.receiverID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.schoolID = Number(selectedValue)
    if (this.schoolID) {
      this.getSection(); 
    }
  }

  onSectionChange(event: Event) { 
    this.grades = [] 
    this.classrooms = [] 
    this.students = []  
    this.gradeID = 0
    this.classroomID = 0
    this.requestToBeSend.receiverID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.sectionID = Number(selectedValue)
    if (this.sectionID) {
      this.getGrade(); 
    }
  }

  onGradeChange(event: Event) {  
    this.classrooms = [] 
    this.students = []   
    this.classroomID = 0
    this.requestToBeSend.receiverID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.gradeID = Number(selectedValue)
    if (this.gradeID) {
      this.getClassroom(); 
    }
  }

  onClassroomChange(event: Event) {   
    this.students = []    
    this.requestToBeSend.receiverID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.classroomID = Number(selectedValue)
    if (this.classroomID) {
      this.getStudent(); 
    }
  }

  onStudentChange(event: Event) {   
    this.subjects = []    
    this.employees = []    
    this.requestToBeSend.receiverID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.requestToBeSend.studentID = Number(selectedValue)
    if (this.requestToBeSend.studentID) {
      this.getSubjects(); 
    }
  }

  onSubjectChange(event: Event) {  
    this.employees = []    
    this.requestToBeSend.receiverID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.subjectID = Number(selectedValue)
    if (this.subjectID) {
      this.GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId(); 
    }
  }

  closeSendRequestModal(){
    document.getElementById('SendRequest_Modal')?.classList.remove('flex');
    document.getElementById('SendRequest_Modal')?.classList.add('hidden');

    this.isLoading = false 
    
    this.departments = []
    this.employees = []
    this.schools = []
    this.sections = []
    this.grades = []
    this.classrooms = []
    this.students = []
    this.subjects = []

    this.departmentID = 0 
    this.schoolID = 0
    this.sectionID = 0
    this.gradeID = 0
    this.classroomID = 0
    this.subjectID = 0

    this.parent = new Parent()
    this.requestToBeSend = new Request()

    this.isTeacherHovered = false;
    this.isEmployeeHovered = false;
    this.isStudentHovered = false;
    this.isParentHovered = false;
  } 

  selectType(userID:number) {   
    this.requestToBeSend = new Request()

    if (userID == 1) {
      this.isEmployeeHovered = true;
      this.isStudentHovered = false;
      this.isParentHovered = false;
      this.getDepartment()
    }
    else if (userID == 2) {
      this.isEmployeeHovered = false;
      this.isStudentHovered = true;
      this.isParentHovered = false;
      this.getSchool()
    }
    else if (userID == 3) {
      this.isEmployeeHovered = false;
      this.isStudentHovered = false;
      this.isParentHovered = true;
      this.getSchool()
    } 
  }

  selectTypeForStudentAndParent(userID:number) {   
    this.requestToBeSend = new Request()

    if (userID == 1) {
      this.isEmployeeHovered = true;
      this.isTeacherHovered = false; 
      this.getDepartment()
    }
    else if (userID == 2) { 
      this.isTeacherHovered = true;
      this.isEmployeeHovered = false;
      
      if(this.User_Data_After_Login.type == "student"){
        this.requestToBeSend.studentID = this.User_Data_After_Login.id
        this.getSubjects()
      }else{
        this.getStudentByParentID()
      }
    } 
  }

  async Send(){
    if(this.requestToBeSend.message == ''){
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'You have to insert the message',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else if(this.requestToBeSend.receiverID == 0 || this.requestToBeSend.receiverID == null){
      const Swal = await import('sweetalert2').then(m => m.default);

      Swal.fire({
        title: 'You have to choose the user to request from',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else{
      if(this.User_Data_After_Login.type == "employee"){
        switch (true) {
          case this.isEmployeeHovered:
            this.requestToBeSend.receiverUserTypeID = 1;
            break;
          case this.isStudentHovered:
            this.requestToBeSend.receiverUserTypeID = 2;
            break;
          case this.isParentHovered:
            this.requestToBeSend.receiverUserTypeID = 3;
            break; 
        }
      }else{
        this.requestToBeSend.receiverUserTypeID = 1;
      }
 
      if(this.isParentHovered){
        this.getParent()
      }else{
        this.SendTheRequest()
      }
    } 
  }

  SendTheRequest(){ 
    this.isLoading = true; 
    this.requestService.Add(this.requestToBeSend, this.DomainName).subscribe(
      (result: any) => { 
        this.closeSendRequestModal(); 
        // call the subscribe again for the other pages
        this.requestService.notifyRequestOpened(); 
      },
      async error => {
        this.isLoading = false;

        const Swal = await import('sweetalert2').then(m => m.default);

        Swal.fire({
          title: error.error,
          icon: 'error', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: "OK"
        })
      }
    ); 
  } 

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(fileExtension)) {
        const Swal = await import('sweetalert2').then(m => m.default);

        Swal.fire({
          title: 'Invalid file type',
          html: `The file <strong>${file.name}</strong> is not an allowed type. Allowed types are:<br><strong>${this.allowedExtensions.join(', ')}</strong>`,
          icon: 'warning',
          confirmButtonColor: '#089B41',
          confirmButtonText: "OK"
        });
        this.requestToBeSend.fileFile = null;
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        const Swal = await import('sweetalert2').then(m => m.default);

        Swal.fire({
          title: 'The file size exceeds the maximum limit of 25 MB.',
          icon: 'warning', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: "OK"
        })
        this.requestToBeSend.fileFile = null;
        return; 
      } else{
        this.requestToBeSend.fileFile = file;  

        const reader = new FileReader();
        reader.readAsDataURL(file);
      }
    }
    
    input.value = '';
  } 



  /////////////////////////////// Search Bar /////////////////////////////// 
  onFocus() {
    this.showSuggestions = true;
    this.filteredKeywords = [...this.allKeywords];
  }
 
  onSearchChange() {
    const search = this.searchText.toLowerCase();
    this.filteredKeywords = this.allKeywords.filter(item =>
      item.toLowerCase().includes(search)
    );
  }
 
  selectKeyword(keyword: string) {
    this.searchText = keyword;
    this.showSuggestions = false;
    if(this.User_Data_After_Login.type == 'octa'){
      this.router.navigateByUrl(`Octa/${keyword}`); 
    }else if(this.User_Data_After_Login.type == 'employee'){
      this.router.navigateByUrl(`Employee/${keyword}`); 
    }else if(this.User_Data_After_Login.type == 'student'){
      this.router.navigateByUrl(`Student/${keyword}`); 
    }else if(this.User_Data_After_Login.type == 'parent'){
      this.router.navigateByUrl(`Parent/${keyword}`); 
    }
    this.searchText = '';
  }

  // hide dropdown when clicking outside
  onBlur() {
    setTimeout(() => this.showSuggestions = false, 200);
  }
}
