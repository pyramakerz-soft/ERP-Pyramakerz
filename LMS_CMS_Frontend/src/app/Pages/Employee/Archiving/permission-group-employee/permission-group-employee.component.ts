import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-permission-group-employee',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './permission-group-employee.component.html',
  styleUrl: './permission-group-employee.component.css'
})
export class PermissionGroupEmployeeComponent {
  
}
