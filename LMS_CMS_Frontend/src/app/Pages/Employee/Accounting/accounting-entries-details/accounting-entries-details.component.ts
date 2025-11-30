import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenData } from '../../../../Models/token-data';
import { AccountingEntries } from '../../../../Models/Accounting/accounting-entries';
import { AccountingEntriesDetails } from '../../../../Models/Accounting/accounting-entries-details';
import { AccountingEntriesDocType } from '../../../../Models/Accounting/accounting-entries-doc-type';
import { AccountingEntriesDocTypeService } from '../../../../Services/Employee/Accounting/accounting-entries-doc-type.service';
import { AccountingEntriesService } from '../../../../Services/Employee/Accounting/accounting-entries.service';
import { AccountingEntriesDetailsService } from '../../../../Services/Employee/Accounting/accounting-entries-details.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DataAccordingToLinkFileService } from '../../../../Services/Employee/Accounting/data-according-to-link-file.service';
import { LinkFileService } from '../../../../Services/Employee/Accounting/link-file.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
// import Swal from 'sweetalert2';
import { AccountingTreeChart } from '../../../../Models/Accounting/accounting-tree-chart';
import { AccountingTreeChartService } from '../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

@Component({
  selector: 'app-accounting-entries-details',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './accounting-entries-details.component.html',
  styleUrl: './accounting-entries-details.component.css'
})

@InitLoader()
export class AccountingEntriesDetailsComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  DomainName: string = '';
  UserID: number = 0;

  path: string = '';
  AccountingEntriesID: number = 0;

  isCreate: boolean = false
  isEdit: boolean = false
  isView: boolean = false

  accountingEntries: AccountingEntries = new AccountingEntries()
  validationErrors: { [key in keyof AccountingEntries]?: string } = {};
  validationErrorsForDetails: Record<number, Partial<Record<keyof AccountingEntriesDetails, string>>> = {};

  dataTypesData: AccountingEntriesDocType[] = []
  bankOrSaveData: any[] = []
  // accountingEntriesDetailsData: AccountingEntriesDetails[] = []
  accountingEntriesDetailsDataForPrint: any[] = []
  AccountingTreeChartData: AccountingTreeChart[] = []
  totalCredit: number = 0;
  totalDebit: number = 0;
  theDifference: number = 0;

  isLoading = false;
  isSaveLoading = false;
  isRtl: boolean = false;
  subscription!: Subscription;

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    private translate: TranslateService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public accountingEntriesDocTypeService: AccountingEntriesDocTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public accountingEntriesService: AccountingEntriesService,
    public accountingEntriesDetailsService: AccountingEntriesDetailsService,
    public linkFileService: LinkFileService,
    public dataAccordingToLinkFileService: DataAccordingToLinkFileService,
    public accountingTreeChartService: AccountingTreeChartService,
    public reportsService: ReportsService, private languageService: LanguageService, 
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.AccountingEntriesID = Number(this.activeRoute.snapshot.paramMap.get('id'))

    if (!this.AccountingEntriesID) {
      this.isCreate = true
    } else {
      this.GetAccountingEntriesByID()
      this.GetAccountingTreeChartData()
      // this.GetAccountingEntriesDetails()
    }

    this.activeRoute.url.subscribe(url => {
      this.path = url[0].path
      if (url[1].path == "View") {
        this.isView = true
      } else {
        if (this.AccountingEntriesID) {
          this.isEdit = true
        }
      }
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others
      }
    });

    this.GetDocType()

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

  moveToAccountingEntries() {
    this.router.navigateByUrl("Employee/Accounting Entries")
  }

  GetDocType() {
    this.accountingEntriesDocTypeService.Get(this.DomainName).subscribe(
      (data) => {
        this.dataTypesData = data
      }
    )
  }

  GetAccountingTreeChartData() {
    this.accountingTreeChartService.GetBySubID(this.DomainName).subscribe(
      (data) => {
        this.AccountingTreeChartData = data
      }
    )
  }

  GetSubAccountData(row:AccountingEntriesDetails ,event: Event) {
    row.subAccountData = []
    row.subAccountingID = null
    const target = event.target as HTMLSelectElement;
    const selectedValue = target ? target.value : null;

    if (selectedValue) {
      this.accountingTreeChartService.GetByID(+selectedValue, this.DomainName).subscribe(
        (data) => {
          if (data.linkFileID && data.id) {
            this.dataAccordingToLinkFileService.GetTableDataAccordingToLinkFileAndSubAccount(this.DomainName, data.linkFileID, data.id).subscribe(
              (data) => {
                row.subAccountData = data
              }
            )
          } 
        }
      )
    }
  }

  GetAccountingEntriesByID() {
    this.accountingEntriesService.GetByID(this.AccountingEntriesID, this.DomainName).subscribe(
      (data) => {
        this.accountingEntries = data
        let totalCredit = 0
        let totalDebit = 0
        this.accountingEntries.accountingEntriesDetails.forEach(element => {
          totalCredit = totalCredit + (element.creditAmount ? element.creditAmount : 0)
          totalDebit = totalDebit + (element.debitAmount ? element.debitAmount : 0)
        });
        this.totalCredit = totalCredit
        this.totalDebit = totalDebit
        this.theDifference = this.totalCredit - this.totalDebit
      }
    )
  }

  CalcTotalData() {
    let totalCredit = 0;
    let totalDebit = 0;

    const details = this.accountingEntries.accountingEntriesDetails || [];
    const newDetails = this.accountingEntries.newDetails || [];

    details.forEach(element => {
      totalCredit += Number(element.creditAmount) || 0;
      totalDebit += Number(element.debitAmount) || 0;
    });

    newDetails.forEach(element => {
      totalCredit += Number(element.creditAmount) || 0;
      totalDebit += Number(element.debitAmount) || 0;
    });

    this.totalCredit = totalCredit;
    this.totalDebit = totalDebit;
    this.theDifference = this.totalCredit - this.totalDebit;
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(InsertedByID, this.UserID, this.AllowDeleteForOthers);
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  capitalizeField(field: keyof AccountingEntries): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.accountingEntries) {
      if (this.accountingEntries.hasOwnProperty(key)) {
        const field = key as keyof AccountingEntries;
        if (!this.accountingEntries[field]) {
          if (field == "accountingEntriesDocTypeID" || field == "date" || field == "docNumber") {
            this.validationErrors[field] = `*${this.capitalizeField(field)} is required`
            isValid = false;
          }
        } else {
          this.validationErrors[field] = '';
        }
      }
    }
    return isValid;
  }

  onInputValueChange(event: { field: keyof AccountingEntries, value: any }) {
    const { field, value } = event;
    (this.accountingEntries as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  onInputValueChangeForDetails(row:AccountingEntriesDetails ,event: { field: keyof AccountingEntriesDetails, value: any }) {
    const { field, value } = event;
    (row as any)[field] = value;
    if (value) {
      if (this.validationErrorsForDetails[row.id]) {
        this.validationErrorsForDetails[row.id][field] = '';
      }
    }

    this.CalcTotalData();  
  }

  isDetailsFormValid(): boolean {
    let isValid = true;

    // Reset validation errors
    this.validationErrorsForDetails = {};

    this.accountingEntries.accountingEntriesDetails.forEach((detail) => {
      // Ensure detail has an ID
      const id = detail.id;
      if (!id) return; // skip if no ID

      // Prepare error object for this row
      if (!this.validationErrorsForDetails[id]) {
        this.validationErrorsForDetails[id] = {};
      }

      const errors = this.validationErrorsForDetails[id];

      // Validate only these fields
      const requiredFields: (keyof AccountingEntriesDetails)[] = [
        'accountingTreeChartID',
        'subAccountingID'
      ];

      requiredFields.forEach((field) => {
        const value = detail[field];
        if (!value || value == 0 || value == '') {
          errors[field] = this.getRequiredErrorMessage(
            this.DetailsCapitalizeField(field)
          );
          console.log(errors)
          isValid = false;
        } else {
          errors[field] = ''; 
        }
      });
    });

    if(this.accountingEntries.newDetails && this.accountingEntries.newDetails.length > 0){
      this.accountingEntries.newDetails.forEach((detail) => {
        // Ensure detail has an ID
        const id = detail.id;
        if (!id) return; // skip if no ID

        // Prepare error object for this row
        if (!this.validationErrorsForDetails[id]) {
          this.validationErrorsForDetails[id] = {};
        }

        const errors = this.validationErrorsForDetails[id];

        // Validate only these fields
        const requiredFields: (keyof AccountingEntriesDetails)[] = [
          'accountingTreeChartID',
          'subAccountingID'
        ];

        requiredFields.forEach((field) => {
          const value = detail[field];
          if (!value || value == 0 || value == '') {
            errors[field] = this.getRequiredErrorMessage(
              this.DetailsCapitalizeField(field)
            );
            console.log(errors)
            isValid = false;
          } else {
            errors[field] = ''; 
          }
        });
      });
    }
    return isValid;
  }

  DetailsCapitalizeField(field: keyof AccountingEntriesDetails): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  private getRequiredErrorMessage(fieldName: string): string {
    const fieldTranslated = this.translate.instant(fieldName);
    const requiredTranslated = this.translate.instant('Is Required');

    if (this.isRtl) {
      return `${requiredTranslated} ${fieldTranslated}`;
    } else {
      return `${fieldTranslated} ${requiredTranslated}`;
    }
  }

  validateNumber(event: any, field: keyof AccountingEntries): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.accountingEntries[field] === 'string') {
        this.accountingEntries[field] = '' as never;
      }
    }
  }

  validateNumberEditedRowData(row:AccountingEntriesDetails ,event: any, field: keyof AccountingEntriesDetails): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof row[field] === 'string') {
        row[field] = null as never;
      }
    }
  }


  async Save() {
    const Swal = await import('sweetalert2').then(m => m.default);

    if (this.isCreate) {
      if (this.isFormValid()) {
        this.isSaveLoading = true;
        this.accountingEntriesService.Add(this.accountingEntries, this.DomainName).subscribe(
          (data) => {
            let id = JSON.parse(data).id;
            this.router.navigateByUrl(`Employee/Accounting Entries/${id}`);
            this.isSaveLoading = false;

            Swal.fire({
              title: 'Saved Successfully',
              icon: 'success',
              confirmButtonColor: '#089B41',
            });
          },
          (error) => {
            this.isSaveLoading = false;
          }
        );
      }
    } else if (this.isEdit) {
      if(this.isDetailsFormValid()){
        this.isSaveLoading = true;
        this.accountingEntriesService.Edit(this.accountingEntries, this.DomainName).subscribe(
          (data) => {
            this.GetAccountingEntriesByID();
            this.router.navigateByUrl(`Employee/Accounting Entries/${this.AccountingEntriesID}`);
            this.isSaveLoading = false;
  
            Swal.fire({
              title: 'Updated Successfully',
              icon: 'success',
              confirmButtonColor: '#089B41',
            });
          },
          (error) => {
            this.isSaveLoading = false;
          }
        );
      }
    }
  }

  AddAccountingEntriesDetails() {
    var newDetail = new AccountingEntriesDetails();
    newDetail.id =  Date.now() + Math.floor(Math.random() * 10000);
    newDetail.accountingEntriesMasterID =  this.AccountingEntriesID
    this.accountingEntries.newDetails = this.accountingEntries.newDetails || [];
    this.accountingEntries.newDetails.push(newDetail)
  }

  async DeleteDetail(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذه') + " " + this.translate.instant('Accounting Entries Detail'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountingEntriesDetailsService.Delete(id, this.DomainName).subscribe(
          (data) => {
            this.accountingEntries.accountingEntriesDetails =this.accountingEntries.accountingEntriesDetails.filter(a=>a.id != id)
            this.CalcTotalData();  
          }
        )
      }
    });
  }

  async DeleteNewDetail(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذه') + " " + this.translate.instant('Accounting Entries Detail'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
          this.accountingEntries.newDetails =this.accountingEntries.newDetails.filter(a=>a.id != id)
          this.CalcTotalData();  
      }
    });

  }

  async DownloadAsPDF() {
    this.showPDF = true;
    await this.formatData();
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => this.showPDF = false, 2000);
    }, 500);
  }

  formatData(){
    this.accountingEntriesDetailsDataForPrint = this.accountingEntries.accountingEntriesDetails.map(item => ({
      id: item.id,
      'Debit Amount': item.debitAmount || 0,
      'Credit Amount': item.creditAmount || 0,
      'Account Name': item.accountingTreeChartName,
      'sub Account': item.subAccountingName,
      'Note': item.note
    }));
  }

  async Print() {
    this.showPDF = true;
    await this.formatData();
    setTimeout(() => {
      const printContents = document.getElementById("Data")?.innerHTML;
      if (!printContents) {
        return;
      }

      const printStyle = `
        <style>
          @page { size: auto; margin: 0mm; }
          body { margin: 0; }
          @media print {
            body > *:not(#print-container) {
              display: none !important;
            }
            #print-container {
              display: block !important;
              position: static !important;
              top: auto !important;
              left: auto !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          }
        </style>
      `;

      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = printStyle + printContents;

      document.body.appendChild(printContainer);
      window.print();

      setTimeout(() => {
        document.body.removeChild(printContainer);
        this.showPDF = false;
      }, 100);
    }, 500);
  }


  async DownloadAsExcel() {
    await this.reportsService.generateExcelReport({
      mainHeader: {
        en: "Accounting Entries Report",
        ar: "تقرير القيود المحاسبية"
      },
      // subHeaders: [
      //   { en: "Detailed accounting entries information", ar: "معلومات تفصيلية عن القيود المحاسبية" },
      // ],
      infoRows: [
        { key: 'Document Type', value: this.accountingEntries.accountingEntriesDocTypeName || '' },
        { key: 'Document Number', value: this.accountingEntries.docNumber || '' },
        { key: 'Date', value: this.accountingEntries.date || '' },
        { key: 'Total Credit', value: this.totalCredit || 0 },
        { key: 'Total Debit', value: this.totalDebit || 0 },
        { key: 'Difference', value: this.theDifference || 0 }
      ],
      reportImage: '', // Add image URL if available
      filename: "Accounting_Entries_Report.xlsx",
      tables: [
        {
          // title: "Accounting Entries Details",
          headers: ['id', 'debitAmount', 'creditAmount', 'Account Name', 'sub Account', 'note'],
          data: this.accountingEntries.accountingEntriesDetails.map((row) => [
            row.id || 0,
            row.debitAmount || 0,
            row.creditAmount || 0,
            row.accountingTreeChartName || '',
            row.subAccountingName || '',
            row.note || ''
          ])
        }
      ]
    });
  }

  get infoRows() {
    const rows = [
      { keyEn: 'Document Type: ' + this.accountingEntries.accountingEntriesDocTypeName },
      { keyEn: 'Document Number: ' + this.accountingEntries.docNumber },
      { keyEn: 'Date: ' + this.accountingEntries.date },
      { keyEn: 'Total Credit: ' + this.totalCredit },
      { keyEn: 'Total Debit: ' + this.totalDebit },
      { keyEn: 'Difference: ' + this.theDifference },
    ];

    if (this.accountingEntries.notes) {
      rows.push({ keyEn: 'Note: ' + this.accountingEntries.notes });
    }

    return rows;
  }
}
