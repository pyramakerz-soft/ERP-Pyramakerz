import { Injectable } from '@angular/core';
import { TimeTable } from '../../../Models/LMS/time-table';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../api.service';
import { TimeTableDayGroupDTO } from '../../../Models/LMS/time-table-day-group-dto';
import { TimeTableReplace } from '../../../Models/LMS/time-table-replace';
import { Employee } from '../../../Models/Employee/employee';
import { Classroom } from '../../../Models/LMS/classroom';

@Injectable({
  providedIn: 'root',
})
export class TimeTableService {
  baseUrl = '';
  header = '';

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  GetBySchoolId(SchoolId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<TimeTable[]>(
      `${this.baseUrl}/TimeTable/BySchoolId/${SchoolId}`,
      { headers }
    );
  }

  GetByID(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(`${this.baseUrl}/TimeTable/${id}`, { headers });
  }


  GetDutyByDate(id: number,date :string, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(`${this.baseUrl}/TimeTable/${id}/${date}`, { headers });
  }


  GetAllTeachersinThisTimetable(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Employee[]>(
      `${this.baseUrl}/TimeTable/GetAllTeachersinThisTimetable/${id}`,
      { headers }
    );
  }

  GetAllClassesinThisTimetable(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<Classroom[]>(
      `${this.baseUrl}/TimeTable/GetAllClassesinThisTimetable/${id}`,
      { headers }
    );
  }

  GetByIdForClassAsync(Tid: number, ClassId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(
      `${this.baseUrl}/TimeTable/GetByIdForClassAsync/${Tid}/${ClassId}`,
      { headers }
    );
  }

  GetByIdForTeacherAsync(Tid: number, ClassId: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<any>(
      `${this.baseUrl}/TimeTable/GetByIdForTeacherAsync/${Tid}/${ClassId}`,
      { headers }
    );
  }

  Add(TimeTable: TimeTable, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/TimeTable`, TimeTable, {
      headers: headers,
      responseType: 'text' as 'json',
    });
  }

  EditIsFavourite(Id: number, IsFav: boolean, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    console.log(DomainName);
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header) // Correct casing as in your backend
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(
      `${this.baseUrl}/TimeTable?id=${Id}&IsFavourite=${IsFav}`,
      {},
      { headers }
    );
  }

  Edit(timetable: TimeTableReplace[], DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    console.log(DomainName);
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('Domain-Name', this.header) // Correct casing as in your backend
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/TimeTable/Replace`, timetable, {
      headers,
    });
  }

  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem('current_token');
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/TimeTable/${id}`, { headers });
  }
}
