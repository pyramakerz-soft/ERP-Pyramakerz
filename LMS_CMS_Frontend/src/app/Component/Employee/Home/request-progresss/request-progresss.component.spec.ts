import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestProgresssComponent } from './request-progresss.component';

describe('RequestProgresssComponent', () => {
  let component: RequestProgresssComponent;
  let fixture: ComponentFixture<RequestProgresssComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestProgresssComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestProgresssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
