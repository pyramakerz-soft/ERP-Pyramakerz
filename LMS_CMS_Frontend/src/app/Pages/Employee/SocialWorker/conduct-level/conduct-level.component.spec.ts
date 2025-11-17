import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductLevelComponent } from './conduct-level.component';

describe('ConductLevelComponent', () => {
  let component: ConductLevelComponent;
  let fixture: ComponentFixture<ConductLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConductLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
