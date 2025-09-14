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
 
  toggleChildren(archiving: ArchivingTree) {
    archiving.isOpen = !archiving.isOpen;
  }

  selectData(archiving: ArchivingTree, parent?: ArchivingTree) {
  let PGD = new PermissionGroupDetails();
  PGD.archivingTreeID = archiving.id;
  PGD.allow_Delete = archiving.allow_Delete ?? false;
  PGD.allow_Delete_For_Others = archiving.allow_Delete_For_Others ?? false;

  this.Selected.emit({ data: PGD, selected: archiving.selected });

  // propagate parent selection to children
  if (archiving.children && archiving.children.length > 0) {
    this.updateChildrenSelection(archiving, archiving.selected);
    this.updateChildrenPermissions(
      archiving,
      archiving.allow_Delete,
      archiving.allow_Delete_For_Others
    );
  }

  // 🔥 NEW: check if parent should be updated
  if (parent) {
    this.updateParentPermissions(parent);
  }
}
 
private updateParentPermissions(parent: ArchivingTree) {
  if (parent.children && parent.children.length > 0) {
    // Parent is selected if any child is selected
    parent.selected = parent.children.some(ch => ch.selected);

    // Parent allow_Delete is true if ANY child has it
    parent.allow_Delete = parent.children.some(ch => ch.allow_Delete);

    // Parent allow_Delete_For_Others is true if ANY child has it
    parent.allow_Delete_For_Others = parent.children.some(ch => ch.allow_Delete_For_Others);

    // Re-emit parent state
    this.selectData(parent);
  }
}
  private updateChildrenSelection(parent: ArchivingTree, selected: boolean) {
    parent.children.forEach(child => {
      child.selected = selected;
      this.selectData(child);  
    });
  }
 
  private updateChildrenPermissions(parent: ArchivingTree, allowDelete: boolean, allowDeleteOthers: boolean) {
    parent.children.forEach(child => {
      child.allow_Delete = allowDelete;
      child.allow_Delete_For_Others = allowDeleteOthers;
      this.selectData(child); 
    });
  }

  getFileExtension(filename: string): string {
    if (!filename) return '';
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return filename.slice(lastDotIndex).toLowerCase();
  } 
}
