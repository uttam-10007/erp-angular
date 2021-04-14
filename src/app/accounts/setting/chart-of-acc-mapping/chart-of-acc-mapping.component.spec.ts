import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartOfAccMappingComponent } from './chart-of-acc-mapping.component';

describe('ChartOfAccMappingComponent', () => {
  let component: ChartOfAccMappingComponent;
  let fixture: ComponentFixture<ChartOfAccMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartOfAccMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartOfAccMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
