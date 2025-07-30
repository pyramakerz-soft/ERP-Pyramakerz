import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllStoreBalanceComponent } from './all-store-balance.component';

describe('AllStoreBalanceComponent', () => {
  let component: AllStoreBalanceComponent;
  let fixture: ComponentFixture<AllStoreBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllStoreBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllStoreBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
