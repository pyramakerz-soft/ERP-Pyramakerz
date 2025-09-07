import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ArchivingTree } from '../../../../Models/Archiving/archiving-tree';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-archiving-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './archiving-item.component.html',
  styleUrl: './archiving-item.component.css'
})
export class ArchivingItemComponent {
  @Input() archivingData: any;
  @Output() Selected: EventEmitter<number> = new EventEmitter<number>();
  
  toggleChildren(archiving: any) {
    archiving.isOpen = !archiving.isOpen;
  }

  getData(archiving: ArchivingTree){
    if(archiving.id)
    this.Selected.emit(archiving.id);
  }
}
