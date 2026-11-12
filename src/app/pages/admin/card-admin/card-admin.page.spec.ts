import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardAdminPage } from './card-admin.page';

describe('CardAdminPage', () => {
  let component: CardAdminPage;
  let fixture: ComponentFixture<CardAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CardAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
