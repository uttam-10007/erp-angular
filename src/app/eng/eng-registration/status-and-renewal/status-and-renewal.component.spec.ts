import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusAndRenewalComponent } from './status-and-renewal.component';

describe('StatusAndRenewalComponent', () => {
  let component: StatusAndRenewalComponent;
  let fixture: ComponentFixture<StatusAndRenewalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusAndRenewalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusAndRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
