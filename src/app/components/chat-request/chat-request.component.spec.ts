import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRequestComponent } from './chat-request.component';

describe('ChatRequestComponent', () => {
  let component: ChatRequestComponent;
  let fixture: ComponentFixture<ChatRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
