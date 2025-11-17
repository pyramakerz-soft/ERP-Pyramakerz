import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductAddEditComponent } from './conduct-add-edit.component';

describe('ConductAddEditComponent', () => {
  let component: ConductAddEditComponent;
  let fixture: ComponentFixture<ConductAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
