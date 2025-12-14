import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { Login } from '../Models/login';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { TokenData } from '../Models/token-data';
import { EmployeeService } from './Employee/employee.service';
import { LogOutService } from './shared/log-out.service';
import { ParentService } from './parent.service';
import { StudentService } from './student.service';
import { NavMenuComponent } from '../Component/nav-menu/nav-menu.component';
import { OctaService } from './Octa/octa.service';
import { EditPass } from '../Models/Employee/edit-pass';


@Injectable({
  providedIn: 'root'
})

export class AccountService {
  
  baseUrl=""
  baseUrlOcta=""

  header="" 

  constructor(public http: HttpClient ,private router: Router , public ApiServ:ApiService, 
    public employeeService:EmployeeService, public studentService:StudentService, public parentService:ParentService, public octaService:OctaService,
    public logOutService:LogOutService){  
    this.baseUrl=ApiServ.BaseUrl
    this.baseUrlOcta=ApiServ.BaseUrlOcta
    this.header = ApiServ.GetHeader();

  }

  Login(UserInfo: Login) {
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Content-Type', 'application/json');
  
    return this.http.post(`${this.baseUrl}/Account`, UserInfo, {
      headers: headers,
      responseType: 'text',
    });
  } 
 
  EditPassword(editpass: EditPass, DomainName?: string) { // view 
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/Account/EditPass`, editpass, { headers });
  }
 
  EditPasswordByToken(editpass: EditPass, DomainName?: string) { // view 
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/Account/EditPasswordByToken`, editpass, { headers });
  }

  Get_Data_Form_Token(isFromLogin?:boolean){
    let User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
    let token = localStorage.getItem("current_token")
    if(token){
      User_Data_After_Login = jwtDecode(token)  
 
      if(User_Data_After_Login.type == 'employee'){
        if(isFromLogin){
          this.employeeService.GetMyData(this.header, { forceRefresh: true }).subscribe(data => { 
            if(User_Data_After_Login.user_Name != data.user_Name || User_Data_After_Login.role != data.role_ID){  
              this.logOutService.logOut() 
              this.router.navigateByUrl(""); 
            } 
          });
        }else{
          this.employeeService.GetMyData(this.header).subscribe(
            data => {  
              if(User_Data_After_Login.user_Name != data.user_Name || User_Data_After_Login.role != data.role_ID){  
                this.logOutService.logOut() 
                this.router.navigateByUrl(""); 
              } 
            }
          )
        }
      } else if(User_Data_After_Login.type == 'parent'){
        this.parentService.GetByIDByToken(this.header).subscribe(
          data => { 
            if(User_Data_After_Login.user_Name != data.user_Name){
              this.logOutService.logOut() 
              this.router.navigateByUrl("");
            } 
          }
        )
      } else if(User_Data_After_Login.type == 'student'){
        this.studentService.GetByIDByToken(this.header).subscribe(
          data => { 
            if(User_Data_After_Login.user_Name != data.user_Name){
              this.logOutService.logOut()
              this.router.navigateByUrl(""); 
            } 
          }
        )
      } else if(User_Data_After_Login.type == 'octa'){
        this.octaService.GetByID(User_Data_After_Login.id).subscribe(
          data => { 
            if(User_Data_After_Login.user_Name != data.user_Name){
              this.logOutService.logOut() 
              this.router.navigateByUrl("");
            } 
          }
        )
      }
      return User_Data_After_Login
    } else{
      return User_Data_After_Login
    }
  }

  LoginOcta(UserInfo: Login) {
    const headers = new HttpHeaders()
    .set('Content-Type', 'application/json');
    return this.http.post(`${this.baseUrlOcta}/OctaAccount`, UserInfo, {
      headers: headers,
      responseType: 'text',
    });
  }

}
