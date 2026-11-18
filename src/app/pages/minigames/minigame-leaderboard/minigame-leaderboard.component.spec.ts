import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinigameLeaderboardComponent } from './minigame-leaderboard.component';

describe('MinigameLeaderboardComponent', () => {
  let component: MinigameLeaderboardComponent;
  let fixture: ComponentFixture<MinigameLeaderboardComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MinigameLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
