import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectMarkComponent } from './direct-mark.component';

describe('DirectMarkComponent', () => {
  let component: DirectMarkComponent;
  let fixture: ComponentFixture<DirectMarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectMarkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
