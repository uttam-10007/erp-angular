import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { LedgerService } from '../../../service/ledger.service';
import { MainService } from '../../../service/main.service';
import {SettingService} from '../../../service/setting.service';
import {ChartOfAccountService} from '../../../service/chart-of-account.service';
import Swal from 'sweetalert2';
declare var $: any

@Component({
  selector: 'app-party-report',
  templateUrl: './party-report.component.html',
  styleUrls: ['./party-report.component.css']
})
export class PartyReportComponent implements OnInit {

  constructor(private chart_of_account_service: ChartOfAccountService,private settingService: SettingService,public mainService: MainService, private ledgerService: LedgerService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  obj = {};
  allParty=[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

 




  
  allAccountInfo=[]
  total={db:0,cr:0}
  data=[];
  dataToShow=[]
  net;
  netBal=0;
  selectedParty={};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllParties();
    await this.getAllAccountInfo()
  }
  changeParty(){
    for(var i=0;i<this.allParty.length;i++){
      if(this.allParty[i]['party_id'] == this.obj['party_id']){
        this.selectedParty = this.allParty[i];
      }
    }
  }
  async getAllParties() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getPartyInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allParty = resp.data;
     
      this.spinner.hide();

    } else {
      this.spinner.hide();
      
      Swal.fire("Error", "...Error while getting  all party list!",'error');

    }
  }
  async getAllAccountInfo() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.chart_of_account_service.getchartofaccount(obj);
    if (resp['error'] == false) {
      this.allAccountInfo = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      Swal.fire("Error","Error while Getting Ledger Account",'error')
    }
  }
 
  async getJournalDetail(){
    this.total={db:0,cr:0}

    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getPartyListing(JSON.stringify(this.obj));
    if(resp['error'] == false){
      this.data = resp['data'];
      var obj={};
      for(var i=0;i<this.data.length;i++){
        // if(obj[this.data[i]['party_id']] == undefined){

        // }
        if(this.data[i]['debit_credit_ind']=='DB'){
          this.total.db += this.data[i]['amount'];
        }else{
          this.total.cr += this.data[i]['amount'];
        }
      }
      if(this.total.db>=this.total.cr){
        this.net = 'DEBIT';
        this.netBal = this.total.db - this.total.cr;
      }else{
        this.net = 'CREDIT';
        this.netBal = this.total.cr - this.total.db;
      }

    }else{

    }
  }
  print() {
    let printContents, popupWin;
    printContents = document.getElementById('p').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        </head>
        <style>
        #tbl {
          font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
          max-width: 2480px;
      }
      
      #tbl td,
      #tbl th {
          border: 1px solid #ddd;
          padding: 8px;
          width: auto;
          overflow: hidden;
          word-wrap: break-word;
      }
      
      #tbl tr:nth-child(even) {
          background-color: #f2f2f2;
      }
      
      #tbl tr:hover {
          background-color: #ddd;
      }
      
      #tbl th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: rgb(63, 24, 233);
          color: white;
      }
      
    
    table {
        width: 100%;
    }
    
    
        </style>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();


  }


}
