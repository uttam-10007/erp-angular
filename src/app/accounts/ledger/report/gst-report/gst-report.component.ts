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
  selector: 'app-gst-report',
  templateUrl: './gst-report.component.html',
  styleUrls: ['./gst-report.component.css']
})
export class GstReportComponent implements OnInit {

  constructor(private ChartOfAccountService: ChartOfAccountService, private mainService: MainService, private excl: ExcelService, private ledgerService: LedgerService, private spinner: NgxSpinnerService, private settingService: SettingService) { }
  erpUser;
  b_acct_id;
  allParty = []
  obj = {}

  acount_name = ''
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.acount_name = this.mainService.accInfo['account_name']
    await this.getHSNAccount()
    await this.getAllParties()
  }
  refresh() {
    this.reportdata = []
    this.obj = {}
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
          for (let k = 0; k < this.allHSNAccounts.length; k++) {
            if (this.allHSNAccounts[k]['hsn_code'] == data['payable_rows'][j]['hsn_code']) {
              if (data['payable_rows'][j]['gst_type'] == 'cgst_sgst') {
                rate = this.allHSNAccounts[k]['sgst'] + this.allHSNAccounts[k]['cgst']
              }else if (data['payable_rows'][j]['gst_type'] == 'igst') {
                rate = this.allHSNAccounts[k]['igst'] 
              }
            }

          }
          data['payable_rows'][j]['gst_rate'] = rate
          this.reportdata.push(data['payable_rows'][j])
        }


      }
    }
  }
  async getGstInputReport() {
    //this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getGstInputReport(JSON.stringify(this.obj))
    if (resp['error'] == false) {
      var arr = resp['data']

      this.reportdata = []
      for (let i = 0; i < arr.length; i++) {
        var data = JSON.parse(arr[i]['data'])

        for (let j = 0; j < data['arr'].length; j++) {
          data['arr'][j]['party_name'] = arr[i]['party_name']
          data['arr'][j]['gstin_no'] = arr[i]['gstin_no']
          var rate = 0
          for (let k = 0; k < this.allHSNAccounts.length; k++) {
            if (this.allHSNAccounts[k]['hsn_code'] == data['arr'][j]['hsn_code']) {
              if (data['arr'][j]['gst_type'] == 'CGST/SGST') {
                rate = this.allHSNAccounts[k]['sgst'] + this.allHSNAccounts[k]['cgst']
              }else if (data['arr'][j]['gst_type'] == 'IGST') {
                rate = this.allHSNAccounts[k]['igst'] 
              }
            }

          }
          data['arr'][j]['gst_rate'] = rate
          this.reportdata.push(data['arr'][j])
        }


      }
      await this.getdemandGstInputReport()
    }
  }
  async getdemandGstInputReport(){
    //this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getdemandGstInputReport(JSON.stringify(this.obj))
    if (resp['error'] == false) {
      var arr = resp['data']

      
      for (let i = 0; i < arr.length; i++) {
        var data = JSON.parse(arr[i]['data'])
      
       for (let j = 0; j < data.length; j++) {
         var obj1 = Object()
         obj1['party_name'] = arr[i]['party_name']
         obj1['gstin_no'] = arr[i]['gstin_no']
         obj1['cgst_amount'] = data[j]['cgst']
         obj1['sgst_amount']  = data[j]['sgst']
         obj1['igst_amount'] = data[j]['igst']
         obj1['amount'] = data[j]['amount']
          var rate = 0
          for (let k = 0; k < this.allHSNAccounts.length; k++) {
            if (this.allHSNAccounts[k]['hsn_code'] == data[j]['hsn']) {
              if (data[j]['gst_type'] == 'CGST-SGST') {
                rate = this.allHSNAccounts[k]['sgst'] + this.allHSNAccounts[k]['cgst']
              }else if (data[j]['gst_type'] == 'IGST') {
                rate = this.allHSNAccounts[k]['igst'] 
              }
            }

          }
          obj1['gst_rate'] = rate
          this.reportdata.push(obj1)
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
      obj['Rate of GST'] = this.reportdata[i]['gst_rate']
      obj['Taxable Amount'] = this.reportdata[i]['amount']
      obj['CGST'] = this.reportdata[i]['cgst']
      obj['SGST'] = this.reportdata[i]['sgst']
      obj['IGST'] = this.reportdata[i]['igst']

      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, 'Gst_report')
  }
  export1() {
    var exp = []
    for (var i = 0; i < this.reportdata.length; i++) {
      var obj = new Object();
      obj['SNO'] = i + 1;
      obj['GSTIN'] = this.reportdata[i]['gstin_no']
      obj['Party Name'] = this.reportdata[i]['party_name']
      obj['Rate of GST'] = this.reportdata[i]['gst_rate']
      obj['Taxable Amount'] = this.reportdata[i]['amount']
      obj['CGST'] = this.reportdata[i]['cgst_amount']
      obj['SGST'] = this.reportdata[i]['sgst_amount']
      obj['IGST'] = this.reportdata[i]['igst_amount']

      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, 'gst_output_report')
  }
  print1() {

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " GST OUTPUT REPORT";
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
    //dd.content.push({ canvas: [{ type: 'line', x1:0, y1: 0, x2: 1000, y2: 0, lineWidth: 0.5 }]});
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
          
          text: this.mainService.dateFormatChange(this.obj['to_dt']), colSpan: 3, alignment: 'center'
        },{},{}
      ]
   // dd.content.push({ text: " " });
   // dd.content.push(header2);
   // dd.content.push({ text: " " });
    //dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1000, y2: 0, lineWidth: 0.5 }] });
   // dd.content.push({ text: " " });
    var tbl = {

      //layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 2,
        widths: [30, 100, 160, 50, 100,90, 90, 100, 60],

        body: [header2,
          ['SNO', 'GSTIN', 'Party Name', {text:'Rate of GST',alignment:'center'}, {text:'Taxable Amount',alignment:'center'}, {text:'CGST',alignment:'center'}, {text:'SGST',alignment:'center'}, {text:'IGST',alignment:'center'}]


        ]
      }
    };
    var cgst = 0
    var sgst = 0
    var igst = 0
    var amount = 0
    dd.content.push(tbl);
    for (var i = 0; i < this.reportdata.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(this.reportdata[i]['gstin_no']);
      arr.push(this.reportdata[i]['party_name']);
      arr.push({text:this.reportdata[i]['gst_rate'],alignment:'right'});
      arr.push({text:this.reportdata[i]['amount'].toFixed(2),alignment:'right'});
      arr.push({text:this.reportdata[i]['cgst_amount'].toFixed(2),alignment:'right'});
      cgst = cgst + this.reportdata[i]['cgst_amount']
      sgst = sgst + this.reportdata[i]['sgst_amount']
      igst = igst + this.reportdata[i]['igst_amount']
      amount = amount + this.reportdata[i]['amount']
      arr.push({text:this.reportdata[i]['sgst_amount'].toFixed(2),alignment:'right'})
      arr.push({text:this.reportdata[i]['igst_amount'].toFixed(2),alignment:'right'})




      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    /* var tbl1 = [
      '', '', '', '', '', 'Total :', this.total.toFixed(2)
    ] */
    var totalObjRow = 
       ['', '', '', 'Total : Rs.', amount.toFixed(2), cgst.toFixed(2), sgst.toFixed(2), igst.toFixed(2) ]

    
    dd.content[dd.content.length - 1].table.body.push(totalObjRow);
    /* dd.content.push(totalObjRow);  */




    pdfMake.createPdf(dd).download("GST-Output-Report");
  }
  print() {

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " GST INPUT REPORT";
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
       
       text: this.mainService.dateFormatChange(this.obj['to_dt']), colSpan: 3, alignment: 'center'
     },{},{}
   ]
   
   // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    var tbl = {

      //layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 2,
        widths: [30, 100, 160, 50, 100,90, 80, 80, 80],

        body: [header2,
          ['SNO', 'GSTIN', 'Party Name', {text:'Rate of GST',alignment:'center'}, {text:'Taxable Amount',alignment:'center'}, {text:'CGST',alignment:'center'}, {text:'SGST',alignment:'center'}, {text:'IGST',alignment:'center'}]


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
      
     
      arr.push({text:this.reportdata[i]['gst_rate'],alignment:'right'});
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
    ['', '', '', 'Total : Rs.', amount.toFixed(2), cgst.toFixed(2), sgst.toFixed(2), igst.toFixed(2) ]

 
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




    pdfMake.createPdf(dd).download("GST-Input-Report");
  }
}
