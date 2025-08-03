import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IterativeNotificcationService } from './Services/shared/iterative-notificcation.service';
import { ApiService } from './Services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ERP_System';
  DomainName = ''  
  
  constructor(private iterativeNotificcationService: IterativeNotificcationService, private ApiServ: ApiService) {}

  ngOnInit() { 
    this.DomainName = this.ApiServ.GetHeader(); 

    this.iterativeNotificcationService.startInterval(this.DomainName);
  }

  ngOnDestroy() { 
    this.iterativeNotificcationService.stopInterval();
  } 
}
