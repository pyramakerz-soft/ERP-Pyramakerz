import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../Component/search/search.component';
import { SchoolType } from '../../../Models/Octa/school-type';
import { SchoolTypeService } from '../../../Services/Octa/school-type.service';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../Services/loading.service';
@Component({
  selector: 'app-school-type',
  standalone: true,
  imports: [FormsModule,CommonModule,SearchComponent, TranslateModule],
  templateUrl: './school-type.component.html',
  styleUrl: './school-type.component.css'
})

@InitLoader()
export class SchoolTypeComponent {
  keysArray: string[] = ['id', 'name' ];
  key: string= "id";
  value: any = "";
  isRtl: boolean = false;
  subscription!: Subscription;
  schoolTypeData:SchoolType[] = []
  schoolType:SchoolType = new SchoolType()
  editSchoolType:boolean = false
  validationErrors: { [key in keyof SchoolType]?: string } = {};

  isSaved = false

  constructor(private languageService: LanguageService,public schoolTypeService: SchoolTypeService,
    private loadingService: LoadingService ){}

  ngOnInit(){
    this.getSchoolTypeData()
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


  getSchoolTypeData(){
    this.schoolTypeService.Get().subscribe(
      (data) => {
        this.schoolTypeData = data;
      }
    )
  }

  GetSchoolTypeById(schoolTypeId: number) {
    this.schoolTypeService.GetSchoolTypeBuID(schoolTypeId).subscribe((data) => {
      this.schoolType = data;
    });
  }

  openModal(schoolTypeId?: number) {
    if (schoolTypeId) {
      this.editSchoolType = true;
      this.GetSchoolTypeById(schoolTypeId); 
    }
    
    document.getElementById("Add_Modal")?.classList.remove("hidden");
    document.getElementById("Add_Modal")?.classList.add("flex");
  }

  closeModal() {
    document.getElementById("Add_Modal")?.classList.remove("flex");
    document.getElementById("Add_Modal")?.classList.add("hidden");

    this.schoolType= new SchoolType()

    if(this.editSchoolType){
      this.editSchoolType = false
    }
    this.validationErrors = {}; 

    this.isSaved = false
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: SchoolType[] = await firstValueFrom(this.schoolTypeService.Get());  
      this.schoolTypeData = data || [];
  
      if (this.value !== "") {
        const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);
  
        this.schoolTypeData = this.schoolTypeData.filter(t => {
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
      this.schoolTypeData = [];
    }
  }

  capitalizeField(field: keyof SchoolType): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.schoolType) {
      if (this.schoolType.hasOwnProperty(key)) {
        const field = key as keyof SchoolType;
        if (!this.schoolType[field]) {
          if(field == "name"){
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          }
        } else {
          if(field == "name"){
            if(this.schoolType.name.length > 100){
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

  onInputValueChange(event: { field: keyof SchoolType, value: any }) {
    const { field, value } = event;
    if (field == "name") {
      (this.schoolType as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

  SaveSchoolType(){
    if(this.isFormValid()){
      this.isSaved = true
      if(this.editSchoolType == false){
        this.schoolTypeService.Add(this.schoolType).subscribe(
          (result: any) => {
            Swal.fire({
              title: 'School Type Created Successfully',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#089B41',
              confirmButtonText: 'Okay',
            }).then((r) => {
              this.closeModal()
              this.schoolTypeService.Get().subscribe(
                (data: any) => {
                  this.schoolTypeData = data;
                }
              );
              this.isSaved = false
            });
          },
          error => {
            if(error.error == "Name Already Exists"){
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please Enter Another School Type Name"
              });
            }
            this.isSaved = false
          }
        );
      } else{
        this.schoolTypeService.Edit(this.schoolType).subscribe(
          (result: any) => {
            this.closeModal()
            this.schoolTypeService.Get().subscribe(
              (data: any) => {
                this.schoolTypeData = data;
              }
            );
          },
          error => {
            if(error.error == "Name Already Exists"){
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please Enter Another School Type Name"
              });
            }
            this.isSaved = false
          }
        );
      }  
    }
  } 

  deleteShoolType(id:number){
    Swal.fire({
      title: 'Are you sure you want to delete this school type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.schoolTypeService.DeleteSchoolType(id).subscribe(
          (data: any) => {
            this.schoolTypeData=[]
            this.getSchoolTypeData()
          }
        );
      }
    });
  }
}
