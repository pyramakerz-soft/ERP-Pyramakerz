import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { LoadingOverlayComponent } from './Component/loading-overlay/loading-overlay.component';
import { LoadingService } from './Services/loading.service'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, LoadingOverlayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ERP_System';  

   constructor(private router: Router, private loadingService: LoadingService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show(); // Start loader immediately when navigating
      } 
      else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Wait for active requests (from ngOnInit) to finish
        const interval = setInterval(() => {
          if (!this.loadingService['activeRequests']) {
            this.loadingService.hide();
            clearInterval(interval);
          }
        }, 100); // checks every 100ms
      }
    });
  }
}
