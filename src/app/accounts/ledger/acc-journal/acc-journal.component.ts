import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { LedgerService } from '../../service/ledger.service';
import { MainService } from '../../service/main.service';
import { BillService } from '../../service/bill.service';
import Swal from 'sweetalert2';
import { type } from 'os';
declare var $: any
import { UserAddService } from '../../../../app/portal/service/user-add.service';

@Component({
  selector: 'app-acc-journal',
  templateUrl: './acc-journal.component.html',
  styleUrls: ['./acc-journal.component.css']
})
export class AccJournalComponent implements OnInit {

  constructor(private userAddService:UserAddService,private billService: BillService, public mainService: MainService, private ledgerService: LedgerService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;

  obj = { prep_id: 0, appr_id: 0, status: 'Under Creation', tgt_curr_cd: 'INR', preparer_comment: '', ledger_type: '' };
  allUnPostedJournalInfo = [];
  AllPartyObj = {};
  allParty = [];
  allAccountInfo = [];
  AllAccountObj = {};
  user_id;

  ledger = [{ code: 'A', value: 'Actual' }, { code: 'B', value: 'Budget' }];
  ledgerObj = { A: 'Actual', B: 'Budget' }
  Status = [{ code: 'Under Creation', value: 'Under Creation' }, { code: 'Created', value: 'Created' }, { code: 'Approved', value: 'Approved' }, { code: 'Rejected', value: 'Rejected' }];


  headerJournal = [{ full_name: 'S No.' }, { full_name: 'Select Account' }, { full_name: 'Debit Credit Indicater' }, { full_name: 'txn_amt' }, { full_name: 'Action' }]
  AllJournalRow_credit = [];
  AllJournalRow_debit = [];
  allDBIND = [{ code: 'CR', value: 'CR' }, { code: "DB", value: 'DB' }]

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;



  displayedColumns = ['org_unit_cd', 'acct_dt', 'prep_id', 'appr_id', 'preparer_comment', 'ledger_type', 'status', 'action'];
  datasource;

  displayedColumns_temp1 = [];
  displayedColumns1 = ['jrnl_dtl_ln_id', 'jrnl_desc', 'db_cd_ind', 'txn_amt', 'action'];
  techToBusNameObj1 = {};
  field_code = [];
  datasource1 = new MatTableDataSource([]);



  allChartOfAccount = [];
  fin_year = "";
  db = 0;
  cr = 0;

  allEventList = [];
  jrnlLineObj = {
    txn_amt: 0,
    db_cd_ind: 'NA',
    chart_of_account: 0,
    acct_dt: this.obj['acct_dt'],
    proc_dt: '',
    fin_year: "",
    jrnl_desc: this.obj['preparer_comment'],
    ledger_type: '',
    jrnl_ln_id: 0,
    jrnl_dtl_ln_id: 0,
    prep_id: 0,
    appr_id: 0,
    tgt_curr_cd: 'INR',
    org_unit_cd: '',
    jrnl_id: 0

  }
  allFields = [];
  ChartOfAccountObj = {};
  jrnl_id;
  systemDate
  async ngOnInit() {
    this.spinner.show();
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    this.obj['prep_id'] = this.user_id;
    this.obj['appr_id'] = this.user_id;
    var resp = await this.billService.getSystemDate();
    this.systemDate = resp.data;
    await this.getUsersInfo();
    await this.getAllApproveRule();
    await this.getCurrentJrnlId();
    await this.getAllParty();
    await this.getallFields();
    await this.getJrnlTRecordDetail();
    await this.getAllAccountInfo();
    await this.getallChartOfAccount();
    await this.getAllUnPostedJournalInfo();
    await this.getIp();
    await this.FinYear();

    await this.getevents();
    this.jrnl_id = this.obj['jrnl_id'];
    this.spinner.hide();
  }


  async schedule(element) {
    console.log(element)
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = [];
    for (var i = 0; i < this.allApproval.length; i++) {
      if (this.allApproval[i]['doc_type'] == 'MJ') {
        obj['data'].push({
          user_id: this.allApproval[i]['user_id'],
          level_of_approval: this.allApproval[i]['level_of_approval'],
          doc_type: this.allApproval[i]['doc_type'],
          create_user_id: this.erpUser.user_id,
          doc_local_no: element['id'],
          doc_local_desc: element['id'] + "-" + element['preparer_comment'],
          status: 'PENDING'
        })
      }
    }



    var resp = await this.billService.sendToApproval(obj);
    if (resp['error'] == false) {
      await this.changeMJStatus(element);
      this.spinner.hide();
    } else {
      this.spinner.hide();
      Swal.fire('Error', 'Error while sending the bill to approvel', 'error');
    }
  }
  async changeMJStatus(element) {
    this.spinner.show();
    let obj = new Object();
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element.id
    obj['status'] = 'SCHEDULED'
    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.ledgerService.updateUnpostedJournalStatus(obj);
    if (resp['error'] == false) {
      await this.getAllUnPostedJournalInfo();
      this.spinner.hide();
      Swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      Swal.fire("Error", "...Error while updating bp !", 'error');
    }
  }
  statusArr = [];
  async status(element) {
    var obj = new Object();
    console.log(element);
    obj["b_acct_id"] = this.b_acct_id;
    obj["bill_id"] = element.id;
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
      Swal.fire("Error", "Error while getting status", 'error');
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
        if (this.allApproval[i]['doc_type'] == 'MJ') {
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
    var resp = await this.userAddService.getAllUsersInfo(JSON.stringify(obj));
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


  /////********************************************* */

  partyArr = []
  partyArrObj = {}
  async getIp() {
    this.spinner.show();

    var resp = await this.billService.getPartyInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.partyArr = resp.data
      this.partyArrObj = new Object
      for (let i = 0; i < this.partyArr.length; i++) {
        this.partyArrObj[this.partyArr[i]['party_id']] = this.partyArr[i]['party_name']
      }

      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getevents() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.ledgerService.getevents(obj);
    if (resp['error'] == false) {
      this.allEventList = resp.data;
    } else {
      this.snackBar.open("Error occured while getting all event", 'Error', {
        duration: 5000,
      });
    }
  }


  async FinYear() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getActiveFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      if (resp.data.length == 0) {
        this.snackBar.open("Active Financial Year Not set!", 'Warning', {
          duration: 5000
        });
      } else {
        this.fin_year = resp.data[0].fin_year;
      }
    } else {
      this.snackBar.open("Error while getting active  fin year", 'Error', {
        duration: 5000
      });
    }
  }



  async getallFields() {

    var obj = new Object();
    obj['table_name'] = 'field_info';
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getFields(obj);
    this.allFields = [];
    if (resp['error'] == false) {
      this.allFields = resp.data;

    } else {
      this.snackBar.open("Error while getting Fields", "Error", {
        duration: 5000,
      });
    }


  }

  async  getJrnlTRecordDetail() {
    var resp = await this.ledgerService.getjrnldata(this.b_acct_id);
    if (resp['error'] == false) {
      var ip_dtl = resp.data[0];
      this.displayedColumns_temp1 = [];
      this.techToBusNameObj1 = {};
      var ip_fields_code = ip_dtl.field_code.split(",");
      this.field_code = [];
      for (let i = 0; i < ip_fields_code.length; i++) {
        for (let j = 0; j < this.allFields.length; j++) {
          if (ip_fields_code[i] == this.allFields[j]['field_code']) {
            if (
              this.allFields[j]['field_technical_name'] == 'id' ||
              this.allFields[j]['field_technical_name'] == 'create_timestamp' ||
              this.allFields[j]['field_technical_name'] == 'create_user_id' ||
              this.allFields[j]['field_technical_name'] == 'update_timestamp' ||
              this.allFields[j]['field_technical_name'] == 'update_user_id') {
            } else {
              this.displayedColumns_temp1.push(this.allFields[j]['field_technical_name']);
              this.techToBusNameObj1[this.allFields[j]['field_technical_name']] = this.allFields[j]['field_business_name'];


              var datatype = this.allFields[j]['datatype_code'];
              var temp_type;
              if (datatype == 'bigint(20)' || datatype == 'double' || datatype == 'int(11)') {
                temp_type = 'number';
              } else if (datatype == 'date') {
                temp_type = 'date';
              } else if (datatype == 'varchar(200)' || datatype == 'varchar(50)' || datatype == 'text') {
                temp_type = 'text';
              }
              this.field_code.push({
                field_business_name: this.allFields[j]['field_business_name'],
                field_technical_name: this.allFields[j]['field_technical_name'],
                field_code: ip_fields_code[i],
                type: temp_type
              })
            }
          }
        }
      }

    } else {
      this.snackBar.open("Error while getting ip Records", "Error", {
        duration: 5000,
      });

    }
  }
  async getallChartOfAccount() {
    this.allChartOfAccount = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getchartofaccount(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allChartOfAccount = resp.data;
      for (let i = 0; i < this.allChartOfAccount.length; i++) {
        this.ChartOfAccountObj[this.allChartOfAccount[i]['leaf_code']] = this.allChartOfAccount[i]['leaf_value'];
      }

      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all chart of account info", 'Error', {
        duration: 5000
      });
    }
  }

  async getAllParty() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getPartyInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allParty = resp.data;
      for (let i = 0; i < this.allParty.length; i++) {
        this.AllPartyObj[this.allParty[i]['party_id']] = this.allParty[i].party_legal_name;
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all party list", 'Error', {
        duration: 5000
      });
    }
  }

  async getAllAccountInfo() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getAccountInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allAccountInfo = resp.data;
      for (let i = 0; i < this.allAccountInfo.length; i++) {
        this.AllAccountObj[this.allAccountInfo[i].account_code] = this.allAccountInfo[i].account_desc
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all account info", 'Error', {
        duration: 5000
      });
    }
  }

  async addRowCredit() {
    this.AllJournalRow_credit.push({ chart_of_account: '', txn_amt: 0, lines: [] })
    await this.changeRowCredit(this.AllJournalRow_credit.length - 1)
    await this.saveline()
  }
  changecoa(i) {
    this.AllJournalRow_credit[i]['lines'][0]['chart_of_account'] = this.AllJournalRow_credit[i]['chart_of_account']
  }
  changedbcr(i) {
    this.AllJournalRow_credit[i]['lines'][0]['db_cd_ind'] = this.AllJournalRow_credit[i]['db_cd_ind']
  }
  changeamt(i) {
    this.AllJournalRow_credit[i]['lines'][0]['txn_amt'] = this.AllJournalRow_credit[i]['txn_amt']
  }
  addRowDebit() {
    this.AllJournalRow_debit.push({ chart_of_account: '', txn_amt: 0, lines: [] })
  }

  deleteRowCredit(i) {
    this.AllJournalRow_credit.splice(i, 1);
  }

  deleteRowDebit(i) {
    this.AllJournalRow_debit.splice(i, 1);
  }

  row_type;
  row_index;

  row_table_data(data) {
    this.datasource1 = new MatTableDataSource(data)
    this.datasource1.paginator = this.paginator;
    this.datasource1.sort = this.sort;
  }

  async changeRowCredit(i) {

    var ledger_type_value = this.obj['ledger_type'];
    this.row_type = 'CR';
    this.row_index = i;
    if (this.AllJournalRow_credit[i]['lines'].length == 0) {
      this.jrnlLineObj = {
        txn_amt: this.AllJournalRow_credit[i]['txn_amt'],
        db_cd_ind: this.AllJournalRow_credit[i]['db_cd_ind'],
        chart_of_account: this.AllJournalRow_credit[i]['chart_of_account'],
        acct_dt: this.obj['acct_dt'],
        proc_dt: this.systemDate,
        fin_year: this.fin_year,
        jrnl_desc: this.obj['preparer_comment'],
        ledger_type: ledger_type_value,
        jrnl_ln_id: i + 1,
        jrnl_dtl_ln_id: this.AllJournalRow_credit[this.row_index]['lines'].length + 1,
        prep_id: this.obj['prep_id'],
        appr_id: this.obj['appr_id'],
        jrnl_id: this.jrnl_id,
        tgt_curr_cd: this.obj['tgt_curr_cd'],
        org_unit_cd: this.mainService.accInfo['account_short_name']

      };
      // this.addLineItems();
    } else {
      this.jrnlLineObj = this.AllJournalRow_credit[i]['lines'][0]
    }

    // await this.row_table_data(this.AllJournalRow_credit[i]['lines'])

  }
  saveline() {
    this.AllJournalRow_credit[this.row_index]['lines'][0] = this.jrnlLineObj
  }
  async changeRowDebit(i) {
    var ledger_type_value = this.obj['ledger_type'];
    this.row_type = 'DB';
    this.row_index = i;
    this.jrnlLineObj = {
      txn_amt: 0,
      db_cd_ind: 'DB',
      chart_of_account: this.AllJournalRow_debit[i]['chart_of_account'],
      acct_dt: this.obj['acct_dt'],
      proc_dt: this.systemDate,
      fin_year: this.fin_year,
      jrnl_desc: this.obj['preparer_comment'],
      ledger_type: ledger_type_value,
      jrnl_ln_id: i + 1,
      jrnl_dtl_ln_id: this.AllJournalRow_debit[this.row_index]['lines'].length + 1,
      prep_id: this.obj['prep_id'],
      appr_id: this.obj['appr_id'],
      jrnl_id: this.jrnl_id,
      tgt_curr_cd: this.obj['tgt_curr_cd'],
      org_unit_cd: this.mainService.accInfo['account_short_name']
    };

    if (this.AllJournalRow_debit[i]['lines'].length == 0) {
      this.addLineItems();
    }
    await this.row_table_data(this.AllJournalRow_debit[i]['lines'])

  }

  async  addLineItems() {
    var ledger_type_value = this.obj['ledger_type'];

    if (this.row_type == 'CR') {
      await this.AllJournalRow_credit[this.row_index]['lines'].push(this.jrnlLineObj);

      /*   this.jrnlLineObj = {
          txn_amt: 0,
          db_cd_ind: 'CR',
          chart_of_account: this.AllJournalRow_credit[this.row_index]['chart_of_account'],
          acct_dt: this.obj['acct_dt'],
          proc_dt: this.systemDate,
          fin_year: this.fin_year,
          jrnl_desc: this.obj['preparer_comment'],
          ledger_type: ledger_type_value,
          jrnl_ln_id: this.row_index + 1,
          jrnl_dtl_ln_id: this.AllJournalRow_credit[this.row_index]['lines'].length + 1,
          prep_id: this.obj['prep_id'],
          appr_id: this.obj['appr_id'],
          jrnl_id: this.jrnl_id,
          tgt_curr_cd: this.obj['tgt_curr_cd'],
          org_unit_cd: this.mainService.accInfo['account_short_name']
        }; */
      // await this.row_table_data(this.AllJournalRow_credit[this.row_index]['lines']);




    } else if (this.row_type == 'DB') {
      this.AllJournalRow_debit[this.row_index]['lines'].push(this.jrnlLineObj);
      this.jrnlLineObj = {
        txn_amt: 0,
        db_cd_ind: 'DB',
        chart_of_account: this.AllJournalRow_debit[this.row_index]['chart_of_account'],
        acct_dt: this.obj['acct_dt'],
        proc_dt: this.systemDate,
        fin_year: this.fin_year,
        jrnl_desc: this.obj['preparer_comment'],
        ledger_type: ledger_type_value,
        jrnl_ln_id: this.row_index + 1,
        jrnl_dtl_ln_id: this.AllJournalRow_debit[this.row_index]['lines'].length + 1,
        prep_id: this.obj['prep_id'],
        appr_id: this.obj['appr_id'],
        jrnl_id: this.jrnl_id,
        tgt_curr_cd: this.obj['tgt_curr_cd'],
        org_unit_cd: this.mainService.accInfo['account_short_name']
      };
      this.row_table_data(this.AllJournalRow_debit[this.row_index]['lines']);
    }
  }

  delete_row(element, i) {
    if (this.row_type == 'CR') {
      this.AllJournalRow_credit[this.row_index]['lines'].splice(i, 1);
      this.row_table_data(this.AllJournalRow_credit[this.row_index]['lines']);

    } else if (this.row_type == 'DB') {
      this.AllJournalRow_debit[this.row_index]['lines'].splice(i, 1);
      this.row_table_data(this.AllJournalRow_debit[this.row_index]['lines']);
    }
  }

  update_row(element, i) {
    if (this.row_type == 'CR') {
      this.jrnlLineObj = Object.assign({}, element);
      this.AllJournalRow_credit[this.row_index]['lines'].splice(i, 1);
      this.row_table_data(this.AllJournalRow_credit[this.row_index]['lines']);

    } else if (this.row_type == 'DB') {
      this.jrnlLineObj = Object.assign({}, element);
      this.AllJournalRow_debit[this.row_index]['lines'].splice(i, 1);
      this.row_table_data(this.AllJournalRow_debit[this.row_index]['lines']);
    }
  }

  ok() {
    $('#change').modal('hide');
    if (this.row_type == 'CR') {
      this.AllJournalRow_credit[this.row_index]['txn_amt'] = 0;
      for (let i = 0; i < this.AllJournalRow_credit[this.row_index]['lines'].length; i++) {
        this.AllJournalRow_credit[this.row_index]['txn_amt'] = this.AllJournalRow_credit[this.row_index]['txn_amt'] + parseInt(this.AllJournalRow_credit[this.row_index]['lines'][i]['txn_amt'])
      }

      this.cr = 0;
      for (let i = 0; i < this.AllJournalRow_credit.length; i++) {
        this.cr = this.cr + this.AllJournalRow_credit[i]['txn_amt'];
      }
    } else if (this.row_type == 'DB') {
      this.AllJournalRow_debit[this.row_index]['txn_amt'] = 0;
      for (let i = 0; i < this.AllJournalRow_debit[this.row_index]['lines'].length; i++) {
        this.AllJournalRow_debit[this.row_index]['txn_amt'] = this.AllJournalRow_debit[this.row_index]['txn_amt'] + parseInt(this.AllJournalRow_debit[this.row_index]['lines'][i]['txn_amt'])
      }
      this.db = 0;
      for (let i = 0; i < this.AllJournalRow_debit.length; i++) {
        this.AllJournalRow_debit[i]['txn_amt'] = this.AllJournalRow_debit[i]['txn_amt'];
        this.db = this.db + this.AllJournalRow_debit[i]['txn_amt'];
      }
    }

  }

  async getAllUnPostedJournalInfo() {
    var resp = await this.ledgerService.getAllUnpostedJournalInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.allUnPostedJournalInfo = resp.data;
      this.datasource = new MatTableDataSource(this.allUnPostedJournalInfo)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all Unposted Journal info list", 'Error', {
        duration: 5000
      });
    }
  }

  open_update(element) {
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.obj = Object.assign({}, element);

    this.AllJournalRow_credit = [];
    this.AllJournalRow_debit = [];
    this.cr = 0;
    this.db = 0;

    var all_account_lines = JSON.parse(element.data_lines);
    for (let i = 0; i < all_account_lines.length; i++) {
      if (all_account_lines[i]['type'] == 'credit') {
        this.AllJournalRow_credit.push(all_account_lines[i]['data'])
        this.cr = this.cr + all_account_lines[i]['data']['txn_amt'];
      }
      if (all_account_lines[i]['type'] == 'debit') {
        this.AllJournalRow_credit.push(all_account_lines[i]['data']);
        this.db = this.db + all_account_lines[i]['data']['txn_amt'];
      }

    }
  }

  async refresh() {
    this.obj = { prep_id: this.user_id, appr_id: this.user_id, tgt_curr_cd: 'INR', status: 'Under Creation', preparer_comment: '', ledger_type: '' };
    this.AllJournalRow_credit = [];
    this.AllJournalRow_debit = [];
    this.cr = 0;
    this.db = 0;
  }

  async post(element) {
    var data = [];
    var all_account_lines = JSON.parse(element.data_lines);
    for (let i = 0; i < all_account_lines.length; i++) {
      if (all_account_lines[i]['type'] == 'credit') {
        for (let j = 0; j < all_account_lines[i]['data']['lines'].length; j++) {
          all_account_lines[i]['data']['lines'][j]['jrnl_type'] = "Manual"

          data.push(all_account_lines[i]['data']['lines'][j]);
        }

      }
      if (all_account_lines[i]['type'] == 'debit') {
        for (let j = 0; j < all_account_lines[i]['data']['lines'].length; j++) {
          all_account_lines[i]['data']['lines'][j]['txn_amt'] = parseInt(all_account_lines[i]['data']['lines'][j]['txn_amt']);
          all_account_lines[i]['data']['lines'][j]['jrnl_type'] = "Manual"
          data.push(all_account_lines[i]['data']['lines'][j]);
        }
      }

    }
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = data;
    obj['id'] = element['id'];
    obj['status'] = 'Posted';
    var resp = await this.ledgerService.postingJournal(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllUnPostedJournalInfo();
      this.snackBar.open("Journal Posted Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while posting journal", 'Error', {
        duration: 5000
      });
    }
  }

  async check() {
    this.db = 0;
    this.cr = 0;
    /*  for (var i = 0; i < this.AllJournalRow_debit.length; i++) {
       this.db += this.AllJournalRow_debit[i]['txn_amt'];
       this.AllJournalRow_debit[i]['db_cd_ind'] = 'DB';
     } */
    for (var i = 0; i < this.AllJournalRow_credit.length; i++) {
      if (this.AllJournalRow_credit[i]['db_cd_ind'] == 'CR') {
        this.cr += this.AllJournalRow_credit[i]['txn_amt'];
        this.AllJournalRow_credit[i]['db_cd_ind'] = 'CR';
      } else {
      this.db += this.AllJournalRow_credit[i]['txn_amt'];
        this.AllJournalRow_credit[i]['db_cd_ind'] = 'DB';

      }

    }

    var total = this.cr - this.db;
    if (total != 0) {
      Swal.fire({
        title: 'Debit and Credit are not equal',
        icon: 'error',
        showCancelButton: true,

      })
    } else {
      Swal.fire({
        title: 'Are You Sure? Total Debit is ' + this.db + ', Total Credit is ' + this.cr,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        if (result.value) {
          this.save()
        }
      })
    }

  }


  async getCurrentJrnlId() {
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;

    var resp = await this.ledgerService.getMaxJournalId(JSON.stringify(obj1));
    if (resp['error'] == false) {
      if (resp.data[0][0].jrnl_id == null && resp.data[1][0].jrnl_id == null) {
        this.obj['jrnl_id'] = 1;
      } else if (resp.data[1][0].jrnl_id == null && resp.data[0][0].jrnl_id != null) {

        this.obj['jrnl_id'] = resp.data[0][0].jrnl_id + 1;
      }
      else if (resp.data[1][0].jrnl_id != null && resp.data[0][0].jrnl_id == null) {
        this.obj['jrnl_id'] = resp.data[1][0].jrnl_id + 1;
      }
      else if (resp.data[1][0].jrnl_id != null && resp.data[0][0].jrnl_id != null) {
        this.obj['jrnl_id'] = resp.data[1][0].jrnl_id + 1;
        if (resp.data[1][0].jrnl_id > resp.data[0][0].jrnl_id) {
          this.obj['jrnl_id'] = resp.data[1][0].jrnl_id + 1;
        } else {
          this.obj['jrnl_id'] = resp.data[0][0].jrnl_id + 1;
        }
      }
    }
    else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Journal", 'Error', {
        duration: 5000
      });
      return;
    }
  }


  async save() {
    // this.spinner.show();
    await this.getCurrentJrnlId();

    var data = [];
    for (let i = 0; i < this.AllJournalRow_credit.length; i++) {
      if (this.AllJournalRow_credit[i]['db_cd_ind'] == 'CR') {
        data.push({ type: 'credit', data: this.AllJournalRow_credit[i] });
      } else {
        data.push({ type: 'debit', data: this.AllJournalRow_credit[i] });

      }

    }
    /* for (let i = 0; i < this.AllJournalRow_debit.length; i++) {
      data.push({ type: 'debit', data: this.AllJournalRow_debit[i] });
    } */

    this.obj['org_unit_cd'] = this.mainService.accInfo['account_short_name'];
    this.obj['data_lines'] = JSON.stringify(data);
    this.obj['b_acct_id'] = this.b_acct_id;
    this.obj['tgt_curr_cd'] = 'INR';
    this.obj['status'] = 'Created';
    var resp = await this.ledgerService.addUnpostedJournal(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllUnPostedJournalInfo();
      await this.getCurrentJrnlId();
      this.snackBar.open("Journal Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Journal", 'Error', {
        duration: 5000
      });
    }
  }

  async checkOnUpdate() {
    this.db = 0;
    this.cr = 0;
    for (var i = 0; i < this.AllJournalRow_debit.length; i++) {
      this.db += this.AllJournalRow_debit[i]['txn_amt'];
      this.AllJournalRow_debit[i]['db_cd_ind'] = 'DB';
    }
    for (var i = 0; i < this.AllJournalRow_credit.length; i++) {
      if (this.AllJournalRow_credit[i]['db_cd_ind'] == 'CR') {
        this.cr += this.AllJournalRow_credit[i]['txn_amt'];
        this.AllJournalRow_credit[i]['db_cd_ind'] = 'CR';
      } else {
      this.db += this.AllJournalRow_credit[i]['txn_amt'];
        this.AllJournalRow_credit[i]['db_cd_ind'] = 'DB';

      }
    }

    var total = this.cr - this.db;
    if (total != 0) {
      Swal.fire({
        title: 'Debit and Credit are not equal',
        icon: 'error',
        showCancelButton: true,

      })
    } else {
      Swal.fire({
        title: 'Are You Sure? Total Debit is ' + this.db + ', Total Credit is ' + this.cr,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        if (result.value) {
          this.update()
        }
      })
    }

  }

  async update() {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;

    var resp = await this.ledgerService.getMaxJournalId(JSON.stringify(obj1));
    if (resp['error'] == false) {
      if (resp.data[0][0].jrnl_line_id == null && resp.data[1][0].jrnl_line_id == null) {
        this.obj['jrnl_line_id'] = 1;
      } else if (resp.data[1][0].jrnl_line_id == null && resp.data[0][0].jrnl_line_id != null) {

        this.obj['jrnl_line_id'] = resp.data[0][0].jrnl_line_id + 1;
      }
      else if (resp.data[1][0].jrnl_line_id != null && resp.data[0][0].jrnl_line_id == null) {
        this.obj['jrnl_line_id'] = resp.data[1][0].jrnl_line_id + 1;
      }
      else if (resp.data[1][0].jrnl_line_id != null && resp.data[0][0].jrnl_line_id != null) {
        this.obj['jrnl_line_id'] = resp.data[1][0].jrnl_line_id + 1;
        if (resp.data[1][0].jrnl_line_id > resp.data[0][0].jrnl_line_id) {
          this.obj['jrnl_line_id'] = resp.data[1][0].jrnl_line_id + 1;
        } else {
          this.obj['jrnl_line_id'] = resp.data[0][0].jrnl_line_id + 1;
        }
      }
    }
    else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Journal", 'Error', {
        duration: 5000
      });
      return;
    }

    var data = [];
    for (let i = 0; i < this.AllJournalRow_credit.length; i++) {
      if (this.AllJournalRow_credit[i]['db_cd_ind'] == 'CR') {
        data.push({ type: 'credit', data: this.AllJournalRow_credit[i] });
      } else {
        data.push({ type: 'debit', data: this.AllJournalRow_credit[i] });

      }
    }
    /*  for (let i = 0; i < this.AllJournalRow_debit.length; i++) {
       data.push({ type: 'debit', data: this.AllJournalRow_debit[i] });
     } */


    this.obj['org_unit_cd'] = this.mainService.accInfo['account_short_name'];
    this.obj['data_lines'] = JSON.stringify(data);
    this.obj['b_acct_id'] = this.b_acct_id;
    this.obj['tgt_curr_cd'] = 'INR';

    var resp = await this.ledgerService.updateUnpostedJournal(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllUnPostedJournalInfo();
      this.snackBar.open("Journal Update Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while update Journal", 'Error', {
        duration: 5000
      });
    }
  }

  async delete(element) {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['id'] = element.id;
    var resp = await this.ledgerService.deleteUnpostedJournal(JSON.stringify(obj1));
    if (resp['error'] == false) {
      await this.getAllUnPostedJournalInfo();
      this.spinner.hide();
      this.snackBar.open("Journal Delete Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while delete Journal ", 'Error', {
        duration: 5000
      });
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}