import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  BaseUrl = 'https://localhost:7205/api/with-domain';
  BaseUrlOcta = 'https://localhost:7205/api';
  BaseUrlSignalR = 'https://localhost:7205/';

  // BaseUrl = 'http://localhost:5094/api/with-domain';
  // BaseUrlOcta = 'http://localhost:5094/api';
  // BaseUrlSignalR = 'http://localhost:5094/'; 

  // BaseUrl="http://44.210.155.226:5000/api/with-domain"
  // BaseUrlOcta="http://44.210.155.226:5000/api"
  // BaseUrlSignalR="http://44.210.155.226:5000/"

  constructor() {}

  GetHeader() { 
    // const hostname = window.location.hostname; 
    // var Header = hostname.split('.')[0] 
      
<<<<<<< HEAD
    var Header = 'domain';      
=======
    var Header = 'ss_two';       
>>>>>>> 380b98e92a51df4c34cfca8019b8bff97f8f14ac
 
    return Header;
  }
}
