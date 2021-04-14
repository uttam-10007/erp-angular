import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportedTenderComponent } from './imported-tender.component';

describe('ImportedTenderComponent', () => {
  let component: ImportedTenderComponent;
  let fixture: ComponentFixture<ImportedTenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportedTenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportedTenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
