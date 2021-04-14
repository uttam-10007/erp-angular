import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryHoldAndStartComponent } from './salary-hold-and-start.component';

describe('SalaryHoldAndStartComponent', () => {
  let component: SalaryHoldAndStartComponent;
  let fixture: ComponentFixture<SalaryHoldAndStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalaryHoldAndStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryHoldAndStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
