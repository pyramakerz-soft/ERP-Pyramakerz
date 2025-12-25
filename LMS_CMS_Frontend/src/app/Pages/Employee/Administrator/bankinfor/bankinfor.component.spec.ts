import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankinforComponent } from './bankinfor.component';

describe('BankinforComponent', () => {
  let component: BankinforComponent;
  let fixture: ComponentFixture<BankinforComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankinforComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankinforComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
