import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinigameResultComponent } from './minigame-result.component';

describe('MinigameResultComponent', () => {
  let component: MinigameResultComponent;
  let fixture: ComponentFixture<MinigameResultComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MinigameResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
