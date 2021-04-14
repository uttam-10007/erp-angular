import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SorEstimateComponent } from './sor-estimate.component';

describe('SorEstimateComponent', () => {
  let component: SorEstimateComponent;
  let fixture: ComponentFixture<SorEstimateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SorEstimateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SorEstimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
