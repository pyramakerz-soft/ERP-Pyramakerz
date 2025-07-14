import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountigConfigurationComponent } from './accountig-configuration.component';

describe('AccountigConfigurationComponent', () => {
  let component: AccountigConfigurationComponent;
  let fixture: ComponentFixture<AccountigConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountigConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountigConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
