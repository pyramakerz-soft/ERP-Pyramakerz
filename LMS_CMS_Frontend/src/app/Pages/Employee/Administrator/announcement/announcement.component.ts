import { Component } from '@angular/core';
import { Announcement } from '../../../../Models/Administrator/announcement';
import { UserType } from '../../../../Models/Administrator/user-type';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { UserTypeService } from '../../../../Services/Employee/Administration/user-type.service';
import { AnnouncementService } from '../../../../Services/Employee/Administration/announcement.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent],
  templateUrl: './announcement.component.html',
  styleUrl: './announcement.component.css'
})
export class AnnouncementComponent {
  announcement= new Announcement();
  TableData:Announcement[] = []
  userTypes:UserType[] = []
  isLoading = false;

  validationErrors: { [key in keyof Announcement]?: string } = {};
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

  isDropdownOpen = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,
    public EditDeleteServ: DeleteEditPermissionService,
    private menuService: MenuService, 
    public activeRoute: ActivatedRoute,  
    public router: Router,
    public announcementService: AnnouncementService,
    public userTypeService: UserTypeService
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
    this.getUserTypeData(); 
  }

  getAllData(){
    this.TableData = []
    this.announcementService.Get(this.DomainName).subscribe(
      data => {
        this.TableData = data
      }
    )
  }

  getAnnouncementById(id: number){
    this.announcement = new Announcement()
    this.announcementService.GetById(id, this.DomainName).subscribe(
      data => {
        this.announcement = data
        this.announcement.userTypeIDs = []
        this.announcement.announcementSharedTos.forEach(element => {
          this.announcement.userTypeIDs.push(element.userTypeID) 
        });
      }
    )
  }

  getUserTypeData(){
    this.userTypes = []
    this.userTypeService.Get(this.DomainName).subscribe(
      data => {
        this.userTypes = data
      }
    )
  }

  openModal(Id?: number) {
    if (Id) {
      this.getAnnouncementById(Id);
    }
     
    this.announcement= new Announcement();

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
    this.validationErrors = {};  
    
    this.announcement= new Announcement();
    this.isLoading = false
    this.isDropdownOpen = false;
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

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this announcement?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: "Yes, I'm sure",
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.announcementService.Delete(id, this.DomainName).subscribe((d) => {
          this.getAllData()
        });
      }
    });  
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // Prevent the click event from bubbling up
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  removeFromUserTypes(moduleID:number, event: MouseEvent){
    event.stopPropagation();
    this.announcement.userTypeIDs = this.announcement.userTypeIDs.filter(_moduleID => _moduleID !== moduleID);
  }
  
  onUserTypeChange(module: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.announcement.userTypeIDs.includes(module)) {
        this.announcement.userTypeIDs.push(module);
      }
    } else {
      const index = this.announcement.userTypeIDs.indexOf(module);
      if (index > -1) {
        this.announcement.userTypeIDs.splice(index, 1);
      }
    }
    
    if (this.announcement.userTypeIDs.length > 0) {
      this.validationErrors['userTypeIDs'] = '';
    } else {
      this.validationErrors['userTypeIDs'] = '*User Type is required.';
    }
  }

  capitalizeField(field: keyof Announcement): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.announcement) {
      if (this.announcement.hasOwnProperty(key)) {
        const field = key as keyof Announcement;
        if (!this.announcement[field]) {
          if(field == "title" || (this.announcement.id == 0 && field == 'imageFile')){
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          } 
        } else { 
          this.validationErrors[field] = '';
        }
      }
    }

    if (this.announcement.userTypeIDs.length > 0) {
      this.validationErrors['userTypeIDs'] = '';
    } else {
      this.validationErrors['userTypeIDs'] = '*User Type is required.';
      isValid = false;
    }

    return isValid;
  }

  onInputValueChange(event: { field: keyof Announcement, value: any }) {
    const { field, value } = event;
    (this.announcement as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;

    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['imageFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.announcement.imageFile = null;
        return; 
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.announcement.imageFile = file; 
        this.validationErrors['imageFile'] = ''; 

        const reader = new FileReader();
        reader.readAsDataURL(file);
      } else {
        this.validationErrors['imageFile'] = 'Invalid file type. Only JPEG, JPG and PNG are allowed.';
        this.announcement.imageFile = null;
        return; 
      }
    }
    
    input.value = '';
  }

  Save(){
    if(this.isFormValid()){ 
      this.isLoading = true;
      if(this.announcement.id == 0){    
        this.announcementService.Add(this.announcement, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal();
            this.getAllData()
          },
          error => {
            this.isLoading = false;
          }
        );
      } else{ 
        this.announcementService.Edit(this.announcement, this.DomainName).subscribe(
          (result: any) => {
            this.closeModal()
            this.getAllData()
          },
          error => {
            this.isLoading = false;
          }
        );
      } 
    }
  } 

  async onSearchEvent(event: { key: string; value: any }) { 
    this.key = event.key;
    this.value = event.value;
    try {
      const data: any = await firstValueFrom(
        this.announcementService.Get(this.DomainName)
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

  filterByTypeID($event: Event) {
    const selectedId = ($event.target as HTMLSelectElement).value; 
    this.TableData = []
    this.announcementService.GetByUserTypeID(+selectedId, this.DomainName).subscribe(
      data => {
        this.TableData = data
      }
    )
  }

  ResetFilter(){
    this.getAllData()
  }
}
