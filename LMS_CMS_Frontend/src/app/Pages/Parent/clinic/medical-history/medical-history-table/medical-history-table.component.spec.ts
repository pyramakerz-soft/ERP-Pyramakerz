import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryTableComponent } from './medical-history-table.component';

describe('MedicalHistoryTableComponent', () => {
  let component: MedicalHistoryTableComponent;
  let fixture: ComponentFixture<MedicalHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalHistoryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
