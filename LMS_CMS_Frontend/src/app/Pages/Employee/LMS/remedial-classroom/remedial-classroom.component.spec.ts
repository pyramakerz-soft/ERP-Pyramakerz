import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemedialClassroomComponent } from './remedial-classroom.component';

describe('RemedialClassroomComponent', () => {
  let component: RemedialClassroomComponent;
  let fixture: ComponentFixture<RemedialClassroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemedialClassroomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemedialClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
