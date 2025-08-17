import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesTypeComponent } from './issues-type.component';

describe('IssuesTypeComponent', () => {
  let component: IssuesTypeComponent;
  let fixture: ComponentFixture<IssuesTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssuesTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssuesTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
