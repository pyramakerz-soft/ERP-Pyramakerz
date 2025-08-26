import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatMessageService } from '../../../Services/shared/chat-message.service';
import { ChatMessage } from '../../../Models/Communication/chat-message';
import { TokenData } from '../../../Models/token-data';
import { ApiService } from '../../../Services/api.service';
import { AccountService } from '../../../Services/account.service';
import { CommonModule } from '@angular/common';
import { Section } from 'jspdf-autotable';
import { Department } from '../../../Models/Administrator/department';
import { Employee } from '../../../Models/Employee/employee';
import { Classroom } from '../../../Models/LMS/classroom';
import { Grade } from '../../../Models/LMS/grade';
import { School } from '../../../Models/school';
import { Student } from '../../../Models/student';
import { Subject } from '../../../Models/LMS/subject';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-my-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-messages.component.html',
  styleUrl: './my-messages.component.css'
})
export class MyMessagesComponent {
  DomainName: string = ''; 
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', ''); 

  otherUserID: number | null = null;
  otherUserTypeID: number | null = null;

  chatMessages:ChatMessage[]= []
  conversation:ChatMessage[]= []
  isConversationOpen = false
  englishNameForConversation = ''
  arabicNameForConversation = ''

  messageToBeSend:ChatMessage = new ChatMessage()
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

  constructor(private route: ActivatedRoute, public chatMessageService:ChatMessageService, public account: AccountService, public ApiServ: ApiService, private router: Router) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 

    this.DomainName = this.ApiServ.GetHeader();
    
    this.loadAllMessages();
    
    this.route.queryParams.subscribe(params => {
      this.otherUserID = params['otherUserID'] ? +params['otherUserID'] : null;
      this.otherUserTypeID = params['otherUserTypeID'] ? +params['otherUserTypeID'] : null;
      this.englishNameForConversation = params['englishNameForConversation'] ? params['englishNameForConversation'] : ""
      this.arabicNameForConversation = params['arabicNameForConversation'] ? params['arabicNameForConversation'] : ""
       
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
    var otherUserID = 0
    var otherUserTypeID = 0
    if(chatMessage.receiverID == this.User_Data_After_Login.id && chatMessage.receiverUserTypeName == this.User_Data_After_Login.type){
      otherUserID = chatMessage.senderID
      otherUserTypeID = chatMessage.senderUserTypeID
 
      this.englishNameForConversation = chatMessage.senderEnglishName
      this.arabicNameForConversation = chatMessage.senderArabicName
    }else{
      otherUserID = chatMessage.receiverID
      otherUserTypeID = chatMessage.receiverUserTypeID

      this.englishNameForConversation = chatMessage.receiverEnglishName
      this.arabicNameForConversation = chatMessage.receiverArabicName
    }

    // this will automatically loaded because of the route
    // this.loadSpecificChat(otherUserID, otherUserTypeID);
    this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
            otherUserID: otherUserID,
            otherUserTypeID: otherUserTypeID,
            englishNameForConversation: this.englishNameForConversation,
            arabicNameForConversation: this.arabicNameForConversation
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

  // sendMessage(){
  //   if(this.User_Data_After_Login.type=='employee'){
  //     this.isStudentHovered = true; 
  //     this.getSchool()
  //   } else{
  //     this.isEmployeeHovered = true
  //     this.getDepartment()
  //   }
  //   document.getElementById('sendMessage')?.classList.remove('hidden');
  //   document.getElementById('sendMessage')?.classList.add('flex');
  // }

  closeModal(){
    document.getElementById('sendMessage')?.classList.remove('flex');
    document.getElementById('sendMessage')?.classList.add('hidden');

    this.isLoading = false 
    
    this.departments = []
    this.employees = []
    this.schools = []
    this.sections = []
    this.grades = []
    this.classrooms = []
    this.students = []  
 
    this.messageToBeSend = new ChatMessage()

    this.isTeacherHovered = false;
    this.isEmployeeHovered = false;
    this.isStudentHovered = false;
    this.isParentHovered = false;
  }

  // selectType(userID:number) {   
  //   this.messageToBeSend = new ChatMessage()

  //   if (userID == 1) {
  //     this.isEmployeeHovered = true;
  //     this.isStudentHovered = false;
  //     this.isParentHovered = false;
  //     this.getDepartment()
  //   }
  //   else if (userID == 2) {
  //     this.isEmployeeHovered = false;
  //     this.isStudentHovered = true;
  //     this.isParentHovered = false;
  //     this.getSchool()
  //   }
  //   else if (userID == 3) {
  //     this.isEmployeeHovered = false;
  //     this.isStudentHovered = false;
  //     this.isParentHovered = true;
  //     this.getSchool()
  //   } 
  // }

  // selectTypeForStudentAndParent(userID:number) {   
  //   this.messageToBeSend = new ChatMessage()

  //   if (userID == 1) {
  //     this.isEmployeeHovered = true;
  //     this.isTeacherHovered = false; 
  //     this.getDepartment()
  //   }
  //   else if (userID == 2) { 
  //     this.isTeacherHovered = true;
  //     this.isEmployeeHovered = false;
      
  //     if(this.User_Data_After_Login.type == "student"){
  //       this.messageToBeSend.studentID = this.User_Data_After_Login.id
  //       this.getSubjects()
  //     }else{
  //       this.getStudentByParentID()
  //     }
  //   } 
  // }

  // onFileSelected(event: any) {
  //   const file: File = event.target.files[0];
  //   const input = event.target as HTMLInputElement;

  //   if (file) {
  //     if (file.size > 25 * 1024 * 1024) {
  //       Swal.fire({
  //         title: 'The file size exceeds the maximum limit of 25 MB.',
  //         icon: 'warning', 
  //         confirmButtonColor: '#089B41', 
  //         confirmButtonText: "OK"
  //       })
  //       this.requestToBeSend.fileFile = null;
  //       return; 
  //     } else{
  //       this.requestToBeSend.fileFile = file;  

  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //     }
  //   }
    
  //   input.value = '';
  // } 
}
