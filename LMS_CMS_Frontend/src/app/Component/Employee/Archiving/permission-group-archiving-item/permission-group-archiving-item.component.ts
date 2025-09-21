import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PermissionGroupDetails } from '../../../../Models/Archiving/permission-group-details';
import { FormsModule } from '@angular/forms';
import { ArchivingTree } from '../../../../Models/Archiving/archiving-tree';

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
  @Input() permissionGroupID: number = 0;

  toggleChildren(archiving: ArchivingTree) {
    archiving.isOpen = !archiving.isOpen;
  }
 
  selectData(archiving: ArchivingTree, type: 'selected' | 'allowDelete' | 'allowDeleteForOthers' = 'selected') {
    if (type === 'selected' && archiving.selected) {
      archiving.allow_Delete = true;
      archiving.allow_Delete_For_Others = true;
    }

    // 🔽 helper function to emit event
    const emitSelection = (node: ArchivingTree) => {
      const selectedPermission: PermissionGroupDetails = {
        id: 0,
        permissionGroupID: this.permissionGroupID,
        archivingTreeID: node.id,
        allow_Delete: node.allow_Delete,
        allow_Delete_For_Others: node.allow_Delete_For_Others,
        archivingTreeDetails: []
      };
      this.Selected.emit({ data: selectedPermission, selected: node.selected });
    };
 
    emitSelection(archiving);

    // 🔽 cascade to children
    if (archiving.children && archiving.children.length > 0) {
      archiving.children.forEach(child => {
        if (archiving.selected) {  
          if ((type === 'allowDelete' && archiving.allow_Delete) || (type === 'allowDeleteForOthers' && archiving.allow_Delete_For_Others) || type === 'selected') {
            child.selected = true;
          }
            
          if(archiving.allow_Delete){
            child.allow_Delete = archiving.allow_Delete;
          }
          if(archiving.allow_Delete_For_Others){
            child.allow_Delete_For_Others = archiving.allow_Delete_For_Others;
          }

          if(child.selected){
            this.selectData(child, type);  
          }
        } else {
          child.selected = false;
          child.allow_Delete = false;
          child.allow_Delete_For_Others = false;
          this.selectData(child, type);  
        }
      });
    }
 
    let current = archiving.parent;
    while (current) { 
      if (archiving.selected) {
        current.selected = true;
      }
 
      if (type === 'allowDelete' && !archiving.allow_Delete) {
        current.allow_Delete = false;
      }
 
      if (type === 'allowDeleteForOthers' && !archiving.allow_Delete_For_Others) {
        current.allow_Delete_For_Others = false;
      }

      emitSelection(current);
      current = current.parent;
    }
  }
 
  getFileExtension(filename: string): string {
    if (!filename) return '';
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return filename.slice(lastDotIndex).toLowerCase();
  }
}
