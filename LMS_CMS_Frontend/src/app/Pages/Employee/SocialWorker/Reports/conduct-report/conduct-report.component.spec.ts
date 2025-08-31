import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductReportComponent } from './conduct-report.component';

describe('ConductReportComponent', () => {
  let component: ConductReportComponent;
  let fixture: ComponentFixture<ConductReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
