import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HygieneFormService } from '../../../../../Services/Employee/Clinic/hygiene-form.service';
import {
  HygieneForm,
  StudentHygieneType,
} from '../../../../../Models/Clinic/HygieneForm';
import { ApiService } from '../../../../../Services/api.service';
import { HygieneFormTableComponent } from '../hygiene-form-table/hygiene-form-table.component';
import { DatePipe } from '@angular/common';
import { HygieneTypesService } from '../../../../../Services/Employee/Clinic/hygiene-type.service';
import { HygieneTypes } from '../../../../../Models/Clinic/hygiene-types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-view-hygiene-form',
  templateUrl: './veiw-hygiene-form.component.html',
  styleUrl: './veiw-hygiene-form.component.css',
  imports: [HygieneFormTableComponent, DatePipe],
  standalone: true,
})
export class ViewHygieneFormComponent implements OnInit {
  moveToHygieneForm() {
    this.router.navigateByUrl('Employee/Hygiene Form Medical Report');
  }

  hygieneForm: HygieneForm | null = null;
  students: any[] = [];
  hygieneTypes: HygieneTypes[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hygieneFormService: HygieneFormService,
    private apiService: ApiService,
    private hygieneTypesService: HygieneTypesService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadHygieneTypes();
      this.loadHygieneForm(Number(id));
    }
  }

  async loadHygieneTypes() {
    try {
      const domainName = this.apiService.GetHeader();
      const data = await firstValueFrom(
        this.hygieneTypesService.Get(domainName)
      );
      this.hygieneTypes = data;
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

        // Initialize all hygiene types as false
        this.hygieneTypes.forEach((hygieneType) => {
          studentData[`hygieneType_${hygieneType.id}`] = false;
        });

        // Set to true only the hygiene types that exist in the student's data
        if (studentHygieneType.hygieneTypes && studentHygieneType.attendance) {
          studentHygieneType.hygieneTypes.forEach((hygieneType) => {
            studentData[`hygieneType_${hygieneType.id}`] = true;
          });
        }

        return studentData;
      }
    );
  }
}
