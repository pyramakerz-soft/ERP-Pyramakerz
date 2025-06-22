import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { Assignment } from '../../../../Models/LMS/assignment';
import { AssignmentService } from '../../../../Services/Employee/LMS/assignment.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { Subject } from '../../../../Models/LMS/subject';
import { SubjectService } from '../../../../Services/Employee/LMS/subject.service';
import { AssignmentType } from '../../../../Models/LMS/assignment-type';
import { AssignmentTypeService } from '../../../../Services/Employee/LMS/assignment-type.service';

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './assignment.component.html',
  styleUrl: './assignment.component.css'
})
export class AssignmentComponent {
  validationErrors: { [key in keyof Assignment]?: string } = {}; 
  keysArray: string[] = ['id','englishName','arabicName','mark','assignmentTypeEnglishName','assignmentTypeArabicName'];
  key: string = 'id';
  value: any = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  subjects: Subject[] = [];
  assignmentTypes: AssignmentType[] = [];
  assignmentData: Assignment[] = [];
  assignment: Assignment = new Assignment();
  subjectID:number = 0

  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0
  isDeleting:boolean = false;

  isLoading = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService, 
    public assignmentService: AssignmentService,
    public activeRoute: ActivatedRoute,
    public subjectService: SubjectService,
    public assignmentTypeService: AssignmentTypeService,
    public router: Router
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.GetAllData(this.CurrentPage, this.PageSize)
    this.getSubjectData();

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
  }

  GetAllData(pageNumber:number, pageSize:number){
    this.assignmentData = [] 
    this.CurrentPage = 1 
    this.TotalPages = 1
    this.TotalRecords = 0
    if(this.subjectID != 0){
      this.assignmentService.GetBySubjectID(this.subjectID, this.DomainName, pageNumber, pageSize).subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords 
          this.assignmentData = data.data
        }, 
        (error) => { 
          if(error.status == 404){
            if(this.TotalRecords != 0){
              let lastPage = this.TotalRecords / this.PageSize 
              if(lastPage >= 1){
                if(this.isDeleting){
                  this.CurrentPage = Math.floor(lastPage) 
                  this.isDeleting = false
                } else{
                  this.CurrentPage = Math.ceil(lastPage) 
                }
                this.GetAllData(this.CurrentPage, this.PageSize)
              }
            } 
          }
        }
      )
    } else{
      this.assignmentService.Get(this.DomainName, pageNumber, pageSize).subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords 
          this.assignmentData = data.data
        }, 
        (error) => { 
          if(error.status == 404){
            if(this.TotalRecords != 0){
              let lastPage = this.TotalRecords / this.PageSize 
              if(lastPage >= 1){
                if(this.isDeleting){
                  this.CurrentPage = Math.floor(lastPage) 
                  this.isDeleting = false
                } else{
                  this.CurrentPage = Math.ceil(lastPage) 
                }
                this.GetAllData(this.CurrentPage, this.PageSize)
              }
            } 
          }
        }
      )
    }
  }

  changeCurrentPage(currentPage:number){
    this.CurrentPage = currentPage
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  validatePageSize(event: any) { 
    const value = event.target.value;
    if (isNaN(value) || value === '') {
        event.target.value = '';
    }
  }

  View(id:number){
    this.router.navigateByUrl(`Employee/Assignment/${id}`)
  }

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  openModal(Id?: number) {
    if (Id) { 
      this.getAssignmentById(Id);
    }

    this.getSubjectData();
    this.getAssignmentTypeData();

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden'); 
    this.validationErrors = {};
  }

  onSubjectChange() { 
    this.GetAllData(this.CurrentPage, this.PageSize)
  }

  getAssignmentById(Id: number){
    this.assignment = new Assignment()
    this.assignmentService.GetByID(Id, this.DomainName).subscribe(
      data => {
        this.assignment = data
      }
    )
  }

  getSubjectData(){
    this.subjects = []
    this.subjectService.Get(this.DomainName).subscribe(
      data => {
        this.subjects = data
      }
    )
  }

  getAssignmentTypeData(){
    this.assignmentTypes = []
    this.assignmentTypeService.Get(this.DomainName).subscribe(
      data => {
        this.assignmentTypes = data
      }
    )
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

  onInputValueChange(event: { field: keyof Assignment; value: any }) {
    const { field, value } = event;
    (this.assignment as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  validateNumber(event: any, field: keyof Assignment): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = ''; 
      if (typeof this.assignment[field] === 'string') {
        this.assignment[field] = '' as never;  
      }
    }
  }

  capitalizeField(field: keyof Assignment): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.assignment) { 
      if (this.assignment.hasOwnProperty(key)) {
        const field = key as keyof Assignment;
        if (!this.assignment[field]) {
          if (field == 'englishName' || field == 'arabicName' || field == 'mark' || field == 'assignmentTypeID' || field == 'subjectID' || field == 'openDate' || field == 'cutOfDate') {
            this.validationErrors[field] = `*${this.capitalizeField( field )} is required`;
            isValid = false;
          }
        } else {
          if (field == 'englishName' || field == 'arabicName') {
            if (this.assignment.englishName.length > 100 || this.assignment.arabicName.length > 100) {
              this.validationErrors[field] = `*${this.capitalizeField( field )} cannot be longer than 100 characters`;
              isValid = false;
            }
          } else {
            this.validationErrors[field] = '';
          }
        }
      }
    } 
    return isValid;
  }

  Save() {  
    if (this.isFormValid()) {
      this.isLoading = true;   
      if (this.assignment.id == 0) { 
        this.assignmentService.Add(this.assignment, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      } else {
        this.assignmentService.Edit(this.assignment, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.GetAllData(this.CurrentPage, this.PageSize)
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        );
      }
    }
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Assignment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assignmentService.Delete(id,this.DomainName).subscribe((D)=>{
          this.GetAllData(this.CurrentPage, this.PageSize)
        })
      }
    });
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.assignmentService.Get(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.assignmentData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.assignmentData = this.assignmentData.filter((t) => {
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
      this.assignmentData = [];
    }
  }
}
