import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveDialogueComponent } from './save-dialogue.component';

describe('SaveDialogueComponent', () => {
  let component: SaveDialogueComponent;
  let fixture: ComponentFixture<SaveDialogueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
