import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { SearchComponent } from '../../../../Component/search/search.component';
import { OfferService } from '../../../../Services/Employee/Administration/offer.service';
import { DepartmentService } from '../../../../Services/Employee/Administration/department.service';
import { TitleService } from '../../../../Services/Employee/Administration/title.service'; // تأكد من وجوده
import { ApiService } from '../../../../Services/api.service';
import { AccountService } from '../../../../Services/account.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { TokenData } from '../../../../Models/token-data';
import { Offer, OfferAddDto } from '../../../../Models/Administrator/offer';
import { Department } from '../../../../Models/Administrator/department';
import { Title } from '../../../../Models/Administrator/title';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, TranslateModule],
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css']
})
export class OfferComponent implements OnInit, OnDestroy {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');
  AllowEdit = false;
  AllowDelete = false;
  AllowDeleteForOthers = false;
  AllowEditForOthers = false;

  TableData: Offer[] = [];
  departments: Department[] = [];
  titles: Title[] = [];

  DomainName = '';
  UserID = 0;
  isRtl = false;
  subscription!: Subscription;

  // Modal
  isModalVisible = false;
  mode: 'Create' | 'Edit' = 'Create';
  currentId?: number; 
  currentOffer: OfferAddDto = { departmentID: 0, titleID: 0, uploadedFile: null };
  selectedFileName: string | null = null;
  validationErrors: string[] = [];
  isLoading = false;

  keysArray: string[] = ['departmentName', 'titleName', 'fileName'];

  constructor(
    private router: Router,
    private menuService: MenuService,
    private account: AccountService,
    private apiServ: ApiService,
    private offerServ: OfferService,
    private departmentServ: DepartmentService,
    private titleServ: TitleService,
    private editDeleteServ: DeleteEditPermissionService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.User_Data_After_Login = this.account.Get_Data_Form_Token();
    this.UserID = this.User_Data_After_Login.id;
    this.DomainName = this.apiServ.GetHeader();

    this.menuService.menuItemsForEmployee$.subscribe(items => {
      const page = this.menuService.findByPageName('Offers', items);
      if (page) {
        this.AllowEdit = page.allow_Edit;
        this.AllowDelete = page.allow_Delete;
        this.AllowDeleteForOthers = page.allow_Delete_For_Others;
        this.AllowEditForOthers = page.allow_Edit_For_Others;
      }
    });

    this.loadData();

    this.subscription = this.languageService.language$.subscribe(dir => {
      this.isRtl = dir === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadData() {
    this.offerServ.Get(this.DomainName).subscribe(data => {
      this.TableData = data || [];
    });

    this.departmentServ.Get(this.DomainName).subscribe(depts => {
      this.departments = depts || [];
    });

    this.titleServ.Get(this.DomainName).subscribe(titles => {
      this.titles = titles || [];
    });
  }

  Create() {
    this.mode = 'Create';
    this.currentId = undefined;
    this.currentOffer = { departmentID: 0, titleID: 0, uploadedFile: null };
    this.selectedFileName = null;
    this.validationErrors = [];
    this.isModalVisible = true;
  }

  Edit(offer: Offer) {
    this.mode = 'Edit';
    this.currentId = offer.id;
    this.currentOffer = {
      departmentID: offer.departmentID,
      titleID: offer.titleID,
      uploadedFile: null 
    };
    this.selectedFileName = offer.fileName;
    this.validationErrors = [];
    this.isModalVisible = true;
  }

  async Delete(id: number) {
    const Swal = (await import('sweetalert2')).default;
    Swal.fire({
      title: 'are you sure you want to delete this offer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.offerServ.Delete(id, this.DomainName).subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  // File Handling
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) this.handleFile(event.dataTransfer.files[0]);
  }

handleFile(file: File) {
  this.validationErrors = [];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    this.validationErrors.push(
     'Allowed file types: PDF, Word (doc/docx), JPG, PNG'
    );
    return;
  }

  this.currentOffer.uploadedFile = file;
  this.selectedFileName = file.name;
}



  removeFile() {
    this.currentOffer.uploadedFile = null;
    this.selectedFileName = null;
  }

  isFormValid(): boolean {
    this.validationErrors = [];
    if (this.currentOffer.departmentID === 0) this.validationErrors.push('Choose a section');
    if (this.currentOffer.titleID === 0) this.validationErrors.push('Choose the job');
    if (this.mode === 'Create' && !this.currentOffer.uploadedFile) {
      this.validationErrors.push('A file must be uploaded');
    }
    return this.validationErrors.length === 0;
  }

  CreateOrEdit() {
    if (!this.isFormValid()) return;
    this.isLoading = true;

    const observable = this.mode === 'Create'
      ? this.offerServ.Add(this.currentOffer, this.DomainName)
      : this.offerServ.Edit(this.currentId!, this.currentOffer, this.DomainName);

    observable.subscribe({
      next: () => {
        this.isLoading = false;
        this.isModalVisible = false;
        this.loadData();
      },
      error: (err) => {
        this.isLoading = false;
        alert(err.error?.message || 'An error occurred');
      }
    });
  }

  openFile(url: string) {
    if (url) window.open(url, '_blank');
  }

  getDepartmentColor(deptName: string): string {
    const colors: { [key: string]: string } = {
      'Software': 'bg-orange-100 text-orange-800',
      'Marketing': 'bg-blue-100 text-blue-800',
      'HR': 'bg-purple-100 text-purple-800',
      'Multimedia': 'bg-green-100 text-green-800',
      'Educational': 'bg-pink-100 text-pink-800',
      'Others': 'bg-gray-100 text-gray-800',
    };
    return colors[deptName] || 'bg-gray-100 text-gray-800';
  }

  IsAllowDelete(insertedByID: number) {
    return this.editDeleteServ.IsAllowDelete(insertedByID, this.UserID, this.AllowDeleteForOthers);
  }

  IsAllowEdit(insertedByID: number) {
    return this.editDeleteServ.IsAllowEdit(insertedByID, this.UserID, this.AllowEditForOthers);
  }
}