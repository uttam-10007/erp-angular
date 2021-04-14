import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdHierComponent } from './prod-hier.component';

describe('ProdHierComponent', () => {
  let component: ProdHierComponent;
  let fixture: ComponentFixture<ProdHierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProdHierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdHierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
