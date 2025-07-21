import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyComponent } from './duty.component';

describe('DutyComponent', () => {
  let component: DutyComponent;
  let fixture: ComponentFixture<DutyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
