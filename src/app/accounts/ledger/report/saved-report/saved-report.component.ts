import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { LedgerService } from '../../../service/ledger.service';
import { MainService } from '../../../service/main.service';

declare var $: any

@Component({
  selector: 'app-saved-report',
  templateUrl: './saved-report.component.html',
  styleUrls: ['./saved-report.component.css']
})
export class SavedReportComponent implements OnInit {

  constructor(public mainService:MainService,private ledgerService: LedgerService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;

  obj = {};
  
  AllPartyObj = {};
  allParty = [];
  allAccountInfo = [];
  AllAccountObj = {};


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
journalFields=[{tech_name:'jrnl_detail_line_id',bus_name:'Journal Detail Line ID'},{tech_name:'jrnl_line_id',bus_name:'Journal Line ID'},
{tech_name:'jrnl_desc',bus_name:'Journal Description'},{tech_name:'fin_year',bus_name:'Financeal Year'}
,{tech_name:'debit_credit_ind',bus_name:'Debit Credit Indicater'},{tech_name:'acct_num',bus_name:'Account Number'}
,{tech_name:'party_id',bus_name:'Party Name'},{tech_name:'event_code',bus_name:'Account Head'}
,{tech_name:'accounting_dt',bus_name:'Accounting Date'},{tech_name:'processing_dt',bus_name:'Processing Date'}
];
  displayedColumns = ['jrnl_line_id','jrnl_detail_line_id','jrnl_desc','fin_year','party_id','amount'];

  datasource;
  allChartOfAccount = [];

  allFinYear=[];

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllParty();
    await this.getallChartOfAccount();
    await this.getAllFinYear();
  }

 async getAllFinYear(){
  var obj = new Object();
  obj['b_acct_id'] = this.b_acct_id;
  var resp = await this.ledgerService.getAllFinYear(JSON.stringify(obj));
  if (resp['error'] == false) {
    this.allFinYear = resp.data;
  } else {
    this.snackBar.open("Error while getting  all fin year list", 'Error', {
      duration: 5000
    });
  }
  }

  async getallChartOfAccount() {
    this.spinner.show()
    this.allChartOfAccount = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getchartofaccount(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allChartOfAccount = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all chart of account info", 'Error', {
        duration: 5000
      });
    }
  }

  async getAllParty() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getPartyInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allParty = resp.data;
      for (let i = 0; i < this.allParty.length; i++) {
        this.AllPartyObj[this.allParty[i]['party_id']] = this.allParty[i].party_legal_name;
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all party list", 'Error', {
        duration: 5000
      });
    }
  }


  refresh() {
    this.obj = {};
  }

  async submit() {
    this.spinner.show();
    this.obj['b_acct_id'] = this.b_acct_id;
    this.obj['fields']= ['jrnl_line_id','jrnl_detail_line_id','jrnl_desc','fin_year','party_id'];
    var resp = await this.ledgerService.getJournalDetail(JSON.stringify(this.obj));
    if (resp['error'] == false) {
     /*  this.displayedColumns=[];
      this.displayedColumns=this.obj['fields'];
      this.displayedColumns.push('amount'); */
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
      this.snackBar.open("Get Successfully!", 'Success', {
        duration: 5000
      }); 
    }
    else {
      this.spinner.hide();
      this.snackBar.open("Error while getting Journal", 'Error', {
        duration: 5000
      });
      return;
    }
  }



  /* async delete(element) {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['jrnl_line_id'] = element.jrnl_line_id;
    var resp = await this.ledgerService.deleteJournal(JSON.stringify(obj1));
    if (resp['error'] == false) {
      await this.getAllUnPostedJournalInfo();
      this.spinner.hide();
      this.snackBar.open("Journal Delete Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while delete Journal ", 'Error', {
        duration: 5000
      });
    }
  } */

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}
