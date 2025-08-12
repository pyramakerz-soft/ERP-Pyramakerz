import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierStatementComponent } from './supplier-statement.component';

describe('SupplierStatementComponent', () => {
  let component: SupplierStatementComponent;
  let fixture: ComponentFixture<SupplierStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierStatementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
