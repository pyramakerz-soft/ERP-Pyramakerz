import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaxIssuer } from '../../../../Models/Administrator/tax-issuer.model';
import Swal from 'sweetalert2';
import { TaxIssuerService } from '../../../../Services/Employee/ETA/tax-issuer.service';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { CountryService } from '../../../../Services/Octa/country.service';
import { Country } from '../../../../Models/Accounting/country';
import { TaxType } from '../../../../Models/ETA/tax-type';
import { TaxTypeService } from '../../../../Services/Employee/ETA/tax-type.service';

@Component({
  selector: 'app-tax-issuer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax-issuer.component.html',
  styleUrl: './tax-issuer.component.css'
})
export class TaxIssuerComponent {
  taxData:TaxIssuer = new TaxIssuer()
  taxDataToEdit:TaxIssuer = new TaxIssuer()
  countries:Country[] = [] 
  taxTypes:TaxType[] = [] 
 
  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
  
  isLoading = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,     
    public countryService: CountryService,     
    public taxTypeService: TaxTypeService,     
    public taxIssuerService: TaxIssuerService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();
 
    this.GetById()  
    this.Getcountries()  
    this.GetType()  
  }

  GetById(){
    this.taxData = new TaxIssuer()
    this.taxIssuerService.getById(1, this.DomainName).subscribe(
      data => {
        this.taxData = data    
        if(this.taxData.typeID == 0){
          this.taxData.typeID = null
        }
      }
    )
  }
  
  Getcountries(){
    this.countryService.Get().subscribe(data => this.countries = data)  
  } 
  
  GetType(){
    this.taxTypeService.Get(this.DomainName).subscribe(data => this.taxTypes = data)  
  }
  
  openModal() { 
    this.taxDataToEdit = JSON.parse(JSON.stringify(this.taxData));
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');   
  }

  save(){ 
    this.isLoading = true;
    
    this.taxIssuerService.edit(this.taxDataToEdit, this.DomainName).subscribe(
      (result: any) => {
        this.closeModal();
        this.GetById()
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Try Again Later!',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
      }
    );
  }
}
