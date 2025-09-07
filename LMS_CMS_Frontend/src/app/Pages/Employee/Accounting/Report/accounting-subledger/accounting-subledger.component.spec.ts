import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingSubledgerComponent } from './accounting-subledger.component';

describe('AccountingSubledgerComponent', () => {
  let component: AccountingSubledgerComponent;
  let fixture: ComponentFixture<AccountingSubledgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingSubledgerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountingSubledgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
