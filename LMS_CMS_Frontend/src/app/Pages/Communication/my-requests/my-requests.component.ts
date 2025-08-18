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

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.css'
})
export class MyRequestsComponent {
  requests: Request[] = []
  requestByID:Request = new Request()
  requestToBeSend:Request = new Request()
  DomainName: string = ''; 
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');  
  
  activeTab:string = "sent"
  isLoading = false;
  
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

  departmentID = 0
  schoolID = 0
  sectionID = 0
  gradeID = 0
  classroomID = 0

  validationErrors: { [key in keyof Request]?: string } = {}; 

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
    public requestService: RequestService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 

    this.DomainName = this.ApiServ.GetHeader();
 
    this.loadSentRequests()  
  }

  loadSentRequests(){
    this.activeTab = 'sent';
    this.requests = []
    this.requestService.GetSentOnesByUserID(this.DomainName).subscribe(
      data => { 
        this.requests = data 
      }
    ) 
  }

  loadReceivedRequests(){
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
        request.seenOrNot = true
        this.requestByID = data 
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
        });
      }
    });
  }

  Forward(request:Request){

  }

  sendRequest(){
    if(this.User_Data_After_Login.type=='employee'){
      this.isStudentHovered = true; 
      this.getSchool()
    }
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
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

  getEmployee(){
    this.employees = [] 
    this.employeeService.GetByDepartmentId(this.departmentID, this.DomainName).subscribe(
      data => {
        this.employees = data
        if(this.User_Data_After_Login.type == 'employee'){
          this.employees = data.filter(
            (employee) => employee.id !== this.User_Data_After_Login.id
          );
        }
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

  onDepartmentChange(event: Event) {
    this.employees = [] 
    this.requestToBeSend.receiverID = 0
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.departmentID = Number(selectedValue)
    if (this.departmentID) {
      this.getEmployee(); 
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

  // onGradeChange(event: Event) {  
  //   this.classrooms = [] 
  //   this.students = []   
  //   this.notification.userFilters.classroomID = 0
  //   this.notification.userFilters.studentID = 0
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   this.notification.userFilters.gradeID = Number(selectedValue)
  //   if (this.notification.userFilters.gradeID) {
  //     this.getClassroom(); 
  //   }
  // }

  // onClassroomChange(event: Event) {   
  //   this.students = []    
  //   this.notification.userFilters.studentID = 0
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   this.notification.userFilters.classroomID = Number(selectedValue)
  //   if (this.notification.userFilters.classroomID) {
  //     this.getStudent(); 
  //   }
  // }

  closeModal(){
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');

    this.isLoading = false
    this.validationErrors = {};  
    this.departmentID = 0
    this.requestToBeSend = new Request()
    this.isEmployeeHovered = false;
    this.isStudentHovered = false;
    this.isParentHovered = false;
  }

  selectType(userID:number) {  
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

  Send(){
    if(this.requestToBeSend.message == '' && this.requestToBeSend.link == '' && this.requestToBeSend.fileFile == null){
      Swal.fire({
        title: 'You have to insert at least one item (File - Message - Link)',
        icon: 'warning', 
        confirmButtonColor: '#089B41', 
        confirmButtonText: "OK"
      })
    } else{
      this.isLoading = true;
      this.requestService.Add(this.requestToBeSend, this.DomainName).subscribe(
        (result: any) => {
          this.requestByID = new Request()
          this.activeTab = "sent"
          this.closeModal();
          this.loadSentRequests()
        },
        error => {
          this.isLoading = false;
        }
      ); 
    } 
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['fileFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.requestToBeSend.fileFile = null;
        return; 
      } 
    }
    
    input.value = '';
  }
}
