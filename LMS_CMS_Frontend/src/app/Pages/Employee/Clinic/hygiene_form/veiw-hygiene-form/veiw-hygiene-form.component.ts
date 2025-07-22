import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HygieneFormService } from '../../../../../Services/Employee/Clinic/hygiene-form.service';
import {
  HygieneForm,
  StudentHygieneType,
} from '../../../../../Models/Clinic/HygieneForm';
import { School } from '../../../../../Models/school';
import { Grade } from '../../../../../Models/LMS/grade';
import { Classroom } from '../../../../../Models/LMS/classroom';
import { Student } from '../../../../../Models/student';
import { HygieneTypes } from '../../../../../Models/Clinic/hygiene-types';
import { HygieneFormTableComponent } from '../hygiene-form-table/hygiene-form-table.component';
import { ApiService } from '../../../../../Services/api.service';
import { DatePipe } from '@angular/common';

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
  school: School | null = null;
  grade: Grade | null = null;
  classroom: Classroom | null = null;
  students: StudentHygieneType[] = [];
  hygieneTypes: HygieneTypes[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hygieneFormService: HygieneFormService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadHygieneForm(Number(id));
    }
  }

  async loadHygieneForm(id: number) {
    try {
      const domainName = this.apiService.GetHeader();
      this.hygieneFormService.GetById(id, domainName).subscribe({
        next: (hygieneForm) => {
          console.log('Hygiene Form:', hygieneForm);
          this.hygieneForm = hygieneForm;
          this.students = hygieneForm.studentHygieneTypes ?? [];

          // Extract all unique hygiene types from all students
          const allHygieneTypes = this.students.flatMap((student) =>
            student.hygieneTypes.map((ht) => ({
              id: ht.id,
              type: ht.type,
              insertedAt: null,
              insertedByUserId: ht.insertedByUserId,
            }))
          );

          // Remove duplicates
          this.hygieneTypes = Array.from(
            new Map(allHygieneTypes.map((item) => [item.id, item])).values()
          );
        },
        error: (error) => {
          console.error('Error loading hygiene form:', error);
        },
      });
    } catch (error) {
      console.error('Error in loadHygieneForm:', error);
    }
  }
}
