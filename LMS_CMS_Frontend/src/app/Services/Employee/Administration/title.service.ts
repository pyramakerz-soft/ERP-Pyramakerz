import { Injectable } from '@angular/core';
import { Title } from '../../../Models/Administrator/title';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';

@Injectable({
  providedIn: 'root'
})
export class TitleService {

  baseUrl = "";
  header = "";

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  // جلب كل العناوين (من جميع الأقسام) - مطابق لـ GET api/with-domain/Title
  Get(DomainName: string): Observable<Title[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Title[]>(`${this.baseUrl}/Title`, { headers });
  }

  // جلب العناوين الخاصة بقسم معين - مطابق لـ GET api/with-domain/Title/ByDepartment/{departmentId}
  GetByDepartmentId(departmentId: number, DomainName: string): Observable<Title[]> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Title[]>(`${this.baseUrl}/Title/ByDepartment/${departmentId}`, { headers });
  }

  GetById(id: number, DomainName: string): Observable<Title> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Title>(`${this.baseUrl}/Title/${id}`, { headers });
  }

Add(title: Title, DomainName: string): Observable<any> {
  if (DomainName != null) {
    this.header = DomainName;
  }
  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');

  return this.http.post<any>(`${this.baseUrl}/Title`, title, {
    headers: headers,
    responseType: 'text' as 'json'
  });
}

Edit(title: Title, DomainName: string): Observable<Title> {
    if (DomainName != null) {
      this.header = DomainName;
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    const dataToSend = {
      id: title.id,
      name: title.name,
      date: new Date().toISOString(), 
      departmentID: title.departmentID
    };

    console.log('Sending to API:', {
      url: `${this.baseUrl}/Title`,
      body: dataToSend
    }
  );

   console.log(' Force today date:', dataToSend);
    
    return this.http.put<Title>(`${this.baseUrl}/Title`, dataToSend, { headers });
}

 Delete(id: number, DomainName: string): Observable<any> {
  const token = localStorage.getItem("current_token");

  const headers = new HttpHeaders()
    .set('domain-name', DomainName) 
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');

  console.log('🧾 Delete headers:', {
    domain: DomainName,
    token: token
  });

  return this.http.delete<any>(`${this.baseUrl}/Title/${id}`, { headers });
}

}