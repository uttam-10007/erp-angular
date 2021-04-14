import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { ChartOfAccountService } from '../../../service/chart-of-account.service';
import { SettingService } from '../../../service/setting.service'
import { MainService } from '../../../service/main.service';
import { LedgerService } from '../../../service/ledger.service'
import Swal from 'sweetalert2';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ExcelService } from '../../../service/file-export.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-all-ded-report',
  templateUrl: './all-ded-report.component.html',
  styleUrls: ['./all-ded-report.component.css']
})
export class AllDedReportComponent implements OnInit {

  erpUser;
  b_acct_id;
  allParty = []
  obj = {};
  deduction_type;
  constructor(private ChartOfAccountService: ChartOfAccountService, public mainService: MainService, private excl: ExcelService, private ledgerService: LedgerService, private spinner: NgxSpinnerService, private settingService: SettingService) { }
  acount_name = ''
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.acount_name = this.mainService.accInfo['account_name']
    await this.getHSNAccount();
    
    await this.getAllParties();
  }

  reportdata = []
  async getreportoutput() {
    //this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getGstOutputReport(JSON.stringify(this.obj))
    if (resp['error'] == false) {
      var arr = resp['data'];
      this.reportdata = []
      for (let i = 0; i < arr.length; i++) {
        var data = JSON.parse(arr[i]['data']);
        for (let j = 0; j < data['payable_rows'].length; j++) {
          data['payable_rows'][j]['party_name'] = arr[i]['party_name']
          data['payable_rows'][j]['gstin_no'] = arr[i]['gstin_no']
          for (let k = 0; k < data['payable_rows'][j]['ded'].length; k++) {
            if (data['payable_rows'][j]['ded'][k]['deduction_type'] == this.deduction_type) {
              var obj1 = Object()
              obj1['party_name'] = arr[i]['party_name']
              obj1['party_id'] = arr[i]['party_id']
              obj1['gstin_no'] = arr[i]['gstin_no']
              if (arr[i]['cb_date']) {
                obj1['cb_date'] = arr[i]['cb_date'].split('T')[0]
              } else {
                obj1['cb_date'] = ''
              }
              obj1['amount'] = data['payable_rows'][j]['amount']
              obj1['gov_rule'] = data['payable_rows'][j]['ded'][k]['gov_rule']


              if (data['payable_rows'][j]['ded'][k]['amt_type'] == 'percentage') {
                obj1['rate'] = "PERCENTAGE ("+data['payable_rows'][j]['ded'][k]['ded_amount']+" % )"
                obj1['amt_type'] = data['payable_rows'][j]['ded'][k]['amt_type']
                obj1['deduction_amount'] = ((data['payable_rows'][j]['ded'][k]['ded_amount']) * obj1['amount']) / 100
              } else {
                obj1['rate'] = "FIXED ("+data['payable_rows'][j]['ded'][k]['ded_amount']+ " /Rs.)"
                obj1['amt_type'] = data['payable_rows'][j]['ded'][k]['amt_type']
                obj1['deduction_amount'] = data['payable_rows'][j]['ded'][k]['ded_amount'] 
              } 
              
              for (let i = 0; i < this.allParty.length; i++) {
                if (this.allParty[i]['party_id'] == obj1['party_id']) {
                  obj1['pan'] = this.allParty[i]['pan_no']
                }
              }
              this.reportdata.push(obj1)
            }
          }
        }
      }
    }
  }
  allHSNAccounts
  async getHSNAccount() {
    var resp = await this.settingService.getHSNAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allHSNAccounts = resp.data;

      this.spinner.hide();
    } else {
      this.spinner.hide();
      Swal.fire("Error", "...Error while getting  all HSN list!");
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
  export() {
    var exp = []
    for (var i = 0; i < this.reportdata.length; i++) {
      var obj = new Object();
      obj['S. NO.'] = i + 1;
      if( this.reportdata[i]['cb_date']){
        obj['Date of Deduction'] = this.mainService.dateFormatChange(this.reportdata[i]['cb_date'])

      }else{
        obj['Date of Deduction'] = this.reportdata[i]['cb_date']

      }
      obj['Party Name'] = this.reportdata[i]['party_name']
      obj['Type of Deduction'] = this.reportdata[i]['rate']
      obj['PAN of Party'] = this.reportdata[i]['pan']
      obj['Gross Amount (Event Value)'] = this.reportdata[i]['amount']
      obj['Deduction Amount'] = this.reportdata[i]['deduction_amount']

      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, 'deduction_report')
  }
  print() {

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ") " +this.mainService.codeValueShowObj['ACC0057'][this.deduction_type]+ "  REPORT";
    var dd = {
      
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },


      pageOrientation: 'portrait',

      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };
    var header2 =
      [
        {

          text: 'From Date :',
          bold: true,
          colSpan: 2, alignment: 'center'

        }, {},
        {

          text: this.mainService.dateFormatChange(this.obj['from_dt']), colSpan: 1, alignment: 'center'
        },
        {

          text: 'To Date :',
          bold: true, colSpan: 2, alignment: 'center'
        }, {},
        {

          text: this.mainService.dateFormatChange(this.obj['to_dt']), colSpan: 2, alignment: 'center'
        }, {}
      ]
    var tbl = {

      fontSize: 10,
      table: {

        headerRows: 2,
        widths: ['*', '*', '*', '*', '*',  '*', '*'],

        body: [header2,
          ['SNO', 'Date of Deduction', 'Party Name',
        
            { text: 'Type of Deduction', alignment: 'center' },
            { text: 'PAN of Party', alignment: 'center' },
            { text: 'Gross Amount (Event Value)', alignment: 'center' },
            { text: 'Deduction Amount', alignment: 'center' }]


        ]
      }
    };
    dd.content.push(tbl);
    var deduction_amount = 0

    var amount = 0
    for (var i = 0; i < this.reportdata.length; i++) {
      var arr = []
      arr.push(i + 1);
      if(this.reportdata[i]['cb_date']){
        arr.push(this.mainService.dateFormatChange(this.reportdata[i]['cb_date']));

      }else{
        arr.push(this.reportdata[i]['cb_date']);

      }
      arr.push(this.reportdata[i]['party_name']);
    
      arr.push({ text: this.reportdata[i]['rate'], alignment: 'right' });
      arr.push({ text: this.reportdata[i]['pan'], alignment: 'right' })
      arr.push({ text: this.reportdata[i]['amount'].toFixed(2), alignment: 'right' })
      arr.push({ text: this.reportdata[i]['deduction_amount'].toFixed(2), alignment: 'right' })

      amount = amount + this.reportdata[i]['amount']

      deduction_amount = deduction_amount + this.reportdata[i]['deduction_amount']


      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    var totalObjRow =
      [ '', '', '', '', 'Total : Rs.', amount.toFixed(2), deduction_amount.toFixed(2)]


    dd.content[dd.content.length - 1].table.body.push(totalObjRow);




    pdfMake.createPdf(dd).download("Deduction-Report");
  }

}
