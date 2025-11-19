import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Payable } from '../../../../Models/Accounting/payable';
import { PayableDocType } from '../../../../Models/Accounting/payable-doc-type';
import { PayableDetails } from '../../../../Models/Accounting/payable-details';
import { LinkFile } from '../../../../Models/Accounting/link-file';
import { TokenData } from '../../../../Models/token-data';
import { PayableService } from '../../../../Services/Employee/Accounting/payable.service';
import { PayableDocTypeService } from '../../../../Services/Employee/Accounting/payable-doc-type.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DataAccordingToLinkFileService } from '../../../../Services/Employee/Accounting/data-according-to-link-file.service';
import { LinkFileService } from '../../../../Services/Employee/Accounting/link-file.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { PayableDetailsService } from '../../../../Services/Employee/Accounting/payable-details.service';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { Bank } from '../../../../Models/Accounting/bank';
import { Saves } from '../../../../Models/Accounting/saves';
import { SafeEmployee } from '../../../../Models/Accounting/safe-employee';
import { BankEmployee } from '../../../../Models/Accounting/bank-employee';
import { SafeEmployeeService } from '../../../../Services/Employee/Accounting/safe-employee.service';
import { BankEmployeeService } from '../../../../Services/Employee/Accounting/bank-employee.service';
import { LinkFileTypeData } from '../../../../Models/Accounting/link-file-type-data';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-payable-details',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './payable-details.component.html',
  styleUrl: './payable-details.component.css',
})

@InitLoader()
export class PayableDetailsComponent {
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  DomainName: string = '';
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  path: string = '';
  PayableID: number = 0;

  isCreate: boolean = false;
  isEdit: boolean = false;
  isView: boolean = false;

  payable: Payable = new Payable();
  validationErrors: { [key in keyof Payable]?: string } = {};
  validationErrorsForDetails: Record<number, Partial<Record<keyof PayableDetails, string>>> = {};
  dataTypesData: PayableDocType[] = [];
  banksData: BankEmployee[] = [];
  safesData: SafeEmployee[] = [];
  bankOrSafe: string = '';
  linkFilesData: LinkFile[] = [];
  linkFileTypesData: any[] = [];
  totalAmount: number = 0;
  isLoading = false;
  isSaveLoading = false;

  AllLinkFileData : LinkFileTypeData= new LinkFileTypeData()
  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public payableDocTypeService: PayableDocTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public payableService: PayableService,
    private translate: TranslateService,
    public payableDetailsService: PayableDetailsService,
    public linkFileService: LinkFileService,
    public dataAccordingToLinkFileService: DataAccordingToLinkFileService,
    public reportsService: ReportsService,
    private languageService: LanguageService,
    private SafeEmployeeServ: SafeEmployeeService,
    private BankEmployeeServ: BankEmployeeService, 
    private cdRef: ChangeDetectorRef,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.PayableID = Number(this.activeRoute.snapshot.paramMap.get('id'));

    if (!this.PayableID) {
      this.isCreate = true;
      this.payable.linkFileID = 5;
      this.getSaveData();
    } else { // when edit 
      this.GetPayableByID();
      this.GetLinkFiles();
    }
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
      if (url[1].path == 'View') {
        this.isView = true;
      } else {
        if (this.PayableID) {
          this.isEdit = true;
        }
      }
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

    this.GetDocType();

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  moveToPayable() {
    this.router.navigateByUrl('Employee/Payable');
  }

  GetDocType() {
    this.payableDocTypeService.Get(this.DomainName).subscribe((data) => {
      this.dataTypesData = data;
    });
  }

  GetPayableByID() {
    this.payableService
      .GetByID(this.PayableID, this.DomainName)
      .subscribe((data) => {
        this.payable = data;
        this.GetAllLinkFilesTypeData()
        console.log(this.payable)
        if (this.payable.linkFileID == 5) {
          this.getSaveData();
        } else if (this.payable.linkFileID == 6) {
          this.getBankData();
        }
      });
  }

  getBankData() {
    this.banksData = [];
    this.bankOrSafe = 'bank';
    this.BankEmployeeServ.GetByEmployeeId(this.UserID,this.DomainName).subscribe((data) => {
      this.banksData = data;
    });
  }

  getSaveData() {
    this.safesData = [];
    this.bankOrSafe = 'safe';
    this.SafeEmployeeServ.GetByEmployeeId( this.UserID,this.DomainName).subscribe((data) => {
      this.safesData = data;
    });
  }

  IsAllowDelete(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowDelete(
      InsertedByID,
      this.UserID,
      this.AllowDeleteForOthers
    );
    return IsAllow;
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(
      InsertedByID,
      this.UserID,
      this.AllowEditForOthers
    );
    return IsAllow;
  }

  capitalizeField(field: keyof Payable): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  DetailsCapitalizeField(field: keyof PayableDetails): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.payable) {
      if (this.payable.hasOwnProperty(key)) {
        const field = key as keyof Payable;
        if (!this.payable[field]) {
          if (
            field == 'bankOrSaveID' ||
            field == 'payableDocTypeID' ||
            field == 'linkFileID' ||
            field == 'date' 
          ) {
            const displayFieldName =
              field === 'bankOrSaveID' ? 'bankOrSafeID' : field;
            this.validationErrors[field] = this.getRequiredErrorMessage(
              this.capitalizeField(displayFieldName as keyof Payable)
            );
            isValid = false;
          }
        } else {
          this.validationErrors[field] = '';
        }
      }
    }
    return isValid;
  }

  isDetailsFormValid(): boolean {
    let isValid = true;

    // Reset validation errors
    this.validationErrorsForDetails = {};

    this.payable.payableDetails.forEach((detail) => {
      // Ensure detail has an ID
      const id = detail.id;
      if (!id) return; // skip if no ID

      // Prepare error object for this row
      if (!this.validationErrorsForDetails[id]) {
        this.validationErrorsForDetails[id] = {};
      }

      const errors = this.validationErrorsForDetails[id];

      // Validate only these fields
      const requiredFields: (keyof PayableDetails)[] = [
        'amount',
        'linkFileID',
        'linkFileTypeID',
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

    if(this.payable.newDetails && this.payable.newDetails.length > 0){
      this.payable.newDetails.forEach((detail) => {
        // Ensure detail has an ID
        const id = detail.id;
        if (!id) return; // skip if no ID

        // Prepare error object for this row
        if (!this.validationErrorsForDetails[id]) {
          this.validationErrorsForDetails[id] = {};
        }

        const errors = this.validationErrorsForDetails[id];

        // Validate only these fields
        const requiredFields: (keyof PayableDetails)[] = [
          'amount',
          'linkFileID',
          'linkFileTypeID',
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

  private getRequiredErrorMessage(fieldName: string): string {
    const fieldTranslated = this.translate.instant(fieldName);
    const requiredTranslated = this.translate.instant('Is Required');

    if (this.isRtl) {
      return `${requiredTranslated} ${fieldTranslated}`;
    } else {
      return `${fieldTranslated} ${requiredTranslated}`;
    }
  }

  onInputValueChange(event: { field: keyof Payable; value: any }) {
    const { field, value } = event;
    (this.payable as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }

    if (field == 'linkFileID') {
      this.payable.bankOrSaveID = 0;
    }
  }

  onInputValueChangeForEditDetails(row: any ,event: {field: keyof PayableDetails;value: any;}) {
    const { field, value } = event;
    if (this.validationErrorsForDetails[row.id]) {
      this.validationErrorsForDetails[row.id][field] = '';
    }
    if (field == 'linkFileID') {
      row.linkFileTypeID = 0; // reset old selection
      row.linkFileTypesData = row.linkFileTypesData || [];

      const numericValue = Number(value); // <-- convert string to number
      console.log(numericValue, row.linkFileTypesData, this.AllLinkFileData?.supplierGetDTO);

      switch (numericValue) {
        case 2: // Supplier
          row.linkFileTypesData = this.AllLinkFileData?.supplierGetDTO || [];
          break;
        case 3: // Debit
          row.linkFileTypesData = this.AllLinkFileData?.debitGetDTO || [];
          break;
        case 4: // Credit
          row.linkFileTypesData = this.AllLinkFileData?.creditGetDTO || [];
          break;
        case 5: // Save
          row.linkFileTypesData = this.AllLinkFileData?.saveGetDTO || [];
          break;
        case 6: // Bank
          row.linkFileTypesData = this.AllLinkFileData?.bankGetDTOs || [];
          break;
        case 7: // Income
          row.linkFileTypesData = this.AllLinkFileData?.incomeGetDTO || [];
          break;
        case 8: // Outcome
          row.linkFileTypesData = this.AllLinkFileData?.outcomeGetDTO || [];
          break;
        case 9: // Asset
          row.linkFileTypesData = this.AllLinkFileData?.assetGetDTO || [];
          break;
        case 10: // Employee
          row.linkFileTypesData = this.AllLinkFileData?.employee_GetDTO || [];
          break;
        case 11: // Fee
          row.linkFileTypesData = this.AllLinkFileData?.tuitionFeesTypeGetDTO || [];
          break;
        case 12: // Discount
          row.linkFileTypesData = this.AllLinkFileData?.tuitionDiscountTypeGetDTO || [];
          break;
        case 13: // Student
          row.linkFileTypesData = this.AllLinkFileData?.studentGetDTO || [];
          break;
        default:
          row.linkFileTypesData = [];
          break;
      }
      console.log(numericValue, row.linkFileTypesData);
    }

  }

  validateNumberPayable(event: any, field: keyof Payable): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.payable[field] === 'string') {
        this.payable[field] = '' as never;
      }
    }
  }

  validateNumberEditDetails(row:PayableDetails ,event: any, field: keyof PayableDetails): void { // 
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof row[field] === 'string') {
        row[field] = '' as never;
      }
    }
  }

  AddInUpdated(row : PayableDetails){
    this.payable.updatedDetails =this.payable.updatedDetails || []
    var ExistRow = this.payable.updatedDetails.find(p=>p.id == row.id)
    if(!ExistRow){
     this.payable.updatedDetails.push(row)
    }
  }

  Save() {
    if (this.isCreate) {
      if(this.isFormValid()){
          this.isSaveLoading = true;
          this.payableService.Add(this.payable, this.DomainName).subscribe(
            (data) => {
              let id = JSON.parse(data).id;
              this.router.navigateByUrl(`Employee/Payable/${id}`);
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
        this.payableService.Edit(this.payable, this.DomainName).subscribe(
          (data) => {
            this.GetPayableByID();
            this.isSaveLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Done!',
              text: 'The Payable has been edited successfully.',
              confirmButtonColor: '#089B41',
            });
          },
          (error) => {
            console.log(error)
            this.isSaveLoading = false;
          }
        );
      }
    }
  }

  GetLinkFiles() {
    this.linkFileService.Get(this.DomainName).subscribe((data) => {
      this.linkFilesData = data;
    });
  }

  GetLinkFilesTypeData(id: number) {
    this.linkFileTypesData = [];
    this.dataAccordingToLinkFileService.GetTableDataAccordingToLinkFileForPyable(this.DomainName, id).subscribe((data) => {
        this.linkFileTypesData = data;
      });
  }

  GetAllLinkFilesTypeData() {
    this.AllLinkFileData = new LinkFileTypeData();
    this.dataAccordingToLinkFileService.GetAllTableDataAccordingForPyable(this.DomainName).subscribe((data) => {
        this.AllLinkFileData = data;
        console.log(123,this.AllLinkFileData)
        this.getLinkFileTypeOptions()
        this.cdRef.detectChanges();
      });
  }

  getLinkFileTypeOptions() {
    if (!this.payable?.payableDetails || !this.AllLinkFileData) return;

    this.payable.payableDetails.forEach((element) => {
      const numericValue = Number(element.linkFileID);
      element.linkFileTypesData =element.linkFileTypesData || []
      switch (numericValue) {
        case 2: // Supplier
          element.linkFileTypesData = this.AllLinkFileData?.supplierGetDTO || [];
          break;
        case 3: // Debit
          element.linkFileTypesData = this.AllLinkFileData?.debitGetDTO || [];
          break;
        case 4: // Credit
          element.linkFileTypesData = this.AllLinkFileData?.creditGetDTO || [];
          break;
        case 5: // Save
          element.linkFileTypesData = this.AllLinkFileData?.saveGetDTO || [];
          break;
        case 6: // Bank
          element.linkFileTypesData = this.AllLinkFileData?.bankGetDTOs || [];
          break;
        case 7: // Income
          element.linkFileTypesData = this.AllLinkFileData?.incomeGetDTO || [];
          break;
        case 8: // Outcome
          element.linkFileTypesData = this.AllLinkFileData?.outcomeGetDTO || [];
          break;
        case 9: // Asset
          element.linkFileTypesData = this.AllLinkFileData?.assetGetDTO || [];
          break;
        case 10: // Employee
          element.linkFileTypesData = this.AllLinkFileData?.employee_GetDTO || [];
          break;
        case 11: // Fee
          element.linkFileTypesData = this.AllLinkFileData?.tuitionFeesTypeGetDTO || [];
          break;
        case 12: // Discount
          element.linkFileTypesData = this.AllLinkFileData?.tuitionDiscountTypeGetDTO || [];
          break;
        case 13: // Student
          element.linkFileTypesData = this.AllLinkFileData?.studentGetDTO || [];
          break;
        default:
          element.linkFileTypesData = [];
          break;
      }
    });
     console.log(this.payable.payableDetails)
  }
  
  AddPayableDetails() {
    var newDetail = new PayableDetails();
    newDetail.id =  Date.now() + Math.floor(Math.random() * 10000);
    newDetail.payableMasterID =  this.PayableID
    this.payable.newDetails = this.payable.newDetails || [];
    this.payable.newDetails.push(newDetail)
  }

  DeleteDetail(id: number) {
    Swal.fire({
      title:
        this.translate.instant('Are you sure you want to') +
        ' ' +
        this.translate.instant('delete') +
        ' ' +
        this.translate.instant('هذا') +
        ' ' +
        this.translate.instant('Payable Detail') +
        this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.payableDetailsService
          .Delete(id, this.DomainName)
          .subscribe((data) => {
          // this.GetPayableByID();
          this.payable.payableDetails = (this.payable.payableDetails || []).filter(p => p.id != id);
          this.payable.updatedDetails = (this.payable.updatedDetails || []).filter(p => p.id != id);
          this.payable.payableDetails = [...this.payable.payableDetails];
          this.payable.updatedDetails = [...this.payable.updatedDetails];
        });
      }
    });
  }

  DeleteNewDetail(id: number) {
    Swal.fire({
      title:
        this.translate.instant('Are you sure you want to') +
        ' ' +
        this.translate.instant('delete') +
        ' ' +
        this.translate.instant('هذا') +
        ' ' +
        this.translate.instant('Payable Detail') +
        this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
       this.payable.newDetails=this.payable.newDetails.filter(p=>p.id!=id)
      }
    });
  }

 /////////////////////////////////// print

  DownloadAsPDF() {
    this.showPDF = true;
    setTimeout(() => {
      this.pdfComponentRef.downloadPDF();
      setTimeout(() => (this.showPDF = false), 2000);
    }, 500);
  }

  Print() {
    this.showPDF = true;
    setTimeout(() => {
      const printContents = document.getElementById('Data')?.innerHTML;
      if (!printContents) {
        console.error('Element not found!');
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
        en: 'Payable Report',
        ar: 'تقرير الدفع',
      },
      // subHeaders: [
      //   { en: "Detailed payable information", ar: "معلومات تفصيلية عن الدفع" },
      // ],
      infoRows: [
        { key: 'Document Type', value: this.payable.payableDocTypesName || '' },
        { key: 'Document Number', value: this.payable.docNumber || '' },
        { key: 'Date', value: this.payable.date || '' },
        { key: 'Total Amount', value: this.totalAmount || 0 },
      ],
      reportImage: '', // Add image URL if available
      filename: 'Payable_Report.xlsx',
      tables: [
        {
          // title: "Payable Details",
          headers: [
            'id',
            'amount',
            'linkFileName',
            'linkFileTypeName',
            'notes',
          ],
          data: this.payable.payableDetails.map((row) => [
            row.id || 0,
            row.amount || 0,
            row.linkFileName || '',
            row.linkFileTypeName || '',
            row.notes || '',
          ]),
        },
      ],
    });
  }
}
