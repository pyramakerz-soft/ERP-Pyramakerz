import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Title } from '../../../../../Models/Administrator/title';
import { TitleService } from '../../../../../Services/Employee/Administration/title.service';
import { AccountService } from '../../../../../Services/account.service';
import { ApiService } from '../../../../../Services/api.service';
import { DeleteEditPermissionService } from '../../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../../Services/shared/menu.service';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { SearchComponent } from '../../../../../Component/search/search.component';
import { TokenData } from '../../../../../Models/token-data';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
@Component({
  selector: 'app-title',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchComponent],
  templateUrl: './title.component.html',
  styleUrl: './title.component.css'
})
@InitLoader()
export class TitleComponent implements OnInit, OnDestroy {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  UserID: number = 0;
  DomainName: string = '';
  TableData: Title[] = [];
  departmentId: number = 0;
  departmentName: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;

  // Modal
  isModalVisible: boolean = false;
  mode: string = '';
  title: Title = new Title();
  validationErrors: { [key: string]: string } = {};
  isLoading: boolean = false;

  // Permissions
  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  keysArray: string[] = ['name', 'date'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private titleService: TitleService,
    private account: AccountService,
    private apiService: ApiService,
    private menuService: MenuService,
    private editDeleteServ: DeleteEditPermissionService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.apiService.GetHeader();

    this.route.params.subscribe(params => {
      this.departmentId = +params['id'] || 0;
      if (this.departmentId > 0) {
        this.GetAllData();
      }
    });

    this.route.queryParams.subscribe(qparams => {
      this.departmentName = qparams['name'] || 'Titles';
    });

    this.menuService.menuItemsForEmployee$.subscribe(items => {
      const page = this.menuService.findByPageName('title', items);
      if (page) {
        this.AllowEdit = page.allow_Edit;
        this.AllowDelete = page.allow_Delete;
        this.AllowEditForOthers = page.allow_Edit_For_Others;
        this.AllowDeleteForOthers = page.allow_Delete_For_Others;
      }
    });


    this.subscription = this.languageService.language$.subscribe(dir => {
      this.isRtl = dir === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onInputValueChange(event: { field: keyof Title; value: any }) {
    const { field, value } = event;
    (this.title as any)[field] = value;

    if (value && value.toString().trim() !== '') {
      delete this.validationErrors[field];
    }
  }

  GetAllData() {
    if (this.departmentId > 0) {
      this.titleService.GetByDepartmentId(this.departmentId, this.DomainName).subscribe(data => {
        this.TableData = data || [];
      });
    }
  }

  Create() {
    this.mode = 'Create';
    this.title = new Title();
    this.title.departmentID = this.departmentId;
    this.title.date = new Date().toISOString();
    this.openModal();
    this.validationErrors = {};
  }

  Edit(row: Title) {
    this.mode = 'Edit';
    this.validationErrors = {};
    this.titleService.GetById(row.id, this.DomainName).subscribe({
      next: (data) => {
        this.title = data;
        if (!this.title.date) {
          this.title.date = new Date().toISOString();
        }
        this.openModal();
      },
      error: async (err) => {
        const Swal = await import('sweetalert2').then(m => m.default);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.error || 'Failed to load title data. Please try again.',
          confirmButtonText: 'Okay',
          customClass: { confirmButton: 'secondaryBg' },
        });
      }
    });
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + ' ' +
        this.translate.instant('delete') + ' ' +
        this.translate.instant('this') + ' ' +
        this.translate.instant('Title') + '?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('🗑️ Starting delete for id:', id);

        this.titleService.Delete(id, this.DomainName).subscribe({
          next: (response) => {
            console.log(' Delete successful:', response);
            this.GetAllData();

            Swal.fire({
              icon: 'success',
              title: this.translate.instant('Success'),
              text: this.translate.instant('Title deleted successfully'),
              confirmButtonText: this.translate.instant('OK'),
              confirmButtonColor: '#089B41',
            });
          },
          error: (error) => {
            console.error(' Delete failed with full error:', error);

            let errorMessage = this.translate.instant('Failed to delete title');

            if (error.status === 404) {
              errorMessage = this.translate.instant('Title not found');
            } else if (error.status === 403) {
              errorMessage = this.translate.instant('You do not have permission to delete');
            } else if (error.status === 400) {
              errorMessage = error.error?.message || this.translate.instant('Invalid request');
            } else if (error.status === 500) {
              errorMessage = this.translate.instant('Server error');
            }

            Swal.fire({
              icon: 'error',
              title: this.translate.instant('Error'),
              text: `${errorMessage} (Code: ${error.status})`,
              confirmButtonText: this.translate.instant('OK'),
              confirmButtonColor: '#17253E',
            });
          }
        });
      }
    });
  }

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;

      const obs = this.mode === 'Create'
        ? this.titleService.Add(this.title, this.DomainName)
        : this.titleService.Edit(this.title, this.DomainName);

      obs.subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.GetAllData();
        },
        error: async (error) => {
          this.isLoading = false;

          const Swal = await import('sweetalert2').then(m => m.default);
          if (error.error && error.error.includes("Name cannot be longer than 100 characters")) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Name cannot be longer than 100 characters',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          } else if (error.error && error.error.includes("Access denied")) {
            Swal.fire({
              icon: 'error',
              title: 'Access Denied',
              text: 'You do not have permission to perform this action.',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error || 'An error occurred. Please try again.',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' },
            });
          }
        }
      });
    }
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    let isValid = true;

    if (!this.title.name?.trim()) {
      this.validationErrors['name'] = this.translate.instant('Name is required');
      isValid = false;
    }

    return isValid;
  }

  openModal() { this.isModalVisible = true; }

  closeModal() { this.isModalVisible = false; this.validationErrors = {}; }

  onSearchEvent(event: { key: string; value: any }) {
  }

}