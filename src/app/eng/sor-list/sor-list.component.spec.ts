import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SorListComponent } from './sor-list.component';

describe('SorListComponent', () => {
  let component: SorListComponent;
  let fixture: ComponentFixture<SorListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SorListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
