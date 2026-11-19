import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaintBannerComponent } from './saint-banner.component';

describe('SaintBannerComponent', () => {
  let component: SaintBannerComponent;
  let fixture: ComponentFixture<SaintBannerComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SaintBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
