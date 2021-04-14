import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationCategoryComponent } from './application-category.component';

describe('ApplicationCategoryComponent', () => {
  let component: ApplicationCategoryComponent;
  let fixture: ComponentFixture<ApplicationCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
