import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ReceivableService } from '../../../../Services/Employee/Accounting/receivable.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { TokenData } from '../../../../Models/token-data';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Receivable } from '../../../../Models/Accounting/receivable';
import { ReceivableDocType } from '../../../../Models/Accounting/receivable-doc-type';
import { ReceivableDocTypeService } from '../../../../Services/Employee/Accounting/receivable-doc-type.service';
import { ReceivableDetailsService } from '../../../../Services/Employee/Accounting/receivable-details.service';
import { ReceivableDetails } from '../../../../Models/Accounting/receivable-details';
import { LinkFile } from '../../../../Models/Accounting/link-file';
import { LinkFileService } from '../../../../Services/Employee/Accounting/link-file.service';
import { DataAccordingToLinkFileService } from '../../../../Services/Employee/Accounting/data-according-to-link-file.service';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { PdfPrintComponent } from '../../../../Component/pdf-print/pdf-print.component';
import { ReportsService } from '../../../../Services/shared/reports.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { BankEmployeeService } from '../../../../Services/Employee/Accounting/bank-employee.service';
import { SafeEmployeeService } from '../../../../Services/Employee/Accounting/safe-employee.service';
import { BankEmployee } from '../../../../Models/Accounting/bank-employee';
import { SafeEmployee } from '../../../../Models/Accounting/safe-employee';
import { LinkFileTypeData } from '../../../../Models/Accounting/link-file-type-data';

@Component({
  selector: 'app-receivable-details',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfPrintComponent, TranslateModule],
  templateUrl: './receivable-details.component.html',
  styleUrl: './receivable-details.component.css',
})
export class ReceivableDetailsComponent {
  User_Data_After_Login: TokenData = new TokenData(
    '',
    0,
    0,
    0,
    0,
    '',
    '',
    '',
    '',
    ''
  );

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  DomainName: string = '';
  UserID: number = 0;

  path: string = '';
  ReceivableID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;
  isCreate: boolean = false;
  isEdit: boolean = false;
  isView: boolean = false;

  receivable: Receivable = new Receivable();
  validationErrors: { [key in keyof Receivable]?: string } = {};
  validationErrorsForDetails: Record<number, Partial<Record<keyof ReceivableDetails, string>>> = {};
  AllLinkFileData : LinkFileTypeData= new LinkFileTypeData()
  dataTypesData: ReceivableDocType[] = [];
  // bankOrSaveData: any[] = [];
  banksData: BankEmployee[] = [];
  safesData: SafeEmployee[] = [];
  bankOrSafe: string = '';
  linkFilesData: LinkFile[] = [];
  linkFileTypesData: any[] = [];
  totalAmount: number = 0;
  isLoading = false;

  @ViewChild(PdfPrintComponent) pdfComponentRef!: PdfPrintComponent;
  showPDF = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public receivableDocTypeService: ReceivableDocTypeService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public receivableService: ReceivableService,
    public receivableDetailsService: ReceivableDetailsService,
    public linkFileService: LinkFileService,
    private translate: TranslateService,
    public dataAccordingToLinkFileService: DataAccordingToLinkFileService,
    public reportsService: ReportsService,
    private languageService: LanguageService,
    private SafeEmployeeServ: SafeEmployeeService,
    private BankEmployeeServ: BankEmployeeService
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.ReceivableID = Number(this.activeRoute.snapshot.paramMap.get('id'));

    if (!this.ReceivableID) {
      this.isCreate = true;
      this.receivable.linkFileID = 5;
      this.getSaveData();
    } else {
      this.GetReceivableByID();
      this.GetLinkFiles();    }

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
      if (url[1].path == 'View') {
        this.isView = true;
      } else {
        if (this.ReceivableID) {
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

  moveToReceivable() {
    this.router.navigateByUrl('Employee/Receivable');
  }

  GetDocType() {
    this.dataTypesData = [];
    this.receivableDocTypeService.Get(this.DomainName).subscribe((data) => {
      this.dataTypesData = data;
    });
  }

  GetReceivableByID() {
    this.receivableService
      .GetByID(this.ReceivableID, this.DomainName)
      .subscribe((data) => {
        this.receivable = data;
        this.GetAllLinkFilesTypeData()
        if (this.receivable.linkFileID == 5) {
          this.getSaveData();
        } else if (this.receivable.linkFileID == 6) {
          this.getBankData();
        }
      });
  }

  getBankData() {
    this.banksData = [];
    this.bankOrSafe = 'bank';
    this.BankEmployeeServ.GetByEmployeeId(
      this.UserID,
      this.DomainName
    ).subscribe((data) => {
      this.banksData = data;
    });
  }

  getSaveData() {
    this.safesData = [];
    this.bankOrSafe = 'safe';
    this.SafeEmployeeServ.GetByEmployeeId(
      this.UserID,
      this.DomainName
    ).subscribe((data) => {
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

  capitalizeField(field: keyof Receivable): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.receivable) {
      if (this.receivable.hasOwnProperty(key)) {
        const field = key as keyof Receivable;
        if (!this.receivable[field]) {
          if (
            field == 'receivableDocTypesID' ||
            field == 'bankOrSaveID' ||
            field == 'linkFileID' ||
            field == 'date' ||
            field == 'docNumber'
          ) {
            // Handle the specific case for bankOrSaveID field name correction
            const displayFieldName =
              field === 'bankOrSaveID' ? 'bankOrSafeID' : field;
            this.validationErrors[field] = this.getRequiredErrorMessage(
              this.capitalizeField(displayFieldName as keyof Receivable)
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

  private getRequiredErrorMessage(fieldName: string): string {
    const fieldTranslated = this.translate.instant(fieldName);
    const requiredTranslated = this.translate.instant('Is Required');

    if (this.isRtl) {
      return `${requiredTranslated} ${fieldTranslated}`;
    } else {
      return `${fieldTranslated} ${requiredTranslated}`;
    }
  }

  DetailsCapitalizeField(field: keyof ReceivableDetails): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  isDetailsFormValid(): boolean {
    let isValid = true;

    // Reset validation errors
    this.validationErrorsForDetails = {};

    this.receivable.receivableDetails.forEach((detail) => {
      // Ensure detail has an ID
      const id = detail.id;
      if (!id) return; // skip if no ID

      // Prepare error object for this row
      if (!this.validationErrorsForDetails[id]) {
        this.validationErrorsForDetails[id] = {};
      }

      const errors = this.validationErrorsForDetails[id];

      // Validate only these fields
      const requiredFields: (keyof ReceivableDetails)[] = [
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

    if(this.receivable.newDetails && this.receivable.newDetails.length > 0){
      this.receivable.newDetails.forEach((detail) => {
        // Ensure detail has an ID
        const id = detail.id;
        if (!id) return; // skip if no ID

        // Prepare error object for this row
        if (!this.validationErrorsForDetails[id]) {
          this.validationErrorsForDetails[id] = {};
        }

        const errors = this.validationErrorsForDetails[id];

        // Validate only these fields
        const requiredFields: (keyof ReceivableDetails)[] = [
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

  onInputValueChange(event: { field: keyof Receivable; value: any }) {
    const { field, value } = event;
    (this.receivable as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }

    if (field == 'linkFileID') {
      this.receivable.bankOrSaveID = 0;
    }
  }

  onInputValueChangeForEditDetails(row: any ,event: {field: keyof ReceivableDetails;value: any;}) {
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

  validateNumberReceivable(event: any, field: keyof Receivable): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.receivable[field] === 'string') {
        this.receivable[field] = '' as never;
      }
    }
  }

  validateNumberEditDetails(row:ReceivableDetails ,event: any, field: keyof ReceivableDetails): void { // 
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof row[field] === 'string') {
        row[field] = '' as never;
      }
    }
  }

  AddInUpdated(row : ReceivableDetails){
    this.receivable.updatedDetails =this.receivable.updatedDetails || []
    var ExistRow = this.receivable.updatedDetails.find(p=>p.id == row.id)
    if(!ExistRow){
      this.receivable.updatedDetails.push(row)
    }
  }

  Save() {
    if (this.isCreate) {
      if (this.isFormValid()) {
          this.isLoading = true;
          this.receivableService.Add(this.receivable, this.DomainName).subscribe(
            (data) => {
              let id = JSON.parse(data).id;
              this.router.navigateByUrl(`Employee/Receivable/${id}`);
              Swal.fire({
                title: 'Saved Successfully',
                icon: 'success',
                confirmButtonColor: '#089B41',
              });
              this.isLoading = false;
            },
            (error) => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.error,
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
            }
          );
          }
      } else if (this.isEdit) {
        if(this.isDetailsFormValid()){
          this.isLoading = true;
          this.receivableService.Edit(this.receivable, this.DomainName).subscribe(
            (data) => {
              this.GetReceivableByID();
              this.isLoading = false;
              Swal.fire({
                icon: 'success',
                title: 'Done!',
                text: 'The Receivable has been edited successfully.',
                confirmButtonColor: '#089B41',
              });
            },
            (error) => {
              this.isLoading = false;
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.error,
                confirmButtonText: 'Okay',
                customClass: { confirmButton: 'secondaryBg' },
              });
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

  GetAllLinkFilesTypeData() {
    this.AllLinkFileData = new LinkFileTypeData();
    this.dataAccordingToLinkFileService.GetAllTableDataAccordingToLinkFile(this.DomainName).subscribe((data) => {
        this.AllLinkFileData = data;
        this.getLinkFileTypeOptions()
      });
  }

  getLinkFileTypeOptions() {
    if (!this.receivable?.receivableDetails || !this.AllLinkFileData) return;

    this.receivable.receivableDetails.forEach((element) => {
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
     console.log(this.receivable.receivableDetails)
  }

  AddReceivableDetails() {
    var newDetail = new ReceivableDetails();
    newDetail.id =  Date.now() + Math.floor(Math.random() * 10000);
    newDetail.receivableMasterID =  this.ReceivableID
    this.receivable.newDetails = this.receivable.newDetails || [];
    this.receivable.newDetails.push(newDetail)

  }

  DeleteDetail(id: number) {
    Swal.fire({
      title:
        this.translate.instant('Are you sure you want to') +
        ' ' +
        this.translate.instant('delete') +
        ' ' +
        this.translate.instant('Receivable Detail') +
        this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.receivableDetailsService
          .Delete(id, this.DomainName)
          .subscribe((data) => {
          this.receivable.receivableDetails = (this.receivable.receivableDetails || []).filter(p => p.id !== id);
          this.receivable.updatedDetails = (this.receivable.updatedDetails || []).filter(p => p.id !== id);
          if(this.receivable.updatedDetails.length == 0){
            this.receivable.updatedDetails=[]
          }
          if(this.receivable.receivableDetails.length == 0){
            this.receivable.receivableDetails=[]
          }
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
        this.translate.instant('receivable Detail') +
        this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
       this.receivable.newDetails=this.receivable.newDetails.filter(p=>p.id!=id)
      }
    });
  }

  //////////////// print

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
        en: 'Receivable Report',
        ar: 'تقرير المستحقات',
      },
      // subHeaders: [
      //   { en: "Detailed receivable information", ar: "معلومات تفصيلية عن القبض" },
      // ],
      infoRows: [
        {
          key: 'Document Type',
          value: this.receivable.receivableDocTypesName || '',
        },
        { key: 'Document Number', value: this.receivable.docNumber || '' },
        { key: 'Date', value: this.receivable.date || '' },
        { key: 'Total Amount', value: this.totalAmount || 0 },
        { key: 'Note', value: this.receivable.notes || 'No Notes' },
      ],
      reportImage: '', // Add image URL if available
      filename: 'Receivable_Report.xlsx',
      tables: [
        {
          // title: "Receivable Details",
          headers: [
            'id',
            'amount',
            'linkFileName',
            'linkFileTypeName',
            'notes',
          ],
          data: this.receivable.receivableDetails.map((row) => [
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
