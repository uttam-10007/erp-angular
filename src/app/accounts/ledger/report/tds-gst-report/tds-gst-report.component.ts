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
  selector: 'app-tds-gst-report',
  templateUrl: './tds-gst-report.component.html',
  styleUrls: ['./tds-gst-report.component.css']
})
export class TdsGstReportComponent implements OnInit {
  erpUser;
  b_acct_id;
  allParty = []
  obj = {}
  constructor(private ChartOfAccountService: ChartOfAccountService, private mainService: MainService, private excl: ExcelService, private ledgerService: LedgerService, private spinner: NgxSpinnerService, private settingService: SettingService) { }
  acount_name = ''
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.acount_name = this.mainService.accInfo['account_name']
    await this.getHSNAccount()
    await this.getAllParties()
  }
  reportdata = []
  async getreportoutput() {
    //this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getGstOutputReport(JSON.stringify(this.obj))
    if (resp['error'] == false) {
      var arr = resp['data']

      this.reportdata = []
      for (let i = 0; i < arr.length; i++) {
        var data = JSON.parse(arr[i]['data'])
        for (let j = 0; j < data['payable_rows'].length; j++) {
          data['payable_rows'][j]['party_name'] = arr[i]['party_name']
          data['payable_rows'][j]['gstin_no'] = arr[i]['gstin_no']
          var rate = 0
          for (let k = 0; k <  data['payable_rows'][j]['ded'].length; k++) {
            if (data['payable_rows'][j]['ded'][k]['deduction_type'] == 'TDS') {
              var obj1 = Object()
              obj1['party_name'] = arr[i]['party_name']
              obj1['gstin_no'] = arr[i]['gstin_no']
              obj1['amount'] = data['payable_rows'][j]['amount']
              if (data['payable_rows'][j]['gst_type'] == 'cgst_sgst') {
                if(data['payable_rows'][j]['ded'][k]['amt_type'] == 'percentage'){
                  obj1['cgst'] = ((data['payable_rows'][j]['ded'][k]['ded_amount'] / 2) * obj1['amount'] ) / 100
                  obj1['sgst'] = ((data['payable_rows'][j]['ded'][k]['ded_amount'] / 2) * obj1['amount'] ) / 100
                  obj1['igst'] = 0
                }else{
                  obj1['cgst'] = data['payable_rows'][j]['ded'][k]['ded_amount'] / 2
                  obj1['sgst'] = data['payable_rows'][j]['ded'][k]['ded_amount'] / 2
                  obj1['igst'] = 0
                }
               
              }else if (data['payable_rows'][j]['gst_type'] == 'igst') {
                if(data['payable_rows'][j]['ded'][k]['amt_type'] == 'percentage'){
                  obj1['igst'] = ((data['payable_rows'][j]['ded'][k]['ded_amount'] ) * obj1['amount'] ) / 100
                  obj1['sgst'] = 0
                  obj1['cgst'] = 0
                }else{
                  obj1['igst'] = data['payable_rows'][j]['ded'][k]['ded_amount'] 
                  obj1['sgst'] = 0
                  obj1['cgst'] = 0
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
      obj['SNO'] = i + 1;
      obj['GSTIN'] = this.reportdata[i]['gstin_no']
      obj['Party Name'] = this.reportdata[i]['party_name']
     
      obj['Taxable Amount'] = this.reportdata[i]['amount']
      obj['TDS On CGST'] = this.reportdata[i]['cgst']
      obj['TDS On SGST'] = this.reportdata[i]['sgst']
      obj['TDS On IGST'] = this.reportdata[i]['igst']

      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, 'Tds_on_Gst_report')
  }
  print() {

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " TDS ON GST REPORT";
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
    //dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    var header2 = 
       [
        {
         
          text: 'From Date :',
          bold: true,
           colSpan: 2, alignment: 'center'

        },{},
        {
         
          text: this.mainService.dateFormatChange(this.obj['from_dt']), alignment: 'center'
        },
        {
          
          text: 'To Date :',
          bold: true, colSpan: 2, alignment: 'center'
        },{},
        {
          
          text: this.mainService.dateFormatChange(this.obj['to_dt']), colSpan: 2, alignment: 'center'
        },{}
      ]

    
   // dd.content.push({ text: " " });
    //dd.content.push(header2);
   // dd.content.push({ text: " " });
   // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    var tbl = {

     // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 2,
        widths: [50, 150, 160,  100,100, 80, '*'],

        body: [header2,
          ['SNO', 'GSTIN', 'Party Name',  {text:'Taxable Amount',alignment:'center'}, {text:'TDS On CGST',alignment:'center'}, {text:'TDS On SGST',alignment:'center'}, {text:'TDS On IGST',alignment:'center'}]


        ]
      }
    };
    dd.content.push(tbl);
    var cgst = 0
    var sgst = 0
    var igst = 0
    var amount = 0
    for (var i = 0; i < this.reportdata.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(this.reportdata[i]['gstin_no']);
      arr.push(this.reportdata[i]['party_name']);
      
     
     
      arr.push({text:this.reportdata[i]['amount'].toFixed(2),alignment:'right'});
      arr.push({text:this.reportdata[i]['cgst'].toFixed(2),alignment:'right'});
      arr.push({text:this.reportdata[i]['sgst'].toFixed(2),alignment:'right'})
      arr.push({text:this.reportdata[i]['igst'].toFixed(2),alignment:'right'})
      cgst = cgst + this.reportdata[i]['cgst']
      sgst = sgst + this.reportdata[i]['sgst']
      igst = igst + this.reportdata[i]['igst']
      amount = amount + this.reportdata[i]['amount']


      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    var totalObjRow = 
    [ '', '', 'Total : Rs.', amount.toFixed(2), cgst.toFixed(2), sgst.toFixed(2), igst.toFixed(2) ]

 
 dd.content[dd.content.length - 1].table.body.push(totalObjRow);
    /*  var tbl1 = [
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
     dd.content.push(totalObjRow); */




    pdfMake.createPdf(dd).download("TDS-GST-Report");
  }
}
