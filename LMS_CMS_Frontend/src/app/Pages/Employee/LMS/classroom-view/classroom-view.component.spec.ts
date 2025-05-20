import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomViewComponent } from './classroom-view.component';

describe('ClassroomViewComponent', () => {
  let component: ClassroomViewComponent;
  let fixture: ComponentFixture<ClassroomViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassroomViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
