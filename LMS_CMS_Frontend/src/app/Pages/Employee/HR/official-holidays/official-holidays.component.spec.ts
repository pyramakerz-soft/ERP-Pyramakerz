import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialHolidaysComponent } from './official-holidays.component';

describe('OfficialHolidaysComponent', () => {
  let component: OfficialHolidaysComponent;
  let fixture: ComponentFixture<OfficialHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialHolidaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficialHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
