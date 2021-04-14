import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjHierComponent } from './proj-hier.component';

describe('ProjHierComponent', () => {
  let component: ProjHierComponent;
  let fixture: ComponentFixture<ProjHierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjHierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjHierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
