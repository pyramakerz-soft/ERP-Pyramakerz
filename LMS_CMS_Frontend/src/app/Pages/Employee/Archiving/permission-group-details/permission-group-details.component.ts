import { Component } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';

@Component({
  selector: 'app-permission-group-details',
  standalone: true,
  imports: [],
  templateUrl: './permission-group-details.component.html',
  styleUrl: './permission-group-details.component.css'
})
export class PermissionGroupDetailsComponent { 
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
  
  DomainName: string = '';
  UserID: number = 0;
  
  isLoading = false;

  permissionGroupID = 0

  constructor( 
    public activeRoute: ActivatedRoute,
    public account: AccountService,  
    public ApiServ: ApiService, 
  ) {}

  ngOnInit() {
    this.permissionGroupID = Number(this.activeRoute.snapshot.paramMap.get('id'));

    this.User_Data_After_Login = this.account.Get_Data_Form_Token(); 
    this.DomainName = this.ApiServ.GetHeader(); 
  }
}
