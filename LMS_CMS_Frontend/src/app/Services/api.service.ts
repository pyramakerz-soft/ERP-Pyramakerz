import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // BaseUrl = 'https://localhost:7205/api/with-domain';
  // BaseUrlOcta = 'https://localhost:7205/api';
  // BaseUrlSignalR = 'https://localhost:7205/';

  // BaseUrl = 'http://localhost:5094/api/with-domain';
  // BaseUrlOcta = 'http://localhost:5094/api'; 
  // BaseUrlSignalR = 'http://localhost:5094/'; 

  BaseUrl="http://52.44.39.94:5000/api/with-domain"
  BaseUrlOcta="http://52.44.39.94:5000/api"
  BaseUrlSignalR="http://52.44.39.94:5000/"

  constructor() {}

  GetHeader() { 
    // const hostname = window.location.hostname; 
    // var Header = hostname.split('.')[0] 
       
    var Header = 'Domain_One';         
    return Header;
  }
}
