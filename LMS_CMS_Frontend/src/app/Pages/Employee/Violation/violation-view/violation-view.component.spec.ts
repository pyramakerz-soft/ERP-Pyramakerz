import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationViewComponent } from './violation-view.component';

describe('ViolationViewComponent', () => {
  let component: ViolationViewComponent;
  let fixture: ComponentFixture<ViolationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViolationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViolationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
