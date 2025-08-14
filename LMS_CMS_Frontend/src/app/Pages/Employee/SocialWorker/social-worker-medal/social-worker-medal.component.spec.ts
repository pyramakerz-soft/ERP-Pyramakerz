import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialWorkerMedalComponent } from './social-worker-medal.component';

describe('SocialWorkerMedalComponent', () => {
  let component: SocialWorkerMedalComponent;
  let fixture: ComponentFixture<SocialWorkerMedalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialWorkerMedalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialWorkerMedalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
