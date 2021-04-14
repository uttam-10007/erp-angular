import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualIncrementComponent } from './annual-increment.component';

describe('AnnualIncrementComponent', () => {
  let component: AnnualIncrementComponent;
  let fixture: ComponentFixture<AnnualIncrementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualIncrementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualIncrementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
