import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { ExcelService } from '../../service/file-export.service';
import { SalaryHoldAndStartService } from '../../service/salary-hold-and-start.service';

import { Router } from '@angular/router';
import { DeductionService } from '../../service/deduction.service';
import { MainService } from '../../service/main.service';

import { NgxSpinnerService } from "ngx-spinner";
import { AllEmpService } from '../../service/all-emp.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;

@Component({
  selector: 'app-stop-report',
  templateUrl: './stop-report.component.html',
  styleUrls: ['./stop-report.component.css']
})
export class StopReportComponent implements OnInit {

  status = [{ id: 'Currently Stopped' }, { id: 'Previously Stopped' }]
  monthObj = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' }
  monthEnd = { '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30, '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31 }

  constructor(private stopService: SalaryHoldAndStartService, private excl: ExcelService, private allEmpService: AllEmpService, private spinner: NgxSpinnerService, public mainService: MainService, private router: Router, private deductionService: DeductionService) { }
  erpUser;
  b_acct_id;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  data = []
  displayedColumns = ['s_no', 'emp_id', 'emp_name', 'designation', 'stop_month', 'stop_fin_year', 'start_month', 'start_fin_year', 'status', 'Action'];
  datasource;
  status_s;
  type = [{ code: 'HISTORY', value: 'HISTORY' }, { code: 'CURRENT', value: 'CURRENT' }]
  selectedOption = "CURRENT";

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.status_s = 'Currently Stopped'
 
          await this.getAllStopSalary();
  }


  export() {
    var exp = []
    for (var i = 0; i < this.data.length; i++) {
      var obj = new Object();
      obj['SNO'] = i + 1;
      obj['EMPLOYEE ID'] = this.mainService.accInfo['account_short_name'] + "" + this.getNumberFormat(this.data[i]['emp_id']);
      obj['EMPLOYEE NAME'] = this.data[i]['emp_name'];
      obj['DESIGNATION'] = this.data[i]['designation'];
      obj['STOP MONTH'] = this.data[i]['stop_month'];
      obj['STOP FINANCIAL YEAR'] = this.data[i]['stop_fin_year'];
      obj['START MONTH'] = this.data[i]['start_month'];
      obj['START FINANCIAL YEAR'] = this.data[i]['start_fin_year'];
      obj['STATUS'] = this.data[i]['status'];
      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, 'stopped_salary_report')
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  view_data = []
  view_data_header = {}
  viewPaidStatus(data) {
    this.view_data_header = data
    this.view_data_header['emp_id']= this.mainService.accInfo['account_short_name']+''+this.getNumberFormat(data['emp_id'])
    this.view_data = JSON.parse(data['paid'])
    $('#myModal2').modal('show');

  }
  async getAllStopSalary() {
    this.spinner.show()
    this.data = []
    var resp = await this.stopService.getholdsalaryreport(this.b_acct_id);

    if (resp['error'] == false) {
      this.data = resp['data']
      let dummy = []
      if (this.status_s == 'Currently Stopped') {
        if (this.data.length > 0) {
          for (let i = 0; i < this.data.length; i++) {
            if (this.data[i]['status'] == 'STOP') {
              this.data[i]['start_month'] = 'Not Started'
              this.data[i]['start_fin_year'] = 'Not Started'
              this.data[i]['stop_month'] = this.mainService.codeValueShowObj['HR0024'][this.data[i]['stop_month']]
              this.data[i]['stop_fin_year'] = this.mainService.codeValueShowObj['HR0023'][this.data[i]['stop_fin_year']]
              dummy.push(this.data[i])
            }
          }
        }
      }
      if (this.status_s == 'Previously Stopped') {
        if (this.data.length > 0) {
          for (let i = 0; i < this.data.length; i++) {
            if (this.data[i]['status'] == 'START') {
              this.data[i]['start_month'] = this.mainService.codeValueShowObj['HR0024'][this.data[i]['start_month']]
              this.data[i]['start_fin_year'] = this.mainService.codeValueShowObj['HR0023'][this.data[i]['start_fin_year']]
              this.data[i]['stop_month'] = this.mainService.codeValueShowObj['HR0024'][this.data[i]['stop_month']]
              this.data[i]['stop_fin_year'] = this.mainService.codeValueShowObj['HR0023'][this.data[i]['stop_fin_year']]
              dummy.push(this.data[i])
            }
          }
        }
      }
      this.data = []
      this.data = dummy
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i]['paid'] != null) {
          let paid = JSON.parse(this.data[i]['paid'])
          let arr = []
          for (let j = 0; j < paid.length; j++) {
            let string: any = ''
            string = '(' + this.mainService.codeValueShowObj['HR0023'][paid[j]['fin_year']] + ',' + this.mainService.codeValueShowObj['HR0024'][paid[j]['month']] + ')'
            arr.push(string)
          }
          this.data[i]['paid_salary'] = arr.join()
        }
        else {
          this.data[i]['paid_salary'] = ''
        }
      }
      this.datasource = new MatTableDataSource(this.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
      this.spinner.hide()

    } else {
      this.spinner.hide()

      swal.fire("Error", "Error while Getting LIC info.");

    }
  }




  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  print() {
 
    let status;
    if(this.status_s=='Currently Stopped'){
    status='Currently Stopped Salary List Of employees'
    }else{
      status='Previously Stopped Salary List Of employees'

    }

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " SALARY HOLD LIST";
    var dd = {
      pageSize: 'A4',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },


      pageOrientation: 'landscape',

      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };
    var header4 = {
      columns: [

        {
          width: '*',
          text: status,
          bold: true
        },
       
      ],
    }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header4);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
 
    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],

        body: [
          ['SNO', 'Employee ID', 'Employee Name', 'Designation', 'Stop Month', 'Stop Financial Year', 'Start Month', 'Start Financial Year', 'Paid Salary']
        ]
      }
    };
    dd.content.push(tbl);
    for (var i = 0; i < this.data.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(this.mainService.accInfo['account_short_name'] + "" + this.getNumberFormat(this.data[i]['emp_id']));
      arr.push(this.data[i]['emp_name']);
      arr.push(this.data[i]['designation_code']);
      arr.push(this.data[i]['stop_month']);
      arr.push(this.data[i]['stop_fin_year']);
      if (this.data[i]['start_month'] == null && this.data[i]['start_month'] == undefined) {
        arr.push("");
      } else {
        arr.push(this.data[i]['start_month']);

      }
      if (this.data[i]['start_fin_year'] == null && this.data[i]['start_fin_year'] == undefined) {
        arr.push("");
      } else {
        arr.push(this.data[i]['start_fin_year']);

      }
      arr.push(this.data[i]['paid_salary']);

      dd.content[dd.content.length - 1].table.body.push(arr);

    }





    pdfMake.createPdf(dd).download("hold-list");
  }

}
