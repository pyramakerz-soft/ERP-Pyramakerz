import { Component } from '@angular/core';
import { FeesActivation } from '../../../../Models/Accounting/fees-activation';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenData } from '../../../../Models/token-data';
import { AccountService } from '../../../../Services/account.service';
import { ApiService } from '../../../../Services/api.service';
import { AccountingTreeChartService } from '../../../../Services/Employee/Accounting/accounting-tree-chart.service';
import { MenuService } from '../../../../Services/shared/menu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FeesActivationService } from '../../../../Services/Employee/Accounting/fees-activation.service';
import { DeleteEditPermissionService } from '../../../../Services/shared/delete-edit-permission.service';
import { School } from '../../../../Models/school';
import { Section } from '../../../../Models/LMS/section';
import { Grade } from '../../../../Models/LMS/grade';
import { Classroom } from '../../../../Models/LMS/classroom';
import { Student } from '../../../../Models/student';
import { SchoolService } from '../../../../Services/Employee/school.service';
import { SectionService } from '../../../../Services/Employee/LMS/section.service';
import { GradeService } from '../../../../Services/Employee/LMS/grade.service';
import { ClassroomService } from '../../../../Services/Employee/LMS/classroom.service';
import { TuitionFeesType } from '../../../../Models/Accounting/tuition-fees-type';
import { TuitionFeesTypeService } from '../../../../Services/Employee/Accounting/tuition-fees-type.service';
import { TuitionDiscountTypes } from '../../../../Models/Accounting/tuition-discount-types';
import { TuitionDiscountTypeService } from '../../../../Services/Employee/Accounting/tuition-discount-type.service';
import { AcademicYear } from '../../../../Models/LMS/academic-year';
import { AcadimicYearService } from '../../../../Services/Employee/LMS/academic-year.service';
import { FeesActivationAddPut } from '../../../../Models/Accounting/fees-activation-add-put';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { StudentService } from '../../../../Services/student.service';

@Component({
  selector: 'app-fees-activation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './fees-activation.component.html',
  styleUrl: './fees-activation.component.css'
})
export class FeesActivationComponent {

  User_Data_After_Login: TokenData = new TokenData('', 0, 0, 0, 0, '', '', '', '', '');

  AllowEdit: boolean = false;
  AllowDelete: boolean = false;
  AllowEditForOthers: boolean = false;
  AllowDeleteForOthers: boolean = false;
 
  TableData: FeesActivation[] = [];

  DomainName: string = '';
  UserID: number = 0;

  isModalVisible: boolean = false;
  mode: string = '';

  path: string = ''; 

  Fees: FeesActivationAddPut = new FeesActivationAddPut()
  FeesForEdit: FeesActivationAddPut = new FeesActivationAddPut()
  FeesForAdd: FeesActivationAddPut[] = []

  SchoolId: number = 0;
  SectionId: number = 0;
  YearId: number = 0;
  GradeId: number = 0;
  ClassRoomId: number = 0;
  StudentId: number = 0;

  Schools: School[] = []
  Sections: Section[] = [];
  AcademicYears: AcademicYear[] = [];
  Grades: Grade[] = [];
  ClassRooms: Classroom[] = [];
 
  Students: Student[] = []; 

  FeesTypes: TuitionFeesType[] = []
  FeesDiscountType: TuitionDiscountTypes[] = [] 
  DiscountPercentage: number|null = null

  IsSearch: boolean = false 

  IsEdit = false;
  editingRowId: any = null; 
  validationErrors: { [key in keyof FeesActivationAddPut]?: string } = {};

  constructor( 
    private menuService: MenuService,
    public activeRoute: ActivatedRoute,
    public account: AccountService,
    public ApiServ: ApiService,
    public accountServ: AccountingTreeChartService, 
    public EditDeleteServ: DeleteEditPermissionService,
    public feesActivationServ: FeesActivationService,
    public SchoolServ: SchoolService,
    public SectionServ: SectionService,
    public acadimicYearService: AcadimicYearService,
    public GradeServ: GradeService,
    public ClassRoomServ: ClassroomService,
    public studentService: StudentService,
    public TuitionFeesTypeServ: TuitionFeesTypeService,
    public FeesDiscountTypeServ: TuitionDiscountTypeService,
    public AcademicYearServ: AcadimicYearService
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
 
    this.GetAllSchools(); 
    this.GetAllTuitionFeesType();
    this.GetAllDiscountType() 
  } 

  GetAllFeesData() {
    this.TableData = []
    this.feesActivationServ.Get(this.GradeId, this.YearId, this.ClassRoomId, this.StudentId, this.DomainName).subscribe((d) => {
      this.TableData = d;  
    })
  }

  Delete(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete this Fees Activation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#089B41',
      cancelButtonColor: '#17253E',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.feesActivationServ.Delete(id, this.DomainName).subscribe((D) => {
          this.GetAllFeesData();
        })
      }
    });
  }

  validateNumber(event: any, field: keyof FeesActivationAddPut): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      if (typeof this.Fees[field] === 'string') {
        this.Fees[field] = '' as never;
      }
    }
  }

  validateNumberForDiscount(event: any): void {
    const value = event.target.value;
    if (isNaN(value) || value === '') {
      event.target.value = '';
      this.DiscountPercentage = 0
    }
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

  GetAllSchools() {
    this.Schools = []
    this.SchoolServ.Get(this.DomainName).subscribe((d) => {
      this.Schools = d
    })
  }

  GetAllSectionsBySchoolID() {
    this.Sections = []
    this.SectionServ.GetBySchoolId(this.SchoolId, this.DomainName).subscribe((d) => {
      this.Sections = d
    })
  }

  GetAllYearsBySchoolID() {
    this.AcademicYears = []
    this.acadimicYearService.GetBySchoolId(this.SchoolId, this.DomainName).subscribe((d) => {
      this.AcademicYears = d
    })
  }

  GetAllGradeBySectionId() {
    this.Grades = []
    this.GradeServ.GetBySectionId(this.SectionId, this.DomainName).subscribe((d) => {
      this.Grades = d
    })
  }

  GetAllClassRoomByGradeAndAcademicYearID() {
    this.ClassRooms = []
    this.ClassRoomServ.GetByGradeAndAcYearId(this.GradeId, this.YearId, this.DomainName).subscribe((d) => {
      this.ClassRooms = d
    })
  }


  SchoolIsChanged(event: Event) {
    this.SchoolId = Number((event.target as HTMLSelectElement).value);
    this.SectionId = 0;
    this.GradeId = 0;
    this.YearId = 0;
    this.ClassRoomId = 0;
    this.StudentId = 0;
    this.Sections = [];
    this.Grades = [];
    this.AcademicYears = [];
    this.ClassRooms = [];
    this.Students = [];
    this.GetAllSectionsBySchoolID(); 
    this.GetAllYearsBySchoolID();  
  }

  SectionIsChanged(event: Event) {
    this.SectionId = Number((event.target as HTMLSelectElement).value);
    this.GradeId = 0;
    this.ClassRoomId = 0;
    this.StudentId = 0;
    this.Grades = [];
    this.ClassRooms = [];
    this.Students = [];
    this.GetAllGradeBySectionId(); 
    this.IsSearch = false 
  }

  YearIsChanged(event: Event) {
    this.YearId = Number((event.target as HTMLSelectElement).value);
    this.ClassRoomId = 0;
    this.StudentId = 0;
    this.ClassRooms = [];
    this.Students = []; 
    this.GetAllClassRoomByGradeAndAcademicYearID();
    this.IsSearch = false 
  }

  GradeIsChanged(event: Event) {
    this.GradeId = Number((event.target as HTMLSelectElement).value);
    this.ClassRoomId = 0;
    this.StudentId = 0;
    this.ClassRooms = [];
    this.Students = [];
    this.GetAllClassRoomByGradeAndAcademicYearID();
    this.IsSearch = false 
  }

  ClassRoomIsChanged(event: Event) {
    this.ClassRoomId = Number((event.target as HTMLSelectElement).value);
    this.StudentId = 0; 
    this.IsSearch = false
    this.getStudentsByClassID()
  }

  StudentChanged(event: Event) {
    this.StudentId = Number((event.target as HTMLSelectElement).value); 
    this.IsSearch = false
  }

  getStudentsByClassID(){
    this.Students = []
    this.studentService.GetByClassID(this.ClassRoomId, this.DomainName).subscribe(
      data =>{
        this.Students = data
      }
    )
  } 

  Search() { 
    this.IsSearch = true 
    this.GetAllFeesData()
  }

  GetAllTuitionFeesType() {
    this.TuitionFeesTypeServ.Get(this.DomainName).subscribe((d) => {
      this.FeesTypes = d
    })
  }

  GetAllDiscountType() {
    this.FeesDiscountTypeServ.Get(this.DomainName).subscribe((d) => {
      this.FeesDiscountType = d
    })
  } 

  async Activate() {
    if(this.isFormValid()){
      this.FeesForAdd = [];
      this.TableData.forEach(stu => {
        var fee: FeesActivationAddPut = new FeesActivationAddPut();
        fee.academicYearId = this.YearId;
        fee.amount = this.Fees.amount;
        fee.date = this.Fees.date;
        fee.discount = this.Fees.discount;
        fee.feeDiscountTypeID = this.Fees.feeDiscountTypeID;
        fee.feeTypeID = this.Fees.feeTypeID;
        fee.net = this.Fees.net;
        fee.studentID = stu.studentID;
  
        this.FeesForAdd.push(fee);
      });
      try {
        await lastValueFrom(this.feesActivationServ.Add(this.FeesForAdd, this.DomainName));
        this.GetAllFeesData();
        Swal.fire({
          title: 'Fees Added Successfully',
          icon: 'success',
          confirmButtonColor: '#089B41',
        });
      } catch (error) {
        console.error("Error while activating fees:", error);
      }
    }
  }

  CalculateDiscountFromPercentage() {
    if ((this.DiscountPercentage?this.DiscountPercentage:0) >= 0) {
      this.Fees.discount = ((this.Fees.amount?this.Fees.amount:0) * (this.DiscountPercentage?this.DiscountPercentage:0)) / 100;
      this.CalculateNet();
    }
  }

  CalculatePercentageFromDiscount() {
    this.DiscountPercentage = 0
    if ((this.Fees.amount?this.Fees.amount:0) > 0) {
      this.DiscountPercentage = ((this.Fees.discount?this.Fees.discount:0) / (this.Fees.amount?this.Fees.amount:0)) * 100;
      this.CalculateNet();
    }
  }

  async CalculateNet() {
    this.Fees.net = this.Fees.amount
    await this.CalculateDiscountFromPercentage()
    this.Fees.net = (this.Fees.amount?this.Fees.amount:0) - (this.Fees.discount?this.Fees.discount:0);
  }

  CalculateNetForEdit(row: FeesActivation) {
    row.net = row.amount - row.discount;
  }

  Edit(id: number) {
    this.IsEdit = true
    this.editingRowId = id
  }

  Save(row: FeesActivation) {
    this.editingRowId = null;
    var fee: FeesActivationAddPut = new FeesActivationAddPut()
    fee.academicYearId = row.academicYearId;
    fee.amount = row.amount;
    fee.date = row.date;
    fee.discount = row.discount;
    fee.feeDiscountTypeID = row.feeDiscountTypeID;
    fee.feeTypeID = row.feeTypeID;
    fee.net = row.net;
    fee.studentID = row.studentID;
    fee.feeActivationID = row.feeActivationID;
    this.feesActivationServ.Edit(fee, this.DomainName).subscribe((d) => {
      this.GetAllFeesData();
      Swal.fire({
        title: 'Fees Updated Successfully',
        icon: 'success',
        confirmButtonColor: '#089B41',
      });
    })
  }

  isFormValid(): boolean {
    let isValid = true;
    for (const key in this.Fees) {
      if (this.Fees.hasOwnProperty(key)) {
        const field = key as keyof FeesActivationAddPut;
        if (!this.Fees[field]) {
          if (
            field == 'feeTypeID' ||
            field == 'date' ||
            field == 'amount'
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

  capitalizeField(field: keyof FeesActivationAddPut): string {
    return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
  }

  onInputValueChange(event: { field: keyof FeesActivationAddPut; value: any }) {
    const { field, value } = event;
    (this.Fees as any)[field] = value;
    if (value) {
      this.validationErrors[field] = '';
    }
  }
}
