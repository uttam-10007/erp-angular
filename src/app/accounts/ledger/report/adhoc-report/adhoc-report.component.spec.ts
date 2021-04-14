import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhocReportComponent } from './adhoc-report.component';

describe('AdhocReportComponent', () => {
  let component: AdhocReportComponent;
  let fixture: ComponentFixture<AdhocReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdhocReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdhocReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
