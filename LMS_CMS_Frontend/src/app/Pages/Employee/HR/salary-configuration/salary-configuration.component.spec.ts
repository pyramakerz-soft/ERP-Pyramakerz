import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryConfigurationComponent } from './salary-configuration.component';

describe('SalaryConfigurationComponent', () => {
  let component: SalaryConfigurationComponent;
  let fixture: ComponentFixture<SalaryConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
