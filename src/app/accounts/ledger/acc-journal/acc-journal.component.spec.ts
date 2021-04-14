import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccJournalComponent } from './acc-journal.component';

describe('AccJournalComponent', () => {
  let component: AccJournalComponent;
  let fixture: ComponentFixture<AccJournalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccJournalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
