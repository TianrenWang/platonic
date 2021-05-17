import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogueBannerComponent } from './dialogue-banner.component';

describe('DialogueBannerComponent', () => {
  let component: DialogueBannerComponent;
  let fixture: ComponentFixture<DialogueBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogueBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogueBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
