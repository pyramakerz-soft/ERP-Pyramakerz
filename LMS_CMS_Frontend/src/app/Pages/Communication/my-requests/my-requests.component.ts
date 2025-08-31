import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Request } from '../../../Models/Communication/request';
import Swal from 'sweetalert2';
import { TokenData } from '../../../Models/token-data';
import { AccountService } from '../../../Services/account.service';
import { ApiService } from '../../../Services/api.service';
import { RequestService } from '../../../Services/shared/request.service';
import { ActivatedRoute } from '@angular/router';
import { DepartmentService } from '../../../Services/Employee/Administration/department.service';
import { Department } from '../../../Models/Administrator/department';
import { SchoolService } from '../../../Services/Employee/school.service';
import { School } from '../../../Models/school';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../../Models/Employee/employee';
import { EmployeeService } from '../../../Services/Employee/employee.service';
import { ClassroomService } from '../../../Services/Employee/LMS/classroom.service';
import { GradeService } from '../../../Services/Employee/LMS/grade.service';
import { SectionService } from '../../../Services/Employee/LMS/section.service';
import { Section } from '../../../Models/LMS/section';
import { Classroom } from '../../../Models/LMS/classroom';
import { Grade } from '../../../Models/LMS/grade';
import { Student } from '../../../Models/student';
import { StudentService } from '../../../Services/student.service';
import { ParentService } from '../../../Services/parent.service';
import { Parent } from '../../../Models/parent';
import { SubjectService } from '../../../Services/Employee/LMS/subject.service';
import { Subject } from '../../../Models/LMS/subject';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';
import { firstValueFrom, Subscription } from 'rxjs';
@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.css'
})
export class MyRequestsComponent {
  requests: Request[] = []
  requestByID:Request = new Request()
  requestToBeSend:Request = new Request()
  requestToBeForwarded:Request = new Request()
  DomainName: string = ''; 
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');  
  
  activeTab:string = "sent"
  isLoading = false;
  
  isTeacherHovered = false;
  isEmployeeHovered = false;
  isStudentHovered = false;
  isParentHovered = false;
  
  departmentsToChooseFrom: Department[] = []
  employees: Employee[] = []
  schools: School[] = []
  sections:Section[] = []
  grades:Grade[] = []
  classrooms:Classroom[] = []
  students:Student[] = []
  subjects:Subject[] = []
  parent:Parent = new Parent()
  isRtl: boolean = false;
  subscription!: Subscription;
  departmentID = 0
  schoolID = 0
  sectionID = 0
  gradeID = 0
  classroomID = 0
 
  subjectID = 0  

  private isLocalNotification = false;

  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx', '.csv',
    '.mp4', '.avi', '.mkv', '.mov'
  ];

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,  
    public activeRoute: ActivatedRoute, 
    public departmentService: DepartmentService, 
    public schoolService: SchoolService, 
    public employeeService: EmployeeService, 
    public sectionService: SectionService,
    public gradeService: GradeService,
    public classroomService: ClassroomService,
    public studentService: StudentService,
    public parentService: ParentService,
    public subjectService: SubjectService,
    public requestService: RequestService,    
    private languageService: LanguageService,
    private realTimeService: RealTimeNotificationServiceService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 

    this.DomainName = this.ApiServ.GetHeader();
 
    this.loadSentRequests() 
    
    // Subscribe to request opened events 
    this.requestService.requestOpened$.subscribe(() => {
      if (this.isLocalNotification) {
        return; // Skip if the notification came from this component
      }

      if (this.activeTab == 'sent') {
        this.loadSentRequests();
      } else if (this.activeTab == 'received') {
        this.loadReceivedRequests();
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

  loadSentRequests(){
    this.requestByID = new Request()
    this.activeTab = 'sent';
    this.requests = []
    this.requestService.GetSentOnesByUserID(this.DomainName).subscribe(
      data => { 
        this.requests = data 
      }
    ) 
  }

  loadReceivedRequests(){
    this.requestByID = new Request()
    this.activeTab = 'received';
    this.requests = []
    this.requestService.GetReceivedOnesByUserID(this.DomainName).subscribe(
      data => { 
        this.requests = data 
      }
    ) 
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

  viewRequest(request:Request){
    this.requestByID = new Request()
    this.requestService.ByUserIDAndRequestID(request.id, this.DomainName).subscribe(
      data => {
        if(request.receiverID == this.User_Data_After_Login.id && request.receiverUserTypeName == this.User_Data_After_Login.type){
          request.seenOrNot = true
        }
        this.requestByID = data 

        // call the subscribe again for the other pages
        this.isLocalNotification = true;
        this.requestService.notifyRequestOpened();
        this.isLocalNotification = false                          
      }
    ) 
  }

  Accept(request:Request){
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
          this.isLocalNotification = true;
          this.requestService.notifyRequestOpened();
          this.isLocalNotification = false  
        });
      }
    });
  }
  
  Decline(request:Request){
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
          this.isLocalNotification = true;
          this.requestService.notifyRequestOpened();
          this.isLocalNotification = false  
        });
      }
    });
  }

  Forward(request:Request){
    this.getDepartment() 
    this.requestToBeForwarded.requestID = request.id
    document.getElementById('Forward_Modal_InMyRequest')?.classList.remove('hidden');
    document.getElementById('Forward_Modal_InMyRequest')?.classList.add('flex');
  }

  sendRequest(){
    if(this.User_Data_After_Login.type=='employee'){
      this.isStudentHovered = true; 
      this.getSchool()
    } else{
      this.isEmployeeHovered = true
      this.getDepartment()
    }
    document.getElementById('Add_Modal_InMyRequest')?.classList.remove('hidden');
    document.getElementById('Add_Modal_InMyRequest')?.classList.add('flex');
  }

  getDepartment(){
    this.departmentsToChooseFrom = [] 
    this.departmentService.Get(this.DomainName).subscribe(
      data => {
        this.departmentsToChooseFrom = data 
      }
    )
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
      error => {
        Swal.fire({
          title: "This student doesn't have a parent to send the request to",
          icon: 'warning', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: "OK"
        })
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

  closeModal(){
    document.getElementById('Add_Modal_InMyRequest')?.classList.remove('flex');
    document.getElementById('Add_Modal_InMyRequest')?.classList.add('hidden');

    this.isLoading = false 
    
    this.departmentsToChooseFrom = []
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
  
  closeForwardModal(){
    document.getElementById('Forward_Modal_InMyRequest')?.classList.remove('flex');
    document.getElementById('Forward_Modal_InMyRequest')?.classList.add('hidden');

    this.isLoading = false

    this.departmentsToChooseFrom = []
    this.employees = []

    this.departmentID = 0
    this.requestToBeForwarded = new Request() 
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

  Send(){
    if(this.requestToBeSend.message == ''){
      Swal.fire({
        title: 'You have to insert the message',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else if(this.requestToBeSend.receiverID == 0 || this.requestToBeSend.receiverID == null){
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
        this.requestByID = new Request()
        this.activeTab = "sent"
        this.closeModal();
        this.loadSentRequests()
        // call the subscribe again for the other pages
        this.isLocalNotification = true;
        this.requestService.notifyRequestOpened();
        this.isLocalNotification = false  
      },
      error => {
        this.isLoading = false;
      }
    ); 
  }

  SendForward(){
    if(this.requestToBeForwarded.forwardToID == 0 || this.requestToBeForwarded.forwardToID == null){
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
          this.requestByID = new Request()
          this.activeTab = "received"
          this.closeForwardModal();
          this.loadReceivedRequests()
          // call the subscribe again for the other pages
          this.isLocalNotification = true;
          this.requestService.notifyRequestOpened();
          this.isLocalNotification = false  
        },
        error => {
          this.isLoading = false;
          Swal.fire({
            title: error.error,
            icon: 'error', 
            confirmButtonColor: '#089B41', 
            confirmButtonText: "OK"
          })
        }
      ); 
    } 
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
 
      if (!this.allowedExtensions.includes(fileExtension)) {
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
}
