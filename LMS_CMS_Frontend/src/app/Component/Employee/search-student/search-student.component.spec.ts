import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchStudentComponent } from './search-student.component';

describe('SearchStudentComponent', () => {
  let component: SearchStudentComponent;
  let fixture: ComponentFixture<SearchStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
