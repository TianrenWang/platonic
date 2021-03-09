import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwilioMessageComponent } from './twilio-message.component';

describe('MessageComponent', () => {
  let component: TwilioMessageComponent;
  let fixture: ComponentFixture<TwilioMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwilioMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwilioMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
