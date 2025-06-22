import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportItemCardComponent } from './report-item-card.component';

describe('ReportItemCardComponent', () => {
  let component: ReportItemCardComponent;
  let fixture: ComponentFixture<ReportItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportItemCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
