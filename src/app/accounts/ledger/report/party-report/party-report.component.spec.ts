import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyReportComponent } from './party-report.component';

describe('PartyReportComponent', () => {
  let component: PartyReportComponent;
  let fixture: ComponentFixture<PartyReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
