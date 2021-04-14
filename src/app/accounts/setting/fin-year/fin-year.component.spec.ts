import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinYearComponent } from './fin-year.component';

describe('FinYearComponent', () => {
  let component: FinYearComponent;
  let fixture: ComponentFixture<FinYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
