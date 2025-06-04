import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolTaxInfoComponent } from './school-tax-info.component';

describe('SchoolTaxInfoComponent', () => {
  let component: SchoolTaxInfoComponent;
  let fixture: ComponentFixture<SchoolTaxInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolTaxInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolTaxInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
