import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { LedgerService } from '../service/ledger.service';
import { MainService } from '../service/main.service';
import swal from 'sweetalert2';
import { SettingService } from '../service/setting.service'
import { BpService } from '../service/bp.service'
import { RuleService } from '../service/rule.service'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
import { BillService } from '../service/bill.service'
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { ChartAcctMapingServiceService } from '../service/chart-acct-maping-service.service';
import { UserAddService } from '../../../app/portal/service/user-add.service';

declare var $: any
@Component({
  selector: 'app-bp',
  templateUrl: './bp.component.html',
  styleUrls: ['./bp.component.css']
})
export class BpComponent implements OnInit {

  constructor(private userAddService:UserAddService,private chartAccMapingS: ChartAcctMapingServiceService, public mainService: MainService, private billService: BillService, private ruleService: RuleService, private BPS: BpService, private settingService: SettingService, private ledgerService: LedgerService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  search_obj = {};
  obj = {};

  AllPartyObj = {};
  allParty = [];
  allAccountInfo = [];
  AllAccountObj = {};
  allBankAccounts;
  show_selected_table: Number = 0;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;

  headerBPDataView = [{ full_name: 'Party Id' }, { full_name: 'Party Name' }, { full_name: 'Party Bank Account Number' }, { full_name: 'Party Bank Code' }
    , { full_name: 'Party Branch Code' }, { full_name: 'Party IFSA Code' }, { full_name: 'AMOUNT' }]


  list = ['select_flag', 'party_id', 'party_name', 'Amount', 'bp_date', 'remark', 'status', 'action'];

  datasource;
  allChartOfAccount = [];
  BP_data = [];
  AllBpRow = [{ bp_id: '', bp_date: '', bp_desc: '', bp_status: '' }];
  popUpTableData = []
  systemDate;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.billService.getSystemDate();
    this.systemDate = resp.data;
    await this.getUsersInfo();
    await this.getAllApproveRule();
    await this.getBankAccount()
    await this.getAllParties()
    await this.getallChartOfAccount()
    await this.getList();
    await this.getChartOfAccountMappingList();
    await this.getActiveFinYear();
  }

  async schedule(element) {
    console.log(element)
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = [];
    for (var i = 0; i < this.allApproval.length; i++) {
      if (this.allApproval[i]['doc_type'] == 'BP') {
        obj['data'].push({
          user_id: this.allApproval[i]['user_id'],
          level_of_approval: this.allApproval[i]['level_of_approval'],
          doc_type: this.allApproval[i]['doc_type'],
          create_user_id: this.erpUser.user_id,
          doc_local_no: element['id'],
          doc_local_desc: element['id'] + "-" + element['remark'],
          status: 'PENDING'
        })
      }
    }



    var resp = await this.billService.sendToApproval(obj);
    if (resp['error'] == false) {
      await this.changeBPStatus(element);
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while sending the bill to approvel', 'error');
    }
  }
  async changeBPStatus(element) {
    this.spinner.show();
    let obj = new Object();
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element.id
    obj['status'] = 'SCHEDULED'
    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.BPS.updateStatus(obj);
    if (resp['error'] == false) {
      await this.getList();
      this.spinner.hide();
      swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating bp !", 'error');
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
        if (this.allApproval[i]['doc_type'] == 'BP') {
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

  //////********************************************************************** */
  fin_year

  async getActiveFinYear() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getActiveFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      if (resp.data.length == 0) {
        swal.fire("Warning", "..Active Financial Year Not set!", 'warning');
      } else {
        this.fin_year = resp.data[0].fin_year;
      }
    } else {
      swal.fire("Error", "..Error while getting active  fin year!", 'error');
    }
  }  
  async search() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id
    obj['party_id'] = this.search_obj['party_id']
    obj['date'] = this.systemDate
    obj['chart_of_account'] = this.search_obj['chart_of_account']
    var resp = await this.BPS.getbpData(JSON.stringify(obj));
    if (resp['error'] == false) {
      if (resp['data'].length == 0) {
        swal.fire('No Record Found', '', 'warning')
      }
      this.spinner.hide()
      this.popUpTableData = resp['data']
      for (let i = 0; i < this.popUpTableData.length; i++) {
        this.popUpTableData[i]['select'] = false
      }
    }
    else {
      this.spinner.hide()
      swal.fire('Some error Occured', '', 'error')
    }

  }
  org_short_name
  async assignValuesForBill(event1, obj) {
    var event = event1['data']
    var arr = []
    for (let i = 0; i < event.length; i++) {
      var obj5 = {}

      obj5['org_unit_cd'] = this.mainService.accInfo['account_short_name']   //need 
      obj5['tgt_curr_cd'] = 'INR'
      obj5['jrnl_id'] = event[i]['jrnl_id']
      obj5['prep_id'] = this.erpUser.user_id
      obj5['appr_id'] = this.erpUser.user_id
      obj5['acct_dt'] = this.systemDate
      obj5['jrnl_desc'] = 'Bank Payment Voucher For ' + event[i]['party_name']
      obj5['txn_amt'] = event[i]['txn_amt']
      obj5['jrnl_ln_id'] = 1
      obj5['event_code'] = ''//event[i]['event_code']
      obj5['proc_dt'] = this.systemDate //need
      //obj5['event_id'] = ''
      obj5['fin_year'] = this.fin_year  //need
      obj5['arr_id'] = event[i]['arr_id']
      // obj5['event_ln_id'] = ''
      obj5['jrnl_type'] = 'BP'//event[i]['bus_event_type']
      obj5['jrnl_line_desc'] = ''
      obj5['db_cd_ind'] = 'DB'
      obj5['chart_of_account'] = event[i]['chart_of_account']
      obj5['ledger_type'] = 'A'
      obj5['status'] = 'UNPOSTED'
      arr.push(obj5)
      obj = {}

      obj['org_unit_cd'] = this.mainService.accInfo['account_short_name']   //need 
      obj['tgt_curr_cd'] = 'INR'
      obj['jrnl_id'] = event[i]['jrnl_id']
      obj['prep_id'] = this.erpUser.user_id
      obj['appr_id'] = this.erpUser.user_id
      obj['acct_dt'] = this.systemDate
      obj['jrnl_desc'] = 'Bank Payment Voucher For ' + event[i]['party_name']
      obj['txn_amt'] = event[i]['txn_amt']
      obj['jrnl_ln_id'] = 2
      obj['event_code'] = ''//event[i]['event_code']
      obj['proc_dt'] = this.systemDate //need
      // obj['event_id'] = ''
      obj['fin_year'] = this.fin_year  //need
      obj['arr_id'] = event[i]['arr_id']
      // obj['event_ln_id'] = ''
      obj['jrnl_type'] = 'BP'//event[i]['bus_event_type']
      obj['jrnl_line_desc'] = ''
      obj['db_cd_ind'] = 'CR'
      obj['chart_of_account'] = event[i]['org_bank_acct_no']
      obj['ledger_type'] = 'A'
      obj['status'] = 'UNPOSTED'
      arr.push(obj)
    }
    var obj1 = {}
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['jrnl'] = arr
    var resp = await this.BPS.insertProcessedbp(obj1);
    if (resp['error'] == false) {
      this.spinner.hide();
      //await this.getAllCBInfo();
      swal.fire("Success", "Processed Successfully!", 'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while Processed  Bill Insert!", 'error');
    }
    return arr;
  }
  checked_this(d) {
    let index = Number(d.target.value)
    if (d.target.checked) {
      this.selected_list.push(this.popUpTableData[index])
    }
    else {
      var i = 0;
      while (i < this.selected_list.length) {
        if (this.selected_list[i] === Number(d.target.value)) {
          this.selected_list.splice(i, 1);
        } else {
          ++i;
        }
      }
    }

  }
  selected_table() {
    swal.fire('Items Selected Successfully', '', 'success')
    this.show_selected_table = 1
    let arr = []
    for (let i = 0; i < this.popUpTableData.length; i++) {

      if (this.popUpTableData[i]['select'] == true) {
        this.popUpTableData[i]['bp_date'] = this.systemDate
        arr.push(this.popUpTableData[i])
      }
    }
    this.selected_list = arr
  }


  selected_list = []
  select() {

  }


  ChartOfAccountToAccountObj = {};
  BankChartOfAccount = []
  async getChartOfAccountMappingList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.chartAccMapingS.getRelationList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.ChartOfAccountToAccountObj = {};
      for (let i = 0; i < resp['data'].length; i++) {
        for (let j = 0; j < this.allChartOfAccount.length; j++) {
          if (resp['data'][i]['chart_of_account'] == this.allChartOfAccount[j]['leaf_code']) {
            resp['data'][i]['chart_of_account_desc'] = this.allChartOfAccount[j]['leaf_value']
            resp['data'][i]['chart_of_account_code'] = resp['data'][i]['chart_of_account'];
            this.ChartOfAccountToAccountObj[resp['data'][i]['chart_of_account_code']] = resp['data'][i]['relation']
          }
        }
      }

      this.BankChartOfAccount = resp.data;
      this.spinner.hide();


    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  list!", 'error');
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  refresh() {

  }

  async getBankAccount() {
    var resp = await this.settingService.getBankAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBankAccounts = resp.data;
      for (var i = 0; i < resp['data'].length; i++) {
        this.allBankAccounts[i]['bank_acct_desc'] = resp['data'][i]['bank_acct_desc'] + ' - ' + resp['data'][i]['bank_acct_no'] + ' - ' + resp['data'][i]['bank_code'] + ' - ' + resp['data'][i]['ifsc_code']
      }
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all fields list!", 'error');
    }
  }
  async submit() {
    this.spinner.show();
    let obj = {}
    obj = this.search_obj
    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.erpUser.user_id
    obj['data'] = this.selected_list
    obj['status'] = 'GENERATED'
    var arr = this.assignValuesForBill(obj, 1)
    var resp = await this.BPS.create(obj)
    if (resp['error'] == false) {
      this.spinner.hide()
      swal.fire('Successfully Submitted', '', 'success')
      await this.getList();
      this.show_selected_table = 0
    }
    else {
      this.spinner.hide()
      swal.fire("Error", "...Error while getting  all party list!", 'error');
    }
  }
  party = {}
  async getAllParties() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getPartyInfoNew(this.b_acct_id);
    if (resp['error'] == false) {

      this.allParty = resp.data;
      for (let i = 0; i < this.allParty.length; i++) {
        this.party[this.allParty[i]['party_id']] = this.allParty[i]['party_name']
      }
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all party list!", 'error');

    }
  }
  async delete(s) {
    this.spinner.show()
    let obj = {}
    obj['id'] = s['id']
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.BPS.delete(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      swal.fire('Deleted Successfully', '', 'success')
      await this.getList();
    }
    else {
      swal.fire("Error", "...Error while getting  all party list!", 'error');
      this.spinner.hide()
    }

  }
  table_data = []
  async getList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.BPS.getList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.table_data = resp['data'];
      for (let i = 0; i < this.table_data.length; i++) {
        this.table_data[i]['select_flag'] = false;
      }
      this.datasource = new MatTableDataSource(this.table_data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all party list!", 'error');

    }
  }

  async getallChartOfAccount() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ruleService.getchartofaccount(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allChartOfAccount = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all chart of account info", 'Error', {
        duration: 5000
      });
    }
  }



  async print1(e) {

    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var arr = []
        var obj = { text: 'Bank Payment', alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        arr.push(obj);
        var obj1 = { text: "Bank Payment", alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        arr.push(obj1);


        return arr;
      },

      pageOrientation: 'landscape',

      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };
    var header1 = {
      columns: [
        {

          width: '*',
          text: 'Party Name:',
          bold: true
        },
        {
          width: '*',
          text: this.party[e.party_id]
        },
        {

          width: '*',
          text: 'Party ID',
          bold: true
        },
        {

          width: '*',
          text: e['party_id']
        }
      ],

    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Amount',
          bold: true
        },
        {
          width: '*',
          text: e['bp_amount']
        },
        {

          width: '*',
          text: 'Chart Of Account :',
          bold: true
        },
        {
          width: '*',
          text: e['chart_of_account']
        }
      ],

    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Remark:',
          bold: true
        },
        {
          width: '*',
          text: e['remark']
        },
        {

          width: '*',
          text: 'Created User ID',
          bold: true
        },
        {
          width: '*',
          text: e['create_user_id']
        }
      ],

    }
    var header4 = {
      columns: [
        {

          width: '*',
          text: 'BP Date:',
          bold: true
        },
        {

          width: '*',
          text: this.mainService.dateFormatChange(e['bp_date'])
        },
        {

          width: '*',
          text: 'Status',
          bold: true
        },
        {
          width: '*',
          text: e['status']
        }

      ],

    }



    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push({ text: " " });
    dd.content.push(header2);
    dd.content.push({ text: " " });
    dd.content.push(header3);
    dd.content.push({ text: " " });
    dd.content.push(header4);
    dd.content.push({ text: " " });

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });



    pdfMake.createPdf(dd).download('detail.pdf');

  }
  remark;
  addRemark() {
    $('#myModal').modal('show');
  }
  async GenerateAdvice() {
    this.spinner.show();
    var arr = [];
    var ids = []
    var amt = 0
    for (let i = 0; i < this.table_data.length; i++) {
      if (this.table_data[i]['select_flag'] == true && this.table_data[i]['status'] == 'APPROVED') {
        arr.push(this.table_data[i]);
        ids.push(this.table_data[i]['id'])
        amt = amt + this.table_data[i]['bp_amount']
      }
    }
    if (arr.length == 0) {
      this.spinner.hide();
      $('#myModal').modal('hide');
      swal.fire('Selected Bank Payment Pending.....! ', '', 'warning');
      return;
    }

    var coa = []
    for (let i = 0; i < arr.length; i++) {
      var temp = JSON.parse(arr[i]['data']);
      coa.push(temp['org_bank_acct_no'])
    }
    var unique = coa.filter((v, i, a) => a.indexOf(v) === i);
    if (unique.length != 1) {
      this.spinner.hide();
      $('#myModal').modal('hide');
      swal.fire('Selected Bank Payment More Then one Bank Account.....! ', '', 'warning');
      return;
    }

    var obj = new Object();
    obj['id'] = ids.join(",");
    obj['b_acct_id'] = this.b_acct_id;
    obj['update_user_id'] = this.erpUser.user_id;
    obj['status'] = 'ADVICEGENERATED';
    var resp = await this.BPS.updateStatus(obj)
    if (resp['error'] == false) {
      await this.addAdvice(ids, amt);
      await this.getList();
      this.spinner.hide();
      $('#myModal').modal('hide');
      swal.fire('Successfully Submitted', '', 'success')
    }
    else {
      this.spinner.hide()
    }



  }

  async addAdvice(ids, amt) {
    var obj = new Object();
    obj['bpid'] = ids.join(",");
    obj['amount'] = amt
    obj['b_acct_id'] = this.b_acct_id;
    obj['create_user_id'] = this.erpUser.user_id;
    obj['status'] = 'PENDING';
    obj['remark'] = this.remark;
    var resp = await this.BPS.createAdvice(obj);
    if (resp['error'] == false) {
    }
    else {
    }
  }


}
