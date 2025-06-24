import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { POS } from '../../../../Models/ETA/pos';
import { TokenData } from '../../../../Models/token-data';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { POSService } from '../../../../Services/Employee/ETA/pos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css'
})
export class POSComponent {
  validationErrors: { [key in keyof POS]?: string } = {}; 
  keysArray: string[] = ['id','clientID','clientSecret','clientSecret2','deviceSerialNumber'];
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

  pos: POS = new POS();
  POSData: POS[] = [];
   
  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0
  isDeleting:boolean = false;
  viewClassStudents:boolean = false;
  viewStudents:boolean = false;

  isLoading = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService,  
    public activeRoute: ActivatedRoute, 
    public posService: POSService, 
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
    this.POSData = [] 
    this.CurrentPage = 1 
    this.TotalPages = 1
    this.TotalRecords = 0
    this.posService.Get(this.DomainName, pageNumber, pageSize).subscribe(
        (data) => {
          this.CurrentPage = data.pagination.currentPage
          this.PageSize = data.pagination.pageSize
          this.TotalPages = data.pagination.totalPages
          this.TotalRecords = data.pagination.totalRecords 
          this.POSData = data.data
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

  getPOSById(id:number){
    this.pos = new POS()
    this.posService.GetByID(id, this.DomainName).subscribe(
      data => {
        this.pos = data  
      }
    )
  }

  openModal(Id?: number) {
    if (Id) { 
      this.getPOSById(Id);
    } 

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden'); 
    this.validationErrors = {};

    this.POSData = []; 
    this.pos = new POS();  
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

  capitalizeField(field: keyof POS): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
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

  validateNumberForPagination(event: any): void {
    const value = event.target.value;
    this.PageSize = 0
  }

  onInputValueChange(event: { field: keyof POS; value: any }) {
    const { field, value } = event;
    (this.pos as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    } 
  }

isFormValid(): boolean {
    let isValid = true;
    for (const key in this.assignment) { 
      if (this.assignment.hasOwnProperty(key)) {
        const field = key as keyof Assignment;
        if (!this.assignment[field]) {
          if (field == 'englishName' || field == 'arabicName' || field == 'mark' || field == 'assignmentTypeID' || field == 'subjectID' || field == 'subjectWeightTypeID' || field == 'openDate' || field == 'cutOfDate') {
            this.validationErrors[field] = `*${this.capitalizeField( field )} is required`;
            isValid = false;
          }
        } else {
          if (field == 'englishName' || field == 'arabicName') {
            if (this.assignment.englishName.length > 100 || this.assignment.arabicName.length > 100) {
              this.validationErrors[field] = `*${this.capitalizeField( field )} cannot be longer than 100 characters`;
              isValid = false;
            }
          }else if (field == 'studentClassroomIDs') {
            if (this.choosedStudentsClass.length == 0 && this.assignment.isSpecificStudents == true) {
              this.validationErrors[field] = `*You have to choose students as you already selected that this assignment is for specific students`;
              isValid = false;
            }
          }else if (field === 'openDate' || field === 'dueDate' || field === 'cutOfDate') {
            const openDate = new Date(this.assignment.openDate);
            const dueDate = new Date(this.assignment.dueDate);
            const cutOfDate = new Date(this.assignment.cutOfDate);

            if (this.assignment.openDate && this.assignment.dueDate && openDate > dueDate) {
              this.validationErrors['openDate'] = '*Open Date must be before or equal to Due Date';
              this.validationErrors['dueDate'] = '*Due Date must be after or equal to Open Date';
              isValid = false;
            }

            if (this.assignment.dueDate && this.assignment.cutOfDate && dueDate > cutOfDate) {
              this.validationErrors['dueDate'] = '*Due Date must be before or equal to Cut Off Date';
              this.validationErrors['cutOfDate'] = '*Cut Off Date must be after or equal to Due Date';
              isValid = false;
            }

            if (this.assignment.dueDate && openDate > dueDate || cutOfDate < dueDate) {
              this.validationErrors['dueDate'] = '*Due Date must be between Open Date and Cut Off Date';
              isValid = false;
            }

            if (this.assignment.cutOfDate && (cutOfDate < openDate || cutOfDate < dueDate)) {
              this.validationErrors['cutOfDate'] = '*Cut Off Date must be after both Open Date and Due Date';
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
      if(this.assignment.isSpecificStudents == true){
        this.assignment.studentClassroomIDs = []
        this.choosedStudentsClass.forEach(element => {
          this.assignment.studentClassroomIDs.push(element.id)
        });
      }else{
        this.assignment.studentClassroomIDs = []
      }

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
      title: 'Are you sure you want to delete this POS?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.posService.Delete(id,this.DomainName).subscribe((D)=>{
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
        this.posService.Get(this.DomainName, this.CurrentPage, this.PageSize)
      );
      this.POSData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.POSData = this.POSData.filter((t) => {
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
      this.POSData = [];
    }
  }
}
