import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductiionMappingComponent } from './deductiion-mapping.component';

describe('DeductiionMappingComponent', () => {
  let component: DeductiionMappingComponent;
  let fixture: ComponentFixture<DeductiionMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeductiionMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeductiionMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
