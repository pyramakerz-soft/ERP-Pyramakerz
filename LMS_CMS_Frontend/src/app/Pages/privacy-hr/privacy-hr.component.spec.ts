import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyHrComponent } from './privacy-hr.component';

describe('PrivacyHrComponent', () => {
  let component: PrivacyHrComponent;
  let fixture: ComponentFixture<PrivacyHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyHrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
