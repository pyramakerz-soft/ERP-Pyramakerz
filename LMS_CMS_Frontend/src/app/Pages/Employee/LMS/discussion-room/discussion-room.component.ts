import { Component } from '@angular/core';
import { DiscussionRoom } from '../../../../Models/LMS/discussion-room';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { TokenData } from '../../../../Models/token-data';
import { DiscussionRoomService } from '../../../../Services/Employee/LMS/discussion-room.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { ClassroomStudent } from '../../../../Models/LMS/classroom-student';
import { ClassroomStudentService } from '../../../../Services/Employee/LMS/classroom-student.service';
import { ClassStudentForDiscussionRoom } from '../../../../Models/LMS/class-student-for-discussion-room';

@Component({
  selector: 'app-discussion-room',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './discussion-room.component.html',
  styleUrl: './discussion-room.component.css'
})
export class DiscussionRoomComponent {
  TableData:DiscussionRoom[] = []
  discussionRoom:DiscussionRoom = new DiscussionRoom()
  isLoading = false;

  validationErrors: { [key in keyof DiscussionRoom]?: string } = {};
  keysArray: string[] = ['id', 'title'];
  key: string = 'id';
  value: any = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  studentsClass: ClassStudentForDiscussionRoom[] = []; 
  choosedClasss: ClassStudentForDiscussionRoom[] = []; 
  choosedStudentsClass: number[] = []; 
  studentClassWhenSelectClass: ClassStudentForDiscussionRoom = new ClassStudentForDiscussionRoom(); 
  viewClassStudents: boolean = false;
  viewStudents: boolean = false; 

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService, 
    public activeRoute: ActivatedRoute,  
    public router: Router,
    public discussionRoomService: DiscussionRoomService,
    public classroomStudentService: ClassroomStudentService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    }); 

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
    this.getAllData() 
  }

  getAllData(){
    this.TableData = []
    this.discussionRoomService.Get(this.DomainName).subscribe(
      data => {
        this.TableData = data
      }
    )
  }

  getStudentClassData(){
    this.studentsClass = []
    this.classroomStudentService.GetClassForActiveAcademicYearWithStudentsIncluded(this.DomainName).subscribe(
      data => {
        this.studentsClass = data
        console.log(this.studentsClass)
      }
    )
  }

  getDiscussionRoomById(id: number){
    this.discussionRoom = new DiscussionRoom()
    this.discussionRoomService.GetById(id, this.DomainName).subscribe(
      data => {
        this.discussionRoom = data 
      }
    )
  }

  openModal(Id?: number) {
    this.discussionRoom= new DiscussionRoom();

    if (Id) {
      this.getDiscussionRoomById(Id);
    }

    this.getStudentClassData()

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};  
    
    this.discussionRoom= new DiscussionRoom();
    this.isLoading = false 
    this.studentsClass = []
    this.choosedClasss = []
    this.choosedStudentsClass = []
    this.viewStudents = false
    this.viewClassStudents = false
  }

  toggleClassesToChooseStudents() {
    this.viewStudents = false  
    if (this.viewClassStudents == false) {
      this.viewClassStudents = true
    } else {
      this.viewClassStudents = false
    } 
  } 
  
  isClassSelected(classroomID: number): boolean {
    return this.choosedClasss.some(item => item.classroomId == classroomID)
  }

  isStudentSelected(studentClassID: number): boolean {
    return this.choosedStudentsClass.some(item => item == studentClassID)
  }

  onClassSelectChange(classroom: ClassStudentForDiscussionRoom) {
    this.validationErrors['studentClassrooms'] = '';

    const index = this.choosedClasss.findIndex(item => item.classroomId === classroom.classroomId);
    if (index !== -1) {
      this.choosedClasss.splice(index, 1); 
      const deselectedStudentIds = classroom.students.map(s => s.id);
      this.choosedStudentsClass = this.choosedStudentsClass.filter(id => !deselectedStudentIds.includes(id));
    } else {
      this.choosedClasss.push(classroom);
      classroom.students.forEach(element => {
        this.choosedStudentsClass.push(element.id);
      });
    }
  } 

  onStudentSelectChange(studentClass: ClassroomStudent) {
    this.validationErrors['studentClassrooms'] = '';

    const studentId = studentClass.id;
    const classId = studentClass.classID;

    const studentIndex = this.choosedStudentsClass.findIndex(id => id === studentId);

    if (studentIndex !== -1) { 
      this.choosedStudentsClass.splice(studentIndex, 1);
    } else { 
      this.choosedStudentsClass.push(studentId);
    }
 
    const classIndex = this.choosedClasss.findIndex(c => c.classroomId === classId);

    if (classIndex === -1) { 
      const foundClass = this.studentsClass.find(c => c.classroomId === classId);
      if (foundClass) {
        this.choosedClasss.push(foundClass);
      }
    } else { 
      const relatedClass = this.choosedClasss[classIndex];
      const hasRemainingStudents = relatedClass.students.some(student =>
        this.choosedStudentsClass.includes(student.id)
      );

      if (!hasRemainingStudents) { 
        this.choosedClasss.splice(classIndex, 1);
      }
    }
  }


  getStudentCount(classroomID: number): number {
    const classroom = this.choosedClasss.find(c => c.classroomId === classroomID);
    if (!classroom) return 0;

    return classroom.students.filter(student =>
      this.choosedStudentsClass.includes(student.id)
    ).length;
  } 

  removeStudentFromClass(classroomId: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from bubbling up
 
    const removedClass = this.choosedClasss.find(item => item.classroomId === classroomId); 
    this.choosedClasss = this.choosedClasss.filter(item => item.classroomId !== classroomId);

    if (removedClass) {
      const removedStudentIds = removedClass.students.map(student => student.id); 
      this.choosedStudentsClass = this.choosedStudentsClass.filter(
        id => !removedStudentIds.includes(id)
      );
    }
  }

  openStudent(classroom: ClassStudentForDiscussionRoom) {
    this.viewStudents = true
    this.studentClassWhenSelectClass = classroom
  }
  
  returnToClases() {
    this.viewStudents = false
    this.studentClassWhenSelectClass = new ClassStudentForDiscussionRoom()
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
    return IsAllow;
  }

  capitalizeField(field: keyof DiscussionRoom): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.discussionRoom) {
      if (this.discussionRoom.hasOwnProperty(key)) {
        const field = key as keyof DiscussionRoom;
        if (!this.discussionRoom[field]) {
          if(field == "title" || field == "startDate" || field == "endDate" || field == "time" || field == "meetingLink" || (this.discussionRoom.id == 0 && field == 'imageFile')){
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          } 
        } else { 
          this.validationErrors[field] = '';
        }
      }
    } 

    if(this.choosedStudentsClass.length == 0){
      this.validationErrors['studentClassrooms'] = '*Students are required'
    }else{
      this.validationErrors['studentClassrooms'] = ''
    }

    return isValid;
  }

  onInputValueChange(event: { field: keyof DiscussionRoom, value: any }) {
    const { field, value } = event;
    (this.discussionRoom as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onIsRepeatedWeeklyChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.discussionRoom.isRepeatedWeekly = isChecked 
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['imageFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.discussionRoom.imageFile = null;
        return; 
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.discussionRoom.imageFile = file; 
        this.validationErrors['imageFile'] = ''; 

        const reader = new FileReader();
        reader.readAsDataURL(file);
      } else {
        this.validationErrors['imageFile'] = 'Invalid file type. Only JPEG, JPG and PNG are allowed.';
        this.discussionRoom.imageFile = null;
        return; 
      }
    }
  }

  Save(){
    this.discussionRoom.studentClassrooms = []
    this.discussionRoom.studentClassrooms.push(...this.choosedStudentsClass)

    console.log(this.discussionRoom)
    // if(this.isFormValid()){ 
    //   this.isLoading = true;
    //   if(this.discussionRoom.id == 0){    
    //     this.discussionRoomService.Add(this.discussionRoom, this.DomainName).subscribe(
    //       (result: any) => {
    //         this.closeModal();
    //         this.getAllData()
    //       },
    //       error => {
    //         this.isLoading = false;
    //       }
    //     );
    //   } else{ 
    //     this.discussionRoomService.Edit(this.discussionRoom, this.DomainName).subscribe(
    //       (result: any) => {
    //         this.closeModal()
    //         this.getAllData()
    //       },
    //       error => {
    //         this.isLoading = false;
    //       }
    //     );
    //   } 
    // }
  } 

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this discussion room?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: "Yes, I'm sure",
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.discussionRoomService.Delete(id, this.DomainName).subscribe((d) => {
          this.getAllData()
        });
      }
    });  
  }
  
  async onSearchEvent(event: { key: string; value: any }) { 
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.discussionRoomService.Get(this.DomainName)
      );
      this.TableData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.TableData = this.TableData.filter((t) => {
          const fieldValue = t[this.key as keyof typeof t];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(this.value.toLowerCase());
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(numericValue.toString())
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }
}
