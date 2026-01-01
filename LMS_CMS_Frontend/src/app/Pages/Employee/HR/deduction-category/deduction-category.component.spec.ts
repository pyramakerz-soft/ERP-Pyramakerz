import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductionCategoryComponent } from './deduction-category.component';

describe('DeductionCategoryComponent', () => {
  let component: DeductionCategoryComponent;
  let fixture: ComponentFixture<DeductionCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeductionCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeductionCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
