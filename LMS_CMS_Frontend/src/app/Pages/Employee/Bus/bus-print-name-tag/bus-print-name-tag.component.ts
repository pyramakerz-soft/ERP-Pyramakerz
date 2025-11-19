import { Component, ViewChild, ElementRef } from '@angular/core';
import { TokenData } from '../../../../Models/token-data';
import { ApiService } from '../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { BusStudentService } from '../../../../Services/Employee/Bus/bus-student.service';
import { AccountService } from '../../../../Services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../../Services/shared/menu.service';
import { Bus } from '../../../../Models/Bus/bus';
import { Domain } from '../../../../Models/domain';
import { BusStudent } from '../../../../Models/Bus/bus-student';
import { BusService } from '../../../../Services/Employee/Bus/bus.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import { Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';
import html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-bus-print-name-tag',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, TranslateModule],
  templateUrl: './bus-print-name-tag.component.html',
  styleUrl: './bus-print-name-tag.component.css'
})

@InitLoader()
export class BusPrintNameTagComponent {

  User_Data_After_Login: TokenData = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  UserID: number = 0;
  path: string = ""
  isRtl: boolean = false;
  subscription!: Subscription;
  key: string = "id";
  value: any = "";
  keysArray: string[] = ['id', 'schoolName', "studentName", "busCategoryName", "semseterName", "isException", "gradeName", "className"];

  AllowEdit: any;
  AllowDelete: any;
  AllowDeleteForOthers: any;

  IsChoosenDomain: boolean = false;
  IsEmployee: boolean = true;

  DomainData: Domain[] = []
  BusData: Bus[] = []

  busStudentData: BusStudent[] = []

  DomainName: string = "";
  busId: number = -1;
  selectedBusName: string = "";
  selectedBusDriverNo: string = "";

  IsClearBus: boolean = false;
  showPDF: boolean = false;

  @ViewChild('nameTagContainer') nameTagContainer!: ElementRef;

  
  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public busStudentServ: BusStudentService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public BusServ: BusService,
    private languageService: LanguageService,
    private loadingService: LoadingService ) { }

  ngOnInit() {

    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    if (this.User_Data_After_Login.type == "employee") {
      this.IsChoosenDomain = true;
      this.DomainName = this.ApiServ.GetHeader();
      this.activeRoute.url.subscribe(url => {
        this.path = url[0].path
        this.GetAllBus();
      });

      this.menuService.menuItemsForEmployee$.subscribe((items) => {
        const settingsPage = this.menuService.findByPageName(this.path, items);
        if (settingsPage) {
          this.AllowEdit = settingsPage.allow_Edit;
          this.AllowDelete = settingsPage.allow_Delete;
          this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others
          this.AllowDeleteForOthers = settingsPage.allow_Edit_For_Others
        }
      });
    } else if (this.User_Data_After_Login.type == "octa") {
      this.GetAllDomains();
      this.IsEmployee = false;
      this.AllowEdit = true;
      this.AllowDelete = true;
    }
    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction == 'rtl';
    });
    this.isRtl = document.documentElement.dir == 'rtl';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  GetAllDomains() {
    this.DomainServ.Get().subscribe((data) => {
      this.DomainData = data;
    })
  }

  GetAllBus() {
    this.BusServ.Get(this.DomainName).subscribe((data) => {
      this.BusData = data;
    })
  }

  async GetTableData(busId: number) {
    this.busStudentData = []
    try {
      const data = await firstValueFrom(this.busStudentServ.GetbyBusId(busId, this.DomainName));
      this.busStudentData = data;
    } catch (error) {
      this.busStudentData = [];
    }
  }

  getDataByBusId(event: Event) {
    this.IsChoosenDomain = true;
    const selectedValue: number = Number((event.target as HTMLSelectElement).value);
    this.busId = selectedValue;
    
    // Get the selected bus name and driver number
    const selectedBus = this.BusData.find(bus => bus.id == selectedValue);
    if (selectedBus) {
      this.selectedBusName = selectedBus.name || '';
      // Assuming bus has a driverPhone or driverNo property, adjust as needed
      this.selectedBusDriverNo = (selectedBus as any).driverPhone || (selectedBus as any).driverNo || '';
    }
    
    this.GetTableData(this.busId);
  }

  DomainIsChanged(event: Event) {
    this.BusData = []
    this.IsChoosenDomain = true;
    const selectedValue: string = ((event.target as HTMLSelectElement).value);
    this.DomainName = selectedValue;
    this.busId = -1;
    this.GetAllBus();
  }

  async onSearchEvent(event: { key: string, value: any }) {
    this.key = event.key;
    this.value = event.value;
    const data: BusStudent[] = await firstValueFrom(
      this.busStudentServ.GetbyBusId(this.busId, this.DomainName)
    );

    this.busStudentData = data || [];

    if (this.value !== "") {
      const numericValue = isNaN(Number(this.value)) ? this.value : parseInt(this.value, 10);
      this.busStudentData = this.busStudentData.filter(t => {
        const fieldValue = t[this.key as keyof typeof t];
        if (typeof fieldValue == 'string') {
          return fieldValue.toLowerCase().includes(this.value.toLowerCase());
        }
        if (typeof fieldValue == 'number') {
          return fieldValue.toString().includes(numericValue.toString())
        }
        return fieldValue == this.value;
      });
    }
  }

  DownloadAsPDF() {
    this.showPDF = true;
    setTimeout(() => {
      this.printNameTagPDF();
    }, 500);
  }

  Print() {
    this.showPDF = true;
    setTimeout(() => {
      this.printNameTag();
      setTimeout(() => this.showPDF = false, 500);
    }, 500);
  }

  printNameTagPDF() {
    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: `Bus-Name-Tags-${this.selectedBusName || 'bus'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, allowTaint: false },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait', compress: true }
    };

    const container = this.nameTagContainer.nativeElement as HTMLElement;
    const clone = container.cloneNode(true) as HTMLElement;

    clone.style.position = 'static';
    clone.style.top = 'auto';
    clone.style.left = 'auto';
    clone.style.display = 'block';
    clone.style.width = '210mm';
    clone.style.maxWidth = '210mm';
    clone.style.margin = '0 auto';
    clone.style.background = 'white';
    clone.style.padding = '20px';
    clone.style.boxSizing = 'border-box';

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.display = 'block';
    wrapper.style.background = 'white';
    wrapper.appendChild(clone);

    document.body.appendChild(wrapper);

    html2pdf()
      .from(clone)
      .set(opt)
      .save()
      .then(() => {
        document.body.removeChild(wrapper);
        this.showPDF = false;
      })
      .catch((error: any) => {
        console.error('PDF generation failed:', error);
        document.body.removeChild(wrapper);
        this.showPDF = false;
      });
  }

  printNameTag() {
    const printContents = this.nameTagContainer.nativeElement.innerHTML;

    const printStyle = `
      <style>
        @page { size: auto; margin: 0mm; }
        body { 
          margin: 0; 
          font-family: Arial, sans-serif;
        }
        .print-container {
          padding: 20px;
          background: white;
          max-width: 210mm;
          margin: 0 auto;
        }
        @media print {
          body > *:not(.print-container) {
            display: none !important;
          }
          .print-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      </style>
    `;

    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    printContainer.innerHTML = printStyle + printContents;

    document.body.appendChild(printContainer);
    window.print();

    setTimeout(() => {
      document.body.removeChild(printContainer);
      this.showPDF = false;
    }, 100);
  }
}