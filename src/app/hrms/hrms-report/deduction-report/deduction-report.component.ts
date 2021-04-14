import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { DeductionService } from '../../service/deduction.service';
import { MainService } from '../../service/main.service';
import { ExcelService } from '../../service/file-export.service';


declare var $: any


@Component({
  selector: 'app-deduction-report',
  templateUrl: './deduction-report.component.html',
  styleUrls: ['./deduction-report.component.css']
})
export class DeductionReportComponent implements OnInit {

  monthObj = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' }
  monthEnd = { '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30, '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31 }

  constructor(private excl: ExcelService, private spinner: NgxSpinnerService, public mainService: MainService, private router: Router, private deductionService: DeductionService) { }
  erpUser;
  b_acct_id;
  pfObj = {}
  tdsObj = {}
  dedObj = {}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  tdsData = []
  pfData = []
  displayedColumns = ['s_no', 'emp_id', 'emp_name', 'designation_code', 'pf_acct_no', 'pf_amount', 'pfadv_amount', 'pfadv1_amount', 'pfadv2_amount', 'total_amount'];
  datasource;
  displayedColumns1 = ['s_no', 'emp_id', 'emp_name', 'designation_code', 'emp_pan_no', 'gross_amount', 'tds_amount'];
  datasource1;
  displayedColumns2 = ['s_no', 'emp_id', 'emp_name', 'designation_code', 'pay_component_amt'];
  datasource2;
  allVariablePay = [];
  obj = {};
  Data
  totalPf = 0;
  totalAdv1 = 0;
  totalAdv2 = 0;
  totalAdv3 = 0;
  totalTds = 0
  totalGross = 0
  totalded = 0
  dednumber = 0
  tdsnumber = 0
  pfnumber = 0
  pf_table_data = [];
  total = 0;
  result = [];
  result1 = [];
  result2 = [];
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;
  @ViewChild('paginator2', { static: false }) paginator2: MatPaginator;
  @ViewChild('sortCol3', { static: false }) sortCol3: MatSort;

  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
  }

  export() {
    this.excl.exportAsExcelFile(this.result, 'down')
  }

  export1() {
    this.excl.exportAsExcelFile(this.result1, 'down')
  }

  export2() {
    this.excl.exportAsExcelFile(this.result2, 'down')
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getPfDed() {
    var obj = new Object();
    obj = this.pfObj
    obj['b_acct_id'] = this.b_acct_id;
    obj['pay_component_code'] = ['PF', 'PFADV', 'PFADV1', 'PFADV2'];
    this.spinner.show()
    var resp = await this.deductionService.getBill(obj);
    this.totalPf = 0
    this.totalAdv1 = 0;
    this.totalAdv2 = 0;
    this.totalAdv3 = 0;
    this.total = 0;
    this.pfData = []
    if (resp['error'] == false) {
      var dt = resp.data;
      this.pfnumber = dt.length
      for (let i = 0; i < dt.length; i++) {
        if (dt[i]['pf_type'] == this.pfObj['pf_type']) {
          //this.totalPf = this.totalPf + dt[i]['pay_component_amt'];
          this.pfData.push(dt[i]);
          if (dt[i]['pay_component_code'] == 'PF') {
            this.totalPf = this.totalPf + dt[i]['pay_component_amt'];
          }
          if (dt[i]['pay_component_code'] == 'PFADV') {
            this.totalAdv1 = this.totalAdv1 + dt[i]['pay_component_amt'];
          }
          if (dt[i]['pay_component_code'] == 'PFADV1') {
            this.totalAdv2 = this.totalAdv2 + dt[i]['pay_component_amt'];
          }
          if (dt[i]['pay_component_code'] == 'PFADV2') {
            this.totalAdv3 = this.totalAdv3 + dt[i]['pay_component_amt'];
          }
          this.total = this.total + dt[i]['pay_component_amt'];

        }
      }
      var all_emp_id = [];
      for (let i = 0; i < this.pfData.length; i++) {
        all_emp_id.push(this.pfData[i]['emp_id']);
      }



      var emp_id = Array.from(new Set(all_emp_id));

      this.pf_table_data = [];

      for (let i = 0; i < emp_id.length; i++) {

        var total_amount = 0;
        var obj = new Object();

        obj['emp_id'] = emp_id[i];
        for (let j = 0; j < this.pfData.length; j++) {
          if (emp_id[i] == this.pfData[j]['emp_id']) {
            obj['designation_code'] = this.pfData[j]['designation_code'];
            obj['emp_name'] = this.pfData[j]['emp_name'];
            obj['pf_acct_no'] = this.pfData[j]['pf_acct_no'];

            obj['pf_ifsc_code'] = this.pfData[j]['pf_ifsc_code'];
            if (obj['pf_amount'] == undefined) {
              obj['pf_amount'] = 0;
            }
            if (obj['pfadv_amount'] == undefined) {
              obj['pfadv_amount'] = 0;
            }

            if (obj['pfadv1_amount'] == undefined) {
              obj['pfadv1_amount'] = 0;

            }
            if (obj['pfadv2_amount'] == undefined) {
              obj['pfadv2_amount'] = 0;
            }



            if (this.pfData[j]['pay_component_code'] == 'PF') {
              obj['pf_amount'] = this.pfData[j]['pay_component_amt'];
              total_amount = total_amount + this.pfData[j]['pay_component_amt']
            } else {

            }


            if (this.pfData[j]['pay_component_code'] == 'PFADV') {
              obj['pfadv_amount'] = this.pfData[j]['pay_component_amt'];
              total_amount = total_amount + this.pfData[j]['pay_component_amt']
            } else {

            }

            if (this.pfData[j]['pay_component_code'] == 'PFADV1') {
              obj['pfadv1_amount'] = this.pfData[j]['pay_component_amt'];
              total_amount = total_amount + this.pfData[j]['pay_component_amt']
            } else {

            }

            if (this.pfData[j]['pay_component_code'] == 'PFADV2') {
              obj['pfadv2_amount'] = this.pfData[j]['pay_component_amt'];
              total_amount = total_amount + this.pfData[j]['pay_component_amt']
            }

          }
        }
        obj['total_amount'] = total_amount;
        this.pf_table_data.push(obj);
      }
      this.result = this.pf_table_data;

      for(let i=0;i<this.result.length;i++){
this.result[i]['serial_no'] = i+1
        this.result[i]['emp_id']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(this.result[i]['emp_id'])
      }
      this.datasource = new MatTableDataSource(this.result)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
      this.spinner.hide()
    } else {
      this.spinner.hide()

      swal.fire("Error", "Error while Getting PF Deductions");
    }
  }


  async getTdsDed() {

    var obj = new Object();
    obj = this.tdsObj
    obj['b_acct_id'] = this.b_acct_id;


    this.spinner.show()
    var resp = await this.deductionService.getTdsReport(obj);
    if (resp['error'] == false) {
      this.tdsData = resp.data;
      this.tdsnumber = this.tdsData.length
      this.totalTds = 0
      this.totalGross = 0
      for (let i = 0; i < this.tdsData.length; i++) {
        this.totalTds = this.totalTds + this.tdsData[i]['tds_amount']
        this.totalGross = this.totalGross + this.tdsData[i]['gross_amount']

      }

      this.result1 = [];
      for (let j = 0; j < resp.data.length; j++) {
        var obj = new Object();
        for (let i = 0; i < this.displayedColumns1.length; i++) {

          obj[this.displayedColumns1[i]] = resp.data[j][this.displayedColumns1[i]]
        }
        obj['s_no']=j+1;
        this.result1.push(obj);
      }

      for(let i=0;i<this.result1.length;i++){
        this.result1[i]['serial_no'] = i+1
        this.result1[i]['emp_id']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(this.result1[i]['emp_id'])
      }
      this.datasource1 = new MatTableDataSource(this.result1)
      this.datasource1.paginator = this.paginator1;
      this.datasource1.sort = this.sortCol2
      this.spinner.hide()

    } else {
      this.spinner.hide()

      swal.fire("Error", "Error while Getting PF Deductions");
    }
  }

  async getDed() {
    var obj = new Object();
    obj = Object.assign({}, this.dedObj)
    obj['b_acct_id'] = this.b_acct_id;
    var obj1 = []
    obj1.push(this.dedObj['pay_component_code']);
    obj['pay_component_code'] = obj1
    var resp = await this.deductionService.getBill(obj);
    this.totalded = 0;
    if (resp['error'] == false) {
      this.Data = resp.data;
      this.dednumber = this.Data.length
      for (let i = 0; i < this.Data.length; i++) {
        this.totalded = this.totalded + this.Data[i]['pay_component_amt']
      }
      this.result2 = [];
      for (let j = 0; j < resp.data.length; j++) {
        var obj = new Object();
        for (let i = 0; i < this.displayedColumns2.length; i++) {

          obj[this.displayedColumns2[i]] = resp.data[j][this.displayedColumns2[i]]
        }
        obj['s_no']=j+1;
        this.result2.push(obj);
      }
      for(let i=0;i<this.result2.length;i++){
        this.result2[i]['serial_no'] = i+1
        this.result2[i]['emp_id']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(this.result2[i]['emp_id'])
      }
      this.datasource2 = new MatTableDataSource(this.result2)
      this.datasource2.paginator = this.paginator2;
      this.datasource2.sort = this.sortCol3

    } else {
      swal.fire("Error", "Error while Getting PF Deductions");
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
        page-break-after:auto 
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        word-wrap: break-word;
        page-break-inside:avoid; page-break-after:auto 
    }

    
    
    #tbl th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #d9edf7;
      color: black;
  }
      </style>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    );
    popupWin.document.close();


  }
  printtds() {

    let printContents, popupWin;
    printContents = document.getElementById('a').innerHTML;
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
        page-break-after:auto 
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        word-wrap: break-word;
        page-break-inside:avoid; page-break-after:auto 
    }

    
    
    #tbl th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #d9edf7;
      color: black;
  }
      </style>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    );
    popupWin.document.close();


  }
  printded() {


    let printContents, popupWin;
    printContents = document.getElementById('c').innerHTML;
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
        page-break-after:auto 
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        word-wrap: break-word;
        page-break-inside:avoid; page-break-after:auto 
    }

    
    
    #tbl th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #d9edf7;
      color: black;
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
  applyFilter2(filterValue: string) {

    this.datasource2.filter = filterValue.trim().toLowerCase();
  }
  applyFilter1(filterValue: string) {

    this.datasource1.filter = filterValue.trim().toLowerCase();
  }


}
