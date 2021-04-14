import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrListingComponent } from './arr-listing.component';

describe('ArrListingComponent', () => {
  let component: ArrListingComponent;
  let fixture: ComponentFixture<ArrListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArrListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArrListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
