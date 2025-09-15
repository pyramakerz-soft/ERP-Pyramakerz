import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ArchivingService } from '../../../../Services/Employee/Archiving/archiving.service';
import { ActivatedRoute } from '@angular/router';
import { PermissionGroupEmployee } from '../../../../Models/Archiving/permission-group-employee';
import { Employee } from '../../../../Models/Employee/employee';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArchivingItemComponent } from '../../../../Component/Employee/Archiving/archiving-item/archiving-item.component';
import { ArchivingTree } from '../../../../Models/Archiving/archiving-tree';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-archiving',
  standalone: true,
  imports: [CommonModule, FormsModule, ArchivingItemComponent],
  templateUrl: './archiving.component.html',
  styleUrl: './archiving.component.css'
})
export class ArchivingComponent {
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
 
  AllowDelete: boolean = false; 
  AllowDeleteForOthers: boolean = false; 
  
  DomainName: string = '';
  UserID: number = 0;
 
  path: string = '';
   
  isLoading = false;
  
  permissionGroupID = 0
  
  TableData:ArchivingTree[] = []
  archiving: ArchivingTree = new ArchivingTree()
  newArchiving = new ArchivingTree()
  isAddFileOpen: boolean = false; 

  constructor( 
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,  
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService, 
    public archivingService:ArchivingService
  ) {}

  ngOnInit() {
    this.permissionGroupID = Number(this.activeRoute.snapshot.paramMap.get('id'));

    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.ApiServ.GetHeader();
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) { 
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others; 
      }
    });

    this.GetAllData() 
  }

  GetAllData(){
    this.archivingService.GetAllPerUser(this.DomainName).subscribe(
      (data) => { 
        this.TableData = data 
      }
    )
  } 

  GetDataByID(archivingTreeID: number){
    this.archiving = new ArchivingTree()
    this.archivingService.GetById(archivingTreeID, this.DomainName).subscribe(
      (data) => { 
        this.archiving = data  
      }
    )
  }

  GetContent(){
    this.archiving = new ArchivingTree()
    this.archivingService.GetContent(this.DomainName).subscribe(
      (data) => { 
        this.archiving = data  
      }
    )
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  Delete(child: ArchivingTree) {
    Swal.fire({
      title: 'Are you sure you want to delete this?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.archivingService.Delete(child.id, this.DomainName).subscribe(
          (data) => {
            this.GetDataByID(child.archivingTreeParentID)
            this.GetAllData() 
          },
          (error) => {
            Swal.fire({
              title: error.error,
              icon: 'warning'
            })
          }
        )
      }
    });
  } 

  createFolder() {
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  addFile() {
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
    this.isAddFileOpen = true
  }

  closeAddFolderOrFileModal(){
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden'); 
    this.newArchiving = new ArchivingTree();  
    this.isAddFileOpen = false
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;
    
    if (file) {
        if (file.size > 25 * 1024 * 1024) { 
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'The file size exceeds the maximum limit of 25 MB.',
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
            });
            this.newArchiving.fileFile = null;
            return; 
        }
        
        const fileName = file.name.toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv', '.mp4', '.avi', '.mkv', '.mov'];
        
        const isExtensionValid = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (isExtensionValid) {
            this.newArchiving.fileFile = file;  
            const reader = new FileReader();
            reader.readAsDataURL(file);
        } else { 
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Invalid file type. Allowed types: JPG, JPEG, PNG, GIF, PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, MP4, AVI, MKV, MOV.',
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
            });
            this.newArchiving.fileFile = null;
            return; 
        }
    }
    
    input.value = '';
  } 

  saveCreateFolder(){
    if(this.newArchiving.name){
      if(this.isAddFileOpen && this.newArchiving.fileFile == null){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please Choose File',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
      }else{
        this.isLoading = true;    
        if(this.archiving.id){
          this.newArchiving.archivingTreeParentID = this.archiving.id 
        }
        this.archivingService.Add(this.newArchiving, this.DomainName).subscribe(
          (result: any) => {
            this.closeAddFolderOrFileModal();
            if(this.archiving.id){ 
              this.GetDataByID(this.archiving.id)
            }else{
              this.GetContent()
            }
            this.GetAllData()
            this.isLoading = false;
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error,
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        ); 
      }
    } else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: this.isAddFileOpen ? 'Please Enter File Name' : 'Please Enter Folder Name',
        confirmButtonText: 'Okay',
        customClass: { confirmButton: 'secondaryBg' },
      });
    } 
  }  

  getFileExtension(filename: string): string {
    if (!filename) return '';
    
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    
    return filename.slice(lastDotIndex).toLowerCase();
  }

  downloadFile(fileUrl: string, fileName: string) {
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
