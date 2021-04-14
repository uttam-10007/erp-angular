import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { ExcelService } from '../../service/file-export.service';

import { Router } from '@angular/router';
import { DeductionService } from '../../service/deduction.service';
import { MainService } from '../../service/main.service';

import { NgxSpinnerService } from "ngx-spinner";
import { AllEmpService } from '../../service/all-emp.service';

@Component({
  selector: 'app-lic-report',
  templateUrl: './lic-report.component.html',
  styleUrls: ['./lic-report.component.css']
})
export class LicReportComponent implements OnInit {


  monthObj = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' }
  monthEnd = { '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30, '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31 }

  constructor(private excl: ExcelService, private allEmpService: AllEmpService, private spinner: NgxSpinnerService, public mainService: MainService, private router: Router, private deductionService: DeductionService) { }
  erpUser;
  b_acct_id;
  licObj = {}
  lic = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  data = []
  displayedColumns = ['s_no', 'emp_id', 'emp_name', 'designation', 'LIC1', 'LIC2', 'LIC3', 'LIC4', 'LIC5', 'LIC6', 'LIC7', 'amount'];
  datasource;

  allVariablePay = [];
  obj = {};
  totalLIC = 0;
  result = [];
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;
  AllLICInfo = []
  allLicObj = {}

  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllLICInfo();

  }


  export() {
    this.excl.exportAsExcelFile(this.result, 'down')
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }

  async getAllLICInfo() {
    this.spinner.show()

    var resp = await this.allEmpService.getLicInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.AllLICInfo = resp.data;
      this.allLicObj = new Object;
      for (let i = 0; i < this.AllLICInfo.length; i++) {
        if (this.allLicObj[this.AllLICInfo[i]['emp_id']] == undefined) {
          this.allLicObj[this.AllLICInfo[i]['emp_id']] = new Object
        }
        this.allLicObj[this.AllLICInfo[i]['emp_id']][this.AllLICInfo[i]['amount']] = this.AllLICInfo[i]['lic_no']

      }
      this.spinner.hide()

    } else {
      this.spinner.hide()

      swal.fire("Error", "Error while Getting LIC info.",'error');

    }
  }
  async getPfDed() {
    var obj = new Object();
    obj = this.licObj
    obj['b_acct_id'] = this.b_acct_id;
    obj['pay_component_code'] = ['LIC1', 'LIC2', 'LIC3', 'LIC4', 'LIC5', 'LIC6', 'LIC7']

    this.spinner.show()

    var resp = await this.deductionService.getBill(obj);
    if (resp['error'] == false) {
      this.data = resp.data;
      var ob = new Object;
      this.totalLIC = 0
      for (let i = 0; i < this.data.length; i++) {
        if (ob[this.data[i]['emp_id']] == undefined) {
          ob[this.data[i]['emp_id']] = {
            emp_id: this.data[i]['emp_id'], emp_name: this.data[i]['emp_name'], designation_code: this.data[i]['designation_code'],
            LIC1: 0.00, LIC2: 0.00, LIC3: 0.00, LIC4: 0.00, LIC5: 0.00, LIC6: 0.00, LIC7: 0.00, total: 0.00
          }
        }
        ob[this.data[i]['emp_id']][this.data[i]['pay_component_code']] = this.data[i]['pay_component_amt']
        ob[this.data[i]['emp_id']]['total'] = this.data[i]['pay_component_amt'] + ob[this.data[i]['emp_id']]['total']
        this.totalLIC = this.totalLIC + this.data[i]['pay_component_amt']
      }
      this.lic = new Array
      var arr = Object.keys(ob)


      for (let i = 0; i < arr.length; i++) {
        this.lic.push(ob[arr[i]])
      }




     
      
      this.result = this.lic;
var data=[];
for(let j=0;j<this.result.length;j++){
  var obj1=Object.assign({},this.result[j])
  obj1['serial_no'] = j+1
  obj1['emp_id']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj1['emp_id']);
  data.push(obj1)
}
this.result=data;
      this.datasource = new MatTableDataSource(this.lic)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
      this.spinner.hide()


    } else {
      this.spinner.hide()

      swal.fire("Error", "Error while Getting LIC Info",'error');
    }
  }



  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
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
}
