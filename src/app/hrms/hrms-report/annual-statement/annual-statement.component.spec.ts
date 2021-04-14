import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualStatementComponent } from './annual-statement.component';

describe('AnnualStatementComponent', () => {
  let component: AnnualStatementComponent;
  let fixture: ComponentFixture<AnnualStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
