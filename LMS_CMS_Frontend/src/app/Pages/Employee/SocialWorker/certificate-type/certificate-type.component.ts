import { Component } from '@angular/core';
import { CertificateType } from '../../../../Models/SocialWorker/certificate-type';
import { CertificateTypeService } from '../../../../Services/Employee/SocialWorker/certificate-type.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-certificate-type',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './certificate-type.component.html',
  styleUrl: './certificate-type.component.css'
})
export class CertificateTypeComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;

  TableData: CertificateType[] = [];

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';
  isRtl: boolean = false;
  subscription!: Subscription;
  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name'];

  certificateType: CertificateType = new CertificateType();
  imagePreview: string = '';

  validationErrors: { [key in keyof CertificateType]?: string } = {};
  isLoading = false;
  IsTestOpen: boolean = false;
  safeBackgroundImage: SafeStyle | null = null;
  imageWidth: number = 0;
  imageHeight: number = 0;
  topPercent: number = 0;
  leftPercent: number = 0;

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    public CertificateTypeServ: CertificateTypeService,
    private sanitizer: DomSanitizer,
    private languageService: LanguageService
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

    this.GetAllData();

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  GetAllData() {
    this.TableData = [];
    this.CertificateTypeServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
      console.log(this.TableData)
    });
  }

  Create() {
    this.mode = 'Create';
    this.certificateType = new CertificateType();
    this.validationErrors = {};
    this.openModal();
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Certificate Type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.CertificateTypeServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
        });
      }
    });
  }

  Edit(row: CertificateType) {
    this.mode = 'Edit';
    this.CertificateTypeServ.GetByID(row.id, this.DomainName).subscribe((d) => {
      this.certificateType = d;
    });
    this.openModal();
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

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.CertificateTypeServ.Add(
          this.certificateType,
          this.DomainName
        ).subscribe(
          (d) => {
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
      if (this.mode == 'Edit') {
        this.CertificateTypeServ.Edit(
          this.certificateType,
          this.DomainName
        ).subscribe(
          (d) => {
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            this.isLoading = false; // Hide spinner
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Try Again Later!',
              confirmButtonText: 'Okay',
              customClass: { confirmButton: 'secondaryBg' }
            });
          }
        );
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.IsTestOpen = false;
    this.imagePreview = '';
    this.certificateType = new CertificateType()
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;
  }

  validateNumber(event: any, field: keyof CertificateType): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.certificateType[field] === 'string') {
        this.certificateType[field] = '' as never;
      }
    }
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    this.imageWidth = img.naturalWidth;
    this.imageHeight = img.naturalHeight;
  }

  test() {
    let imageUrl = this.imagePreview || this.certificateType.file;
    if (imageUrl) {
      if (!imageUrl.startsWith('data:')) {
        imageUrl = encodeURI(imageUrl);
      }
      this.safeBackgroundImage = this.sanitizer.bypassSecurityTrustStyle(`url("${imageUrl}")`);

      // Download directly using raw URL
      this.downloadCertificate(imageUrl);
    }
  }

  downloadCertificate(imageUrl: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const leftPx = (this.certificateType.leftSpace / 100) * img.width;
      const topPx = (this.certificateType.topSpace / 100) * img.height;
      const fontSize = Math.floor(img.height * 0.05);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'top';
      ctx.fillText("Student Name Will Be Here", leftPx, topPx);

      const link = document.createElement('a');
      link.download = `Student Name Will Be Here-certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.certificateType) {
      if (this.certificateType.hasOwnProperty(key)) {
        const field = key as keyof CertificateType;
        if (!this.certificateType[field]) {
          if (
            field == 'name' ||
            (this.certificateType.id == 0 && field == "newFile")
          ) {
            this.validationErrors[field] = `*${this.capitalizeField(
              field
            )} is required`;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof CertificateType): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof CertificateType; value: any }) {
    const { field, value } = event;
    (this.certificateType as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: CertificateType[] = await firstValueFrom(
        this.CertificateTypeServ.Get(this.DomainName)
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
            return fieldValue.toString().includes(numericValue.toString())
          }
          return fieldValue == this.value;
        });
      }
    } catch (error) {
      this.TableData = [];
    }
  }

  onImageFileSelected(event: any) {
    const file: File = event.target.files[0];
    const input = event.target as HTMLInputElement;
    this.IsTestOpen = false;
    this.certificateType.file = '';
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        this.validationErrors['newFile'] = 'The file size exceeds the maximum limit of 25 MB.';
        this.certificateType.newFile = null;
        return;
      }
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.certificateType.newFile = file;
        this.validationErrors['newFile'] = '';

        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string; // ✅ Set preview
        };
        reader.readAsDataURL(file);

      } else {
        this.validationErrors['newFile'] = 'Invalid file type. Only JPEG, JPG and PNG are allowed.';
        this.certificateType.newFile = null;
        this.imagePreview = '';
        return;
      }
    }
    input.value = '';
  }
}
