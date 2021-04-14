import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPensionContributionComponent } from './setting-pension-contribution.component';

describe('SettingPensionContributionComponent', () => {
  let component: SettingPensionContributionComponent;
  let fixture: ComponentFixture<SettingPensionContributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingPensionContributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingPensionContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
