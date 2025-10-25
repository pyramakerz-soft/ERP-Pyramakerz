import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryRankingComponent } from './category-ranking.component';

describe('CategoryRankingComponent', () => {
  let component: CategoryRankingComponent;
  let fixture: ComponentFixture<CategoryRankingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryRankingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryRankingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
