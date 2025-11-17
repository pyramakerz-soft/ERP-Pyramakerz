import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HygieneFormService } from '../../../../../Services/Employee/Clinic/hygiene-form.service';
import {
  HygieneForm,
  StudentHygieneType,
} from '../../../../../Models/Clinic/HygieneForm';
import { ApiService } from '../../../../../Services/api.service'; 
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { HygieneFormTableComponent } from '../hygiene-form-table/hygiene-form-table.component';
import { DatePipe } from '@angular/common';
import { HygieneTypesService } from '../../../../../Services/Employee/Clinic/hygiene-type.service';
import { HygieneTypes } from '../../../../../Models/Clinic/hygiene-types';
import { firstValueFrom } from 'rxjs';
import { RealTimeNotificationServiceService } from '../../../../../Services/shared/real-time-notification-service.service';
import { InitLoader } from '../../../../../core/Decorator/init-loader.decorator';
import { LoadingService } from '../../../../../Services/loading.service';

@Component({
  selector: 'app-view-hygiene-form',
  templateUrl: './veiw-hygiene-form.component.html',
  styleUrl: './veiw-hygiene-form.component.css',
  imports: [HygieneFormTableComponent, DatePipe,TranslateModule],
  standalone: true,

})

@InitLoader()
export class ViewHygieneFormComponent implements OnInit {
  moveToHygieneForm() {
    this.router.navigateByUrl('Employee/Hygiene Form Medical Report');
  }

  hygieneForm: HygieneForm | null = null;
  isRtl: boolean = false;
  subscription!: Subscription;  

  students: any[] = [];

  hygieneTypes: HygieneTypes[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hygieneFormService: HygieneFormService,
    private apiService: ApiService,
    private languageService: LanguageService,
    private hygieneTypesService: HygieneTypesService, 
    private loadingService: LoadingService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadHygieneTypes();
      this.loadHygieneForm(Number(id));
      console.log(this.loadHygieneForm(Number(id)));
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



  async loadHygieneTypes() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.hygieneTypesService.Get(domainName)
      );
      this.hygieneTypes = data;
      console.log('testing hygiene types');
      console.log(this.hygieneTypes);
    } catch (error) {
      console.error('Error loading hygiene types:', error);
    }
  }

  loadHygieneForm(id: number) {
    try {
      const domainName = this.apiService.GetHeader();
      this.hygieneFormService.GetById(id, domainName).subscribe({
        next: (hygieneForm) => {
          this.hygieneForm = hygieneForm;
          console.log(hygieneForm);
          this.prepareStudentData(hygieneForm);
        },
        error: (error) => {
          console.error('Error loading hygiene form:', error);
        },
      });
    } catch (error) {
      console.error('Error in loadHygieneForm:', error);
    }
  }

private prepareStudentData(hygieneForm: HygieneForm) {
  this.students = hygieneForm.studentHygieneTypes.map(
    (studentHygieneType) => {
      const studentData: any = {
        id: studentHygieneType.studentId,
        en_name: studentHygieneType.student,
        attendance: studentHygieneType.attendance,
        comment: studentHygieneType.comment,
        actionTaken: studentHygieneType.actionTaken,
      };

      this.hygieneTypes.forEach((hygieneType) => {
        if (studentHygieneType.attendance === true) {
          const hasHygieneType = studentHygieneType.hygieneTypes?.some(
            ht => ht.id === hygieneType.id
          );
          studentData[`hygieneType_${hygieneType.id}`] = hasHygieneType ? true : false;
        } else {
          studentData[`hygieneType_${hygieneType.id}`] = null;
        }
      });

      return studentData;
    }
  );
}
}
