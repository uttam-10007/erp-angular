import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LedgerService } from '../../../service/ledger.service';
import { MainService } from '../../../service/main.service';
import { EventsService } from '../../../service/events.service';
import { ChartOfAccountService } from '../../../service/chart-of-account.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { bindCallback } from 'rxjs';
declare var $: any
@Component({
  selector: 'app-jrnl-listing',
  templateUrl: './jrnl-listing.component.html',
  styleUrls: ['./jrnl-listing.component.css']
})
export class JrnlListingComponent implements OnInit {

  displayedColumns = ['jrnl_id', 'jrnl_desc', 'jrnl_ln_id', 'jrnl_dtl_ln_id', 'event_code', 'event_id', 'event_ln_id', 'acct_dt', 'cr_amount', 'db_amount'];
  obj = {}
  erpUser;
  b_acct_id
  datasource;
  user_id
  ledger = [{ code: 'A', value: 'A' }, { code: 'B', value: 'B' }]
  data = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(public mainService: MainService, private chartOfAccountService: ChartOfAccountService, private ledgerService: LedgerService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }

  total_db_amount = 0;
  total_cr_amount = 0;
  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllChartOfAccount();
    await this.getAllArrangement();
    await this.getevents();
  }

  eventObj = {}
  async getevents() {
    var obj = new Object;
    obj['b_acct_id'] = this.b_acct_id;
    this.spinner.show();
    var resp = await this.ledgerService.getevents(obj);
    if (resp['error'] == false) {
      this.eventObj = {}
      for (let i = 0; i < resp.data.length; i++) {
        this.eventObj[resp.data[i]['event_code']] = resp.data[i]['event_desc'];
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Event List", 'Error', {
        duration: 5000,
      });
    }
  }

  allChartOfAccount = [];
  coaObj = {};
  async getAllChartOfAccount() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.chartOfAccountService.getchartofaccount(obj);
    if (resp['error'] == false) {
      this.allChartOfAccount = resp.data;
      this.coaObj = {};

      for (let i = 0; i < this.allChartOfAccount.length; i++) {
        this.coaObj[this.allChartOfAccount[i]['leaf_code']] = this.allChartOfAccount[i]['leaf_value']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
    }
  }
  allArrangement = [];
  arrObj = {};
  async getAllArrangement() {
    var resp = await this.ledgerService.getAllArrangement(this.b_acct_id);
    if (resp['error'] == false) {
      this.allArrangement = resp.data;
      this.arrObj = {};
      for (let i = 0; i < this.allArrangement.length; i++) {
        this.arrObj[this.allArrangement[i]['arr_id']] = this.allArrangement[i]['arr_desc']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
    }
  }

  amounttoINRConvert(amount) {
    var negative = false;
    if (amount < 0) {
      amount = amount * (-1);
      negative = true;
    }

    var y = amount.toFixed(2);
    var x = y.toString();
    var afterPoint = '';
    if (x.indexOf('.') > 0)
      afterPoint = x.substring(x.indexOf('.'), x.length);
    var x1 = Math.floor(y);
    var x2 = x1.toString();
    var lastThree = x2.substring(x2.length - 3);
    var otherNumbers = x2.substring(0, x2.length - 3);
    if (otherNumbers != '')
      lastThree = ',' + lastThree;
    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
    if (negative == true) {
      res = "-" + res
    }
    return res;
  }


  async submit() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getJournalList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.data = resp.data;
      this.total_cr_amount = 0;
      this.total_db_amount = 0;
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i]['db_cd_ind'] == 'CR') {
          this.data[i]['cr_amount'] = this.amounttoINRConvert(this.data[i]['txn_amt']);
          this.total_cr_amount = this.total_cr_amount + this.data[i]['txn_amt'];
          this.data[i]['db_amount'] = this.amounttoINRConvert(0);
        } else {
          this.data[i]['db_amount'] = this.amounttoINRConvert(this.data[i]['txn_amt']);
          this.total_db_amount = this.total_db_amount + this.data[i]['txn_amt'];
          this.data[i]['cr_amount'] = this.amounttoINRConvert(0);
        }
      }

      this.datasource = new MatTableDataSource(this.data);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting journal listing", 'Error', {
        duration: 5000,
      });
    }
  }
  async print1() {

    var data = this.data;
    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")";
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var arr = []
        var obj = { text: txt + "  Page No. - " + currentPage, alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        arr.push(obj);
        return arr;
      },
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };


    var header0 = {
      columns: [
        {
          width: '*',
          text: 'Journal Listing',
          bold: true,
          alignment: 'center'
        }
      ],

    }

    var header1 = {
      columns: [
        {
          width: '*',
          text: 'Processing Date :',
          bold: true
        },
        {
          width: '*',
          text: this.obj['proc_dt']
        },
        {

          width: '*',
          text: 'Accounting Date :',
          bold: true
        },
        {
          width: '*',
          text: this.obj['acct_dt']
        }
      ],

    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Ledger Type :',
          bold: true

        },
        {
          width: '*',
          text: this.obj['ledger_type']
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
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Ledger :',
          bold: true

        },
        {
          width: '*',
          text: this.coaObj[this.obj['chart_of_account']]
        },
        {
          width: '*',
          text: 'Arrangement :',
          bold: true
        },
        {
          width: '*',
          text: this.arrObj[this.obj['arr_id']]
        }
      ],

    }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push(header0);

    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push(header2);
    dd.content.push(header3);
    dd.content.push({ text: " " });

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });


    var header8 = {
      columns: [
        {
          width: '*',
          text: 'Journal ID',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Journal Description',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Journal Line ID',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Journal Detail Line ID',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Event Code',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Event ID',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Event Line ID',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Accounting Date',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'CR',
          bold: true,
          alignment: 'right'
        },
        {
          width: '*',
          text: 'DB',
          bold: true,
          alignment: 'right'
        }
      ],


    }
    dd.content.push(header8);
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });

    for (var i = 0; i < data.length; i++) {
      var objRow = {
        columns: [
          {
            width: '*',
            text: data[i]['jrnl_id'],
            alignment: 'left'
          },
          {
            width: '*',
            text: data[i]['jrnl_desc'],
            alignment: 'left'

          },
          {
            width: '*',
            text: data[i]['jrnl_ln_id'],
            alignment: 'left'

          },
          {
            width: '*',
            text: data[i]['jrnl_dtl_ln_id'],
            alignment: 'left'

          },
          {
            width: '*',
            text: this.eventObj[data[i]['event_code']],
            alignment: 'left'

          },
          {
            width: '*',
            text: data[i]['event_id'],
            alignment: 'center'

          },
          {
            width: '*',
            text: data[i]['event_ln_id'],
            alignment: 'left'

          },
          {
            width: '*',
            text: data[i]['acct_dt'],
            alignment: 'left'

          },
          {
            width: '*',
            text: data[i]['cr_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: data[i]['db_amount'],
            alignment: 'right'

          },
        ],
      }

      dd.content.push(objRow);
      dd.content.push({ text: " " });
    }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    dd.content.push({ text: " " });

    var totalObjRow = {
      columns: [

        {
          width: '*',
          text: 'TOTAL:',
          bold: true

        },
        {
          width: '*',
          text: '',
        },
        {
          width: '*',
          text: ''
        },
        {
          width: '*',
          text: ''
        },
        {
          width: '*',
          text: ''
        },
        {
          width: '*',
          text: ''
        },
        {
          width: '*',
          text: ''
        },
        {
          width: '*',
          text: ''
        },
        {
          width: '*',
          text: this.amounttoINRConvert(this.total_cr_amount),
          bold: true,
          alignment: 'right'

        },
        {
          width: '*',
          text: this.amounttoINRConvert(this.total_db_amount),
          bold: true,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(totalObjRow);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    pdfMake.createPdf(dd).download('jrnl-listing-report.pdf');

  }

  refressadd() {
    this.obj = Object.assign({}, {})
  }

  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }






}
