import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialWorkerMedalStudentComponent } from './social-worker-medal-student.component';

describe('SocialWorkerMedalStudentComponent', () => {
  let component: SocialWorkerMedalStudentComponent;
  let fixture: ComponentFixture<SocialWorkerMedalStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialWorkerMedalStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialWorkerMedalStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
