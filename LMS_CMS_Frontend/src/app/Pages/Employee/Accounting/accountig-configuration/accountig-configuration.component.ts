import { Component } from '@angular/core';
import { AccountingTreeChart } from '../../../../Models/Accounting/accounting-tree-chart';
import { TokenData } from '../../../../Models/token-data';
import { AccountingTreeChartService } from '../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import Swal from 'sweetalert2';
import { AccountingConfiguration } from '../../../../Models/Accounting/accounting-configuration';
import { AccountingConfigurationService } from '../../../../Services/Employee/Accounting/accounting-configuration.service';

@Component({
  selector: 'app-accountig-configuration',
  standalone: true,
  imports: [],
  templateUrl: './accountig-configuration.component.html',
  styleUrl: './accountig-configuration.component.css'
})
export class AccountigConfigurationComponent {
  accountConfigData:AccountingConfiguration = new AccountingConfiguration() 
  accountConfigDataToEdit:AccountingConfiguration = new AccountingConfiguration() 
  accountingTreeCharts:AccountingTreeChart[] = []  
 
  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
  
  isLoading = false;

  constructor(
    public account: AccountService,
    public ApiServ: ApiService,     
    public accountingTreeChartService: AccountingTreeChartService,
    public accountingConfigurationService: AccountingConfigurationService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();
 
    this.GetById()  
    this.GetAccountingTree()   
  }

  GetById(){
    this.accountConfigData = new AccountingConfiguration()
    this.accountingConfigurationService.getById(1, this.DomainName).subscribe(
      data => {
        this.accountConfigData = data   
      }
    )
  }
  
  GetAccountingTree(){
    this.accountingTreeChartService.GetBySubID(this.DomainName).subscribe(data => this.accountingTreeCharts = data)  
  } 
   
  openModal() {  
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');   
  }

  save(){ 
    this.isLoading = true;
    
    this.accountingConfigurationService.edit(this.accountConfigDataToEdit, this.DomainName).subscribe(
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
