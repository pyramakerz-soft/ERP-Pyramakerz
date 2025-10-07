import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansStatusComponent } from './loans-status.component';

describe('LoansStatusComponent', () => {
  let component: LoansStatusComponent;
  let fixture: ComponentFixture<LoansStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoansStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoansStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
