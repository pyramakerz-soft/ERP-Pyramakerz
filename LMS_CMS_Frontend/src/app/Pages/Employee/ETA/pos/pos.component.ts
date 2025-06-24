import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { POS } from '../../../../Models/ETA/pos';
import { TokenData } from '../../../../Models/token-data';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css'
})
export class POSComponent {
  validationErrors: { [key in keyof POS]?: string } = {}; 
  keysArray: string[] = ['id','name','clientID','clientSecret','clientSecret2','deviceSerialNumber'];
  key: string = 'id';
  value: any = '';

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  assignment: POS = new POS();
  POSData: POS[] = [];
   
  CurrentPage:number = 1
  PageSize:number = 10
  TotalPages:number = 1
  TotalRecords:number = 0
  isDeleting:boolean = false;
  viewClassStudents:boolean = false;
  viewStudents:boolean = false;

  isLoading = false;


  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      // const data: any = await firstValueFrom(
      //   this.posService.Get(this.DomainName, this.CurrentPage, this.PageSize)
      // );
      // this.POSData = data.data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.POSData = this.POSData.filter((t) => {
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
      this.POSData = [];
    }
  }
}
