import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMessagesComponent } from './my-messages.component';

describe('MyMessagesComponent', () => {
  let component: MyMessagesComponent;
  let fixture: ComponentFixture<MyMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
