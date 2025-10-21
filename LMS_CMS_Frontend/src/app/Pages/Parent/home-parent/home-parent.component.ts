import { Component } from '@angular/core'; 
import { TokenData } from '../../../Models/token-data';
import { AccountService } from '../../../Services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-parent',
  standalone: true,
  imports: [],
  templateUrl: './home-parent.component.html',
  styleUrl: './home-parent.component.css'
})
export class HomeParentComponent {
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")
  greeting: string = '';

  constructor(public accountService: AccountService, private router: Router){}
  
  ngOnInit() { 
    this.User_Data_After_Login = this.accountService.Get_Data_Form_Token();
    this.setGreeting();
  }

  setGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      this.greeting = 'Good Morning';
    } else if (currentHour < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

  NavigateeToPage(route: string) {
    this.router.navigateByUrl(`Parent/${route}`)
  }
}
