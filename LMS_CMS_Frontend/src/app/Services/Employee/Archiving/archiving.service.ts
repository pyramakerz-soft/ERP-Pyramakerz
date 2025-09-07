import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { ArchivingTree } from '../../../Models/Archiving/archiving-tree';

@Injectable({
  providedIn: 'root'
})
export class ArchivingService {
  baseUrl = ""
  header = ""

  constructor(public http: HttpClient, public ApiServ: ApiService) {
    this.baseUrl = ApiServ.BaseUrl
  } 

  Get(DomainName:string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
      return this.http.get<ArchivingTree[]>(`${this.baseUrl}/ArchivingTree`, { headers });
  }

  GetById(id:number ,DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.get<ArchivingTree>(`${this.baseUrl}/ArchivingTree/${id}`, { headers })
  } 

  Add(archivingTree: ArchivingTree, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName;
    }

    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`);

    const formData = new FormData(); ;  
    formData.append('name', archivingTree.name ?? '');   
    formData.append('archivingTreeParentID', archivingTree.archivingTreeParentID.toString() ?? '');   
  
    if (archivingTree.fileFile) {
      formData.append('fileFile', archivingTree.fileFile, archivingTree.fileFile.name);
    }

    return this.http.post(`${this.baseUrl}/ArchivingTree`, formData, { headers });
  } 
 
  Delete(id: number, DomainName: string) {
    if (DomainName != null) {
      this.header = DomainName
    }
    const token = localStorage.getItem("current_token");
    const headers = new HttpHeaders()
      .set('domain-name', this.header)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.delete(`${this.baseUrl}/ArchivingTree/${id}`, { headers })
  } 
}
