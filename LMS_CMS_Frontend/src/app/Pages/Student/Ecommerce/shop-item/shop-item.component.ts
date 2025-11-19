import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ShopItemService } from '../../../../Services/Employee/Inventory/shop-item.service';
import { ShopItem } from '../../../../Models/Inventory/shop-item';
import { CommonModule } from '@angular/common';
import { CartShopItem } from '../../../../Models/Student/ECommerce/cart-shop-item';
import { CartShopItemService } from '../../../../Services/Student/cart-shop-item.service';
import Swal from 'sweetalert2';
import { EmplyeeStudent } from '../../../../Models/Accounting/emplyee-student';
import { EmployeeStudentService } from '../../../../Services/Employee/Accounting/employee-student.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { StudentService } from '../../../../Services/student.service';
import { Student } from '../../../../Models/student';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../Services/loading.service';

@Component({
  selector: 'app-shop-item',
  standalone: true,
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './shop-item.component.html',
  styleUrl: './shop-item.component.css'
})

@InitLoader()
export class ShopItemComponent {
  ShopItemId = 0
  
  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  UserID: number = 0;
  StuID: number = 0;
  emplyeeStudent: EmplyeeStudent[] = [];
  DomainName: string = "";

  shopItem: ShopItem = new ShopItem()
  cartShopItem:CartShopItem = new CartShopItem() 
  isRtl: boolean = false;
  subscription!: Subscription;
  CalculatedVat: number = 0;
  selectedColor: number = 0;
  selectedSize: number = 0;
  students: Student[] = [];
  
  imageList: string[] = [];
  selectedImage: string | null = null;
  
  constructor(public activeRoute: ActivatedRoute,private languageService: LanguageService, public account: AccountService, public ApiServ: ApiService, private router: Router, public shopItemService:ShopItemService
    , private cartShopItemService:CartShopItemService, public employeeStudentService:EmployeeStudentService,public StudentService: StudentService,
    private loadingService: LoadingService
  ){}

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

    this.ShopItemId = Number(this.activeRoute.snapshot.paramMap.get('id'))

    this.getShopItem() 
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

  getShopItem(){
    this.shopItemService.GetById(this.ShopItemId, this.DomainName).subscribe(
      data => {
        this.shopItem = data
        if(this.shopItem.vatForForeign != 0){
          this.CalculatedVat = (this.shopItem.salesPrice ? this.shopItem.salesPrice : 0) + (this.shopItem.salesPrice ? this.shopItem.salesPrice : 0) * ((this.shopItem.vatForForeign ? this.shopItem.vatForForeign : 0) / 100)
        }

        const images = [];
        if (this.shopItem.mainImage) images.push(this.shopItem.mainImage);
        if (this.shopItem.otherImage) images.push(this.shopItem.otherImage);
        this.imageList = images;
 
        if (this.shopItem.mainImage) {
          this.selectedImage = this.shopItem.mainImage;
        } else if (this.shopItem.otherImage) {
          this.selectedImage = this.shopItem.otherImage;
        } else {
          this.selectedImage = null;
        }
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

  moveToShop() {
    if(this.User_Data_After_Login.type == "employee"){
      this.router.navigateByUrl("Employee/The Shop")
    } else if(this.User_Data_After_Login.type == "student"){
      this.router.navigateByUrl("Student/Shop")
    }else{
      this.router.navigateByUrl("Parent/Shop")
    }
  }

  goToCart() {
    if(this.User_Data_After_Login.type == "employee"){
      this.router.navigateByUrl("Employee/Cart")
    } else if(this.User_Data_After_Login.type == "student"){
      this.router.navigateByUrl("Student/Cart")
    } else{
      this.router.navigateByUrl("Parent/Cart")
    }
  } 

  goToOrder() {
    if(this.User_Data_After_Login.type == "employee"){
      this.router.navigateByUrl("Employee/Order")
    } else if(this.User_Data_After_Login.type == "student"){
      this.router.navigateByUrl("Student/Order")
    } else{
      this.router.navigateByUrl("Parent/Order")
    }
  } 

  addShopItemToCart(id: number) { 
    this.shopItemService.CheckIfHeCanAddItem(id, this.StuID, this.DomainName).subscribe(
      data =>{
        if(data == true){
          this.cartShopItem.studentID = this.StuID
          this.cartShopItem.quantity = 1
          this.cartShopItem.shopItemID = id
          if(this.selectedColor != 0){
            this.cartShopItem.shopItemColorID = this.selectedColor
          }
          if(this.selectedSize != 0){
            this.cartShopItem.shopItemSizeID = this.selectedSize
          }
      
          this.cartShopItemService.Add(this.cartShopItem, this.DomainName).subscribe(
            data => {
              Swal.fire({
                title: "Added Successfully!",
                icon: "success"
              }) 
            }
          )
        }else{
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: "This item isn't available for your selected student",
            confirmButtonText: 'Okay',
            customClass: { confirmButton: 'secondaryBg' },
          });
        }
      }
    )
  }

  onAddToCartClick(event: MouseEvent, itemId: number) {
    event.stopPropagation();  
    this.addShopItemToCart(itemId);
  }

  ChooseColor(id: any) {
    this.selectedColor = id
  }

  ChooseSize(id: any) {
    this.selectedSize = id
  }
      
  isValidColor(color: string): boolean {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }
}
