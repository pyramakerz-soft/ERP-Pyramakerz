import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArchivingTree } from '../../../../Models/Archiving/archiving-tree';
import { PermissionGroupDetailsService } from '../../../../Services/Employee/Archiving/permission-group-details.service';
import { PermissionGroupDetails } from '../../../../Models/Archiving/permission-group-details';
import { ArchivingService } from '../../../../Services/Employee/Archiving/archiving.service';
import { PermissionGroupArchivingItemComponent } from '../../../../Component/Employee/Archiving/permission-group-archiving-item/permission-group-archiving-item.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permission-group-details',
  standalone: true,
  imports: [FormsModule, CommonModule, PermissionGroupArchivingItemComponent],
  templateUrl: './permission-group-details.component.html',
  styleUrl: './permission-group-details.component.css'
})
export class PermissionGroupDetailsComponent {
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
  
  DomainName: string = '';
  UserID: number = 0;
  
  isLoading = false;

  permissionGroupID = 0

  archivingTrees:ArchivingTree[] = [] 
  PermissionGroupDetailsData:PermissionGroupDetails[] = []
  SelectedPermissionGroupDetails: PermissionGroupDetails[] = [];
  
  constructor( 
    private router: Router,
    public activeRoute: ActivatedRoute,
    public account: AccountService,  
    public ApiServ: ApiService, 
    public permissionGroupDetailsService: PermissionGroupDetailsService,
    public archivingService: ArchivingService
  ) {}

  ngOnInit() {
    this.permissionGroupID = Number(this.activeRoute.snapshot.paramMap.get('id'));

    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 
    this.DomainName = this.ApiServ.GetHeader(); 

    this.GetPermissionGroupDetails()
    this.GetArchivingTree()
  }

  MoveToPermissionGroup(){
    this.router.navigateByUrl(`Employee/Permissions Groups`)
  }

  GetPermissionGroupDetails(){
    this.PermissionGroupDetailsData = []
    this.permissionGroupDetailsService.GetByPermissionGroupID(this.permissionGroupID, this.DomainName).subscribe(
      data => {
        this.PermissionGroupDetailsData = data 
        this.matchPermissionGroups();
      }
    )
  }

  GetArchivingTree(){
    this.archivingTrees = []
    this.archivingService.Get(this.DomainName).subscribe(
      data => {
        this.archivingTrees = data 
        this.setParents(this.archivingTrees, null);
        this.matchPermissionGroups();
      }
    )
  } 

  private setParents(nodes: ArchivingTree[], parent: ArchivingTree | null) {
    nodes.forEach(node => {
      node.parent = parent;
      if (node.children && node.children.length > 0) {
        this.setParents(node.children, node);
      }
    });
  }

  matchPermissionGroups() {
    if (this.archivingTrees.length > 0 && this.PermissionGroupDetailsData.length > 0) {
      this.archivingTrees.forEach(tree => {
        this.applyPermissions(tree);
      });
 
      this.SelectedPermissionGroupDetails = [...this.PermissionGroupDetailsData];
    }
  }

  applyPermissions(node: ArchivingTree) {
    const matchingPermission = this.PermissionGroupDetailsData.find(
      permission => permission.archivingTreeID === node.id
    );

    if (matchingPermission) {
      node.selected = true;
      node.allow_Delete = matchingPermission.allow_Delete;
      node.allow_Delete_For_Others = matchingPermission.allow_Delete_For_Others;
    } else {
      node.selected = false;
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.applyPermissions(child));
    }
  }
 
  SelectData($event: { data: PermissionGroupDetails; selected: boolean }) {
    if ($event.selected) {
      const existingItemIndex = this.SelectedPermissionGroupDetails.findIndex(
        item => item.archivingTreeID === $event.data.archivingTreeID
      );

      if (existingItemIndex === -1) {
        this.SelectedPermissionGroupDetails.push($event.data);
      } else {
        this.SelectedPermissionGroupDetails[existingItemIndex] = $event.data;
      }
    } else {
      this.SelectedPermissionGroupDetails = this.SelectedPermissionGroupDetails.filter(
        item => item.archivingTreeID !== $event.data.archivingTreeID
      );
    }

    console.log('Selected Items to Save:', this.SelectedPermissionGroupDetails);
  }
 
  Save() { 
    if(this.SelectedPermissionGroupDetails.length > 0){
      let PermissionGroupDetail = new PermissionGroupDetails()
      PermissionGroupDetail.permissionGroupID = this.permissionGroupID
      PermissionGroupDetail.archivingTreeDetails = this.SelectedPermissionGroupDetails

      this.isLoading = true
      this.permissionGroupDetailsService.Add(PermissionGroupDetail, this.DomainName).subscribe(
        data => {
          Swal.fire({
            icon: 'success',
            title: 'Done',
            text: 'Saved Successfully',
            confirmButtonColor: '#089B41',
          });
          this.isLoading = false
        }
      )
      this.MoveToPermissionGroup()
    }
  } 
}
