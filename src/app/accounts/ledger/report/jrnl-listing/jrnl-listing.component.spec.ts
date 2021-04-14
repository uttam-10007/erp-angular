import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JrnlListingComponent } from './jrnl-listing.component';

describe('JrnlListingComponent', () => {
  let component: JrnlListingComponent;
  let fixture: ComponentFixture<JrnlListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JrnlListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JrnlListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
