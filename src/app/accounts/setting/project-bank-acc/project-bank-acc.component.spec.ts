import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBankAccComponent } from './project-bank-acc.component';

describe('ProjectBankAccComponent', () => {
  let component: ProjectBankAccComponent;
  let fixture: ComponentFixture<ProjectBankAccComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectBankAccComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBankAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// /accounts/projectBank/getProjectBankAccounts // get
// createProjectBankAccounts //b_acct_id,
// Kunal Bharti17:19
// /accounts/projectBank/getProjectBankAccounts
// createProjectBankAccounts
// updateProjectBankAccounts
// deleteProjectBankAccounts
// Kunal Bharti17:33
// bank_acct_desc
// bank_acct_no
// Kunal Bharti17:49
// /accounts/projectBank/createProjectBankAccounts

// ------------update
// b_acct_id
