import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatronPickerComponent } from './patron-picker.component';

describe('PatronPickerComponent', () => {
  let component: PatronPickerComponent;
  let fixture: ComponentFixture<PatronPickerComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PatronPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
