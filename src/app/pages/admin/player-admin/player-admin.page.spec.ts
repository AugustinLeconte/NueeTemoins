import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerAdminPage } from './player-admin.page';

describe('PlayerAdminPage', () => {
  let component: PlayerAdminPage;
  let fixture: ComponentFixture<PlayerAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
