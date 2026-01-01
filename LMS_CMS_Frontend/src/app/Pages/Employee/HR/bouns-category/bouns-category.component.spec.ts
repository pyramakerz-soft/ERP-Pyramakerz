import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BounsCategoryComponent } from './bouns-category.component';

describe('BounsCategoryComponent', () => {
  let component: BounsCategoryComponent;
  let fixture: ComponentFixture<BounsCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BounsCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BounsCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
