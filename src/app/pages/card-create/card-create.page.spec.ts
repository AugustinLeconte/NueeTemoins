import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardCreatePage } from './card-create.page';

describe('CardCreatePage', () => {
  let component: CardCreatePage;
  let fixture: ComponentFixture<CardCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CardCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
