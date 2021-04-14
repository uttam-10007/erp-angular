import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LedgerService } from '../../../service/ledger.service';
import { MainService } from '../../../service/main.service';
import { ChartOfAccountService } from '../../../service/chart-of-account.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { bindCallback } from 'rxjs';
declare var $: any
@Component({
  selector: 'app-arr-listing',
  templateUrl: './arr-listing.component.html',
  styleUrls: ['./arr-listing.component.css']
})
export class ArrListingComponent implements OnInit {

  displayedColumns = ['party_id', 'party_name', 'arr_id', 'arr_desc', 'cr_amount', 'db_amount'];
  obj = {}
  erpUser;
  b_acct_id
  data;
  dataSource;
  user_id
  ledger = [{ code: 'A', value: 'A' }, { code: 'B', value: 'B' }]
  total_cr_amount = 0;
  total_db_amount = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(public mainService: MainService, private chartOfAccountService: ChartOfAccountService, private ledgerService: LedgerService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }



  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllChartOfAccount();





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
        this.coaObj[this.allChartOfAccount[i]['leaf_code']] = this.allChartOfAccount[i]['leaf_value'];
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
    }
  }


  async submit() {
    this.spinner.show()
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getarrList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.data = resp.data;
      this.total_cr_amount = 0;
      this.total_db_amount = 0;










      var data = [];
      var temp = [];

      for (let i = 0; i < this.data.length; i++) {
        if (temp.indexOf(this.data[i]['party_id'] + this.data[i]['party_name'] + this.data[i]['arr_id'] + this.data[i]['arr_desc']) < 0) {
          temp.push(this.data[i]['party_id'] + this.data[i]['party_name'] + this.data[i]['arr_id'] + this.data[i]['arr_desc']);
          var obj1 = new Object();
          if (this.data[i]['db_cd_ind'] == 'CR') {
            obj1['party_id'] = this.data[i]['party_id'];
            obj1['party_name'] = this.data[i]['party_name'];
            obj1['arr_id'] = this.data[i]['arr_id'];
            obj1['arr_desc'] = this.data[i]['arr_desc'];
            obj1['cr_amount'] = this.data[i]['txn_amt'];
            obj1['db_amount'] = 0;
          } else {
            obj1['party_id'] = this.data[i]['party_id'];
            obj1['party_name'] = this.data[i]['party_name'];
            obj1['arr_id'] = this.data[i]['arr_id'];
            obj1['arr_desc'] = this.data[i]['arr_desc'];
            obj1['db_amount'] = this.data[i]['txn_amt'];

            obj1['cr_amount'] = 0;
          }
          data.push(obj1);
        } else {
          var index = temp.indexOf(this.data[i]['party_id'] + this.data[i]['party_name'] + this.data[i]['arr_id'] + this.data[i]['arr_desc'])
          if (this.data[i]['db_cd_ind'] == 'CR') {
            data[index]['cr_amount'] = data[index]['cr_amount'] + this.data[i]['txn_amt'];
          } else {
            data[index]['db_amount'] = data[index]['db_amount'] + this.data[i]['txn_amt'];
          }
        }

      }



      this.data = data;






      for (let i = 0; i < this.data.length; i++) {
        this.total_cr_amount = this.total_cr_amount + this.data[i]['cr_amount'];
        this.total_db_amount = this.total_db_amount + this.data[i]['db_amount'];

        this.data[i]['cr_amount'] = this.amounttoINRConvert(this.data[i]['cr_amount']);
        this.data[i]['db_amount'] = this.amounttoINRConvert(this.data[i]['db_amount']);


      }




      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Arrangement listing", 'Error', {
        duration: 5000,
      });
    }
  }

  refressadd() {
    this.obj = Object.assign({}, {})
  }

  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
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
          text: 'Arrangement Listing',
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
          text: '',
          bold: true
        },
        {
          width: '*',
          text: ''
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
          text: 'Party ID',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Party Name',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Arrangement ID',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Arrangement Description',
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
            text: data[i]['party_id'],
            alignment: 'left'
          },
          {
            width: '*',
            text: data[i]['party_name'],
            alignment: 'left'

          },
          {
            width: '*',
            text: data[i]['arr_id'],
            alignment: 'left'

          },
          {
            width: '*',
            text: data[i]['arr_desc'],
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
    pdfMake.createPdf(dd).download('arr-listing-report.pdf');

  }


}
