import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Violation } from '../../../Models/Violation/violation';
import { ApiService } from '../../api.service';
import { ViolationReport } from '../../../Models/Violation/violation-report';


@Injectable({
  providedIn: 'root',
})
export class ViolationService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  Get(DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Violation[]>(`${this.baseUrl}/Violation`, { headers });
  }

  GetByID(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Violation>(`${this.baseUrl}/Violation/${id}`, {
      headers,
    });
  }

  Add(Violation: Violation, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append(
      'employeeTypeId',
      Violation.employeeTypeId.toString() ?? ''
    );
    formData.append(
      'violationTypeID',
      Violation.violationTypeID.toString() ?? ''
    );
    formData.append('employeeID', Violation.employeeID.toString() ?? '');
    formData.append('date', Violation.date ?? '');
    formData.append('details', Violation.details ?? '');

    if (Violation.attachFile) {
      formData.append(
        'attachFile',
        Violation.attachFile,
        Violation.attachFile.name
      );
    }
    return this.http.post(`${this.baseUrl}/Violation`, formData, {
      headers: headers,
      responseType: 'text' as 'json',
    });
  }

  Edit(Violation: Violation, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('id', Violation.id.toString() ?? '');
    formData.append(
      'employeeTypeId',
      Violation.employeeTypeId.toString() ?? ''
    );
    formData.append(
      'violationTypeID',
      Violation.violationTypeID.toString() ?? ''
    );
    formData.append('employeeID', Violation.employeeID.toString() ?? '');
    formData.append('date', Violation.date ?? '');
    formData.append('details', Violation.details ?? '');

    if (Violation.attachFile) {
      formData.append(
        'attachFile',
        Violation.attachFile,
        Violation.attachFile.name
      );
    }

    return this.http.put(`${this.baseUrl}/Violation`, formData, {
      headers: headers,
      responseType: 'text' as 'json',
    });
  }

  Delete(id: number, DomainName?: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/Violation/${id}`, { headers });
  }

  GetViolationReport(
    employeeTypeId: number,
    violationTypeId: number,
    fromDate: string,
    toDate: string,
    DomainName?: string
  ) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const params = new HttpParams()
      .set('employeeTypeId', employeeTypeId.toString())
      .set('violationTypeId', violationTypeId.toString())
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<ViolationReport[]>(
      `${this.baseUrl}/Violation/report`,
      {
        headers: headers,
        params: params,
      }
    );
  }
}
