import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductTypeComponent } from './conduct-type.component';

describe('ConductTypeComponent', () => {
  let component: ConductTypeComponent;
  let fixture: ComponentFixture<ConductTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
