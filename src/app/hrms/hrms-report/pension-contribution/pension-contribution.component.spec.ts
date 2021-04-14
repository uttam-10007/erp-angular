import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionContributionComponent } from './pension-contribution.component';

describe('PensionContributionComponent', () => {
  let component: PensionContributionComponent;
  let fixture: ComponentFixture<PensionContributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PensionContributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PensionContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
