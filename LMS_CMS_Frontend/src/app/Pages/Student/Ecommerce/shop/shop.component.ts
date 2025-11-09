import { Component } from '@angular/core';
import { InventoryCategoryService } from '../../../../Services/Employee/Inventory/inventory-category.service';
import { Category } from '../../../../Models/Inventory/category';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { CommonModule } from '@angular/common';
import { SubCategory } from '../../../../Models/Inventory/sub-category';
import { InventorySubCategoriesService } from '../../../../Services/Employee/Inventory/inventory-sub-categories.service';
import { ShopItemService } from '../../../../Services/Employee/Inventory/shop-item.service';
import { ShopItem } from '../../../../Models/Inventory/shop-item';
import { Router } from '@angular/router';
import { CartShopItemService } from '../../../../Services/Student/cart-shop-item.service';
import { CartShopItem } from '../../../../Models/Student/ECommerce/cart-shop-item';
import Swal from 'sweetalert2';
import { EmployeeStudentService } from '../../../../Services/Employee/Accounting/employee-student.service';
import { EmplyeeStudent } from '../../../../Models/Accounting/emplyee-student';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { StudentService } from '../../../../Services/student.service';
import { Student } from '../../../../Models/student';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent { 
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  UserID: number = 0;
  StuID: number = 0;
  emplyeeStudent: EmplyeeStudent[] = [];
  students: Student[] = [];
  DomainName: string = "";
  
  InventoryCategory:Category[] = []
  InventorySubCategory:SubCategory[] = []
  ShopItem:ShopItem[] = []
  selectedInventoryCategory = 0
  selectedInventorySubCategory = 0
  isRtl: boolean = false;
  subscription!: Subscription;
  CurrentPage:number = 1
  PageSize:number = 9

  TotalPages:number = 1
  TotalRecords:number = 0
  
  cartShopItem:CartShopItem = new CartShopItem()
 
  searchQuery: string = '';
   
  constructor(public inventoryCategoryService:InventoryCategoryService,private languageService: LanguageService, public inventorySubCategoryService:InventorySubCategoriesService, public employeeStudentService:EmployeeStudentService,
    public account: AccountService,public StudentService: StudentService, public ApiServ: ApiService, public shopItemService:ShopItemService, private router: Router, private cartShopItemService:CartShopItemService){}

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

    this.getInventoryCategory() 
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
    this.students = []
    this.StudentService.Get_By_ParentID(this.UserID, this.DomainName).subscribe(
      data => {
        this.students = data
      }
    )
  }

  getInventoryCategory(){
    this.InventoryCategory = []
    this.inventoryCategoryService.Get(this.DomainName).subscribe(
      data => {
        this.InventoryCategory = data 
      }
    )
  }

  getInventorySubCategory(){
    this.InventorySubCategory = []
    this.inventorySubCategoryService.GetByCategoryId(this.selectedInventoryCategory, this.DomainName).subscribe(
      data => { 
        this.InventorySubCategory = data 
      }
    )
  }

  getSubCategories(id: number) { 
    this.InventorySubCategory = []
    this.ShopItem = []
    this.selectedInventorySubCategory = 0
    this.selectedInventoryCategory = id
    this.getInventorySubCategory()
  }

  getShopPagination(){
    this.ShopItem = []
    this.shopItemService.GetBySubCategoryID(this.selectedInventorySubCategory, this.CurrentPage, this.PageSize, this.DomainName, this.searchQuery).subscribe(
      data => { 
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords 
        this.ShopItem = data.data 
      }
    )
  }

  getShopPaginationWithStudentID(){
    this.ShopItem = []
    this.shopItemService.GetBySubCategoryIDWithGenderAndGradeAndStudentID(this.selectedInventorySubCategory, this.StuID, this.CurrentPage, this.PageSize, this.DomainName, this.searchQuery).subscribe(
      data => { 
        this.CurrentPage = data.pagination.currentPage
        this.PageSize = data.pagination.pageSize
        this.TotalPages = data.pagination.totalPages
        this.TotalRecords = data.pagination.totalRecords 
        this.ShopItem = data.data 
      }
    )
  }
  
  getShopItems(id: number) { 
    this.ShopItem = []
    this.selectedInventorySubCategory = id
    if(this.StuID != 0){
      this.getShopPaginationWithStudentID()
    }else{
      this.getShopPagination()
    }
  }
  
  addShopItemToCart(id: number) { 
    this.cartShopItem.studentID = this.StuID
    this.cartShopItem.quantity = 1
    this.cartShopItem.shopItemID = id

    this.cartShopItemService.Add(this.cartShopItem, this.DomainName).subscribe(
      data => {
        Swal.fire({
          title: "Added Successfully!",
          icon: "success"
        }).then((result) => {
          this.goToCart();
        }); 
      }
    )
  }

  onAddToCartClick(event: MouseEvent, itemId: number) {
    event.stopPropagation();  
    this.addShopItemToCart(itemId);
  }

  changeCurrentPage(currentPage:number){
    this.CurrentPage = currentPage
    if(this.StuID != 0){
      this.getShopPaginationWithStudentID()
    }else{
      this.getShopPagination()
    } 
  }

  get visiblePages(): number[] {
    const total = this.TotalPages;
    const current = this.CurrentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  
  goToShopItem(id: number) {  
    if(this.User_Data_After_Login.type == "employee"){
      this.router.navigateByUrl("Employee/The Shop/" + id)
    } 
    else if(this.User_Data_After_Login.type == "student"){
      this.router.navigateByUrl("Student/The Shop/" + id)
    }
    else{
      this.router.navigateByUrl("Parent/The Shop/" + id)
    }
  }

  goToCart() {
    if(this.User_Data_After_Login.type == "employee"){
      this.router.navigateByUrl("Employee/Cart")
    }
    else if(this.User_Data_After_Login.type == "student"){
      this.router.navigateByUrl("Student/Cart")
    }
    else{
      this.router.navigateByUrl("Parent/Cart")

    }
  } 

  goToOrder() {
    if(this.User_Data_After_Login.type == "employee"){
      this.router.navigateByUrl("Employee/Order")
    } 
    else if(this.User_Data_After_Login.type == "student"){
      this.router.navigateByUrl("Student/Order")
    }
    else{
      this.router.navigateByUrl("Parent/Order")
    }
  }
  
  searchReports(): void {
    this.ShopItem = []
    this.CurrentPage = 1; 
    if(this.StuID != 0){
      this.getShopPaginationWithStudentID()
    }else{
      this.getShopPagination()
    }
  }

  onStudentChange(){ 
    if(this.StuID != 0){
      this.getShopPaginationWithStudentID()
    }else{
      this.getShopPagination()
    }
  }
}
