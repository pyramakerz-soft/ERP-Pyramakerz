import { Component } from '@angular/core';
import { TimeTable } from '../../../../Models/LMS/time-table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { TimeTableService } from '../../../../Services/Employee/LMS/time-table.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { firstValueFrom } from 'rxjs';
import { School } from '../../../../Models/school';
import { SchoolService } from '../../../../Services/Employee/school.service';

@Component({
  selector: 'app-time-table',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent],
  templateUrl: './time-table.component.html',
  styleUrl: './time-table.component.css',
})
export class TimeTableComponent {
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
  keysArray: string[] = ['id', 'englishTitle', 'arabicTitle'];

  TableData: TimeTable[] = [];
  schools: School[] = [];
  SelectedSchoolId: number = 0;
  timetable: TimeTable = new TimeTable();
  validationErrors: { [key in keyof TimeTable]?: string } = {};
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
    public TimeTableServ: TimeTableService
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
    this.TimeTableServ.GetBySchoolId(
      this.SelectedSchoolId,
      this.DomainName
    ).subscribe((d) => {
      this.TableData = d;
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

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: TimeTable[] = await firstValueFrom(
        this.TimeTableServ.GetBySchoolId(this.SelectedSchoolId, this.DomainName)
      );
      this.TableData = data || [];

      if (this.value !== '') {
        const numericValue = isNaN(Number(this.value))
          ? this.value
          : parseInt(this.value, 10);

        this.TableData = this.TableData.filter((t) => {
          const fieldValue = t[this.key as keyof typeof t];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(this.value.toLowerCase());
          }
          if (typeof fieldValue === 'number') {
            return fieldValue.toString().includes(numericValue.toString());
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }

  openModal() {
    document.getElementById('Add_Modal')?.classList.remove('hidden');
    document.getElementById('Add_Modal')?.classList.add('flex');
    this.timetable = new TimeTable();
  }

  closeModal() {
    document.getElementById('Add_Modal')?.classList.remove('flex');
    document.getElementById('Add_Modal')?.classList.add('hidden');
  }

  onInputValueChange(event: { field: keyof TimeTable; value: any }) {
    const { field, value } = event;
    if (field == 'name') {
      (this.timetable as any)[field] = value;
      if (value) {
        this.validationErrors[field] = '';
      }
    }
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.timetable) {
      if (this.timetable.hasOwnProperty(key)) {
        const field = key as keyof TimeTable;
        if (!this.timetable[field]) {
          if (field == 'name') {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        } else {
          if (field == 'name') {
            if (this.timetable.name.length > 100) {
              this.validationErrors[field] = `*${this.capitalizeField(
                field
              )} cannot be longer than 100 characters`;
              isValid = false;
            }
          } else {
            this.validationErrors[field] = '';
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof TimeTable): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  Generate() {
    this.timetable.schoolID = this.SelectedSchoolId;
    if (this.isFormValid()) {
      this.isLoading=true
      this.TimeTableServ.Add(this.timetable, this.DomainName).subscribe((d) => {
        this.closeModal();
      this.isLoading=false
        this.SelectedSchoolId = 0;
      });
    }
  }

  View(id:number){
    this.router.navigateByUrl(`Employee/Time Table View/${id}`)
  }
}
