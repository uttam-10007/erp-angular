import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { ExcelService } from '../../service/file-export.service';
import { EstablishmentService } from '../../service/establishment.service';
import { Router } from '@angular/router';
import { DeductionService } from '../../service/deduction.service';
import { MainService } from '../../service/main.service';
import { SettingService } from '../../service/setting.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { AllEmpService } from '../../service/all-emp.service';
import { PayrollService } from '../../service/payroll.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-pension-contribution',
  templateUrl: './pension-contribution.component.html',
  styleUrls: ['./pension-contribution.component.css']
})
export class PensionContributionComponent implements OnInit {

  monthObj = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' }
  monthEnd = { '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30, '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31 }

  constructor(private establishmentService: EstablishmentService,private settingService: SettingService, private payableService: PayrollService, private snackBar: MatSnackBar, private excl: ExcelService, private spinner: NgxSpinnerService, public mainService: MainService, private router: Router) { }
  erpUser;
  b_acct_id;
  licObj = {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  data = []
  joining_type_code = [{ 'value': 'NONCENTRALISED' }, { 'value': 'CENTRALISED' }, { 'value': 'DEPUTATION' }, { 'value': 'ALL' },]
  displayedColumns = ['s_no', 'emp_id', 'emp_name', 'designation', 'basic', 'da', 'daper', 'pen'];
  datasource;

  obj = {};
  total = 0.00;
  result = [];
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;



  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getcontribution()
    await this.getAllCurrentArrangements()
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }

  allArr = []
  async getAllCurrentArrangements() {
    this.spinner.show();

    var transferdArr1 = []
    var arr = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ['ACTIVE']

    var resp = await this.establishmentService.getAllCurrentArrangements(obj);
    if (resp['error'] == false) {
      this.allArr = resp.data;


      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting All  Employee", 'Error', {
        duration: 5000
      });
    }
  }
  pencontribution = []
  async getcontribution() {
this.spinner.show()
    var resp = await this.settingService.getcontribution(this.b_acct_id);
    if (resp['error'] == false) {
      this.pencontribution = resp.data;
      

      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all values!",'error');

    }
  }
  billIdObj = {}
  allBillId = []
  async getAllBillID() {

    this.billIdObj['b_acct_id'] = this.b_acct_id;
    this.billIdObj['fin_year'] = this.licObj['fin_year'];
    this.billIdObj['month'] = this.licObj['month'];
    this.spinner.show();
    var resp = await this.payableService.getMonthlyBill(JSON.stringify(this.billIdObj));
    if (resp['error'] == false) {

      for (let i = 0; i < resp.data.length; i++) {
        var obj = Object()
        obj = resp.data[i]
        if (obj['pay_code'] == 'PAY' && (obj['pay_component_code'] == 'BASIC' || obj['pay_component_code'] == 'DA')) {
          this.allBillId.push(obj)
        }

      }
      await this.pensioncontribution();
      this.spinner.hide()
    } else {
      this.spinner.hide()
      this.snackBar.open("Error in getting All Bill", 'Error', {
        duration: 5000
      });
    }
  }

  contribution = []
  async pensioncontribution() {
    this.contribution = []

    for (let i = 0; i < this.allArr.length; i++) {
      var Obj = Object()
      Obj = this.allArr[i];
      if (this.licObj['joining_type_code']=='ALL' || Obj['joining_type_code'] == this.licObj['joining_type_code']) {
        this.contribution[Obj['emp_id']] = []
        for (let j = 0; j < this.allBillId.length; j++) {
          if (Obj['emp_id'] == this.allBillId[j]['emp_id']) {
            this.allBillId[j]['emp_name'] = Obj['emp_name']
            this.allBillId[j]['designation_code'] = Obj['designation_code']
            this.contribution[Obj['emp_id']].push(this.allBillId[j])
          }


        }
      }

    }
    var emparr = []
    for (let i = 0; i < this.allArr.length; i++) {
      if (this.licObj['joining_type_code']=='ALL' || this.allArr[i]['joining_type_code'] == this.licObj['joining_type_code']) {
        if (this.contribution[this.allArr[i]['emp_id']].length > 1) {
          var obj = Object()
          obj['emp_id'] = this.contribution[this.allArr[i]['emp_id']][0]['emp_id']
          obj['emp_name'] = this.contribution[this.allArr[i]['emp_id']][0]['emp_name']
          obj['designation_code'] = this.contribution[this.allArr[i]['emp_id']][0]['designation_code']
          for (let j = 0; j < this.contribution[this.allArr[i]['emp_id']].length; j++) {
            if (this.contribution[this.allArr[i]['emp_id']][j]['pay_component_code'] == 'BASIC') {
              obj['basic'] = this.contribution[this.allArr[i]['emp_id']][j]['pay_component_amt']
            }
            else if (this.contribution[this.allArr[i]['emp_id']][j]['pay_component_code'] == 'DA') {
              obj['da'] = this.contribution[this.allArr[i]['emp_id']][j]['pay_component_amt']
            }
          }
          emparr.push(obj)
        }
      }


    }
    var Total = 0
    var arr = []
    for (let i = 0; i < emparr.length; i++) {
      for (let j = 0; j < this.pencontribution.length; j++) {
        if(this.pencontribution[j]['emp_id'] == emparr[i]['emp_id']){
      var empobj = Object()
      empobj = emparr[i]
      var da = Number(((empobj['da'] * 100) / empobj['basic']).toFixed(2))
      var pen = Number((((empobj['da'] + empobj['basic']) * 12) / 100).toFixed(2))
      emparr[i]['daper'] = da
      emparr[i]['pen'] = pen
      Total = Total + pen
      arr.push(emparr[i])
    }
  } 
    }
    this.total = Number(Total.toFixed(2));
    this.data = arr
    this.datasource = new MatTableDataSource(arr)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort
  }
  export() {
    var exp = []
    for (var i = 0; i < this.data.length; i++) {
      var obj = new Object();
      obj['SNO'] = i + 1;
      obj['EMPLOYEE ID'] = this.mainService.accInfo['account_short_name'] + "" + this.getNumberFormat(this.data[i]['emp_id']);
      obj['EMPLOYEE NAME'] = this.data[i]['emp_name'];
      obj['DESIGNATION'] = this.data[i]['designation_code'];
      obj['BASIC'] = this.data[i]['basic'];
      obj['DA'] = this.data[i]['da'];
      obj['DA%'] = this.data[i]['daper'];
      obj['PENSION CONTRIBUTION'] = this.data[i]['pen'];

      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, 'pension_contribution_report')
  }
  print() {

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " PENSION CONTRIBUTION LIST";
    var dd = {
      pageSize: 'A4',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },


      pageOrientation: 'portrait',

      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };

    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*'],

        body: [
          ['SNO', 'Employee ID', 'Employee Name', 'Designation', 'BASIC', 'DA', 'DA%', 'Pension Contribution']


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
      arr.push(this.data[i]['basic']);
      arr.push(this.data[i]['da']);
      arr.push(this.data[i]['daper'])
      arr.push(this.data[i]['pen'])




      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    var tbl1 = [
      '', '', '', '', '', 'Total :', this.total.toFixed(2)
    ]
    var totalObjRow = {
      columns: [

        {
          width: '*',
          text: '',
        },
        {
          width: '*',
          text: '',
          bold: true

        },
        {
          width: '*',
          text: '',
        },
        {
          width: '*',
          text: '',
          bold: true

        },
        {
          width: '*',
          text: 'Total : Rs.',
          bold: true
        },
        {
          width: '*',
          text: this.total.toFixed(2)
        },


      ],

    }
    dd.content.push(totalObjRow);




    pdfMake.createPdf(dd).download("pension-list");
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}
