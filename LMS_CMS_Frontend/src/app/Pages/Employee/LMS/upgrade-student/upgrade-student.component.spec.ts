import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeStudentComponent } from './upgrade-student.component';

describe('UpgradeStudentComponent', () => {
  let component: UpgradeStudentComponent;
  let fixture: ComponentFixture<UpgradeStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradeStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
