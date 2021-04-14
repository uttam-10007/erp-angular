import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EngRegistrationComponent } from './eng-registration.component';

describe('EngRegistrationComponent', () => {
  let component: EngRegistrationComponent;
  let fixture: ComponentFixture<EngRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EngRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
