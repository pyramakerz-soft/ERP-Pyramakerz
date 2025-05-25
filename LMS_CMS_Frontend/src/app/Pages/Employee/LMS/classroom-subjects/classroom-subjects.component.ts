import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { firstValueFrom } from 'rxjs';
import { SearchComponent } from '../../../../Component/search/search.component';
import { CommonModule } from '@angular/common';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';

@Component({
  selector: 'app-classroom-subjects',
  standalone: true,
  imports: [SearchComponent, CommonModule],
  templateUrl: './classroom-subjects.component.html',
  styleUrl: './classroom-subjects.component.css'
})
export class ClassroomSubjectsComponent {
  classId:number = 0
  DomainName: string = '';
  UserID: number = 0; 
  User_Data_After_Login: TokenData = new TokenData('',0,0,0,0,'','','','','');

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id'];

  AllowEdit: boolean = false;
  AllowEditForOthers: boolean = false; 

  constructor(
    public account: AccountService, 
    public ApiServ: ApiService, 
    public classroomService: ClassroomService, 
    public EditDeleteServ: DeleteEditPermissionService,
    public activeRoute: ActivatedRoute,
    private menuService: MenuService,
    public router: Router
  ) {}

  ngOnInit() {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;

    this.DomainName = this.ApiServ.GetHeader(); 
    this.activeRoute.url.subscribe((url) => {
      this.path = url[0].path;
    });

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const settingsPage = this.menuService.findByPageName(this.path, items);
      if (settingsPage) {
        this.AllowEdit = settingsPage.allow_Edit; 
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });

    this.classId = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.DomainName = this.ApiServ.GetHeader(); 
  }

  GoToClass() {
    this.router.navigateByUrl('Employee/Classroom/'+ this.classId);
  }

  IsAllowEdit(InsertedByID: number) {
    const IsAllow = this.EditDeleteServ.IsAllowEdit(InsertedByID, this.UserID, this.AllowEditForOthers);
    return IsAllow;
  }

  // async onSearchEvent(event: { key: string; value: any }) {
  //   this.key = event.key;
  //   this.value = event.value;
  //   try {
  //     const data: WeightType[] = await firstValueFrom(
  //       this.weightTypeService.Get(this.DomainName)
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

  Generate(){

  }
}
