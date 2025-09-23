import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule , TranslateModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isEditMode: boolean = false;
  @Input() buttonText: string = 'Create';
  @Input() isLoading: boolean = false; // Add this input
  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  onSave() {
    if (!this.isLoading) { // Prevent save when already loading
      this.save.emit();
    }
  }
}