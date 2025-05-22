import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightTypeComponent } from './weight-type.component';

describe('WeightTypeComponent', () => {
  let component: WeightTypeComponent;
  let fixture: ComponentFixture<WeightTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeightTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeightTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
