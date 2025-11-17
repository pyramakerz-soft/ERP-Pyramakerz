import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivingItemComponent } from './archiving-item.component';

describe('ArchivingItemComponent', () => {
  let component: ArchivingItemComponent;
  let fixture: ComponentFixture<ArchivingItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivingItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchivingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
