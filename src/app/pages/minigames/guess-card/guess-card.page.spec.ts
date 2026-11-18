import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuessCardPage } from './guess-card.page';

describe('GuessCardPage', () => {
  let component: GuessCardPage;
  let fixture: ComponentFixture<GuessCardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GuessCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
