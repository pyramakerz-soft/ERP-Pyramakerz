import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../Component/search/search.component';
import Swal from 'sweetalert2';
import { Account } from '../../../Models/Octa/account';
import { OctaService } from '../../../Services/Octa/octa.service';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../Services/loading.service';
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule,CommonModule,SearchComponent, TranslateModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})

@InitLoader()
export class AccountComponent {
  keysArray: string[] = ['id', 'user_Name','arabic_Name'  ];
  key: string= "id";
  value: any = "";
  isRtl: boolean = false;
  subscription!: Subscription;
  accountData:Account[] = []
  accountToMake:Account = new Account()
  editAccount:boolean = false
  validationErrors: { [key in keyof Account]?: string } = {};

  constructor(private languageService: LanguageService,public octaService: OctaService,
    private loadingService: LoadingService ){}
  
  ngOnInit(){
    this.getAccountData()
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

  getAccountData(){
    this.octaService.Get().subscribe(
      (data) => {
        this.accountData = data;
      }
    )
  }

  GetAccountById(accountId: number) {
    this.accountToMake = new Account()
    this.octaService.GetByID(accountId).subscribe((data) => {
      this.accountToMake = data;
    });
  }

  openModal(accountId?: number) {
    if (accountId) {
      this.editAccount = true;
      this.GetAccountById(accountId); 
    } 
    
    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

    this.accountToMake= new Account()

    if(this.editAccount){
      this.editAccount = false
    }
    this.validationErrors = {}; 
  }
  
  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Account[] = await firstValueFrom( this.octaService.Get());  
      this.accountData = data || [];
  
      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);
  
        this.accountData = this.accountData.filter(t => {
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
      this.accountData = [];
    }
  }

  capitalizeField(field: keyof Account): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.accountToMake) {
      if (this.accountToMake.hasOwnProperty(key)) {
        const field = key as keyof Account;
        if (!this.accountToMake[field]) {
          if(field == "user_Name" || field == "arabic_Name" || field == "password"){
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          }
        } else {
          if(field == "user_Name" || field == "arabic_Name"){
            if(this.accountToMake.user_Name.length > 100 || this.accountToMake.arabic_Name.length > 100){
              this.validationErrors[field] = `*${this.capitalizeField(field)} cannot be longer than 100 characters`
              isValid = false;
            }
          } else{
            this.validationErrors[field] = '';
          }
        }
      }
    }
    return isValid;
  }

  onInputValueChange(event: { field: keyof Account, value: any }) {
    const { field, value } = event;
    if (field == "user_Name" || field == "arabic_Name" || field == "password") {
      (this.accountToMake as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

  SaveAccount(){
    if(this.isFormValid()){
      if(this.editAccount == false){
        this.octaService.Add(this.accountToMake).subscribe(
          (result: any) => {
            this.closeModal()
            this.getAccountData()
          },
          error => {
          }
        );
      } else{
        this.octaService.Edit(this.accountToMake).subscribe(
          (result: any) => {
            this.closeModal()
            this.getAccountData()
          },
          error => {
          }
        );
      }  
    }
  } 

  deleteAccount(id:number){
    Swal.fire({
      title: 'Are you sure you want to delete this account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.octaService.Delete(id).subscribe(
          (data: any) => {
            this.accountData=[]
            this.getAccountData()
          }
        );
      }
    });
  }
}
