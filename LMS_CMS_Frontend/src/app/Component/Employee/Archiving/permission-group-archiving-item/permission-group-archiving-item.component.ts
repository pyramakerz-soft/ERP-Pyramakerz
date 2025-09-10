import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PermissionGroupDetails } from '../../../../Models/Archiving/permission-group-details';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-permission-group-archiving-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permission-group-archiving-item.component.html',
  styleUrl: './permission-group-archiving-item.component.css'
})
export class PermissionGroupArchivingItemComponent {
  @Input() archivingData: any;
  @Output() Selected: EventEmitter<{ data: PermissionGroupDetails; selected: boolean }> = new EventEmitter<{ data: PermissionGroupDetails; selected: boolean }>();

  toggleChildren(archiving: any) {
    archiving.isOpen = !archiving.isOpen;
  } 

  selectData(archiving: any) {  
    let PGD = new PermissionGroupDetails();
    PGD.archivingTreeID = archiving.id;
    PGD.allow_Delete = archiving.allow_Delete ?? false;
    PGD.allow_Delete_For_Others = archiving.allow_Delete_For_Others ?? false;

    this.Selected.emit({ data: PGD, selected: archiving.selected });
  }
  
  getFileExtension(filename: string): string {
    if (!filename) return '';
    
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    
    return filename.slice(lastDotIndex).toLowerCase();
  }
}
