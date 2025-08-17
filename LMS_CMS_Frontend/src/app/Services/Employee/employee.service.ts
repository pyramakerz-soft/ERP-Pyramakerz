import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Employee } from '../../Models/Employee/employee';
import { EmployeeGet } from '../../Models/Employee/employee-get';
import { EditPass } from '../../Models/Employee/edit-pass';
import { AccountingEmployee } from '../../Models/Accounting/accounting-employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
    this.header = ApiServ.GetHeader();
  }

  GetWithTypeId(typeId: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('domain-name', this.header)
      .set('Content-Type', 'application/json');

    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetByTypeId/${typeId}`, { headers })
  }

  GetByDepartmentId(departmentID: number,DomainName?:string){
    if(DomainName!=null) {
      this.header=DomainName 
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('domain-name', this.header)
    .set('Content-Type', 'application/json');
    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetByDepartmentId/${departmentID}`, { headers })
  }

  Add(employee: EmployeeGet, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('domain-name', this.header);

    const formData = new FormData();

    formData.append('user_Name', employee.user_Name);
    formData.append('en_name', employee.en_name);
    formData.append('ar_name', employee.ar_name || '');
    formData.append('password', employee.password);
    formData.append('mobile', employee.mobile || '');
    formData.append('phone', employee.phone || '');
    formData.append('email', employee.email || '');
    formData.append('licenseNumber', employee.licenseNumber || '');
    formData.append('expireDate', employee.expireDate || '');
    formData.append('address', employee.address || '');
    formData.append('role_ID', employee.role_ID?.toString() ?? '');
    formData.append('busCompanyID', employee.busCompanyID?.toString() ?? '');
    formData.append('employeeTypeID', employee.employeeTypeID?.toString() ?? ''); 
    formData.append('canReceiveRequest', employee.canReceiveRequest?.toString() ?? 'false');
    formData.append('canReceiveMessageFromParent', employee.canReceiveMessageFromParent?.toString() ?? 'false');
    formData.append('canReceiveRequestFromParent', employee.canReceiveRequestFromParent?.toString() ?? 'false');

    if (employee.files && employee.files.length > 0) {
      employee.files.forEach((file, index) => {
        formData.append(`files[${index}].file`, file.file, file.file.name); // File (IFormFile)
        formData.append(`files[${index}].Name`, file.name);            // Name (string)
      });
    }

    if (employee.floorsSelected && employee.floorsSelected.length > 0) {
      employee.floorsSelected.forEach((floor, index) => {
        formData.append(`floorsSelected[${index}]`, floor.toString());
      });
    }

    if (employee.gradeSelected && employee.gradeSelected.length > 0) {
      employee.gradeSelected.forEach((floor, index) => {
        formData.append(`gradeSelected[${index}]`, floor.toString());
      });
    }

    if (employee.subjectSelected && employee.subjectSelected.length > 0) {
      employee.subjectSelected.forEach((floor, index) => {
        formData.append(`subjectSelected[${index}]`, floor.toString());
      });
    }
    return this.http.post<EmployeeGet>(`${this.baseUrl}/Employee`, formData, { headers });
  }

  Edit(employee: EmployeeGet, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('domain-name', this.header);

    const formData = new FormData();
    formData.append('id', employee.id?.toString() ?? '');
    formData.append('user_Name', employee.user_Name);
    formData.append('en_name', employee.en_name);
    formData.append('ar_name', employee.ar_name || '');
    formData.append('password', employee.password);
    formData.append('mobile', employee.mobile || '');
    formData.append('phone', employee.phone || '');
    formData.append('email', employee.email || '');
    formData.append('licenseNumber', employee.licenseNumber || '');
    formData.append('expireDate', employee.expireDate || '');
    formData.append('address', employee.address || '');
    formData.append('role_ID', employee.role_ID?.toString() ?? '');
    formData.append('busCompanyID', employee.busCompanyID?.toString() ?? '');
    formData.append('employeeTypeID', employee.employeeTypeID?.toString() ?? ''); 
    formData.append('canReceiveRequest', employee.canReceiveRequest?.toString() ?? 'false');
    formData.append('canReceiveMessageFromParent', employee.canReceiveMessageFromParent?.toString() ?? 'false');
    formData.append('canReceiveRequestFromParent', employee.canReceiveRequestFromParent?.toString() ?? 'false');

    if (employee.files && employee.files.length > 0) {
      let uploadIndex = 0;
      employee.files.forEach((file) => {
        if (file.file instanceof File) {
          formData.append(`files[${uploadIndex}].file`, file.file, file.file.name);
          formData.append(`files[${uploadIndex}].name`, file.name);
          uploadIndex++;
        }
      });
    }

    if (employee.deletedFloorsSelected && employee.deletedFloorsSelected.length > 0) {
      employee.deletedFloorsSelected.forEach((floor, index) => {
        formData.append(`deletedFloorsSelected[${index}]`, floor.toString());
      });
    }

    if (employee.newFloorsSelected && employee.newFloorsSelected.length > 0) {
      employee.newFloorsSelected.forEach((floor, index) => {
        formData.append(`newFloorsSelected[${index}]`, floor.toString());
      });
    }

     if (employee.deletedGradesSelected && employee.deletedGradesSelected.length > 0) {
      employee.deletedGradesSelected.forEach((floor, index) => {
        formData.append(`deletedGradesSelected[${index}]`, floor.toString());
      });
    }

    if (employee.newGradesSelected && employee.newGradesSelected.length > 0) {
      employee.newGradesSelected.forEach((floor, index) => {
        formData.append(`newGradesSelected[${index}]`, floor.toString());
      });
    }

     if (employee.deletedSubjectsSelected && employee.deletedSubjectsSelected.length > 0) {
      employee.deletedSubjectsSelected.forEach((floor, index) => {
        formData.append(`deletedSubjectsSelected[${index}]`, floor.toString());
      });
    }

    if (employee.newSubjectsSelected && employee.newSubjectsSelected.length > 0) {
      employee.newSubjectsSelected.forEach((floor, index) => {
        formData.append(`newSubjectsSelected[${index}]`, floor.toString());
      });
    }

    if (employee.editedFiles && employee.editedFiles.length > 0) {
      let uploadIndex = 0;
      employee.files.forEach((file) => {
        formData.append(`editedFiles[${uploadIndex}].id`, file.id.toString());
        formData.append(`editedFiles[${uploadIndex}].name`, file.name);
        formData.append(`editedFiles[${uploadIndex}].link`, file.link);
        formData.append(`editedFiles[${uploadIndex}].lastModified`, file.lastModified.toString());
        formData.append(`editedFiles[${uploadIndex}].size`, file.size.toString());
        formData.append(`editedFiles[${uploadIndex}].type`, file.type);
        formData.append(`editedFiles[${uploadIndex}].employeeID`, file.employeeID.toString());
        uploadIndex++;
      });
    }
    return this.http.put<EmployeeGet>(`${this.baseUrl}/Employee`, formData, { headers });
  }

  Get_Employees(DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<EmployeeGet[]>(`${this.baseUrl}/Employee`, { headers });
  }

  Get_Employee_By_ID(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<EmployeeGet>(`${this.baseUrl}/Employee/${id}`, { headers });
  }

  DeleteFile(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/Employee/DeleteFiles/${id}`, { headers });
  }

  Delete(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/Employee/${id}`, { headers });
  } 

  EditAccountingEmployee(employee: AccountingEmployee, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/Employee/EmployeeAccounting`, employee, { headers });
  } 

  GetAcountingEmployee(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<AccountingEmployee>(`${this.baseUrl}/Employee/getByAccountingEmployee/${id}`, { headers });
  }

  GetWhoCanAcceptRequestsFromEmployeeByDepartmentId(departmentID: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetWhoCanAcceptRequestsFromEmployeeByDepartmentId/${departmentID}`, { headers });
  }
 

  GetWhoCanAcceptRequestsFromParentAndStudentByDepartmentId(departmentID: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetWhoCanAcceptRequestsFromParentAndStudentByDepartmentId/${departmentID}`, { headers });
  }

  GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId(SubjectId: number, StudentId: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetTeachersCoTeachersRemedialTeachersBySubjectIdAndStudentId/${SubjectId}/${StudentId}`, { headers });
  }
}