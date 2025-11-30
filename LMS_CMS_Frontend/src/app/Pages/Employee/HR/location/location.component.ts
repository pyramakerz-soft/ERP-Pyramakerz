import { Component } from '@angular/core';
import { Location } from '../../../../Models/HR/location';
import { LocationService } from '../../../../Services/Employee/HR/location.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';
// import Swal from 'sweetalert2';
import { SearchComponent } from '../../../../Component/search/search.component';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { DomainService } from '../../../../Services/Employee/domain.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { LanguageService } from '../../../../Services/shared/language.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import 'leaflet-control-geocoder';
// import * as L from 'leaflet';
import { LoadingService } from '../../../../Services/loading.service';
import { InitLoader } from '../../../../core/Decorator/init-loader.decorator';


@Component({
  selector: 'app-location',
  standalone: true,
  imports: [FormsModule, CommonModule, SearchComponent, TranslateModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css',
})

@InitLoader()
export class LocationComponent {
  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
  isRtl: boolean = false;
  subscription!: Subscription;
  TableData: Location[] = [];
  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = '';
  key: string = 'id';
  value: any = '';
  keysArray: string[] = ['id', 'name'];

  location: Location = new Location();

  validationErrors: { [key in keyof Location]?: string } = {};
  isLoading = false;
  private map!: L.Map;
  private marker!: L.Marker;
  private circle: any; // for range circle

  constructor(
    private router: Router,
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    private languageService: LanguageService,
    public DomainServ: DomainService,
    public EditDeleteServ: DeleteEditPermissionService,
    public ApiServ: ApiService,
    private translate: TranslateService,
    public LocationServ: LocationService,
    private loadingService: LoadingService
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

    this.subscription = this.languageService.language$.subscribe(
      (direction) => {
        this.isRtl = direction === 'rtl';
      }
    );
    this.isRtl = document.documentElement.dir === 'rtl';
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async showErrorAlert(errorMessage: string) {
    const translatedTitle = this.translate.instant('Error');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'error',
      title: translatedTitle,
      text: errorMessage,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  private async showSuccessAlert(message: string) {
    const translatedTitle = this.translate.instant('Success');
    const translatedButton = this.translate.instant('Okay');

    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      icon: 'success',
      title: translatedTitle,
      text: message,
      confirmButtonText: translatedButton,
      customClass: { confirmButton: 'secondaryBg' },
    });
  }

  GetAllData() {
    this.TableData = [];
    this.LocationServ.Get(this.DomainName).subscribe((d) => {
      this.TableData = d;
    });
  }

  Create() {
    this.mode = 'Create';
    this.location = new Location();
    this.validationErrors = {};
    this.openModal();
  }

  async Delete(id: number) {
    const Swal = await import('sweetalert2').then(m => m.default);

    Swal.fire({
      title: this.translate.instant('Are you sure you want to') + " " + this.translate.instant('delete') + " " + this.translate.instant('هذا') + " " + this.translate.instant('Location') + this.translate.instant('?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.LocationServ.Delete(id, this.DomainName).subscribe((d) => {
          this.GetAllData();
        });
      }
    });
  }

  async Edit(id: number) {
    const L = await import('leaflet');

    this.mode = 'Edit';
    this.LocationServ.GetByID(id, this.DomainName).subscribe((d) => {
      this.location = d;
      this.onRangeChange();
      this.openModal();
      setTimeout(() => {
        if (this.map && this.location.latitude && this.location.longitude) {
          const latlng = L.latLng(
            this.location.latitude,
            this.location.longitude
          );
          if (this.location.zoom) {
            this.map.setView(latlng, this.location.zoom); // center map
          }
          else {
            this.map.setView(latlng, 13); // center map
          }
          this.marker.setLatLng(latlng); // move marker
        }
      }, 200);
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

  CreateOREdit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      if (this.mode == 'Create') {
        this.LocationServ.Add(this.location, this.DomainName).subscribe(
          (d) => {
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
            this.showSuccessAlert(this.translate.instant('Location created successfully'));
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to create location');
            this.showErrorAlert(errorMessage);
          }
        );
      }
      if (this.mode == 'Edit') {
        this.LocationServ.Edit(this.location, this.DomainName).subscribe(
          (d) => {
            this.showSuccessAlert(this.translate.instant('Location updated successfully'));
            this.GetAllData();
            this.isLoading = false;
            this.closeModal();
          },
          (error) => {
            this.isLoading = false;
            const errorMessage = error.error?.message || this.translate.instant('Failed to update location');
            this.showErrorAlert(errorMessage);
          }
        );
      }
    }
  }

  validateNumber(event: any, field: keyof Location): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.location[field] === 'string') {
        this.location[field] = '' as never;
      }
    }
  }

  closeModal() {
    this.isModalVisible = false;
    this.location = new Location();
  }

  openModal() {
    this.validationErrors = {};
    this.isModalVisible = true;

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 200);
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.location) {
      if (this.location.hasOwnProperty(key)) {
        const field = key as keyof Location;
        if (!this.location[field]) {
          if (field == 'name' || field == 'latitude' || field == 'longitude' || field == 'range') {
            this.validationErrors[field] = `${this.translate.instant(field)} ${this.translate.instant('Field is required')} `;
            isValid = false;
          }
        }
      }
    }
    return isValid;
  }

  capitalizeField(field: keyof Location): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof Location; value: any }) {
    const { field, value } = event;
    (this.location as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }

  async onSearchEvent(event: { key: string; value: any }) {
    this.key = event.key;
    this.value = event.value;
    try {
      const data: Location[] = await firstValueFrom(
        this.LocationServ.Get(this.DomainName)
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

  ngAfterViewInit(): void {
    this.initMap();
  }

  private async initMap(): Promise<void> {
    const L = await import('leaflet');

    // Create map
    this.map = L.map('map').setView([30.0444, 31.2357], 13);

    // Tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Custom Font Awesome marker
    const faIcon = L.divIcon({
      html: '<i class="fa-solid fa-location-dot" style="font-size:34px;color:red;"></i>',
      className: 'fa-map-marker-icon',
      iconSize: [34, 34],
      iconAnchor: [17, 34], // bottom center
    });

    // Marker
    this.marker = L.marker([30.0444, 31.2357], {
      draggable: true,
      icon: faIcon
    }).addTo(this.map);

    // Drag event
    this.marker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      this.location.latitude = pos.lat;
      this.location.longitude = pos.lng;
      this.updateCircle();
    });

    // Click on map → move marker
    this.map.on('click', (e: any) => {
      this.marker.setLatLng(e.latlng);
      this.location.latitude = e.latlng.lat;
      this.location.longitude = e.latlng.lng;
      this.updateCircle();
    });

    // Save zoom
    this.map.on('zoomend', () => {
      this.location.zoom = this.map.getZoom();
    });

    // Geocoder Search Bar
    // @ts-ignore
    L.Control.geocoder().addTo(this.map);

    // Draw initial circle if needed
    this.updateCircle();
  }

  /** Called when latitude or longitude inputs change */
  async onLatLngChange(): Promise<void> {
    const L = await import('leaflet');

    if (this.location.latitude && this.location.longitude) {
      const latlng = L.latLng(this.location.latitude, this.location.longitude);
      this.marker.setLatLng(latlng);
      this.map.setView(latlng, this.location.zoom || 13); // use saved zoom
      this.updateCircle();
    }
  }

  /** Called when range input changes */
  onRangeChange(): void {
    this.updateCircle();
  }

  /** Draw / update circle */
  async updateCircle(): Promise<void> {
    const L = await import('leaflet');

    if (this.circle) {
      this.map.removeLayer(this.circle);
    }

    if (
      this.location.range &&
      this.location.latitude &&
      this.location.longitude
    ) {
      this.circle = L.circle(
        [this.location.latitude, this.location.longitude],
        {
          radius: +this.location.range, // in meters
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.2,
        }
      ).addTo(this.map);
    }
  }

}
