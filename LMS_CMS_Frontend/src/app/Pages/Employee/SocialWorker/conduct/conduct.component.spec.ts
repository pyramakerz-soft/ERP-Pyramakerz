import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductComponent } from './conduct.component';

describe('ConductComponent', () => {
  let component: ConductComponent;
  let fixture: ComponentFixture<ConductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
