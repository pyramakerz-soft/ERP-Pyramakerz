
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common'; 
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
@Component({
  selector: 'app-table',
  imports: [CommonModule , DatePipe , TranslateModule],
  standalone: true,
  templateUrl: './reuse-table.component.html',
  styleUrls: ['./reuse-table.component.css']
})
export class TableComponent {

  @Input() headers: string[] = []; 
  @Input() data: any[] = []; 
  @Input() keys: string[] = []; 
  @Input() showViewAction: boolean = false; 
  @Input() showEditAction: boolean = true; 

  @Output() delete = new EventEmitter<any>(); 
  @Output() edit = new EventEmitter<any>(); 
  @Output() view = new EventEmitter<any>(); 
  
  isRtl: boolean = false;
  subscription!: Subscription; 


    constructor(
      private languageService: LanguageService
    ) {}



  
  ngOnInit() {

      this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';
  }  
  
  onDelete(row: any) {
    this.delete.emit(row);
  }

  
  onEdit(row: any) {
    this.edit.emit(row);
  }

  
  onView(row: any) {
    this.view.emit(row);
  }
}