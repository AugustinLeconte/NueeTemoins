import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialOverlayComponent } from './tutorial-overlay.component';

describe('TutorialOverlayComponent', () => {
  let component: TutorialOverlayComponent;
  let fixture: ComponentFixture<TutorialOverlayComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorialOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
