import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatMessageService } from '../../../Services/shared/chat-message.service';
import { ChatMessage } from '../../../Models/Communication/chat-message';
import { TokenData } from '../../../Models/token-data';
import { ApiService } from '../../../Services/api.service';
import { AccountService } from '../../../Services/account.service';
import { CommonModule } from '@angular/common'; 
import { Department } from '../../../Models/Administrator/department';
import { Employee } from '../../../Models/Employee/employee';
import { Classroom } from '../../../Models/LMS/classroom';
import { Grade } from '../../../Models/LMS/grade';
import { School } from '../../../Models/school';
import { Student } from '../../../Models/student';
import { Subject } from '../../../Models/LMS/subject';
import Swal from 'sweetalert2';
import { DepartmentService } from '../../../Services/Employee/Administration/department.service';
import { SchoolService } from '../../../Services/Employee/school.service';
import { FormsModule } from '@angular/forms';
import { Section } from '../../../Models/LMS/section';
import { EmployeeService } from '../../../Services/Employee/employee.service';
import { SectionService } from '../../../Services/Employee/LMS/section.service';
import { GradeService } from '../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../Services/Employee/LMS/classroom.service';
import { StudentService } from '../../../Services/student.service';
import { SubjectService } from '../../../Services/Employee/LMS/subject.service';
import { Parent } from '../../../Models/parent';
import { ParentService } from '../../../Services/parent.service';
import { InitLoader } from '../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../Services/loading.service';

@Component({
  selector: 'app-my-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-messages.component.html',
  styleUrl: './my-messages.component.css'
})

@InitLoader()
export class MyMessagesComponent {
  DomainName: string = ''; 
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', ''); 

  otherUserID: number | null = null;
  otherUserTypeID: number | null = null;

  chatMessages:ChatMessage[]= []
  conversation:ChatMessage[]= []
  isConversationOpen = false
  isShowChat = false
  englishNameForConversation = ''
  arabicNameForConversation = ''
  connectionStatusForConversation = 0

  messageToBeSend:ChatMessage = new ChatMessage()
  messageToBeForwarded:ChatMessage = new ChatMessage()
  isLoading = false 

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

  subjectID = 0   

  private readonly allowedExtensions: string[] = [
    '.jpg', '.jpeg', '.png', '.gif',
    '.pdf', '.doc', '.docx', '.txt',
    '.xls', '.xlsx', '.csv',
    '.mp4', '.avi', '.mkv', '.mov'
  ];

  constructor(private route: ActivatedRoute, public chatMessageService:ChatMessageService, public account: AccountService, public ApiServ: ApiService, private router: Router,
    public departmentService:DepartmentService, public schoolService:SchoolService, public employeeService:EmployeeService, public sectionService:SectionService,
    private loadingService: LoadingService,
    public gradeService:GradeService, public classroomService:ClassroomService, public studentService:StudentService, public subjectService:SubjectService, public parentService:ParentService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 

    this.DomainName = this.ApiServ.GetHeader();
    
    this.loadAllMessages();
    
    this.route.queryParams.subscribe(params => {
      this.otherUserID = params['otherUserID'] ? +params['otherUserID'] : null;
      this.otherUserTypeID = params['otherUserTypeID'] ? +params['otherUserTypeID'] : null;
      this.englishNameForConversation = params['englishNameForConversation'] ? params['englishNameForConversation'] : ""
      this.arabicNameForConversation = params['arabicNameForConversation'] ? params['arabicNameForConversation'] : ""
      this.connectionStatusForConversation = params['connectionStatusForConversation'] ? params['connectionStatusForConversation'] : 0 

      if (this.otherUserID && this.otherUserTypeID) {
        this.loadSpecificChat(this.otherUserID, this.otherUserTypeID);
      }  
    });

    // Subscribe to request opened events 
    this.chatMessageService.messageOpened$.subscribe(() => {
      if(!this.isShowChat){
        this.loadAllMessages();
      }
      if (this.otherUserID && this.otherUserTypeID) {
        this.loadSpecificChat(this.otherUserID, this.otherUserTypeID);
      } 
    });
  }

  loadSpecificChat(userID: number, userTypeID: number) { 
    this.conversation = []
    this.isConversationOpen = true
    this.chatMessageService.BySenderAndReceiverID(userID, userTypeID, this.DomainName).subscribe(
      data => {
        this.conversation = data   

        if(this.isShowChat){
          // call the subscribe again for the other pages
          this.chatMessageService.notifyMessageOpened();
          this.isShowChat = false
        }
      }
    )
  }

  loadAllMessages() { 
    this.chatMessages = []
    this.chatMessageService.ByUserIDWithAllOtherUsers(this.DomainName).subscribe(
      data => {
        this.chatMessages = data 
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

  showChat(chatMessage: ChatMessage) { 
    this.messageToBeSend = new ChatMessage() 
    this.messageToBeForwarded = new ChatMessage() 
    chatMessage.unreadCount = 0
    chatMessage.seenOrNot = true
    var otherUserID = 0
    var otherUserTypeID = 0
    if(chatMessage.receiverID == this.User_Data_After_Login.id && chatMessage.receiverUserTypeName == this.User_Data_After_Login.type){
      otherUserID = chatMessage.senderID
      otherUserTypeID = chatMessage.senderUserTypeID
 
      this.englishNameForConversation = chatMessage.senderEnglishName
      this.arabicNameForConversation = chatMessage.senderArabicName
      this.connectionStatusForConversation = chatMessage.senderConnectionStatusID
    }else{
      otherUserID = chatMessage.receiverID ? chatMessage.receiverID : 0  
      otherUserTypeID = chatMessage.receiverUserTypeID ? chatMessage.receiverUserTypeID :0

      this.englishNameForConversation = chatMessage.receiverEnglishName
      this.arabicNameForConversation = chatMessage.receiverArabicName
      this.connectionStatusForConversation = chatMessage.receiverConnectionStatusID
    }

    // this will automatically loaded because of the route
    // this.loadSpecificChat(otherUserID, otherUserTypeID);
    this.isShowChat = true
    this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
            otherUserID: otherUserID,
            otherUserTypeID: otherUserTypeID,
            englishNameForConversation: this.englishNameForConversation,
            arabicNameForConversation: this.arabicNameForConversation,
            connectionStatusForConversation: this.connectionStatusForConversation
        },
        queryParamsHandling: 'merge' 
    });  
  }

  getFileType(fileLink: string): string {
    if (!fileLink) return 'unknown';
     
    const fileName = fileLink.split('/').pop()?.split('\\').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || 'unknown';
    
    return extension;
  } 

  isImageFile(fileType: string): boolean {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
    return imageTypes.includes(fileType.toLowerCase());
  }

  downloadFile(fileLink: string, fileName: string) { 
    const link = document.createElement('a');
    link.href = fileLink;
    link.download = fileName || 'download';
    link.target = '_blank';
     
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } 

  downloadImage(fileLink: string, fileName: string){
    fetch(fileLink)
      .then(response => response.blob())
      .then(blob => { 
          const blobUrl = URL.createObjectURL(blob);
           
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName || 'image.jpg';
           
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
           
          URL.revokeObjectURL(blobUrl);
      })
      .catch(error => {
          console.error('Error downloading image:', error); 
          this.downloadFile(fileLink, fileName);
      });
  }

  sendMessage(){
    if(this.User_Data_After_Login.type=='employee'){
      this.isStudentHovered = true; 
      this.getSchool()
    } else{
      this.isEmployeeHovered = true
      this.getDepartment()
    }
    document.getElementById('sendMessage')?.classList.remove('hidden');
    document.getElementById('sendMessage')?.classList.add('flex');
  }

  ForwardMessage(messag:ChatMessage){ 
    this.messageToBeForwarded.chatMessageID = messag.id

    if(this.User_Data_After_Login.type=='employee'){
      this.isStudentHovered = true; 
      this.getSchool()
    } else{
      this.isEmployeeHovered = true
      this.getDepartment()
    }
    document.getElementById('forwardMessage')?.classList.remove('hidden');
    document.getElementById('forwardMessage')?.classList.add('flex');
  }

  closeModal(){
    document.getElementById('sendMessage')?.classList.remove('flex');
    document.getElementById('sendMessage')?.classList.add('hidden');
    document.getElementById('forwardMessage')?.classList.remove('flex');
    document.getElementById('forwardMessage')?.classList.add('hidden');

    this.isLoading = false 
    
    this.departments = []
    this.employees = []
    this.schools = []
    this.sections = []
    this.grades = []
    this.classrooms = []
    this.students = []  
    this.subjects = []  
 
    this.subjectID = 0  
    
    this.messageToBeSend = new ChatMessage() 
    this.messageToBeForwarded = new ChatMessage() 

    this.isTeacherHovered = false;
    this.isEmployeeHovered = false;
    this.isStudentHovered = false;
    this.isParentHovered = false;
  }

  selectType(userID:number) {   
    this.messageToBeSend = new ChatMessage()

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
    this.messageToBeSend = new ChatMessage()

    if (userID == 1) {
      this.isEmployeeHovered = true;
      this.isTeacherHovered = false; 
      this.getDepartment()
    }
    else if (userID == 2) { 
      this.isTeacherHovered = true;
      this.isEmployeeHovered = false;
      
      if(this.User_Data_After_Login.type == "student"){
        this.messageToBeSend.userFilters.studentID = this.User_Data_After_Login.id
        this.getSubjects()
      }else{
        this.getStudentByParentID()
      }
    } 
  }

  getDepartment(){
    this.departments = [] 
    this.departmentService.Get(this.DomainName).subscribe(
      data => {
        this.departments = data 
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

  getEmployeeByDepartmentId(){
    this.employees = [] 
    this.employeeService.GetByDepartmentId(this.messageToBeSend.userFilters.departmentID, this.DomainName).subscribe(
      data => {  
        if(this.User_Data_After_Login.type == 'employee'){
          this.employees = data.filter(
            (employee) => Number(employee.id) !== Number(this.User_Data_After_Login.id)
          );
        }
      }
    )
  }

  getWhoCanAcceptMessagesFromParentAndStudentByDepartmentId(){
    this.employees = [] 
    this.employeeService.GetWhoCanAcceptMessagesFromParentAndStudentByDepartmentId(this.messageToBeSend.userFilters.departmentID, this.DomainName).subscribe(
      data => {  
        this.employees = data
      }
    )
  }

  getSection(){
    this.sections = [] 
    this.sectionService.GetBySchoolId(this.messageToBeSend.userFilters.schoolID, this.DomainName).subscribe(
      data => {
        this.sections = data
      }
    )
  }
  
  getGrade(){
    this.grades = [] 
    this.gradeService.GetBySectionId(this.messageToBeSend.userFilters.sectionID, this.DomainName).subscribe(
      data => {
        this.grades = data
      }
    )
  }
  
  getClassroom(){
    this.classrooms = [] 
    this.classroomService.GetByGradeId(this.messageToBeSend.userFilters.gradeID, this.DomainName).subscribe(
      data => {
        this.classrooms = data
      }
    )
  }
  
  getStudent(){
    this.students = [] 
    this.studentService.GetByClassID(this.messageToBeSend.userFilters.classroomID, this.DomainName).subscribe(
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
    this.subjectService.GetClassroomAndRemedialSubjectsByStudent(this.messageToBeSend.userFilters.studentID, this.DomainName).subscribe(
      data => {
        this.subjects = data
      }
    )
  }

  GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId(){
    this.employees = [] 
    this.employeeService.GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId(this.subjectID, this.messageToBeSend.userFilters.studentID, this.DomainName).subscribe(
      data => {  
        this.employees = data
      }
    )
  }
  
  getParent(){ 
    this.parentService.GetByStudentID(this.messageToBeSend.userFilters.studentID ? this.messageToBeSend.userFilters.studentID : this.messageToBeForwarded.userFilters.studentID, this.DomainName).subscribe(
      data => { 
        if(this.messageToBeSend.userFilters.studentID){
          this.SendTheMessage()
        }else{
          this.ForwardTheMessage()
        }
      },
      error => {
        Swal.fire({
          title: "This student doesn't have a parent to send the message to",
          icon: 'warning', 
          confirmButtonColor: '#089B41', 
          confirmButtonText: "OK"
        })
      }
    )
  }

  onDepartmentChange(event: Event) {
    this.employees = [] 
    this.messageToBeSend.userFilters.employeeID = 0 
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.messageToBeSend.userFilters.departmentID = Number(selectedValue)
    if (this.messageToBeSend.userFilters.departmentID) {
      if(this.User_Data_After_Login.type == "employee"){
        this.getEmployeeByDepartmentId(); 
      }else{
        this.getWhoCanAcceptMessagesFromParentAndStudentByDepartmentId()
      }
    }
  }

  onSchoolChange(event: Event) {
    this.sections = [] 
    this.grades = [] 
    this.classrooms = [] 
    this.students = [] 
    this.messageToBeSend.userFilters.sectionID = 0
    this.messageToBeSend.userFilters.gradeID = 0
    this.messageToBeSend.userFilters.classroomID = 0
    this.messageToBeSend.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.messageToBeSend.userFilters.schoolID = Number(selectedValue)
    if (this.messageToBeSend.userFilters.schoolID) {
      this.getSection(); 
    }
  }

  onSectionChange(event: Event) { 
    this.grades = [] 
    this.classrooms = [] 
    this.students = []  
    this.messageToBeSend.userFilters.gradeID = 0
    this.messageToBeSend.userFilters.classroomID = 0
    this.messageToBeSend.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.messageToBeSend.userFilters.sectionID = Number(selectedValue)
    if (this.messageToBeSend.userFilters.sectionID) {
      this.getGrade(); 
    }
  }

  onGradeChange(event: Event) {  
    this.classrooms = [] 
    this.students = []   
    this.messageToBeSend.userFilters.classroomID = 0
    this.messageToBeSend.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.messageToBeSend.userFilters.gradeID = Number(selectedValue)
    if (this.messageToBeSend.userFilters.gradeID) {
      this.getClassroom(); 
    }
  }

  onClassroomChange(event: Event) {   
    this.students = []    
    this.messageToBeSend.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.messageToBeSend.userFilters.classroomID = Number(selectedValue)
    if (this.messageToBeSend.userFilters.classroomID) {
      this.getStudent(); 
    }
  }

  onStudentChange(event: Event) {   
    this.subjects = []    
    this.employees = []    
    this.messageToBeSend.userFilters.studentID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.messageToBeSend.userFilters.studentID = Number(selectedValue)
    if (this.messageToBeSend.userFilters.studentID) {
      this.getSubjects(); 
    }
  }

  onSubjectChange(event: Event) {  
    this.employees = []    
    this.messageToBeSend.userFilters.employeeID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.subjectID = Number(selectedValue)
    if (this.subjectID) {
      this.GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId(); 
    }
  }

  onFileSelected(event: any) { 
    const input = event.target as HTMLInputElement;
    const files: FileList | null = input.files;

    if (!files || files.length === 0) return;

    if (!this.messageToBeSend.chatMessageAttachmentFiles) {
      this.messageToBeSend.chatMessageAttachmentFiles = [];
    }
    

    const maxSize = 25 * 1024 * 1024; // 25 MB
    let rejectedFiles: string[] = []; 
    let invalidTypeFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(fileExtension)) {
        invalidTypeFiles.push(file.name);
        continue;
      }

      if (file.size > maxSize) {
        rejectedFiles.push(file.name);
      } else {
        this.messageToBeSend.chatMessageAttachmentFiles.push(file);

        const reader = new FileReader();
        reader.readAsDataURL(file);
      }
    }

    if (rejectedFiles.length > 0 || invalidTypeFiles.length > 0) {
      let message = '';

      if (rejectedFiles.length > 0) {
        message += `<p>The following files exceed the 25 MB limit:</p><strong>${rejectedFiles.join('<br>')}</strong><br><br>`;
      }

      if (invalidTypeFiles.length > 0) {
        message += `<p>The following files are not allowed types:</p><strong>${invalidTypeFiles.join('<br>')}</strong>`;
      }

      Swal.fire({
        title: 'File Upload Issues',
        html: message,
        icon: 'warning',
        confirmButtonColor: '#089B41',
        confirmButtonText: 'OK'
      });
    }

    input.value = '';
  } 

  removeFile(index: number) {
    if (this.messageToBeSend.chatMessageAttachmentFiles) {
      this.messageToBeSend.chatMessageAttachmentFiles.splice(index, 1);
    }
  }

  Send(){
    if(this.messageToBeSend.message == '' && (this.messageToBeSend.chatMessageAttachmentFiles == null || this.messageToBeSend.chatMessageAttachmentFiles.length == 0)){
      Swal.fire({
        title: 'You have to send at least one item (File - Message)',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else{
      if(this.User_Data_After_Login.type == "employee"){
        switch (true) {
          case this.isEmployeeHovered:
            this.messageToBeSend.receiverUserTypeID = 1;
            break;
          case this.isStudentHovered:
            this.messageToBeSend.receiverUserTypeID = 2;
            break;
          case this.isParentHovered:
            this.messageToBeSend.receiverUserTypeID = 3;
            break; 
        }
      }else{
        this.messageToBeSend.receiverUserTypeID = 1;
      }

      if(this.isParentHovered && this.messageToBeSend.userFilters.studentID){
        this.getParent()
      }else{
        this.SendTheMessage()
      }
    } 
  }

  SendTheMessage(){
    this.isLoading = true; 
    if(this.isTeacherHovered){
      this.messageToBeSend.isTeacher = true
    }
    this.chatMessageService.Add(this.messageToBeSend, this.DomainName).subscribe(
      (result: any) => {
        this.messageToBeSend = new ChatMessage() 
        this.closeModal();
        this.loadAllMessages();
        this.otherUserID = null;
        this.otherUserTypeID = null; 
        this.conversation = []
        this.isConversationOpen = false
        this.englishNameForConversation = ''
        this.connectionStatusForConversation = 0

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
              otherUserID: this.otherUserID,
              otherUserTypeID: this.otherUserTypeID,
              englishNameForConversation: this.englishNameForConversation,
              arabicNameForConversation: this.arabicNameForConversation,
              connectionStatusForConversation: this.connectionStatusForConversation,
          },
          queryParamsHandling: 'merge' 
        }); 
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

  SendOneMessage(){ 
    this.messageToBeSend.receiverID = this.otherUserID
    this.messageToBeSend.receiverUserTypeID = this.otherUserTypeID
    
    if(this.messageToBeSend.message == '' && (this.messageToBeSend.chatMessageAttachmentFiles == null || this.messageToBeSend.chatMessageAttachmentFiles.length == 0)){
      Swal.fire({
        title: 'You have to send at least one item (File - Message)',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else{
      this.isLoading = true; 
      this.chatMessageService.SendToOneUser(this.messageToBeSend, this.DomainName).subscribe(
        (result: any) => {
          this.messageToBeSend = new ChatMessage() 
          this.closeModal();
          this.loadAllMessages(); 
          if (this.otherUserID && this.otherUserTypeID) {
            this.loadSpecificChat(this.otherUserID, this.otherUserTypeID);
          }  
  
          // call the subscribe again for the other pages
          // this.chatMessageService.notifyMessageOpened();
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

  Forward(){
    if(this.User_Data_After_Login.type == "employee"){
      switch (true) {
        case this.isEmployeeHovered:
          this.messageToBeForwarded.receiverUserTypeID = 1;
          break;
        case this.isStudentHovered:
          this.messageToBeForwarded.receiverUserTypeID = 2;
          break;
        case this.isParentHovered:
          this.messageToBeForwarded.receiverUserTypeID = 3;
          break; 
      }
    }else{
      this.messageToBeForwarded.receiverUserTypeID = 1;
    }

    if(this.isParentHovered && this.messageToBeForwarded.userFilters.studentID){
      this.getParent()
    }else{
      this.ForwardTheMessage()
    }
  }

  ForwardTheMessage(){
    this.isLoading = true; 
    if(this.isTeacherHovered){
      this.messageToBeForwarded.isTeacher = true
    }

    this.chatMessageService.Forward(this.messageToBeForwarded, this.DomainName).subscribe(
      (result: any) => {
        this.messageToBeForwarded = new ChatMessage() 
        this.closeModal();
        this.loadAllMessages();
        this.otherUserID = null;
        this.otherUserTypeID = null; 
        this.conversation = []
        this.isConversationOpen = false
        this.englishNameForConversation = ''
        this.arabicNameForConversation = ''
        this.connectionStatusForConversation = 0

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
              otherUserID: this.otherUserID,
              otherUserTypeID: this.otherUserTypeID,
              englishNameForConversation: this.englishNameForConversation,
              arabicNameForConversation: this.arabicNameForConversation,
              connectionStatusForConversation: this.connectionStatusForConversation,
          },
          queryParamsHandling: 'merge' 
        });

        // call the subscribe again for the other pages
        this.chatMessageService.notifyMessageOpened();
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
