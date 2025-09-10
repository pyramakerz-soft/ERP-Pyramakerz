import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingStatementReportComponent } from './accounting-statement-report.component';

describe('AccountingStatementReportComponent', () => {
  let component: AccountingStatementReportComponent;
  let fixture: ComponentFixture<AccountingStatementReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountingStatementReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountingStatementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
