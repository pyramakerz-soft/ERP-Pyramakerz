import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  BaseUrl = 'https://localhost:7205/api/with-domain';
  BaseUrlOcta = 'https://localhost:7205/api';

  // BaseUrl = 'http://localhost:5094/api/with-domain';
  // BaseUrlOcta = 'http://localhost:5094/api';

  // BaseUrl="http://44.210.155.226:5000/api/with-domain"
  // BaseUrlOcta="http://44.210.155.226:5000/api"w

  constructor() {}

  GetHeader() {
    // const hostname = window.location.hostname;
    // var Header = hostname.split('.')[0]
<<<<<<< HEAD
 
    var Header = 'domain'; 
=======

    var Header = 'Domain_One';
>>>>>>> 4ceb7fc6d063171faf0b8656b5a729590bf29419

    return Header;
  }
}
