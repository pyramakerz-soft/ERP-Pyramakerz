import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Employee } from '../../Models/Employee/employee';
import { EditPass } from '../../Models/Employee/edit-pass';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  baseUrl = ""
  header = ""
  private cachedDomainForMyData?: string;
  private myData$?: Observable<Employee>;
 
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

  GetWithJobId(jobId: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('domain-name', this.header)
      .set('Content-Type', 'application/json');

    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetByJobId/${jobId}`, { headers })
  }

  GetByDepartmentId(departmentID: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('domain-name', this.header)
      .set('Content-Type', 'application/json');
    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetByDepartmentId/${departmentID}`, { headers })
  }

  Add(employee: Employee, DomainName?: string) {
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
    formData.append('isRestrictedForLoctaion', employee.isRestrictedForLoctaion?.toString() ?? 'false');

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

    if (employee.locationSelected && employee.locationSelected.length > 0) {
      employee.locationSelected.forEach((floor, index) => {
        formData.append(`locationSelected[${index}]`, floor.toString());
      });
    }

    if (employee.subjectSelected && employee.subjectSelected.length > 0) {
      employee.subjectSelected.forEach((floor, index) => {
        formData.append(`subjectSelected[${index}]`, floor.toString());
      });
    }
    return this.http.post<Employee>(`${this.baseUrl}/Employee`, formData, { headers });
  }

  Edit(employee: Employee, DomainName?: string) {
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
    formData.append('isRestrictedForLoctaion', employee.isRestrictedForLoctaion?.toString() ?? 'false');

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

    if (employee.deletedLocationSelected && employee.deletedLocationSelected.length > 0) {
      employee.deletedLocationSelected.forEach((floor, index) => {
        formData.append(`deletedLocationSelected[${index}]`, floor.toString());
      });
    }

    if (employee.newLocationSelected && employee.newLocationSelected.length > 0) {
      employee.newLocationSelected.forEach((floor, index) => {
        formData.append(`newLocationSelected[${index}]`, floor.toString());
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
    return this.http.put<Employee>(`${this.baseUrl}/Employee`, formData, { headers });
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
    return this.http.get<Employee[]>(`${this.baseUrl}/Employee`, { headers });
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
    return this.http.get<Employee>(`${this.baseUrl}/Employee/${id}`, { headers });
  }
 
  // GetMyData(DomainName?: string) {
  //   if (DomainName != null) {
  //     this.header = DomainName
  //   }
  //   const token = localStorage.getItem("current_token");
  //   const headers = new HttpHeaders()
  //     .set('domain-name', this.header)
  //     .set('Authorization', `Bearer ${token}`)
  //     .set('Content-Type', 'application/json');
  //   return this.http.get<Employee>(`${this.baseUrl}/Employee/GetMyData`, { headers });
  // }

  GetMyData(DomainName?: string, options?: { forceRefresh?: boolean }): Observable<Employee> {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const activeDomain = this.header;
    const forceRefresh = options?.forceRefresh ?? false;

    if (forceRefresh || !this.myData$ || this.cachedDomainForMyData !== activeDomain) {
      const token = localStorage.getItem("current_token");
      const headers = new HttpHeaders()
        .set('domain-name', activeDomain)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

      this.cachedDomainForMyData = activeDomain;
      this.myData$ = this.http.get<Employee>(`${this.baseUrl}/Employee/GetMyData`, { headers })
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
    }

    return this.myData$!;
  }

  clearMyDataCache(): void {
    this.cachedDomainForMyData = undefined;
    this.myData$ = undefined;
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

  Suspend(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/Employee/Suspend/${id}`, { headers });
  }

  EditAccountingEmployee(employee: Employee, DomainName?: string) {
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
    return this.http.get<Employee>(`${this.baseUrl}/Employee/getByAccountingEmployee/${id}`, { headers });
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

  GetWhoCanAcceptMessagesFromParentAndStudentByDepartmentId(departmentID: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Employee[]>(`${this.baseUrl}/Employee/GetWhoCanAcceptMessagesFromParentAndStudentByDepartmentId/${departmentID}`, { headers });
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

GetJobReport(jobId: number, jobCategoryId: number, DomainName?: string) {
  if (DomainName != null) {
    this.header = DomainName;
  }
  
  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');
  
  const requestBody = {
    jobId: jobId,
    jobCategoryId: jobCategoryId
  };
  
  return this.http.post<any[]>(`${this.baseUrl}/Employee/report`, requestBody, { headers });
}
}