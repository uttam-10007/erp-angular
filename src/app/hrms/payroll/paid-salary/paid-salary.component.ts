import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { MainService } from '../../service/main.service';
declare var $ : any;
@Component({
  selector: 'app-paid-salary',
  templateUrl: './paid-salary.component.html',
  styleUrls: ['./paid-salary.component.css']
})
export class PaidSalaryComponent implements OnInit {

  
  constructor(public mainService: MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  erpUser;
  b_acct_id;

  year;
  month;
  printObj=[]
  billTotal=0;
  accrual_flag=0;
  billDate="";
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['party_id', 'party_name', 'total_paid_salary', 'year', 'month', 'pay_status_code', 'bank_name', 'bank_account_number','bank_ifsc_code'];
  datasource;
  monthObj={'1': 'January','2': 'February','3':'March','4': 'April','5': 'May','6':'June','7':'July','8':'August','9':'September','10':'October','11':'November','12':'December'}
 
 
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
  }

  async getSalary() {
    var obj = new Object();
    obj['year'] = this.year;
    obj['month'] = this.month;
    obj['b_acct_id']=this.b_acct_id;
    this.billTotal =0;
    this.spinner.show();

    var resp = await this.payableService.getAllPaidSalary(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.printObj = resp.data;
      for(var i=0;i<this.printObj.length;i++){
        this.billTotal += this.printObj[i].total_paid_salary;
      }
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee paid salary list", 'Error', {
        duration: 5000
      });
    }
  }

  async markPaid(){
    this.spinner.show();

    var obj= new Object();
    obj['year']=this.year;
    obj['month']=this.month;
    obj['b_acct_id']=this.b_acct_id;
    obj['update_user_id']=this.erpUser.user_id;
    obj['pay_status_code']='PAID';

    var resp = await this.payableService.salaryPaid(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getSalary();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while change status employee paid salary list", 'Error', {
        duration: 5000
      });
    }
  }
  printBiLL(){
    $('.nav-tabs a[href="#tab-2"]').tab('show');
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
        </style>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  
   
} 

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }




}
