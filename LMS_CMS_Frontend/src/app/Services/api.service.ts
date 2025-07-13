import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  BaseUrl = 'https://localhost:7205/api/with-domain';
  BaseUrlOcta = 'https://localhost:7205/api';

  // BaseUrl = 'http://localhost:5094/api/with-domain';
  // BaseUrlOcta = 'http://localhost:5094/api';

  //   BaseUrl = 'http://localhost:44322/api/with-domain';
  // BaseUrlOcta = 'http://localhost:44322/api';

  // BaseUrl="http://44.210.155.226:5000/api/with-domain"
  // BaseUrlOcta="http://44.210.155.226:5000/api"w

  constructor() {}

  GetHeader() {
<<<<<<< HEAD

    // const hostname = window.location.hostname;
    // var Header = hostname.split('.')[0]
 
    var Header = 'try'; 
// =======
//     // const hostname = window.location.hostname; 
//     // var Header = hostname.split('.')[0] 
//     var Header = 'Domain_One'; 
// >>>>>>> 154221f61f99031fc1785d16cddd9012135f6ad6

=======
    // const hostname = window.location.hostname;
    // var Header = hostname.split('.')[0]
    var Header = 'Domain_One'; 
>>>>>>> 0fd87838238d45e38ec9a53da11d3370045430d9
    return Header;
  }
}

