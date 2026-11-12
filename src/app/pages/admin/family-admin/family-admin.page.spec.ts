import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FamilyAdminPage } from './family-admin.page';

describe('FamilyAdminPage', () => {
  let component: FamilyAdminPage;
  let fixture: ComponentFixture<FamilyAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
