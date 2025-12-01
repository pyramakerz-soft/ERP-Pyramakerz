import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../../Services/api.service';
import { Order } from '../../../../Models/Student/ECommerce/order';
import { OrderService } from '../../../../Services/Student/order.service';
import { EmployeeStudentService } from '../../../../Services/Employee/Accounting/employee-student.service';
import { EmplyeeStudent } from '../../../../Models/Accounting/emplyee-student';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Student } from '../../../../Models/student';
import { StudentService } from '../../../../Services/student.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';
@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})

@InitLoader()
export class OrderComponent { 
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  UserID: number = 0;
  StuID: number = 0;
  emplyeeStudent: EmplyeeStudent[] = [];
  DomainName: string = ""; 
  isRtl: boolean = false;
  subscription!: Subscription;
  orders: Order[] = []

  filteredOrders: Order[] = [] 
  searchTerm: string = '';
  students: Student[] = [];

  constructor(public account: AccountService,private languageService: LanguageService,public StudentService: StudentService, 
    public ApiServ: ApiService, private router: Router, public employeeStudentService:EmployeeStudentService, private orderrService: OrderService,
    private loadingService: LoadingService){}
  
  ngOnInit(){
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader(); 

    if(this.User_Data_After_Login.type == 'employee'){
      this.getStudents()
    }

    if(this.User_Data_After_Login.type == 'student'){
      this.StuID = this.UserID
    }
    
    if(this.User_Data_After_Login.type == 'parent'){
      this.getStudentsByParent()
    }

    this.getOrders() 
        this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {  
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getStudents(){
    this.employeeStudentService.Get(this.UserID, this.DomainName).subscribe(
      data => {
        this.emplyeeStudent = data
      }
    )
  }

  getStudentsByParent(){
    this.StudentService.Get_By_ParentID(this.UserID, this.DomainName).subscribe(
      data => {
        this.students = data
      }
    )
  }  

  goToCart() {
    if(this.User_Data_After_Login.type == 'employee'){
      this.router.navigateByUrl("Employee/Cart")
    } 
    else if(this.User_Data_After_Login.type == 'student'){
      this.router.navigateByUrl("Student/Cart")
    }
    else{
      this.router.navigateByUrl("Parent/Cart")
    }
  } 

  getOrders() {
    this.orders = []
    this.orderrService.getByStudentID(this.StuID, this.DomainName).subscribe(
      data => {
        this.orders = data
        this.filterOrders(); 
      }
    )
  } 

  formatDate(dateString: string) {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    const formattedDate = date.toLocaleDateString('en-US', options)

    return `${formattedDate}`;
  }

  goToOrderItems(id: number) {
    if(this.User_Data_After_Login.type == 'employee'){
      this.router.navigateByUrl("Employee/Order/" + id)
    } else if(this.User_Data_After_Login.type == 'student'){
      this.router.navigateByUrl("Student/Order/" + id)
    }
    else{
      this.router.navigateByUrl("Parent/Order/" + id)
    }
  }
  
  DownloadOrder(id:number) {  
    console.log(this.User_Data_After_Login.type)
    if(this.User_Data_After_Login.type == 'employee'){ 
      this.router.navigate(['Employee/Order', id], { queryParams: { download: 'true' } }); 

    } else if(this.User_Data_After_Login.type == 'student'){ 
      this.router.navigate(['Student/Order', id], { queryParams: { download: 'true' } }); 
    } 
    else if(this.User_Data_After_Login.type == 'parent'){
      this.router.navigate(['Parent/Order', id], { queryParams: { download: 'true' } }); 
    }
  }

  filterOrders() {
    if(this.searchTerm.trim() === '') {
      this.filteredOrders = [...this.orders]; 
    } else {
      this.filteredOrders = this.orders.filter(order =>
        order.cartID.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.totalPrice.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.orderStateName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
} 
