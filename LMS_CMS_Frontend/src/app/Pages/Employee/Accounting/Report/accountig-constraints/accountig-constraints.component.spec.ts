import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountigConstraintsComponent } from './accountig-constraints.component';

describe('AccountigConstraintsComponent', () => {
  let component: AccountigConstraintsComponent;
  let fixture: ComponentFixture<AccountigConstraintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountigConstraintsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountigConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
