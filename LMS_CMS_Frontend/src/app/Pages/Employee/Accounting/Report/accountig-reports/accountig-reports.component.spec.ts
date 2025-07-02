import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountigReportsComponent } from './accountig-reports.component';

describe('AccountigReportsComponent', () => {
  let component: AccountigReportsComponent;
  let fixture: ComponentFixture<AccountigReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountigReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountigReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
