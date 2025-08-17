import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatementsComponent } from './account-statements.component';

describe('AccountStatementsComponent', () => {
  let component: AccountStatementsComponent;
  let fixture: ComponentFixture<AccountStatementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStatementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
