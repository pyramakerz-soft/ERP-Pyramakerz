import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { SearchComponent } from '../../../../Component/search/search.component';
import { ApiService } from '../../../../Services/api.service';
import { AccountService } from '../../../../Services/account.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';

import { AppointmentDocument, AppointmentDocumentCreate } from '../../../../Models/Administrator/appointmentDocument';
import { AppointmentDocumentService } from '../../../../Services/Employee/Administration/appointment-document.service';
import { TokenData } from '../../../../Models/token-data';

@Component({
  selector: 'app-appointment-document',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SearchComponent],
  templateUrl: './appointment-document.component.html',
  styleUrl: './appointment-document.component.css',
})
@InitLoader()
export class AppointmentDocumentComponent implements OnInit, OnDestroy {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  TableData: AppointmentDocument[] = [];
  DomainName: string = '';
  UserID: number = 0;
  isRtl: boolean = false;
  subscription!: Subscription;

  // Modal
  isModalVisible: boolean = false;
  mode: 'Create' | 'Edit' = 'Create';
  currentDocument: AppointmentDocumentCreate = { documentName: '' };
  validationErrors: { documentName?: string } = {};
  isLoading: boolean = false;

  // Permissions
  AllowDelete: boolean = false;
  AllowDeleteForOthers: boolean = false;

  // Search
  keysArray: string[] = ['documentName'];

  constructor(
    private account: AccountService,
    private apiServ: ApiService,
    private menuService: MenuService,
    private editDeleteServ: DeleteEditPermissionService,
    private languageService: LanguageService,
    private loadingService: LoadingService,
    private appointmentDocServ: AppointmentDocumentService
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.apiServ.GetHeader();

    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      const page = this.menuService.findByPageName('appointment-document', items); // غيّر الاسم حسب اللي في الـ menu
      if (page) {
        this.AllowDelete = page.allow_Delete;
        this.AllowDeleteForOthers = page.allow_Delete_For_Others;
      }
    });

    this.GetAllData();

    this.subscription = this.languageService.language$.subscribe((direction) => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  GetAllData() {
    this.TableData = [];
    this.appointmentDocServ.Get(this.DomainName).subscribe((data) => {
      this.TableData = data;
    });
  }

  Create() {
    this.mode = 'Create';
    this.currentDocument = { documentName: '' };
    this.validationErrors = {};
    this.openModal();
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: 'Are you sure you want to delete this document?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentDocServ.Delete(id, this.DomainName).subscribe(() => {
          this.GetAllData();
          Swal.fire('Deleted!', 'Document has been deleted.', 'success');
        });
      }
    });
  }

  SaveDocument() {
    if (!this.isFormValid()) return;

    this.isLoading = true;

    this.appointmentDocServ.Add(this.currentDocument, this.DomainName).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.GetAllData();
      },
      error: async (error) => {
        this.isLoading = false;
        const Swal = await import('sweetalert2').then(m => m.default);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error || 'Something went wrong!',
        });
      }
    });
  }

  isFormValid(): boolean {
    this.validationErrors = {};
    let valid = true;

    if (!this.currentDocument.documentName || this.currentDocument.documentName.trim() === '') {
      this.validationErrors.documentName = 'Document Name is required';
      valid = false;
    }

    return valid;
  }

  openModal() {
    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  async onSearchEvent(event: { key: string; value: any }) {
    try {
      const data: AppointmentDocument[] = await firstValueFrom(
        this.appointmentDocServ.Get(this.DomainName)
      );
      this.TableData = data || [];

      if (event.value !== '') {
        this.TableData = this.TableData.filter((doc) =>
          doc.documentName.toLowerCase().includes(event.value.toLowerCase())
        );
      }
    } catch (error) {
      this.TableData = [];
    }
  }

  IsAllowDelete(insertedById: number): boolean {
    return this.editDeleteServ.IsAllowDelete(insertedById, this.UserID, this.AllowDeleteForOthers);
  }
}