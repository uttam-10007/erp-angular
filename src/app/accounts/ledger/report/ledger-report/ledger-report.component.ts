import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { ChartOfAccountService } from '../../../service/chart-of-account.service';
import { SettingService } from '../../../service/setting.service'
import { MainService } from '../../../service/main.service';
import { LedgerService } from '../../../service/ledger.service'
import Swal from 'sweetalert2';
import pdfMake from "pdfmake/build/pdfmake";

import { ExcelService } from '../../../service/file-export.service';
import pdfFonts from "pdfmake/build/vfs_fonts"
import { identity } from 'rxjs';

@Component({
  selector: 'app-ledger-report',
  templateUrl: './ledger-report.component.html',
  styleUrls: ['./ledger-report.component.css']
})
export class LedgerReportComponent implements OnInit {

  constructor(private excel:ExcelService,private ChartOfAccountService: ChartOfAccountService,private mainService:MainService, private ledgerService: LedgerService, private spinner: NgxSpinnerService, private settingService: SettingService) { }
  erpUser;
  b_acct_id;
  allParty = []
  obj = {}
  C_acc = []
  bal = []
  acount_name=''

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    // this.httpUrl = this.mainService.httpUrl;
    await this.getAllChartOfAccount()
    await this.getAllParties()
    await this.getFinYear()
    this.acount_name=this.mainService.accInfo['account_name']
  }
  res = []
  first_dropdown = []
 
  async getAllChartOfAccount() {
    this.spinner.show()
    let count, start;
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ChartOfAccountService.getchartofaccount(obj);
    if (resp['error'] == false) {
      this.C_acc = resp['data'];
      this.change_c_acc();     
      this.spinner.hide();
    } else {
      this.spinner.hide()
    }
  }
  
  obj_exp = {}
  assets=[];
  liability=[];
  equity=[];
  income=[];
  expense=[];
  change_c_acc() {
    this.assets=this.C_acc;
    this.liability=this.C_acc;
    this.equity=this.C_acc;
    this.income=this.C_acc;
    this.expense=this.C_acc;
    // for (let i = 0; i < this.C_acc.length; i++) {
    //   if (this.C_acc[i]['lvl2_value'] == 'EQUITY') {
    //     this.equity.push(this.C_acc[i])
    //   }
    //   if (this.C_acc[i]['lvl2_value'] == 'ASSET') {
    //     this.assets.push(this.C_acc[i])
    //   }
    //   if (this.C_acc[i]['lvl2_value'] == 'LIABILITY') {
    //     this.liability.push(this.C_acc[i])
    //   }
    //   if (this.C_acc[i]['lvl2_value'] == 'INCOME') {
    //     this.income.push(this.C_acc[i])
    //   }
    //   if (this.C_acc[i]['lvl2_value'] == 'EXPENSE') {
    //     this.expense.push(this.C_acc[i])
    //   }

    // }

  }





 
  cureent_year = []
  async getFinYear() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getAllFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.cureent_year = resp['data']
      this.spinner.hide();
      for (let i = 0; i < this.cureent_year.length; i++) {
        if (this.cureent_year[i]['status'] == 'ACTIVE') {
          this.obj['fin_year'] = this.cureent_year[i]['fin_year']
          this.obj_lia['fin_year'] = this.cureent_year[i]['fin_year']
          this.obj_ass['fin_year'] = this.cureent_year[i]['fin_year']
          this.obj_exp['fin_year'] = this.cureent_year[i]['fin_year']
          this.obj_rev['fin_year'] = this.cureent_year[i]['fin_year']
        }
      }

    } else {
      this.spinner.hide()

    }
  }
  async getAllParties() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getPartyInfoNew(this.b_acct_id);
    if (resp['error'] == false) {
      this.allParty = resp.data;

    } else {
      this.spinner.hide();
    }
  }
  obj_lia = {}
  result = []
  final_res = []
  res_obj = {}
  result1 = []
  total = 0
  async show() {
    this.final_res = []
    this.total = 0
    this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id
    this.obj['from_accounting_dt'] = this.obj['from_date']
    this.obj['to_accounting_dt'] = this.obj['to_date']
    this.obj['chart_of_account'] = this.obj['c_acc'];
    for(var i=0;i<this.C_acc.length;i++){
      if(this.C_acc[i]['leaf_code']==this.obj['c_acc']){
        this.obj['acc_desc'] = this.C_acc[i]['leaf_value']
      }
    }
    this.obj['arr_id'] = this.obj['party_id']
    var resp = await this.ledgerService.getLedgerReport(JSON.stringify(this.obj))
    if (resp['error'] == false) {
      this.res_obj = this.obj
      this.result = resp['data']
      var openObj={};
      openObj['acct_dt'] = this.obj['from_date'];
      openObj['jrnl_desc'] = "Opening Balance";
      openObj['jrnl_type'] = "";
      openObj['jrnl_id'] = "";
      openObj['db'] = 0;
      openObj['cr'] = 0;
      
      

      for (let i = 0; i < this.result[1].length; i++) {
        if (this.result[1][i]['db_cd_ind'] == 'DB') {
          openObj['db'] += this.result[1][i]['txn_amt']
         
        } else {
          
          openObj['cr'] += this.result[1][i]['txn_amt']
        }
       
      }
      if(openObj['db']>=openObj['cr']){
        openObj['db'] = openObj['db'] - openObj['cr'];
        openObj['cr'] =0;
      }else{
        openObj['cr'] = openObj['cr'] - openObj['db'];
        openObj['db'] =0;
      }
      this.final_res.push(openObj);

      for (let i = 0; i < this.result[0].length; i++) {
        if (this.result[0][i]['db_cd_ind'] == 'DB') {
          this.result[0][i]['db'] = this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = 0
          this.total = this.total - this.result[0][i]['txn_amt']
        } else {
          this.total = this.total + this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
          this.result[0][i]['db'] = 0
        }
        this.final_res.push(this.result[0][i])
      }
      let dum = {}
      let db = 0
      let cr = 0
      for (let i = 0; i < this.final_res.length; i++) {
        db = db + this.final_res[i]['db']
        cr = cr + this.final_res[i]['cr']
      }

      dum['cr'] = cr
      dum['db'] = db
      dum['jrnl_desc'] = 'Total'
      this.final_res.push(dum)
      let dum2 = {}
      let s=0;
      if (db < cr) {
        s = cr - db
        dum2['db'] = s
      } else {
        s = db - cr
        dum2['cr'] = s
      }
      dum2['jrnl_desc']='Closing Balance'
      let dum3={}
      if(db >cr){
        dum3['db']=db
      dum3['cr']=s+cr
      }
      else{
        dum3['db']=s+db
      dum3['cr']=cr
      }

      this.final_res.push(dum2)
      this.final_res.push(dum3)

      this.spinner.hide()
    }



    else {
      this.spinner.hide()
      Swal.fire('Error', 'Some Error Occured', 'error')
    }
  }
  // ---------print
  export1(){
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

      exp.push(obj);
    }
    this.excel.exportAsExcelFile(exp, 'Equity_report')
  }
  export2(){
    var exp = []
    for (var i = 0; i < this.final_res2.length; i++) {
      var obj = new Object();
      if(this.final_res2[i]['acct_dt']){
        obj['Date'] =this.mainService.dateFormatChange(this.final_res2[i]['acct_dt']);
      }else{
        obj['Date'] = this.final_res2[i]['acct_dt'];
      }      obj['Particulars'] = this.final_res2[i]['jrnl_desc']
      obj['Voucher Type'] = this.final_res2[i]['jrnl_type']

      obj['Voucher Number'] = this.final_res2[i]['jrnl_id']
      obj['Debit(Dr)'] = this.final_res2[i]['db']
      obj['Credit(Cr)'] = this.final_res2[i]['cr']

      exp.push(obj);
    }
    this.excel.exportAsExcelFile(exp, 'Liability_report')
  }
  export3(){
    var exp = []
    for (var i = 0; i < this.final_res3.length; i++) {
      var obj = new Object();
      if(this.final_res3[i]['acct_dt']){
        obj['Date'] =this.mainService.dateFormatChange(this.final_res3[i]['acct_dt']);
      }else{
        obj['Date'] = this.final_res3[i]['acct_dt'];
      }
      obj['Particulars'] = this.final_res3[i]['jrnl_desc']
      obj['Voucher Type'] = this.final_res3[i]['jrnl_type']

      obj['Voucher Number'] = this.final_res3[i]['jrnl_id']
      obj['Debit(Dr)'] = this.final_res3[i]['db']
      obj['Credit(Cr)'] = this.final_res3[i]['cr']

      exp.push(obj);
    }
    this.excel.exportAsExcelFile(exp, 'Asset_report')
  }
  export4(){
    var exp = []
    for (var i = 0; i < this.final_res4.length; i++) {
      var obj = new Object();
      if(this.final_res4[i]['acct_dt']){
        obj['Date'] =this.mainService.dateFormatChange(this.final_res4[i]['acct_dt']);
      }else{
        obj['Date'] = this.final_res4[i]['acct_dt'];
      }      obj['Particulars'] = this.final_res4[i]['jrnl_desc']
      obj['Voucher Type'] = this.final_res4[i]['jrnl_type']

      obj['Voucher Number'] = this.final_res4[i]['jrnl_id']
      obj['Debit(Dr)'] = this.final_res4[i]['db']
      obj['Credit(Cr)'] = this.final_res4[i]['cr']
      exp.push(obj);
    }
    this.excel.exportAsExcelFile(exp, 'Expense_report')
  }
  export5(){
    var exp = []
    for (var i = 0; i < this.final_res5.length; i++) {
      var obj = new Object();
      if(this.final_res5[i]['acct_dt']){
        obj['Date'] =this.mainService.dateFormatChange(this.final_res5[i]['acct_dt']);
      }else{
        obj['Date'] = this.final_res5[i]['acct_dt'];
      }      obj['Particulars'] = this.final_res5[i]['jrnl_desc']
      obj['Voucher Type'] = this.final_res5[i]['jrnl_type']

      obj['Voucher Number'] = this.final_res5[i]['jrnl_id']
      obj['Debit(Dr)'] = this.final_res5[i]['db']
      obj['Credit(Cr)'] = this.final_res5[i]['cr']
    

      exp.push(obj);
    }
    this.excel.exportAsExcelFile(exp, 'Income_report')
  }

  async print1() {
     this.spinner.show()
    let data = []
  if(this.final_res.length>1){
    for (let i = 0; i < this.final_res.length; i++) {
      let obj = {}
      if (this.final_res[i]['acct_dt']) {
        obj['acct_dt'] = this.mainService.dateFormatChange(this.final_res[i]['acct_dt'])
      } else {
        obj['acct_dt'] = ''
      }
      if (this.final_res[i]['db']) {
        obj['db'] = this.final_res[i]['db']
      } else {
        obj['db'] = 0
      }
      if (this.final_res[i]['cr']) {
        obj['cr'] = this.final_res[i]['cr']
      } else {
        obj['cr'] = 0
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
      data.push(obj)
    }
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
    // Liabilities ({{obj_lia['acc_desc']}})
    var header0 = {
      columns: [
              {
          width: '*',
          text: 'Equity (' +this.obj['acc_desc']+')',
          alignment:'center'
          
        },
       
        
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
          text:this.obj['acc_desc']
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
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*','*', '*'],
        body: [
          ['Date', 'Particulars', 'Voucher Type', 'Voucher Number','Debit(Dr)','Credit(Cr)']
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
      arr.push({ text: data[i]['db'] , alignment: 'right' });      
      arr.push({ text: data[i]['cr'] , alignment: 'right' });   
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    pdfMake.createPdf(dd).download("equityReport");
    this.spinner.hide()
  }else{
    this.spinner.hide()
    Swal.fire('There Is No Record To Display','','info')
  }
  }

  res_obj2 = {}
  final_res2 = []
  async show2() {
    this.final_res2 = []
    this.total = 0
    this.spinner.show()
    this.obj_lia['b_acct_id'] = this.b_acct_id
    this.obj_lia['from_accounting_dt'] = this.obj_lia['from_date']
    this.obj_lia['to_accounting_dt'] = this.obj_lia['to_date']
    this.obj_lia['chart_of_account'] = this.obj_lia['c_acc']
    for(var i=0;i<this.C_acc.length;i++){
      if(this.C_acc[i]['leaf_code']==this.obj_lia['c_acc']){
        this.obj_lia['acc_desc'] = this.C_acc[i]['leaf_value']
      }
    }
    this.obj_lia['arr_id'] = this.obj_lia['party_id']
    var resp = await this.ledgerService.getLedgerReport(JSON.stringify(this.obj_lia))
    if (resp['error'] == false) {
      this.res_obj2 = this.obj_lia
      this.result = resp['data']
      var openObj={};
      openObj['acct_dt'] = this.obj_lia['from_date'];
      openObj['jrnl_desc'] = "Opening Balance";
      openObj['jrnl_type'] = "";
      openObj['jrnl_id'] = "";
      openObj['db'] = 0;
      openObj['cr'] = 0;
      
      

      for (let i = 0; i < this.result[1].length; i++) {
        if (this.result[1][i]['db_cd_ind'] == 'DB') {
          openObj['db'] += this.result[1][i]['txn_amt']
         
        } else {
          
          openObj['cr'] += this.result[1][i]['txn_amt']
        }
       
      }
      if(openObj['db']>=openObj['cr']){
        openObj['db'] = openObj['db'] - openObj['cr'];
        openObj['cr'] =0;
      }else{
        openObj['cr'] = openObj['cr'] - openObj['db'];
        openObj['db'] =0;
      }
      this.final_res2.push(openObj);
      for (let i = 0; i < this.result[0].length; i++) {
        if (this.result[0][i]['db_cd_ind'] == 'DB') {
          this.result[0][i]['db'] = this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = 0
          this.total = this.total - this.result[0][i]['txn_amt']
        } else {
          this.total = this.total + this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
          this.result[0][i]['db'] = 0
        }

       // this.result[0][i]['jrnl_desc'] = ''
       // this.result[0][i]['acct_dt'] = this.obj_lia['from_date']
        this.final_res2.push(this.result[0][i])
      }
      let dum = {}
      let db = 0
      let cr = 0
      for (let i = 0; i < this.final_res2.length; i++) {
        db = db + this.final_res2[i]['db']
        cr = cr + this.final_res2[i]['cr']
      }

      dum['cr'] = cr
      dum['db'] = db
      dum['jrnl_desc'] = 'Total'
      this.final_res2.push(dum)
      let dum2 = {}
      let s=0;
      if (db < cr) {
        s = cr - db
        dum2['db'] = s
      } else {
        s = db - cr
        dum2['cr'] = s
      }
      dum2['jrnl_desc']='Closing Balance'
      let dum3={}
      if(db >cr){
        dum3['db']=db
      dum3['cr']=s+cr
      }
      else{
        dum3['db']=s+db
      dum3['cr']=cr
      }
      this.final_res2.push(dum2)
      this.final_res2.push(dum3)

      this.spinner.hide()
    }



    else {
      this.spinner.hide()
      Swal.fire('Error', 'Some Error Occured', 'error')
    }
  }
  async print2() {
    this.spinner.show()
    let data = []
  if(this.final_res2.length>1){
    for (let i = 0; i < this.final_res2.length; i++) {
      let obj = {}
      if (this.final_res2[i]['acct_dt']) {
        obj['acct_dt'] = this.mainService.dateFormatChange(this.final_res2[i]['acct_dt'])
      } else {
        obj['acct_dt'] = ''
      }
      if (this.final_res2[i]['db']) {
        obj['db'] = this.final_res2[i]['db']
      } else {
        obj['db'] = 0
      }
      if (this.final_res2[i]['cr']) {
        obj['cr'] = this.final_res2[i]['cr']
      } else {
        obj['cr'] = 0
      }
      if (this.final_res2[i]['jrnl_desc']) {
        obj['jrnl_desc'] = this.final_res2[i]['jrnl_desc']
      } else {
        obj['jrnl_desc'] = '  '
      }
      if (this.final_res2[i]['jrnl_id']) {
        obj['jrnl_id'] = this.final_res2[i]['jrnl_id']
      } else {
        obj['jrnl_id'] = '  '
      }
      if (this.final_res2[i]['jrnl_type']) {
        obj['jrnl_type'] = this.final_res2[i]['jrnl_type']
      } else {
        obj['jrnl_type'] = '  '

      }
      data.push(obj)
    }
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
    // Liabilities ({{obj_lia['acc_desc']}})
    var header0 = {
      columns: [
              {
          width: '*',
          text: 'Liabilities (' +this.obj_lia['acc_desc']+')',
          alignment:'center'
          
        },
       
        
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
          text:this.obj_lia['acc_desc']
        },
        {
          width: '*',
          text: 'Financial Year :',
          bold: true
        },

        {
          width: '*',
          text: this.obj_lia['fin_year']
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
          text: this.mainService.dateFormatChange(this.obj_lia['from_accounting_dt'])


        },
        {
          width: '*',
          text: 'To Date :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.dateFormatChange(this.obj_lia['to_accounting_dt'])
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
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*','*', '*'],
        body: [
          ['Date', 'Particulars', 'Voucher Type', 'Voucher Number','Debit(Dr)','Credit(Cr)']
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
      arr.push({ text: data[i]['db'] , alignment: 'right' });      
      arr.push({ text: data[i]['cr'] , alignment: 'right' });   
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    pdfMake.createPdf(dd).download("liabilityReport");
    this.spinner.hide()
  }else{
    this.spinner.hide()
    Swal.fire('There Is No Record To Display','','info')
  }
  }
  final_res3 = []
  obj_ass = {}
  async show3() {
    this.final_res3 = []
    this.total = 0
    this.spinner.show()
    this.obj_ass['b_acct_id'] = this.b_acct_id
    this.obj_ass['from_accounting_dt'] = this.obj_ass['from_date']
    this.obj_ass['to_accounting_dt'] = this.obj_ass['to_date']
    this.obj_ass['chart_of_account'] = this.obj_ass['c_acc']
    for(var i=0;i<this.C_acc.length;i++){
      if(this.C_acc[i]['leaf_code']==this.obj_ass['c_acc']){
        this.obj_ass['acc_desc'] = this.C_acc[i]['leaf_value']
      }
    }
    this.obj_ass['arr_id'] = this.obj_ass['party_id']
    var resp = await this.ledgerService.getLedgerReport(JSON.stringify(this.obj_ass))
    if (resp['error'] == false) {
      this.res_obj2 = this.obj_ass
      this.result = resp['data']
      var openObj={};
      openObj['acct_dt'] = this.obj_ass['from_date'];
      openObj['jrnl_desc'] = "Opening Balance";
      openObj['jrnl_type'] = "";
      openObj['jrnl_id'] = "";
      openObj['db'] = 0;
      openObj['cr'] = 0;
      
      

      for (let i = 0; i < this.result[1].length; i++) {
        if (this.result[1][i]['db_cd_ind'] == 'DB') {
          openObj['db'] += this.result[1][i]['txn_amt']
         
        } else {
          
          openObj['cr'] += this.result[1][i]['txn_amt']
        }
       
      }
      if(openObj['db']>=openObj['cr']){
        openObj['db'] = openObj['db'] - openObj['cr'];
        openObj['cr'] =0;
      }else{
        openObj['cr'] = openObj['cr'] - openObj['db'];
        openObj['db'] =0;
      }
      this.final_res3.push(openObj);
      for (let i = 0; i < this.result[0].length; i++) {
        if (this.result[0][i]['db_cd_ind'] == 'DB') {
          this.result[0][i]['db'] = this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = 0
          this.total = this.total - this.result[0][i]['txn_amt']
        } else {
          this.total = this.total + this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
          this.result[0][i]['db'] = 0
        }
        this.final_res3.push(this.result[0][i])
      }
      let dum = {}
      let db = 0
      let cr = 0
      for (let i = 0; i < this.final_res3.length; i++) {
        db = db + this.final_res3[i]['db']
        cr = cr + this.final_res3[i]['cr']
      }

      dum['cr'] = cr
      dum['db'] = db
      dum['jrnl_desc'] = 'Total'
      this.final_res3.push(dum)
      let dum2 = {}
      let s=0;
      if (db < cr) {
        s = cr - db
        dum2['db'] = s
      } else {
        s = db - cr
        dum2['cr'] = s
      }
      dum2['jrnl_desc']='Closing Balance'
      let dum3={}
      if(db >cr){
        dum3['db']=db
      dum3['cr']=s+cr
      }
      else{
        dum3['db']=s+db
      dum3['cr']=cr
      }
      this.final_res3.push(dum2)
      this.final_res3.push(dum3)

      this.spinner.hide()
    }



    else {
      this.spinner.hide()
      Swal.fire('Error', 'Some Error Occured', 'error')
    }
  }
  async print3() {
    this.spinner.show()
    let data = []
  if(this.final_res3.length>1){
    for (let i = 0; i < this.final_res3.length; i++) {
      let obj = {}
      if (this.final_res3[i]['acct_dt']) {
        obj['acct_dt'] = this.mainService.dateFormatChange(this.final_res3[i]['acct_dt'])
      } else {
        obj['acct_dt'] = ''
      }
      if (this.final_res3[i]['db']) {
        obj['db'] = this.final_res3[i]['db']
      } else {
        obj['db'] = 0
      }
      if (this.final_res3[i]['cr']) {
        obj['cr'] = this.final_res3[i]['cr']
      } else {
        obj['cr'] = 0
      }
      if (this.final_res3[i]['jrnl_desc']) {
        obj['jrnl_desc'] = this.final_res3[i]['jrnl_desc']
      } else {
        obj['jrnl_desc'] = '  '
      }
      if (this.final_res3[i]['jrnl_id']) {
        obj['jrnl_id'] = this.final_res3[i]['jrnl_id']
      } else {
        obj['jrnl_id'] = '  '
      }
      if (this.final_res3[i]['jrnl_type']) {
        obj['jrnl_type'] = this.final_res3[i]['jrnl_type']
      } else {
        obj['jrnl_type'] = '  '

      }
      data.push(obj)
    }
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
    // Liabilities ({{obj_lia['acc_desc']}})
    var header0 = {
      columns: [
              {
          width: '*',
          text: 'Assets (' +this.obj_ass['acc_desc']+')',
          alignment:'center'
          
        },
       
        
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
          text:this.obj_ass['acc_desc']
        },
        {
          width: '*',
          text: 'Financial Year :',
          bold: true
        },

        {
          width: '*',
          text: this.obj_ass['fin_year']
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
          text: this.mainService.dateFormatChange(this.obj_ass['from_accounting_dt'])


        },
        {
          width: '*',
          text: 'To Date :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.dateFormatChange(this.obj_ass['to_accounting_dt'])
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
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*','*', '*'],
        body: [
          ['Date', 'Particulars', 'Voucher Type', 'Voucher Number','Debit(Dr)','Credit(Cr)']
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
      arr.push({ text: data[i]['db'] , alignment: 'right' });      
      arr.push({ text: data[i]['cr'] , alignment: 'right' });   
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    pdfMake.createPdf(dd).download("assetReport");
    this.spinner.hide()
  }else{
    this.spinner.hide()
    Swal.fire('There Is No Record To Display','','info')
  }
  }
  final_res4 = []

  async show4() {
    this.final_res4 = []
    this.total = 0
    this.spinner.show()
    this.obj_exp['b_acct_id'] = this.b_acct_id
    this.obj_exp['from_accounting_dt'] = this.obj_exp['from_date']
    this.obj_exp['to_accounting_dt'] = this.obj_exp['to_date']
    this.obj_exp['chart_of_account'] = this.obj_exp['c_acc']
    for(var i=0;i<this.C_acc.length;i++){
      if(this.C_acc[i]['leaf_code']==this.obj_exp['c_acc']){
        this.obj_exp['acc_desc'] = this.C_acc[i]['leaf_value']
      }
    }
    this.obj_exp['arr_id'] = this.obj_exp['party_id']
    var resp = await this.ledgerService.getLedgerReport(JSON.stringify(this.obj_exp))
    if (resp['error'] == false) {
      this.res_obj2 = this.obj_exp
      this.result = resp['data']
     
      for (let i = 0; i < this.result[0].length; i++) {
        if (this.result[0][i]['db_cd_ind'] == 'DB') {
          this.result[0][i]['db'] = this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = 0
          this.total = this.total - this.result[0][i]['txn_amt']
        } else {
          this.total = this.total + this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
          this.result[0][i]['db'] = 0
        }

        //this.result[0][i]['jrnl_desc'] = ''
       // this.result[0][i]['acct_dt'] = this.obj_exp['from_date']
        this.final_res4.push(this.result[0][i])
      }
      let dum = {}
      let db = 0
      let cr = 0
      for (let i = 0; i < this.final_res4.length; i++) {
        db = db + this.final_res4[i]['db']
        cr = cr + this.final_res4[i]['cr']
      }

      dum['cr'] = cr
      dum['db'] = db
      dum['jrnl_desc'] = 'Total'
      this.final_res4.push(dum)
      let dum2 = {}
      let s=0;
      if (db < cr) {
        s = cr - db
        dum2['db'] = s
      } else {
        s = db - cr
        dum2['cr'] = s
      }
      dum2['jrnl_desc']='To Closing Balance'
      let dum3={}
      if(db >cr){
        dum3['db']=db
      dum3['cr']=s+cr
      }
      else{
        dum3['db']=s+db
      dum3['cr']=cr
      }
      this.final_res4.push(dum2)
      this.final_res4.push(dum3)


      this.spinner.hide()
    }



    else {
      this.spinner.hide()
      Swal.fire('Error', 'Some Error Occured', 'error')
    }
  }
  async print4() {
    this.spinner.show()
    let data = []
  if(this.final_res4.length>1){
    for (let i = 0; i < this.final_res4.length; i++) {
      let obj = {}
      if (this.final_res4[i]['acct_dt']) {
        obj['acct_dt'] = this.mainService.dateFormatChange(this.final_res4[i]['acct_dt'])
      } else {
        obj['acct_dt'] = ''
      }
      if (this.final_res4[i]['db']) {
        obj['db'] = this.final_res4[i]['db']
      } else {
        obj['db'] = 0
      }
      if (this.final_res4[i]['cr']) {
        obj['cr'] = this.final_res4[i]['cr']
      } else {
        obj['cr'] = 0
      }
      if (this.final_res4[i]['jrnl_desc']) {
        obj['jrnl_desc'] = this.final_res4[i]['jrnl_desc']
      } else {
        obj['jrnl_desc'] = '  '
      }
      if (this.final_res4[i]['jrnl_id']) {
        obj['jrnl_id'] = this.final_res4[i]['jrnl_id']
      } else {
        obj['jrnl_id'] = '  '
      }
      if (this.final_res4[i]['jrnl_type']) {
        obj['jrnl_type'] = this.final_res4[i]['jrnl_type']
      } else {
        obj['jrnl_type'] = '  '

      }
      data.push(obj)
    }
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
    // Liabilities ({{obj_lia['acc_desc']}})
    var header0 = {
      columns: [
              {
          width: '*',
          text: 'Expence (' +this.obj_exp['acc_desc']+')',
          alignment:'center'
          
        },
       
        
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
          text:this.obj_exp['acc_desc']
        },
        {
          width: '*',
          text: 'Financial Year :',
          bold: true
        },

        {
          width: '*',
          text: this.obj_exp['fin_year']
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
          text: this.mainService.dateFormatChange(this.obj_exp['from_accounting_dt'])


        },
        {
          width: '*',
          text: 'To Date :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.dateFormatChange(this.obj_exp['to_accounting_dt'])
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
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*','*', '*'],
        body: [
          ['Date', 'Particulars', 'Voucher Type', 'Voucher Number','Debit(Dr)','Credit(Cr)']
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
      arr.push({ text: data[i]['db'] , alignment: 'right' });      
      arr.push({ text: data[i]['cr'] , alignment: 'right' });   
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    pdfMake.createPdf(dd).download("expenceReport");
    this.spinner.hide()
  }else{
    this.spinner.hide()
    Swal.fire('There Is No Record To Display','','info')
  }
  }
  obj_rev = {}
  final_res5 = []
  final5 = []
  async show5() {
    this.final_res5 = []
    this.total = 0
    this.spinner.show()
    this.obj_rev['b_acct_id'] = this.b_acct_id
    this.obj_rev['from_accounting_dt'] = this.obj_rev['from_date']
    this.obj_rev['to_accounting_dt'] = this.obj_rev['to_date']
    this.obj_rev['chart_of_account'] = this.obj_rev['c_acc']
    for(var i=0;i<this.C_acc.length;i++){
      if(this.C_acc[i]['leaf_code']==this.obj_rev['c_acc']){
        this.obj_rev['acc_desc'] = this.C_acc[i]['leaf_value']
      }
    }
    this.obj_rev['arr_id'] = this.obj_rev['party_id']
    var resp = await this.ledgerService.getLedgerReport(JSON.stringify(this.obj_rev))
    if (resp['error'] == false) {
      this.res_obj2 = this.obj_rev
      this.result = resp['data']
      
     
      for (let i = 0; i < this.result[0].length; i++) {
        if (this.result[0][i]['db_cd_ind'] == 'DB') {
          this.result[0][i]['db'] = this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = 0
          this.total = this.total - this.result[0][i]['txn_amt']
        } else {
          this.total = this.total + this.result[0][i]['txn_amt']
          this.result[0][i]['cr'] = this.result[0][i]['txn_amt']
          this.result[0][i]['db'] = 0
        }

        //this.result[0][i]['jrnl_desc'] = ''
        //this.result[0][i]['acct_dt'] = this.obj_rev['from_date']
        this.final_res5.push(this.result[0][i])
      }
      let dum = {}
      let db = 0
      let cr = 0
      for (let i = 0; i < this.final_res5.length; i++) {
        db = db + this.final_res5[i]['db']
        cr = cr + this.final_res5[i]['cr']
      }

      dum['cr'] = cr
      dum['db'] = db
      dum['jrnl_desc'] = 'Total'
      this.final_res5.push(dum)
      let dum2 = {}
      let s=0;
      if (db < cr) {
        s = cr - db
        dum2['db'] = s
      } else {
        s = db - cr
        dum2['cr'] = s
      }
      dum2['jrnl_desc']='To Closing Balance'
      let dum3={}
      if(db >cr){
        dum3['db']=db
      dum3['cr']=s+cr
      }
      else{
        dum3['db']=s+db
      dum3['cr']=cr
      }
      this.final_res5.push(dum2)
      this.final_res5.push(dum3)


      this.spinner.hide()
    }



    else {
      this.spinner.hide()
      Swal.fire('Error', 'Some Error Occured', 'error')
    }
  }
  async print5() {
    this.spinner.show()
    let data = []
  if(this.final_res5.length>1){
    for (let i = 0; i < this.final_res5.length; i++) {
      let obj = {}
      if (this.final_res5[i]['acct_dt']) {
        obj['acct_dt'] = this.mainService.dateFormatChange(this.final_res5[i]['acct_dt'])
      } else {
        obj['acct_dt'] = ''
      }
      if (this.final_res5[i]['db']) {
        obj['db'] = this.final_res5[i]['db']
      } else {
        obj['db'] = 0
      }
      if (this.final_res5[i]['cr']) {
        obj['cr'] = this.final_res5[i]['cr']
      } else {
        obj['cr'] = 0
      }
      if (this.final_res5[i]['jrnl_desc']) {
        obj['jrnl_desc'] = this.final_res5[i]['jrnl_desc']
      } else {
        obj['jrnl_desc'] = '  '
      }
      if (this.final_res5[i]['jrnl_id']) {
        obj['jrnl_id'] = this.final_res5[i]['jrnl_id']
      } else {
        obj['jrnl_id'] = '  '
      }
      if (this.final_res5[i]['jrnl_type']) {
        obj['jrnl_type'] = this.final_res5[i]['jrnl_type']
      } else {
        obj['jrnl_type'] = '  '

      }
      data.push(obj)
    }
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
    // Liabilities ({{obj_lia['acc_desc']}})
    var header0 = {
      columns: [
              {
          width: '*',
          text: 'Income (' +this.obj_rev['acc_desc']+')',
          alignment:'center'
          
        },
       
        
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
          text:this.obj_rev['acc_desc']
        },
        {
          width: '*',
          text: 'Financial Year :',
          bold: true
        },

        {
          width: '*',
          text: this.obj_rev['fin_year']
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
          text: this.mainService.dateFormatChange(this.obj_rev['from_accounting_dt'])


        },
        {
          width: '*',
          text: 'To Date :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.dateFormatChange(this.obj_rev['to_accounting_dt'])
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
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    var tbl = {
      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*','*', '*'],
        body: [
          ['Date', 'Particulars', 'Voucher Type', 'Voucher Number','Debit(Dr)','Credit(Cr)']
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
      arr.push({ text: data[i]['db'] , alignment: 'right' });      
      arr.push({ text: data[i]['cr'] , alignment: 'right' });      

      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    pdfMake.createPdf(dd).download("incomeReport");
    this.spinner.hide()
  }else{
    this.spinner.hide()
    Swal.fire('There Is No Record To Display','','info')
  }
  }
}
