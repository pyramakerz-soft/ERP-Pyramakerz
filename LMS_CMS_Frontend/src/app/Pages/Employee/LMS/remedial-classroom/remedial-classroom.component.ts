import { ChangeDetectorRef, Component } from '@angular/core';
import { RemedialClassroomService } from '../../../../Services/Employee/LMS/remedial-classroom.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../../../../Component/search/search.component';
import { Employee } from '../../../../Models/Employee/employee';
import { Classroom } from '../../../../Models/LMS/classroom';
import { RemedialClassroom } from '../../../../Models/LMS/remedial-classroom';
import { School } from '../../../../Models/school';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-remedial-classroom',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './remedial-classroom.component.html',
  styleUrl: './remedial-classroom.component.css'
})
export class RemedialClassroomComponent {

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
  mode: string = '';
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name'];

  TableData: RemedialClassroom[] = [];
  schools: School[] = [];
  Teachers: Employee[] = [];
  classes: Classroom[] = [];
  SelectedSchoolId: number = 0;
  SelectedTimeTableId: number = 0;
  remedialClassroom: RemedialClassroom = new RemedialClassroom();
  validationErrors: { [key in keyof RemedialClassroom]?: string } = {};
  isLoading = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public SchoolServ: SchoolService,
    public remedialClassroomServ: RemedialClassroomService,
    private cdRef: ChangeDetectorRef
  ) { }
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
        this.AllowDelete = settingsPage.allow_Delete;
        this.AllowDeleteForOthers = settingsPage.allow_Delete_For_Others;
        this.AllowEditForOthers = settingsPage.allow_Edit_For_Others;
      }
    });
    this.GetAllSchools();
  }

  GetAllSchools() {
    this.TableData = [];
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.schools = d;
    });
  }

  GetAllData() {
    this.TableData = [];
    // this.TimeTableServ.GetBySchoolId(
    //   this.SelectedSchoolId,
    //   this.DomainName
    // ).subscribe((d) => {
    //   this.TableData = d;
    // });
  }

  async onSearchEvent(event: { key: string; value: any }) {
    // this.key = event.key;
    // this.value = event.value;
    // try {
    //   const data: RemedialClassroom[] = await firstValueFrom(
    //     // this.TimeTableServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName)
    //   );
    //   this.TableData = data || [];

    //   if (this.value !== '') {
    //     const numericValue = isNaN(Number(this.value))
    //       ? this.value
    //       : parseInt(this.value, 10);

    //     this.TableData = this.TableData.filter((t) => {
    //       const fieldValue = t[this.key as keyof typeof t];
    //       if (typeof fieldValue === 'string') {
    //         return fieldValue.toLowerCase().includes(this.value.toLowerCase());
    //       }
    //       if (typeof fieldValue === 'number') {
    //         return fieldValue.toString().includes(numericValue.toString());
    //       }
    //       return fieldValue == this.value;
    //     });
    //   }
    // } catch (error) {
    //   this.TableData = [];
    // }
  }

  openModal() {
    if (this.SelectedSchoolId == 0) {
      this.validationErrors["schoolID"] = "School is required"
    } else {
      document.getElementById('Add_Modal')?.classList.remove('hidden');
      document.getElementById('Add_Modal')?.classList.add('flex');
      this.remedialClassroom = new RemedialClassroom();
    }
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
  }

  onInputValueChange(event: { field: keyof RemedialClassroom; value: any }) {
    const { field, value } = event;
    if (field == 'name' || field == 'schoolID') {
      (this.remedialClassroom as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }
}
