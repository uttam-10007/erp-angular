import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportedTenderComponent } from './exported-tender.component';

describe('ExportedTenderComponent', () => {
  let component: ExportedTenderComponent;
  let fixture: ComponentFixture<ExportedTenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportedTenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportedTenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
