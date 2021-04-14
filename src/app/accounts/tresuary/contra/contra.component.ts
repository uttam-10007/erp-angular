import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service';
import swal from 'sweetalert2';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { LedgerService } from '../../service/ledger.service';
import { ContraService } from '../../service/contra.service';
import { ChartOfAccountService } from '../../service/chart-of-account.service';
import { BillService } from '../../service/bill.service';
import { UserAddService } from '../../../../app/portal/service/user-add.service';


declare var $: any

@Component({
  selector: 'app-contra',
  templateUrl: './contra.component.html',
  styleUrls: ['./contra.component.css']
})
export class ContraComponent implements OnInit {

  constructor(private userAdd: UserAddService, private billService: BillService, private contraService: ContraService, private ChartOfAccountService: ChartOfAccountService,
    private ledgerService: LedgerService, public mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  allBankAccounts = [];
  contraObj = { data: [] };
  allContra = [];
  type = [{ code: 'cash', value: 'CASH' }, { code: 'bank', value: 'BANK' }];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['voucher_no', 'remark', 'voucher_dt', 'status', 'action'];
  datasource;
  systemDate
  orgShortName
  fin_year;
  allChartOfAccount = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.mainService.getSystemDate();
    this.systemDate = resp.data
    this.orgShortName = await this.mainService.accInfo['account_short_name'];
    await this.getUsersInfo();
    await this.getAllApproveRule();
    await this.getBankAccount();
    await this.getActiveFinYear()
    await this.getContra();
    await this.getAllChartOfAccount();
  }

  async schedule(element) {
    console.log(element)
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = [];
    for (var i = 0; i < this.allApproval.length; i++) {
      if (this.allApproval[i]['doc_type'] == 'CONTRA') {
        obj['data'].push({
          user_id: this.allApproval[i]['user_id'],
          level_of_approval: this.allApproval[i]['level_of_approval'],
          doc_type: this.allApproval[i]['doc_type'],
          create_user_id: this.erpUser.user_id,
          doc_local_no: element['voucher_no'],
          doc_local_desc: element['voucher_no'] + "-" + element['remark'],
          status: 'PENDING'
        })
      }
    }



    var resp = await this.billService.sendToApproval(obj);
    if (resp['error'] == false) {
      await this.changeContraStatus(element);
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while sending the bill to approvel', 'error');
    }
  }
  async changeContraStatus(element) {
    this.spinner.show();
    let obj = Object.assign(element)
    obj['b_acct_id'] = this.b_acct_id
    obj['status'] = 'SCHEDULED'
    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.contraService.updatecontra(obj);
    if (resp['error'] == false) {
      await this.getContra();
      this.spinner.hide();
      swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating bill !", 'error');
    }
  }
  statusArr = [];
  async status(element) {
    var obj = new Object();
    console.log(element);
    obj["b_acct_id"] = this.b_acct_id;
    obj["bill_id"] = element.voucher_no;
    console.log(obj)
    this.spinner.show();
    var resp = await this.billService.getDocumentStatus(obj);
    console.log(resp);
    if (resp['error'] == false) {
      this.statusArr = resp['data'];
      $('#myModal_Status').modal('show');
      this.spinner.hide()
    } else {
      this.spinner.hide();
      swal.fire("Error", "Error while getting status", 'error');
    }
  }
  allApproval = [];
  levelOfApproval = {};
  async getAllApproveRule() {
    this.spinner.show()
    var resp = await this.billService.getAllApproval(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allApproval = resp['data'];
      for (var i = 0; i < this.allApproval.length; i++) {
        if (this.allApproval[i]['doc_type'] == 'CONTRA') {
          this.levelOfApproval[this.allApproval[i]['level_of_approval']] = this.allApproval[i];
        }
      }
    } else {
      this.spinner.hide()
    }
  }
  allUser = [];
  UserObj = {};
  async getUsersInfo() {
    var obj = { b_acct_id: this.b_acct_id };
    var resp = await this.userAdd.getAllUsersInfo(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      this.allUser = resp['data'];
      for (let i = 0; i < this.allUser.length; i++) {
        this.UserObj[this.allUser[i]['user_id']] = this.allUser[i]['first_name'] + " " + this.allUser[i]['last_name']
        this.allUser[i]['name'] = this.allUser[i]['first_name'] + " " + this.allUser[i]['last_name']
      }
    } else {

    }
  }
  ////////////////////////////////////////////******* */
  async getContra() {
    this.spinner.show()
    var resp = await this.contraService.getcontra(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allContra = resp['data']
      this.datasource = new MatTableDataSource(this.allContra);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      swal.fire("Error", "..Error while getting Contra!", 'error');
    }
  }
  async getActiveFinYear() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getActiveFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      if (resp.data.length == 0) {
        swal.fire("Warning", "..Active Financial Year Not set!", 'warning');
      } else {
        this.fin_year = resp.data[0].fin_year;
      }
    } else {
      this.spinner.hide()
      swal.fire("Error", "..Error while getting active  fin year!", 'error');
    }
  }

  addRow() {
    var obj = new Object();
    obj['type'] = 'bank';
    obj['bank'] = '';
    obj['desc'] = "";
    obj['dr'] = 0;
    obj['cr'] = 0;

    this.contraObj.data.push(obj)

  }
  deleteRowUpdate(i) {
    this.contraObj['data'].splice(i, 1);
  }
  addRowUpdate() {
    var obj = new Object();
    obj['type'] = 'bank';
    obj['bank'] = '';
    obj['desc'] = "";
    obj['dr'] = 0;
    obj['cr'] = 0;

    this.contraObj['data'].push(obj)

  }
  deleteRow(i) {
    this.contraObj.data.splice(i, 1);
  }
  open_update(element) {
    this.contraObj = Object.assign({}, element);
    this.contraObj['data'] = JSON.parse(element['data'])
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.contraObj = { data: [] };

    this.contraObj['voucher_date'] = this.systemDate
  }

  async getBankAccount() {
    this.spinner.show()
    var resp = await this.settingService.getBankAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBankAccounts = resp.data;

      this.spinner.hide();

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while getting  all fields list!", 'error');

      /*  this.snackBar.open("Error while getting  all fields list", 'Error', {
         duration: 5000
       }); */
    }
  }
  async process(element) {
    let arr = JSON.parse(element.data)
    let jrnlArr = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]['type'] == 'bank') {
        if (arr[i]['cr'] > 0) {
          let ob = new Object

          ob['chart_of_account'] = arr[i]['bank']
          ob['db_cd_ind'] = 'CR'
          ob['txn_amt'] = arr[i]['cr']
          ob['org_unit_cd'] = this.orgShortName   //need 
          ob['tgt_curr_cd'] = 'INR'

          ob['proc_dt'] = this.systemDate //need
          ob['fin_year'] = this.fin_year  //need
          ob['jrnl_id'] = element['voucher_no']

          ob['acct_dt'] = element['voucher_date']
          ob['jrnl_desc'] = element['remark']
          ob['ledger_type'] = 'A'
          ob['prep_id'] = element['create_user_id']
          ob['appr_id'] = this.erpUser.user_id
          ob['jrnl_type'] = "Contra"


          jrnlArr.push(ob)

        }
        if (arr[i]['dr'] > 0) {
          let ob = new Object

          ob['chart_of_account'] = arr[i]['bank']
          ob['db_cd_ind'] = 'DB'
          ob['txn_amt'] = arr[i]['dr']
          ob['org_unit_cd'] = this.orgShortName   //need 
          ob['tgt_curr_cd'] = 'INR'
          ob['proc_dt'] = this.systemDate //need
          ob['fin_year'] = this.fin_year  //need
          ob['jrnl_desc'] = element['remark']
          ob['acct_dt'] = element['voucher_date']
          ob['jrnl_id'] = element['voucher_no']
          ob['ledger_type'] = 'A'
          ob['prep_id'] = element['create_user_id']
          ob['appr_id'] = this.erpUser.user_id
          ob['jrnl_type'] = "Contra"


          jrnlArr.push(ob)

        }
      } else if (arr[i]['type'] == 'cash') {
        if (arr[i]['cr'] > 0) {
          let ob = new Object

          ob['chart_of_account'] = arr[i]['bank']
          ob['db_cd_ind'] = 'CR'
          ob['txn_amt'] = arr[i]['cr']
          ob['org_unit_cd'] = this.orgShortName   //need 
          ob['tgt_curr_cd'] = 'INR'
          ob['proc_dt'] = this.systemDate //need
          ob['fin_year'] = this.fin_year  //need
          ob['jrnl_desc'] = element['remark']
          ob['acct_dt'] = element['voucher_date']
          ob['jrnl_id'] = element['voucher_no']
          ob['ledger_type'] = 'A'
          ob['prep_id'] = element['create_user_id']
          ob['appr_id'] = this.erpUser.user_id
          ob['jrnl_type'] = "Contra"

          jrnlArr.push(ob)
        }
        if (arr[i]['dr'] > 0) {
          let ob = new Object

          ob['chart_of_account'] = arr[i]['bank']
          ob['db_cd_ind'] = 'DB'
          ob['txn_amt'] = arr[i]['dr']
          ob['org_unit_cd'] = this.orgShortName   //need 
          ob['tgt_curr_cd'] = 'INR'
          ob['proc_dt'] = this.systemDate //need
          ob['fin_year'] = this.fin_year  //need
          ob['acct_dt'] = element['voucher_date']

          ob['jrnl_desc'] = element['remark']
          ob['jrnl_id'] = element['voucher_no']
          ob['ledger_type'] = 'A'
          ob['prep_id'] = element['create_user_id']
          ob['appr_id'] = this.erpUser.user_id
          ob['jrnl_type'] = "Contra"
          jrnlArr.push(ob)
        }
      }
    }
    let obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['status'] = 'PROCESSED'
    obj['jrnl'] = jrnlArr
    obj['id'] = [element.id]
    obj['update_user_id'] = this.erpUser.user_id
    var resp = await this.contraService.insertProcessedVoucherData(obj);
    if (resp['error'] == false) {

      this.contraObj['voucher_no'] = resp['data']
      await this.getContra()
      this.spinner.hide();
      swal.fire("Success", "Processed Successfully!", 'success');


    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while processing voucher!", 'error');


    }
  }
  async delete(element) {
    this.spinner.show();
    let obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element['id']
    var resp = await this.contraService.deletecontra(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getContra();
      swal.fire("Success", "...Contra Deleted Successfully!!", 'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while deleting contra!", 'error');
    }
  }
  async update() {
    this.spinner.show();
    let obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['status'] = 'GENERATED'
    obj['data'] = JSON.stringify(this.contraObj['data'])
    obj['voucher_date'] = this.contraObj['voucher_date']
    obj['remark'] = this.contraObj['remark']
    obj['voucher_no'] = this.contraObj['voucher_no']
    obj['id'] = this.contraObj['id']

    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.contraService.updatecontra(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getContra();
      swal.fire("Success", "...Contra Update Successfully!!", 'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating contra!", 'error');

    }
  }
  async submit() {
    this.spinner.show()
    let obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['status'] = 'GENERATED'
    obj['data'] = JSON.stringify(this.contraObj['data'])
    obj['voucher_date'] = this.systemDate
    obj['remark'] = this.contraObj['remark']
    obj['create_user_id'] = this.erpUser.user_id
    var resp = await this.contraService.addcontra(obj);
    if (resp['error'] == false) {

      this.contraObj['voucher_no'] = resp['data']
      await this.getContra()
      this.spinner.hide();
      swal.fire("Success", "Voucher Created Successfully!", 'success');


    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while creating voucher!", 'error');


    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  allChartOfAccountobj = {}
  async getAllChartOfAccount() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ChartOfAccountService.getchartofaccount(obj);
    if (resp['error'] == false) {
      this.allChartOfAccount = resp.data;
      for (let i = 0; i < this.allChartOfAccount.length; i++) {
        this.allChartOfAccountobj[this.allChartOfAccount[i]['leaf_code']] = this.allChartOfAccount[i]['leaf_value']

      }
      this.spinner.hide()
    } else {
      this.spinner.hide()
    }
  }




  async print1(element) {

    this.spinner.show()
    var data = element;
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
          text: 'Contra Voucher',
          bold: true,
          alignment: 'center',
          fontSize: 18
        }
      ],

    }

    var header1 = {
      columns: [
        {
          width: '*',
          text: 'Voucher No :',
          bold: true
        },
        {
          width: '*',
          text: data['voucher_no']
        },
        {

          width: '*',
          text: 'Voucher Date :',
          bold: true
        },
        {
          width: '*',
          text: this.mainService.dateFormatChange(data['voucher_date'])
        }
      ],

    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Remark :',
          bold: true

        },
        {
          width: '*',
          text: data['remark']
        },
        {
          width: '*',
          text: ""
        },
        {
          width: '*',
          text: ""
        }
      ],

    }

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push(header0);

    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push(header2);
    dd.content.push({ text: " " });

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });


    var dt = JSON.parse(data['data']);

    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 15,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*', '*', '*'],

        body: [
          ['SNO', 'Type', 'Head', 'Description', 'DR', 'CR']


        ]
      }
    };
    dd.content.push(tbl);
    var dr = 0;
    var cr = 0;
    for (var i = 0; i < dt.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(dt[i]['type'])
      arr.push(this.allChartOfAccountobj[dt[i]['bank']])
      arr.push(dt[i]['desc'])
      arr.push(dt[i]['dr'])
      arr.push(dt[i]['cr'])
      dr = dr + dt[i]['dr'];
      cr = cr + dt[i]['cr']




      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    dd.content.push({ text: " " });
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Total DR :',
          bold: true

        },
        {
          width: '*',
          text: dr
        },
        {
          width: '*',
          text: 'Total CR :',
          bold: true

        },
        {
          width: '*',
          text: cr
        }
      ],

    }
    dd.content.push({ text: " " });
    dd.content.push(header3);

    pdfMake.createPdf(dd).download('contra-voucher.pdf');
    this.spinner.hide()
  }


}
