import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TdsGstReportComponent } from './tds-gst-report.component';

describe('TdsGstReportComponent', () => {
  let component: TdsGstReportComponent;
  let fixture: ComponentFixture<TdsGstReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TdsGstReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TdsGstReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
