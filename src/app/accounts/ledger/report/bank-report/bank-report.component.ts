import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { SettingService } from '../../../service/setting.service'
import { LedgerService } from '../../../service/ledger.service'
import swal from 'sweetalert2';
import { ChartOfAccountService } from '../../../service/chart-of-account.service'
import { ChartAcctMapingServiceService } from '../../../service/chart-acct-maping-service.service'
import { BankReportService } from '../../../service/bank-report.service'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"

import { ExcelService } from '../../../service/file-export.service';
import { MainService } from '../../../service/main.service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any
@Component({
  selector: 'app-bank-report',
  templateUrl: './bank-report.component.html',
  styleUrls: ['./bank-report.component.css']
})
export class BankReportComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  list = ['particulars', 'type', 'voucher', 'db', 'cr', 'bal'];
  obj = {}
  balance = [{ id: 'Every Transaction' }, { id: 'Daily' }, { id: 'Monthly' }, { id: 'Yearly' }]
  datasource;
  constructor(private excel:ExcelService,private spinner: NgxSpinnerService, public mainService: MainService, private settingService: SettingService, private chartAccMapingS: ChartAcctMapingServiceService, private ch_acc_S: ChartOfAccountService, private bankS: BankReportService, private ledgerService: LedgerService) { }
  b_acct_id;
  chartOfAcc = []
  erpUser;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getFinYear();
    await this.allChartOfAccount();
    await this.getBankAccount();
    await this.getChartMappingList()
    this.obj['balancing'] = 'Every Transaction'
    var d = '2020-09-05';
    var dateStr = '2019-01-01';
    var days = 1;

    var result = new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + days));

  }

  async allChartOfAccount() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ch_acc_S.getchartofaccount(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      for (let i = 0; i < resp['data'].length; i++) {
        resp['data'][i]['leaf_value'] = resp['data'][i]['leaf_code'] + ' - ' + resp['data'][i]['leaf_value']
      }
      this.chartOfAcc = resp['data']
    } else {
      this.spinner.hide()
    }
  }

  fin_year = []
  async getFinYear() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getAllFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.fin_year = resp['data']
    } else {
      this.spinner.hide()
    }
  }
  chartAcc = []
  s = []
  s2 = []
  async getChartMappingList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.chartAccMapingS.getRelationList(JSON.stringify(obj));
    if (resp['error'] == false) {
      for (let i = 0; i < resp['data'].length; i++) {
        if (resp['data'][i]['type'] === 'BANK') {
          this.s.push(resp['data'][i])
        }
      }
      this.s2 = this.s
      for (let i = 0; i < this.s2.length; i++) {
        for (let j = 0; j < this.chartOfAcc.length; j++) {
          if (this.s2[i]['chart_of_account'] == this.chartOfAcc[j]['leaf_code']) {
            this.s2[i]['desc'] = this.chartOfAcc[j]['leaf_value']
          }
        }
      }
      this.spinner.hide()
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Some Error Occured", 'error');
    }
  }
  data = []
  result = []
  final_res = []
  total;
  comp_obj = {}
  async submit() {
    this.spinner.show()
    this.final_res = []
    let data = []
    let obj2 = {}
    obj2 = this.obj
    obj2['b_acct_id'] = this.b_acct_id;
    obj2['chart_of_account'] = this.obj['chart_of_account']
    if (this.obj['balancing'] && this.obj['chart_of_account'] && this.obj['from_accounting_dt'] && this.obj['to_accounting_dt'] && this.obj['fin_year']) {
      var resp = await this.ledgerService.getLedgerReport(JSON.stringify(this.obj))
      let open_bal = 0
      if (resp['error'] == false) {
        this.result = resp['data']
        var openObj = {};
        openObj['acct_dt'] = this.obj['from_date'];
        openObj['jrnl_desc'] = "Opening Balance as on";
        openObj['jrnl_type'] = "";
        openObj['jrnl_id'] = "";
        openObj['db'] = 0;
        openObj['cr'] = 0;
        openObj['bal'] = 0;
        // for opening balance of before from date
        for (let i = 0; i < this.result[1].length; i++) {
          if (this.result[1][i]['db_cd_ind'] == 'DB') {
            openObj['db'] += this.result[1][i]['txn_amt']
          } else {
            openObj['cr'] += this.result[1][i]['txn_amt']
          }
        }
        if (openObj['db'] >= openObj['cr']) {
          openObj['db'] = openObj['db'] - openObj['cr'];
          openObj['cr'] = 0;
          openObj['bal'] = -openObj['db']
        } else {
          openObj['cr'] = openObj['cr'] - openObj['db'];
          openObj['db'] = 0;
          openObj['bal'] = openObj['cr']
        }
        if (openObj['cr'] > openObj['db']) {
          this.comp_obj['bal'] = openObj['cr']
        } else {
          this.comp_obj['bal'] = -openObj['db']
        }
        openObj['bal'] = this.comp_obj['bal']
        open_bal = openObj['bal']
        if (this.obj['balancing'] == 'Daily' || this.obj['balancing'] == 'Monthly' || this.obj['balancing'] == 'Yearly') {
          this.final_res.push(openObj)
        }
        for (let i = 0; i < this.result[0].length; i++) {
          let date = new Date(this.result[0][i]['acct_dt'])
          this.result[0][i]['date'] = date.getDate()
          this.result[0][i]['month'] = date.getMonth()
          this.result[0][i]['year'] = date.getFullYear()
          if (this.result[0][i]['db_cd_ind'] == 'DB') {
            this.result[0][i]['db'] = this.result[0][i]['txn_amt']
            this.result[0][i]['cr'] = 0
          }
          if (this.result[0][i]['db_cd_ind'] == 'CR') {
            this.result[0][i]['db'] = 0
            this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
          }
        }
        if (this.obj['balancing'] == 'Daily') {
          let res = this.byDaily(this.result[0], this.comp_obj['bal'])
          for (let i = 0; i < res.length; i++) {
            let obj = {}
            obj['jrnl_desc'] = res[i]['jrnl_desc']
            obj['db'] = res[i]['db']
            obj['cr'] = res[i]['cr']
            obj['jrnl_type'] = res[i]['jrnl_type']
            obj['jrnl_id'] = res[i]['jrnl_id']
            obj['acct_dt'] = res[i]['acct_dt']
            obj['bal'] = res[i]['opening_bal']

            this.final_res.push(obj)
          }
          for (let i = 0; i < this.final_res.length; i++) {
            if (this.final_res[i]['bal'] < 0) {
              this.final_res[i]['bal'] = this.final_res[i]['bal'] * (-1) + ' (DR)'
            }
            if (this.final_res[i]['bal'] >= 0) {
              this.final_res[i]['bal'] = this.final_res[i]['bal'] + '(CR)'
            }
          }
          let dum = {}
          let db = openObj['db'];
          let cr = openObj['cr'];
          for (let i = 0; i < this.result[0].length; i++) {
            db = db + Number(this.result[0][i]['db'])
            cr = cr + Number(this.result[0][i]['cr'])
          }
          dum['cr'] = cr
          dum['db'] = db
          dum['jrnl_desc'] = 'Total'
          this.final_res.push(dum)
        } else if (this.obj['balancing'] == 'Every Transaction') {
          this.forEveryTransection()
        }
        else if (this.obj['balancing'] == 'Yearly' || this.obj['balancing'] == 'Monthly') {
          if (this.obj['balancing'] == 'Monthly') {
            var dt = this.getMonthDateFromTo()
          }
          if (this.obj['balancing'] == 'Yearly') {
            var dt = this.getListYear()
          }
          var res = this.byMonthly(this.result[0], this.comp_obj['bal'], dt)
          for (let i = 0; i < res.length; i++) {
            let obj = {}
            obj['jrnl_desc'] = res[i]['jrnl_desc']
            obj['db'] = res[i]['db']
            obj['cr'] = res[i]['cr']
            obj['jrnl_type'] = res[i]['jrnl_type']
            obj['jrnl_id'] = res[i]['jrnl_id']
            obj['acct_dt'] = res[i]['acct_dt']
            obj['bal'] = res[i]['opening_bal']

            this.final_res.push(obj)
          }
          for (let i = 0; i < this.final_res.length; i++) {
            if (this.final_res[i]['bal'] < 0) {
              this.final_res[i]['bal'] = this.final_res[i]['bal'] * (-1) + ' (DR)'
            }
            if (this.final_res[i]['bal'] >= 0) {
              this.final_res[i]['bal'] = this.final_res[i]['bal'] + '(CR)'
            }
          }
          let dum = {}
          let db = openObj['db'];
          let cr = openObj['cr'];
          for (let i = 0; i < this.result[0].length; i++) {
            db = db + Number(this.result[0][i]['db'])
            cr = cr + Number(this.result[0][i]['cr'])
          }
          dum['cr'] = cr
          dum['db'] = db
          dum['jrnl_desc'] = 'Total'
          this.final_res.push(dum)
        }
        this.spinner.hide()
      } else {
        this.spinner.hide()
      }
    } else {
      this.spinner.hide()
      swal.fire('Opps..', 'Please Select All Fields', 'info')
    }
  }
  getListYear() {
    var startDate = this.obj['from_accounting_dt']
    let d = new Date(startDate)
    var endDate = this.obj['to_accounting_dt']
    let s = new Date(endDate)
    var first = d.getFullYear();
    var second = s.getFullYear();
    var arr = Array();
    var arr2 = []
    arr2.push(startDate)
    for (let i = first; i <= second; i++) arr.push(i);
    for (let i = 0; i < arr.length; i++) {
      // arr2.push(arr[i] + '-' + 4 + '-' + 1)
      arr2.push(arr[i] + '-' + 3 + '-' + 31)
    }
    arr2.push(endDate)
    return arr2
  }
  byMonthly(result, bal1, dt11) {
    var arr = []
    var bal = bal1 //100
    var dt = dt11//["2020-09-05", "2020-9-30", "2020-10-31", "2020-11-10"]
    for (let j = 1; j < dt.length; j++) {
      var obj = new Object()
      obj['opening_date'] = dt[j - 1]
      obj['close_date'] = dt[j]
      obj['opening_bal'] = bal
      obj['bal'] = bal
      for (let i = 0; i < result.length; i++) {
        var dt1 = new Date(dt[j - 1])
        var dt2 = new Date(result[i]['acct_dt'])
        var dt3 = new Date(dt[j])
        if (dt1.getTime() < dt2.getTime() && dt3.getTime() >= dt2.getTime()) {
          if(i==0){
            obj['jrnl_desc'] = 'Opening Balance as on ' + result[i]['opening_date']
          }
          else{
            var myDate = new Date(dt[j - 1]);
            myDate.setDate(myDate.getDate() + 1);
            obj['jrnl_desc'] = 'Opening Balance as on ' + myDate.getFullYear()+'-'+(myDate.getMonth()+1)+'-'+myDate.getDate()  
          }
          if (result[i]['db'] > 0) {
            obj['bal'] = obj['bal'] - result[i]['db']
          } else {
            obj['bal'] = obj['bal'] + result[i]['cr']
          }
          bal = obj['bal']
        }
      }
      arr.push(obj)
    }
    arr[0]['jrnl_desc']='Opening Balance as on ' + arr[0]['opening_date']
    var temparr = []
    for (let j = 0; j < arr.length; j++) {
      temparr.push(arr[j])
      for (let i = 0; i < result.length; i++) {
        var dt1 = new Date(arr[j]['opening_date'])
        var dt2 = new Date(result[i]['acct_dt'])
        var dt3 = new Date(arr[j]['close_date'])
        if (dt1.getTime() < dt2.getTime() && dt3.getTime() >= dt2.getTime()) {
          temparr.push(result[i])
        }
      }
      var obj3 = Object.assign({}, arr[j])
      obj3['opening_bal'] = obj3['bal']
      obj3['jrnl_desc'] = 'Closing Balance as on ' + obj3['close_date']
      temparr.push(obj3)
    }
    for(let i=0;i<temparr.length;i++){
      if(temparr[i]['jrnl_desc']){
        temparr[i]['jrnl_desc']= temparr[i]['jrnl_desc']
      }else{
        var myDate = new Date(temparr[i]['opening_date']);
        myDate.setDate(myDate.getDate() + 1);
        temparr[i]['jrnl_desc']= 'Opening Balance as on ' + myDate.getFullYear()+'-'+(myDate.getMonth()+1)+'-'+myDate.getDate()  
      }
    }
    return temparr
  }
  getMonthDateFromTo() {
    var startDate = this.obj['from_accounting_dt']
    var endDate = this.obj['to_accounting_dt']
    var start = startDate.split('-');
    var end = endDate.split('-');
    var startYear = parseInt(start[0]);
    var endYear = parseInt(end[0]);
    var dates = [];
    for (var i = startYear; i <= endYear; i++) {
      var endMonth = i != endYear ? 11 : parseInt(end[1]) - 1;
      var startMon = i === startYear ? parseInt(start[1]) - 1 : 0;
      for (var j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
        var month = j + 1;
        var displayMonth = month < 10 ? '0' + month : month;
        dates.push([i, displayMonth, '01'].join('-'));
      }
    }
    let new_date = []
    new_date.push(startDate)
    for (let i = 0; i < dates.length; i++) {
      var today = new Date(dates[i]);
      var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      new_date.push(lastDayOfMonth.getFullYear() + '-' + (lastDayOfMonth.getMonth() + 1) + '-' + lastDayOfMonth.getDate())
    }
    new_date[new_date.length - 1] = endDate
    return new_date
  }


  byDaily(result, bal1) {
    var flagarrdev12 = []
    var arr = []
    var bal = bal1
    for (let i = 0; i < result.length; i++) {
      if (!flagarrdev12.includes(result[i]['acct_dt'])) {
        flagarrdev12.push(result[i]['acct_dt'])
        var obj = Object()
        obj['jrnl_desc'] = 'opening Balance as on ' + result[i]['acct_dt']
        if (result[i]['db'] > 0) {
          obj['acct_dt'] = result[i]['acct_dt']
          obj['bal'] = bal - result[i]['db']
        } else {
          obj['acct_dt'] = result[i]['acct_dt']
          obj['bal'] = result[i]['cr'] + bal
        }
        obj['opening_bal'] = bal
        arr.push(obj)
        bal = obj['bal']
      } else {
        var obj1 = Object.assign({}, arr[arr.length - 1])
        if (result[i]['db'] > 0) {
          arr[arr.length - 1]['bal'] = obj1['bal'] - result[i]['db']
        } else {
          arr[arr.length - 1]['bal'] = obj1['bal'] + result[i]['cr']
        }
        bal = arr[arr.length - 1]['bal']
      }
    }
    var temparr = []
    for (let j = 0; j < arr.length; j++) {
      temparr.push(arr[j])
      for (let i = 0; i < result.length; i++) {
        if (arr[j]['acct_dt'] == result[i]['acct_dt']) {
          temparr.push(result[i])
        }
      }
      var obj3 = Object.assign({}, arr[j])
      obj3['opening_bal'] = obj3['bal']
      obj3['jrnl_desc'] = 'Closing Balance as on ' + obj3['acct_dt']
      temparr.push(obj3)
    }
    return temparr
  }

  forEveryTransection() {
    var openObj = {};
    openObj['acct_dt'] = this.obj['from_date'];
    openObj['jrnl_desc'] = "Opening Balance as on";
    openObj['jrnl_type'] = "";
    openObj['jrnl_id'] = "";
    openObj['db'] = 0;
    openObj['cr'] = 0;
    openObj['bal'] = 0;
    // for opening balance of before from date
    for (let i = 0; i < this.result[1].length; i++) {
      if (this.result[1][i]['db_cd_ind'] == 'DB') {
        openObj['db'] += this.result[1][i]['txn_amt']
      } else {
        openObj['cr'] += this.result[1][i]['txn_amt']
      }
    }
    if (openObj['cr'] > 0) {
      openObj['bal'] = openObj['cr']
      this.comp_obj['bal'] = openObj['cr']
      this.comp_obj['ind'] = 'cr'
      openObj['ind'] = 'CR'
    } else if (openObj['db'] > 0) {
      openObj['bal'] = openObj['db']
      this.comp_obj['bal'] = openObj['db']
      this.comp_obj['ind'] = 'db'
      openObj['ind'] = 'DR'
    } else {
      openObj['bal'] = 0
      this.comp_obj['bal'] = 0
      this.comp_obj['ind'] = 'cr'
      openObj['ind'] = 'CR'
    }
    this.final_res.push(openObj)
    for (let i = 0; i < this.result[0].length; i++) {
      if (this.result[0][i]['db_cd_ind'] == 'CR') {
        if (this.comp_obj['ind'] == 'cr') {
          this.result[0][i]['bal'] = this.result[0][i]['txn_amt'] + this.comp_obj['bal']
          this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
          this.result[0][i]['db'] = 0
          this.comp_obj['bal'] = this.result[0][i]['bal']
          this.comp_obj['ind'] = 'cr'
          this.result[0][i]['ind'] = 'CR'
        }
      }
      // if CR and db 
      if (this.result[0][i]['db_cd_ind'] == 'CR') {
        if (this.comp_obj['ind'] == 'db') {
          if (this.result[0][i]['txn_amt'] > this.comp_obj['bal']) {
            this.result[0][i]['bal'] = this.result[0][i]['txn_amt'] - this.comp_obj['bal']
            this.result[0][i]['db'] = 0
            this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
            this.comp_obj['ind'] = 'cr'
            this.comp_obj['bal'] = this.result[0][i]['bal']
            this.result[0][i]['ind'] = 'CR'
          } else {
            this.result[0][i]['bal'] = this.comp_obj['bal'] - this.result[0][i]['txn_amt']
            this.result[0][i]['db'] = 0
            this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
            this.comp_obj['ind'] = 'cr'
            this.comp_obj['bal'] = this.result[0][i]['bal']
            this.result[0][i]['ind'] = 'CR'

          }
        }
      }
      // if DB and db 

      if (this.result[0][i]['db_cd_ind'] == 'DB') {
        if (this.comp_obj['ind'] == 'db') {
          this.result[0][i]['bal'] = this.result[0][i]['txn_amt'] + this.comp_obj['bal']
          this.result[0][i]['cr'] = 0
          this.result[0][i]['db'] = this.result[0][i]['txn_amt']
          this.comp_obj['bal'] = this.result[0][i]['bal']
          this.comp_obj['ind'] = 'db'
          this.result[0][i]['ind'] = 'DR'

        }
      }
      // -------
      // if DB and cr 
      if (this.result[0][i]['db_cd_ind'] == 'DB') {
        if (this.comp_obj['ind'] == 'cr') {
          if (this.result[0][i]['txn_amt'] > this.comp_obj['bal']) {
            this.result[0][i]['bal'] = this.result[0][i]['txn_amt'] - this.comp_obj['bal']
            this.result[0][i]['db'] = this.result[0][i]['txn_amt']
            this.result[0][i]['cr'] = 0
            this.comp_obj['ind'] = 'db'
            this.comp_obj['bal'] = this.result[0][i]['bal']
            this.result[0][i]['ind'] = 'DR'

          } else {
            this.result[0][i]['bal'] = this.comp_obj['bal'] - this.result[0][i]['txn_amt']
            this.result[0][i]['db'] = this.result[0][i]['txn_amt']
            this.result[0][i]['cr'] = 0
            this.comp_obj['ind'] = 'cr'
            this.comp_obj['bal'] = this.result[0][i]['bal']
            this.result[0][i]['ind'] = 'CR'
          }
        }
      }
      // ------



      this.final_res.push(this.result[0][i])
    }

    let dum = {}
    let db = 0
    let cr = 0
    for (let i = 0; i < this.final_res.length; i++) {
      db = db + Number(this.final_res[i]['db'])
      cr = cr + Number(this.final_res[i]['cr'])
    }
    dum['cr'] = cr
    dum['db'] = db
    dum['acct_dt']=''
    dum['jrnl_type']=''
    dum['jrnl_id']=''
    dum['jrnl_desc'] = 'Total'
    this.final_res.push(dum)
  }
  
  allBankAccounts = []
  async getBankAccount() {
    var resp = await this.settingService.getBankAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBankAccounts = resp.data;
    } else {
      this.spinner.hide();

      swal.fire("Error", "...Some Error  Occured!", 'error');
    }
  }
  objData = {}
  objData2 = {}
  changeDetails() {
    this.objData2 = {}
    for (let i = 0; i < this.s2.length; i++) {
      if (this.s2[i]['chart_of_account'] == this.obj['chart_of_account']) {
        this.objData = Object.assign({}, this.s2[i])
        break;
      }
    }
    for (let i = 0; i < this.allBankAccounts.length; i++) {
      if (this.objData['relation'] == this.allBankAccounts[i]['bank_acct_no']) {
        this.objData2 = Object.assign({}, this.allBankAccounts[i])
        break;
      }
    }

  }
  export(){
    var exp = []
    for (var i = 0; i < this.final_res.length; i++) {
      var obj = new Object();
      if(this.final_res[i]['acct_dt']){
        obj['Date'] =this.mainService.dateFormatChange(this.final_res[i]['acct_dt']);
      }else{
        obj['Date'] = this.final_res[i]['acct_dt'];
      }      obj['Particulars'] = this.final_res[i]['jrnl_desc']
      obj['Voucher Type'] = this.final_res[i]['jrnl_type']
      obj['Voucher Number'] = this.final_res[i]['jrnl_id']
      obj['Debit(Dr)'] = this.final_res[i]['db']
      obj['Credit(Cr)'] = this.final_res[i]['cr']
      obj['Balance'] = this.final_res[i]['bal']

      exp.push(obj);
    }
    this.excel.exportAsExcelFile(exp, 'bank_report')
  }

  async print() {
    this.spinner.show()
    let data = []
    if (this.final_res.length > 1) {
      for (let i = 0; i < this.final_res.length; i++) {
        let obj = {}
        obj['cr'] = this.final_res[i]['cr']
        obj['db'] = this.final_res[i]['db']
        obj['ind'] = this.final_res[i]['ind']
        if (this.final_res[i]['acct_dt']) {
          obj['acct_dt'] = this.mainService.dateFormatChange(this.final_res[i]['acct_dt'])
        } else {
          obj['acct_dt'] = '  '

        }
        if (this.final_res[i]['jrnl_desc']) {
          obj['jrnl_desc'] = this.final_res[i]['jrnl_desc']
        } else {
          obj['jrnl_desc'] = '  '

        }
        if (this.final_res[i]['jrnl_id']) {
          obj['jrnl_id'] = this.final_res[i]['jrnl_id']
        } else {
          obj['jrnl_id'] = '  '

        }
        if (this.final_res[i]['jrnl_type']) {
          obj['jrnl_type'] = this.final_res[i]['jrnl_type']
        } else {
          obj['jrnl_type'] = '  '

        }
        if (this.final_res[i]['ind']) {
          if (this.final_res[i]['bal']) {
            obj['bal'] = this.final_res[i]['bal'] + '(' + this.final_res[i]['ind'] + ')'
          } else {
            if (i == this.final_res.length - 1) {
              obj['bal'] = ''
            } else {
              obj['bal'] = ''
            }
          }
        } else {
          if (this.final_res[i]['bal']) {
            obj['bal'] = this.final_res[i]['bal']
          } else {
            if (i == this.final_res.length - 1) {
              obj['bal'] = ''
            } else {
              obj['bal'] = ''
            }
          }
        }
        data.push(obj)
      }
      // ------------
      var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
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
      var header0 = {
        columns: [
          {
            width: '*',
            text: 'BANK BOOK REPORT',
            bold: true,
            alignment: 'center'
          }

        ],
      }
      var header1 = {
        columns: [
          {
            width: '*',
            text: 'Chart Of Account :',
            bold: true
          },

          {
            width: '*',
            text: this.objData['desc']
          },
          {
            width: '*',
            text: 'Financial Year :',
            bold: true
          },

          {
            width: '*',
            text: this.obj['fin_year']
          }

        ],
      }
      var header2 = {
        columns: [
          {
            width: '*',
            text: 'From Date :',
            bold: true
          },
          {
            width: '*',
            text: this.mainService.dateFormatChange(this.obj['from_accounting_dt'])


          },
          {
            width: '*',
            text: 'To Date :',
            bold: true
          },

          {
            width: '*',
            text: this.mainService.dateFormatChange(this.obj['to_accounting_dt'])
          }
        ],
      }
      var header3 = {
        columns: [

          {
            width: '*',
            text: 'Bank Name :',
            bold: true
          },
          {
            width: '*',
            text: this.mainService.codeValueShowObj['ACC0006'][this.objData2['bank_code']]
          },
          {
            width: '*',
            text: 'Bank Branch :',
            bold: true
          },
          {
            width: '*',
            text: this.mainService.codeValueShowObj['ACC0007'][this.objData2['branch_code']]
          }
        ],
      }
      var header4 = {
        columns: [

          {
            width: '*',
            text: 'Account Number :',
            bold: true
          },
          {
            width: '*',
            text: this.objData2['bank_acct_no']
          },
          {
            width: '*',
            text: '',
            bold: true
          },

          {
            width: '*',
            text: ''
          }
        ],
      }
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
      dd.content.push({ text: " " });
      dd.content.push(header0);
      dd.content.push({ text: " " });
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
      dd.content.push({ text: " " });
      dd.content.push(header1);
      dd.content.push({ text: " " });
      dd.content.push(header2);
      dd.content.push({ text: " " });
      dd.content.push(header3);
      dd.content.push({ text: " " });
      dd.content.push(header4);
      dd.content.push({ text: " " });
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
      var tbl = {

        // layout: 'lightHorizontalLines',
        fontSize: 10,
        table: {

          headerRows: 1,
          widths: ['*', '*', '*', '*', '*', '*', '*'],
          body: [
            ['Date', 'Particulars', 'Voucher Type', 'Voucher Number', { text: 'Debit(DR)', alignment: 'right' }, { text: 'Credit(CR)', alignment: 'right' }, { text: 'Balance', alignment: 'right' }]
          ],

        }
      };
      dd.content.push(tbl);
      for (var i = 0; i < data.length; i++) {
        var arr = []
        arr.push(data[i]['acct_dt']);
        arr.push(data[i]['jrnl_desc']);
        arr.push(data[i]['jrnl_type']);
        arr.push(data[i]['jrnl_id']);
        arr.push({ text: data[i]['db'], alignment: 'right' });
        arr.push({ text: data[i]['cr'], alignment: 'right' });
        arr.push({ text: data[i]['bal'], alignment: 'right' });
        dd.content[dd.content.length - 1].table.body.push(arr);
      }
      this.spinner.hide()
      pdfMake.createPdf(dd).download("bankBook");
    } else {
      this.spinner.hide()
      swal.fire('There Is No Record To Display', '', 'info')
    }
  }
}
