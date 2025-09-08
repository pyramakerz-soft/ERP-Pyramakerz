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
    this.archivingService.Get(this.DomainName).subscribe(
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
        console.log(this.archiving  )
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
          }
        )
      }
    });
  } 
}
