import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudHierComponent } from './bud-hier.component';

describe('BudHierComponent', () => {
  let component: BudHierComponent;
  let fixture: ComponentFixture<BudHierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudHierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudHierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
