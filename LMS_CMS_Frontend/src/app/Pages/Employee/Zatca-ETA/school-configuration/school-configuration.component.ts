import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { School } from '../../../../Models/school';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../Services/shared/real-time-notification-service.service';
@Component({
  selector: 'app-school-configuration',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './school-configuration.component.html',
  styleUrl: './school-configuration.component.css'
})
export class SchoolConfigurationComponent {
  ETA_Zatca: string = '';
  keysArray: string[] = ['id', 'name', 'address'];
  key: string = 'id';
  value: any = '';

  schoolData: School[] = [];
  school: School = new School();
  isRtl: boolean = false;
  subscription!: Subscription;
  AllowEdit: boolean = false;
  AllowEditForOthers: boolean = false;
  path: string = '';

  DomainName: string = '';
  UserID: number = 0;
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');
  isLoading = false;
   
  constructor(public account: AccountService, public ApiServ: ApiService, public EditDeleteServ: DeleteEditPermissionService,private menuService: MenuService, 
    public activeRoute: ActivatedRoute, public schoolService: SchoolService, private router: Router,
    private realTimeService: RealTimeNotificationServiceService,
    private languageService: LanguageService,) {}

  ngOnInit(): void { 
    const currentUrl = this.router.url;
    if (currentUrl.includes('ETA')) {
      this.ETA_Zatca = 'ETA';
    } else if (currentUrl.includes('Zatca')) {
      this.ETA_Zatca = 'Zatca';
    }

    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader();

    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.getSchoolData();

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
        this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

   ngOnDestroy(): void {
      this.realTimeService.stopConnection(); 
       if (this.subscription) {
        this.subscription.unsubscribe();
      }
  }

  getSchoolData() {
    this.schoolData = []
    this.schoolService.Get(this.DomainName).subscribe((data) => {
      this.schoolData = data;
    });
  }

  GetSchoolById(schoolId: number) {
    this.schoolService
      .GetBySchoolId(schoolId, this.DomainName)
      .subscribe((data) => {
        this.school = data;
      });
  }

  openModal(schoolId: number) {
    this.GetSchoolById(schoolId);

    this.getSchoolData(); 

    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');

    this.school = new School(); 
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: School[] = await firstValueFrom(
        this.schoolService.Get(this.DomainName)
      );
      this.schoolData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.schoolData = this.schoolData.filter((t) => {
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
      this.schoolData = [];
    }
  }

  SaveSchool() {  
    this.isLoading = true;
    if(this.ETA_Zatca == "ETA"){
      this.schoolService.EditEta(this.school, this.DomainName).subscribe(
        (result: any) => {
          this.closeModal();
          this.isLoading = false;
          this.getSchoolData();
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
    }else if(this.ETA_Zatca == "Zatca"){
      this.schoolService.EditZatca(this.school, this.DomainName).subscribe(
        (result: any) => {
          this.closeModal();
          this.isLoading = false;
          this.getSchoolData();
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
}
