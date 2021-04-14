import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SorSelectionComponent } from './sor-selection.component';

describe('SorSelectionComponent', () => {
  let component: SorSelectionComponent;
  let fixture: ComponentFixture<SorSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SorSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SorSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
