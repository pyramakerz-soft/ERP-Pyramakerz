import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { WeightType } from '../../../../Models/LMS/weight-type';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';

@Component({
  selector: 'app-weight-type',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './weight-type.component.html',
  styleUrl: './weight-type.component.css'
})
export class WeightTypeComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: WeightType[] = [];

  DomainName: string = '';
  UserID: number = 0; 

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'englishName' ,'arabicName'];

  weightType: WeightType = new WeightType();

  validationErrors: { [key in keyof WeightType]?: string } = {};
  isLoading = false;

  // constructor(
  //   private router: Router,
  //   private menuService: MenuService,
  //   public activeRoute: ActivatedRoute,
  //   public account: AccountService,
  //   public DomainServ: DomainService,
  //   public EditDeleteServ: DeleteEditPermissionService,
  //   public ApiServ: ApiService 
  // ) { }
  // ngOnInit() {
  //   this.User_Data_After_Login = this.account.Get_Data_Form_Token();
  //   this.UserID = this.User_Data_After_Login.id;
  //   this.DomainName = this.ApiServ.GetHeader();
  //   this.activeRoute.url.subscribe((url) => {
  //     this.path = url[0].path;
  //   });

  //   this.menuService.menuItemsForEmployee$.subscribe((items) => {
  //     const settingsPage = this.menuService.findByPageName(this.path, items);
  //     if (settingsPage) {
  //       this.AllowEdit = settingsPage.allow_Edit;
  //       this.AllowDelete = settingsPage.allow_Delete;
  //       this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
  //       this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
  //     }
  //   });

  //   this.GetAllData();
  // }

  // async onSearchEvent(event: { key: string; value: any }) {
  //   this.key = event.key;
  //   this.value = event.value;
  //   try {
  //     const data: WeightType[] = await firstValueFrom(
  //       this.medalServ.Get(this.DomainName)
  //     );
  //     this.TableData = data || [];

  //     if (this.value !== '') {
  //       const numericValue = isNaN(Number(this.value))
  //         ? this.value
  //         : parseInt(this.value, 10);

  //       this.TableData = this.TableData.filter((t) => {
  //         const fieldValue = t[this.key as keyof typeof t];
  //         if (typeof fieldValue === 'string') {
  //           return fieldValue.toLowerCase().includes(this.value.toLowerCase());
  //         }
  //         if (typeof fieldValue === 'number') {
  //           return fieldValue.toString().includes(numericValue.toString())
  //         }
  //         return fieldValue == this.value;
  //       });
  //     }
  //   } catch (error) {
  //     this.TableData = [];
  //   }
  // }
}
