import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccRuleComponent } from './acc-rule.component';

describe('AccRuleComponent', () => {
  let component: AccRuleComponent;
  let fixture: ComponentFixture<AccRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
