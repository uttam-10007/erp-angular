import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionApplicationComponent } from './auction-application.component';

describe('AuctionApplicationComponent', () => {
  let component: AuctionApplicationComponent;
  let fixture: ComponentFixture<AuctionApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuctionApplicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuctionApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
