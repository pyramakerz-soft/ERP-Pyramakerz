import { Component, Input, OnInit } from '@angular/core';
import { MedicalHistoryService } from '../../../../../Services/Employee/Clinic/medical-history.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../../Services/api.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import {  Subscription } from 'rxjs';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';
@Component({
  selector: 'app-view-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './view-report.component.html',
  styleUrl: './view-report.component.css'
})

@InitLoader()
export class ViewReportComponent implements OnInit {
  @Input() reportType: 'parent' | 'doctor' = 'parent';
  UserType: string = 'employee';
  @Input() id?: number;
  isRtl: boolean = false;
  subscription!: Subscription;
  medicalHistory: any;
  isLoading = false;
  error = '';

  constructor(
    private medicalHistoryService: MedicalHistoryService,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private languageService: LanguageService, 
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
        this.reportType = this.route.snapshot.data['reportType'] || 'parent';
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        
        if (this.id) {
            this.loadMedicalHistory();
        }
      this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }

  ngOnDestroy(): void { 
     if (this.subscription) {
      this.subscription.unsubscribe();
    }
  } 

  async loadMedicalHistory() {
    this.isLoading = true;
    try {
      const domainName = this.apiService.GetHeader();
      
      if (this.reportType === 'parent') {
        this.medicalHistory = await firstValueFrom(
          this.medicalHistoryService.GetByIdByParent(this.id!, domainName)
        );
      } else {
        this.medicalHistory = await firstValueFrom(
          this.medicalHistoryService.GetByIdByDoctor(this.id!, domainName)
        );
      }
    } catch (error) {
      console.error('Error loading medical history:', error);
      this.error = 'Failed to load medical history';
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    if(this.UserType == 'parent'){
      this.router.navigate(['/Employee/Medical Report'], { relativeTo: this.route });
    }else{
      this.router.navigate(['/Parent/Medical Report'], { relativeTo: this.route });
    }
  }

  getFileName(filePath: string | null): string {
    if (!filePath) return '';
    return filePath.split('/').pop() || '';
  }

  hasValidFile(file: string | null): boolean {
    return !!file && file !== 'null' && file !== 'undefined';
  }
}
