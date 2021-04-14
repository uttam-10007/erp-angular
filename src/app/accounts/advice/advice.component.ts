import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NgxSpinnerService } from "ngx-spinner";
import { MainService } from '../service/main.service';
import { SettingService } from '../service/setting.service';
import swal from 'sweetalert2';
import { BpService } from '../service/bp.service'
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts  from '../../../assets/font/vfs_fonts.js'

pdfMake.fonts = {
  Hindi: {
    normal: 'Roboto-Hindi.ttf',
    bold: 'Roboto-Hindi.ttf',
    italics: 'Roboto-Hindi.ttf',
    bolditalics: 'Roboto-Hindi.ttf'
  },

  // download default Roboto font from cdnjs.com
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
  }
}

pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;

import { BillService } from '../service/bill.service';
declare var $: any
import { ChartAcctMapingServiceService } from '../service/chart-acct-maping-service.service';

@Component({
  selector: 'app-advice',
  templateUrl: './advice.component.html',
  styleUrls: ['./advice.component.css']
})
export class AdviceComponent implements OnInit {


  constructor(private billService:BillService,private chartAccMapingS: ChartAcctMapingServiceService, private settingService: SettingService, public mainService: MainService, private BPS: BpService, private spinner: NgxSpinnerService) { }
  erpUser;
  b_acct_id;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  list = ['id','amount','date', 'remark', 'status', 'action'];
  datasource;
  systemDate;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.billService.getSystemDate();
    this.systemDate = resp.data;
    await this.getAllParties();
    await this.getChartOfAccountMappingList();
    await this.getBankAccount();
    await this.getList();
    await this.getAdviceList();
  }

  bankDtlObj={};
  allBankAccounts=[];
  async getBankAccount() {
    var resp = await this.settingService.getBankAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBankAccounts = resp.data;
      for(let i=0;i<this.allBankAccounts.length;i++){
        this.bankDtlObj[this.allBankAccounts[i]['bank_acct_no']]=this.allBankAccounts[i]
      }
    } else {
      swal.fire("Error", "...Error while getting  all Bank list!",'error');
    }
  }

  allParty = [];
  partyIdToName = {};
  partyIdToIFSC = {};
  async getAllParties() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getPartyInfoNew(this.b_acct_id);
    if (resp['error'] == false) {

      this.allParty = resp.data;
      this.partyIdToName = {};
      this.partyIdToIFSC = {};
      for (let i = 0; i < this.allParty.length; i++) {
        this.partyIdToName[this.allParty[i]['party_id']] = this.allParty[i]['party_name']
        this.partyIdToIFSC[this.allParty[i]['party_id']] = this.allParty[i]['ifsc_code']
      }

      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all party list!", 'error');

    }
  }
  bp_data = [];
  async getList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.BPS.getList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.bp_data = resp['data'];
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all party list!", 'error');
    }
  }


  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  async getAdviceList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.BPS.getAdvice(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      var table_data = []
      for (let i = 0; i < resp['data'].length; i++) {
        var obj1 = Object.assign({}, resp['data'][i])
         obj1['date'] = obj1['create_timestamp'].split("T")[0]
        table_data.push(obj1)
       }
      this.datasource = new MatTableDataSource(table_data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  data!", 'error');

    }
  }



  ChartOfAccountToAccountObj = {};
  async getChartOfAccountMappingList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.chartAccMapingS.getRelationList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.ChartOfAccountToAccountObj = {};
      for (let i = 0; i < resp['data'].length; i++) {
        this.ChartOfAccountToAccountObj[resp['data'][i]['chart_of_account']] = resp['data'][i]['relation']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  list!", 'error');
    }
  }


  async delete(element) {
    this.spinner.show()
    let obj = {}
    obj['id'] = element['id'];
    obj['bpid'] = element['bpid'];
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.BPS.deleteAdvice(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      swal.fire('Deleted Successfully', '', 'success')
      await this.getAdviceList();
      await this.getList();
    }
    else {
      swal.fire("Error", "...Some Error Exist..!", 'error');
      this.spinner.hide()
    }

  }
  printAdvice(element) {
    var arr = [];
    var bank_acct_no = ''
    var bpid = element['bpid'].split(",");
    for (let i = 0; i < bpid.length; i++) {
      for (let j = 0; j < this.bp_data.length; j++) {
        if (this.bp_data[j]['id'] == bpid[i]) {
          arr.push(this.bp_data[j])
          var tt = JSON.parse(this.bp_data[j]['data']);
          bank_acct_no = this.ChartOfAccountToAccountObj[tt['org_bank_acct_no']]
        }
      }
    }
    var bank = this.bankDtlObj[bank_acct_no];

    var bank_name = this.mainService.codeValueShowObj['ACC0006'][bank['bank_code']];
    var branch_name = this.mainService.codeValueShowObj['ACC0007'][bank['branch_code']];

    this.print11(arr, bank_acct_no, bank_name, branch_name);
  }



  print11(data, bank_acct_no, bank_name, branch_name) {
    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " Bank Payment REPORT";
    var dd = {
      pageSize: 'A4',
      header: function (currentPage, pageCount) {
        // var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        var obj = { text: 'okjk.klh fodkl izkf/kdj.k] okjk.klhA', alignment: 'center', margin: [72, 40], font: 'Hindi' };
        return obj;
      },


      pageOrientation: 'portrait',

      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };
    // var header0 = {
    //   columns: [
    //     {
    //       width: '*',
    //       text: 'Payment Bank Account Number :',
    //       bold: true,

    //     },

    //     {
    //       width: '*',
    //       text: bank_acct_no
    //     },
    //     {
    //       width: '*',
    //       text: '',
    //       bold: true
    //     },

    //     {
    //       width: '*',
    //       text: ''
    //     }

    //   ],
    // }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });

    var header1 = {
      columns: [
        {
          width: '10%',
          text: 'lsok esa]',
          bold: false,
          font: 'Hindi'
        },
      ],
    }
    var header2 = {
      columns: [
        {
          width: '10%',
          text: '',
          bold: false
        },
        {
          width: '25%',
          text: "'kk[kk çca/kd",
          bold: false,
          font: 'Hindi'
        },
      ],
    }
    var header3 = {
      columns: [
        {
          width: '10%',
          text: '',
          bold: false
        },
        {
          width: '25%',
          text: bank_name + ',',
          bold: false
        },
      ],
    }

    var header4 = {
      columns: [
        {
          width: '10%',
          text: '',
          bold: false
        },
        {
          width: '25%',
          text: branch_name,
          bold: false
        },
      ],
    }
    var header5 = {
      columns: [
        {
          width: '5%',
          text: 'egksn;]',
          bold: false,
          font: 'Hindi'

        },
      ],
    }

    var header7 = {
      columns: [
        {
          width: '50%',
          text: "i=kad          @fo-izk-@ys[kk@2020&21",
          bold: false,
          font: 'Hindi'

        },
        {
          width: '30%',
          text: "",
          bold: false,
          font: 'Hindi'

        },
        {
          width: '10%',
          text: "fnukad % ",
          bold: false,
          font: 'Hindi',
          alignment:'right'

        },
        {
          width: '10%',
          text:this.mainService.dateFormatChange(this.systemDate),
          bold: false,
          alignment:'left'

        },
      ],
    }



    var total_amount = 0
    for (var i = 0; i < data.length; i++) {
      total_amount = total_amount + data[i]['bp_amount']
    }


    var header6 = {
      columns: [
        {
          width: '5%',
          text: '',
          bold: false,
        },
        {
          width: '95%',
          text: "okjk.klh fodkl izkf/kdj.k ds [kkrk la- " + bank_acct_no
            + " ls vkj-Vh-th-,l- izfdz;k ds ek/;e ls #0 " + total_amount + "  fuEu fooj.k ds vuqlkj"
            + " gLrkUrfjr djus dh  —ik  djsaA",
          bold: false,
          font: 'Hindi'

        },
      ],
    }

    dd.content.push(header1);
    dd.content.push(header2);
    dd.content.push(header3);
    dd.content.push(header4);
    dd.content.push({ text: " " });

    dd.content.push(header7);
    dd.content.push(header5);
    dd.content.push(header6);

    dd.content.push({ text: " " });
    // dd.content.push(header0);
    // dd.content.push({ text: " " });


    var tbl = {

      fontSize: 10,
      table: {

        headerRows: 2,
        widths: ['*', '*', '*', '*', '*', '*'],

        body: [
          ['SNO', 'Name', 'Bank Account NO',
            { text: 'Bank Name', alignment: 'center' },
            { text: 'IFSC Code', alignment: 'center' },
            { text: 'Amount', alignment: 'center' }
          ]


        ]
      }
    };

    dd.content.push(tbl);

    var amount = 0
    for (var i = 0; i < data.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(this.partyIdToName[data[i].party_id]);

      var d = JSON.parse(data[i]['data']);
      arr.push({ text: d['bank_acct_num'], alignment: 'right' });
      arr.push({ text: this.mainService.codeValueShowObj['ACC0006'][d['bank_code']], alignment: 'right' });
      arr.push({ text: this.partyIdToIFSC[data[i].party_id], alignment: 'right' })
      arr.push({ text: data[i]['bp_amount'].toFixed(2), alignment: 'right' })

      amount = amount + data[i]['bp_amount']



      dd.content[dd.content.length - 1].table.body.push(arr);

    }

    var totalObjRow =
      ['', '', '', '', 'Total : Rs.', amount.toFixed(2)]


    dd.content[dd.content.length - 1].table.body.push(totalObjRow);

    pdfMake.createPdf(dd, null, pdfMake.fonts, pdfMake.vfs).download("advice");
  }
}
