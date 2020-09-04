import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveChannelComponent } from './save-channel.component';

describe('SaveChannelComponent', () => {
  let component: SaveChannelComponent;
  let fixture: ComponentFixture<SaveChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
