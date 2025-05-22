import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZatcaDevicesComponent } from './zatca-devices.component';

describe('ZatcaDevicesComponent', () => {
  let component: ZatcaDevicesComponent;
  let fixture: ComponentFixture<ZatcaDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZatcaDevicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZatcaDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
