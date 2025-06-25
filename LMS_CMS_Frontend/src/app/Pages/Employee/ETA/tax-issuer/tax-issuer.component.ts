import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaxIssuer } from '../../../../Models/Administrator/tax-issuer.model';
import Swal from 'sweetalert2';
import { TaxIssuerService } from '../../../../Services/Employee/Administration/tax-issuer.service';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';

@Component({
  selector: 'app-tax-issuer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tax-issuer.component.html',
  styleUrl: './tax-issuer.component.css'
})
export class TaxIssuerComponent {
  taxData:TaxIssuer = new TaxIssuer()
 
  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
  
  isLoading = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,     
    public taxIssuerService: TaxIssuerService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();
 
    this.GetById()  
  }

  GetById(){
    this.taxData = new TaxIssuer()
    this.taxIssuerService.getById(1, this.DomainName).subscribe(
      data => {
        this.taxData = data  
      }
    )
  }

  openModal() { 
    this.GetById();
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden'); 
    this.taxData = new TaxIssuer();  
  }

  save(){
    this.taxIssuerService.edit(this.taxData, this.DomainName).subscribe(
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
