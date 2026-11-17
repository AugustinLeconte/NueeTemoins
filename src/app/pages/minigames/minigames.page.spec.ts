import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinigamesPage } from './minigames.page';

describe('MinigamesPage', () => {
  let component: MinigamesPage;
  let fixture: ComponentFixture<MinigamesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MinigamesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
