import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRecordPage } from './add-record.page';

describe('AddRecordPage', () => {
  let component: AddRecordPage;
  let fixture: ComponentFixture<AddRecordPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
