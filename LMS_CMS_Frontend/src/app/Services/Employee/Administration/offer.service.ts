import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api.service';
import { Offer } from '../../../Models/Administrator/offer';
 import { OfferAddDto } from'../../../Models/Administrator/offer';
 import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class OfferService {

  baseUrl = "";
  header = "";

  constructor(
    public http: HttpClient,
    public ApiServ: ApiService
  ) {
    this.baseUrl = ApiServ.BaseUrl;
  }

  // ============================
  // GET ALL OFFERS
  // ============================
Get(DomainName: string): Observable<Offer[]> {
  if (DomainName != null) {
    this.header = DomainName;
  }

  const token = localStorage.getItem("current_token");
  const headers = new HttpHeaders()
    .set('domain-name', this.header)
    .set('Authorization', `Bearer ${token}`);

  return this.http.get<Offer[]>(`${this.baseUrl}/Offer`, { headers });
}


  // ============================
  // GET BY ID
  // ============================
  GetById(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);
 return this.http.get<Offer>(`${this.baseUrl}/Offer/${id}`, { headers });
  //  return this.http.get<Offer>(`${this.baseUrl}/with-domain/Offer/${id}`, { headers });
  }

  // ============================
  // ADD OFFER (WITH FILE)
  // ============================
  Add(dto: OfferAddDto, DomainName: string): Observable<any> {

    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");

    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);
      

    const formData = new FormData();
    formData.append('DepartmentID', dto.departmentID.toString());
    formData.append('TitleID', dto.titleID.toString());

    if (dto.uploadedFile) {
      formData.append('UploadedFile', dto.uploadedFile);
    }
   return this.http.post(`${this.baseUrl}/Offer`, formData, { headers });
    // return this.http.post<Offer>(
    //   `${this.baseUrl}/with-domain/Offer`,
    //   formData,
    //   {
    //     headers: headers,
    //     responseType: 'json'
    //   }
    // );
  }

  // ============================
  // EDIT OFFER (WITH FILE)
  // ============================
  Edit(id: number, dto: OfferAddDto, DomainName: string): Observable<Offer> {

    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");

    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('DepartmentID', dto.departmentID.toString());
    formData.append('TitleID', dto.titleID.toString());

    if (dto.uploadedFile) {
      formData.append('UploadedFile', dto.uploadedFile);
    }
   return this.http.put<Offer>(`${this.baseUrl}/Offer/${id}`, formData, { headers });
    // return this.http.put<Offer>(
    //   `${this.baseUrl}/with-domain/Offer/${id}`,
    //   formData,
    //   { headers }
    // );
  }

  // ============================
  // DELETE OFFER
  // ============================
  Delete(id: number, DomainName: string) {

    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");

    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

      return this.http.delete(`${this.baseUrl}/Offer/${id}`, { headers });
    // return this.http.delete(
    //   `${this.baseUrl}/with-domain/Offer/${id}`,
    //   { headers }
    // );
  }
}
