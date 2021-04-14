import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { BillService } from '../service/bill.service';
import { RuleService } from '../service/rule.service';
import { LedgerService } from '../service/ledger.service';
import { MainService } from '../service/main.service';
import swal from 'sweetalert2';
import { EventsService } from '../service/events.service';
import { BudgetService } from '../service/budget.service';
import { RuleProcessService } from '../service/rule-process.service';
import { SettingService } from '../service/setting.service';
import { UserAddService } from '../../../app/portal/service/user-add.service';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

declare var $: any

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css']
})
export class BillComponent implements OnInit {

  constructor(private userAdd: UserAddService, private settingService: SettingService, private ruleProcessService: RuleProcessService,
    private budgetService: BudgetService, private EventsService: EventsService, public mainService: MainService, private ledgerService: LedgerService, private ruleService: RuleService, private billService: BillService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;

  fin_year;

  gstArr = [{ code: 'cgst_sgst', value: 'CGST/SGST' }, { code: 'igst', value: 'IGST' }]
  gstArrObj = { cgst_sgst: 'CGST/SGST', igst: 'IGST' }
  amountTypeArr = [{ code: 'fixed', value: 'FIXED' }, { code: 'percentage', value: 'PERCENTAGE' }]
  amountTypeArrObj = { fixed: 'FIXED', percentage: 'PERCENTAGE' }
  partyArr = []
  partyArrObj = {}
  obj = {};
  selectAccountType;
  allCBInfo = [];
  cb_status = [{ code: 'GENERATED', value: 'GENERATED' }, { code: 'REJECTED', value: 'REJECTED' }]
  allAccountInfo = []
  AllAccountObj = {};
  hsnArr = []
  gstObj = {}
  hsnObj = {}
  AllBillRow = [];
  AllDedRow = []
  rateObj = {}
  //getEventFromCode = {}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;


  displayedColumns1 = ['event_code', 'event_desc', 'action'];
  dataSource1;

  displayedColumns = ['select', 'cb_id', 'party_id', 'work_order_no', 'work_or_service_name', 'bill_no', 'bill_date', 'cb_date', 'status', 'action'];
  datasource;
  total_amt = 0
  total_ded_amount = 0
  net_amount = 0
  cgstAmount = 0
  sgstAmount = 0
  igstAmount = 0
  totalAmount = 0
  TaxAmount = 0
  selectedStatus = ''
  systemDate = ''
  allEVents = []
  dedTypeObj = {}



  allAllocationArr = []
  allBudgetHier = []
  allProjectHier = []
  allProductHier = []
  allActivityHier = []
  orgShortName
  allRule = [];
  eventArr = [];
  allocationAmountObj = {}
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;

    var resp = await this.billService.getSystemDate();
    this.systemDate = resp.data
    this.orgShortName = await this.mainService.accInfo['account_short_name']
    this.spinner.show();
    await this.getAllApproveRule();
    await this.getUsersInfo();
    await this.getDedType();
    await this.getDedData();
    await this.getAllCBInfo()
    await this.getActiveFinYear();
    await this.getgst();
    await this.getIp();
    await this.getBudgetHier();
    await this.getProjectHier();
    await this.getActivityHier();
    await this.allAllocation();
    await this.getProductHier();
    await this.getAllRuleList();
    await this.setData();
    await this.getworkInfo();
    this.spinner.hide();
  }
  async schedule(element) {
    console.log(element)
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = [];
    for (var i = 0; i < this.allApproval.length; i++) {
      if (this.allApproval[i]['doc_type'] == 'BILL') {
        obj['data'].push({
          user_id: this.allApproval[i]['user_id'],
          level_of_approval: this.allApproval[i]['level_of_approval'],
          doc_type: this.allApproval[i]['doc_type'],
          create_user_id: this.erpUser.user_id,
          doc_local_no: element['cb_id'],
          doc_local_desc: element['cb_id'] + "-" + element['work_or_service_name'],
          status: 'PENDING'
        })
      }
    }



    var resp = await this.billService.sendToApproval(obj);
    if (resp['error'] == false) {
      await this.changeCBStatus(element['cb_id'], 'SCHEDULED');
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while sending the bill to approvel', 'error');
    }
  }

  statusArr = [];
  async status(element) {
    var obj = new Object();
    console.log(element);
    obj["b_acct_id"] = this.b_acct_id;
    obj["bill_id"] = element.cb_id;
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
        if (this.allApproval[i]['doc_type'] == 'BILL') {
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


  //allBudgetHier = [];
  level1 = [];
  level2 = []
  level3 = []
  level4 = []
  level5 = []
  level6 = []
  level7 = []
  Chartobj = {}
  BALACESHEET = [{ lvl2_value: 'ASSET', lvl2_code: '100011' }, { lvl2_value: 'LIABILITY', lvl2_code: '100012' }, { lvl2_value: 'EQUITY', lvl2_code: '100013' }];
  INCOME_STATEMENT = [{ lvl2_value: 'INCOME', lvl2_code: '100021' }, { lvl2_value: 'EXPENSE', lvl2_code: '100022' }];
  Hier = [];
  type;
  async Select(type) {
    $('#select').modal('show');
    this.type = type;
    if (type == 'budget') {
      this.Hier = this.allBudgetHier;
    } else if (type == 'activity') {
      this.Hier = this.allActivityHier;
    } else if (type == 'project') {
      this.Hier = this.allProjectHier;
    } else if (type == 'product') {
      this.Hier = this.allProductHier;
    }

    await this.getLevel1();
    this.Chartobj = {};
  }

  getLevel1() {
    let temp = []
    this.level1 = []
    for (let i = 0; i < this.Hier.length; i++) {
      if (!temp.includes(this.Hier[i]['lvl1_cd'])) {
        temp.push(this.Hier[i]['lvl1_cd'])
        let ob = new Object();
        ob['lvl1_cd'] = this.Hier[i]['lvl1_cd']
        ob['lvl1_value'] = this.Hier[i]['lvl1_value']
        this.level1.push(ob)
      }
    }

    this.level2 = []
    this.level3 = []
    this.level4 = []
    this.level5 = []
    this.level6 = []
    this.level7 = []
  }
  allwork = []
  AllworkObj = {}
  AllworkpartyObj = {}
  async getworkInfo() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.billService.getworkInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allwork = []
      this.AllworkObj = {}
      this.allwork = resp.data;
      for (let i = 0; i < this.allwork.length; i++) {
        this.AllworkObj[this.allwork[i]['id']] = this.allwork[i].work_desc;
        this.AllworkpartyObj[this.allwork[i]['id']] = this.allwork[i].party_id;
        this.allwork[i]['temp_desc'] = this.allwork[i].work_order_no + '-' + this.allwork[i].work_desc
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all work list", 'Error', {
        duration: 5000
      });
    }
  }
  changework() {
    this.obj['work_or_service_name'] = this.AllworkObj[this.obj['work_order_no']]
    this.obj['party_id'] = this.AllworkpartyObj[this.obj['work_order_no']]
  }

  async onChangeLvl1() {
    for (let i = 0; i < this.level1.length; i++) {
      if (this.level1[i]['lvl1_cd'] == this.Chartobj['lvl1_cd']) {
        this.Chartobj['lvl1_value'] = this.level1[i]['lvl1_value']
      }
    }
    let temp = []
    this.level2 = []
    for (let i = 0; i < this.Hier.length; i++) {
      if (this.Hier[i]['lvl1_cd'] == this.Chartobj['lvl1_cd'] && this.Hier[i]['lvl2_cd'] != null) {
        if (!temp.includes(this.Hier[i]['lvl2_cd'])) {
          temp.push(this.Hier[i]['lvl2_cd'])
          let ob = new Object();
          ob['lvl2_cd'] = this.Hier[i]['lvl2_cd']
          ob['lvl2_value'] = this.Hier[i]['lvl2_value']
          this.level2.push(ob)
        }
      }

    }

    this.level3 = []
    this.level4 = []
    this.level5 = []
    this.level6 = []
    this.level7 = []

    for (let i = 2; i < 8; i++) {
      this.Chartobj['lvl' + i + '_cd'] = null
      this.Chartobj['lvl' + i + '_value'] = null
    }

    await this.makingLeafValues()


  }

  async  onChangeLvl2() {
    for (let i = 0; i < this.level2.length; i++) {
      if (this.level2[i]['lvl2_cd'] == this.Chartobj['lvl2_cd']) {
        this.Chartobj['lvl2_value'] = this.level2[i]['lvl2_value']
      }
    }
    let temp = []
    this.level3 = []
    for (let i = 0; i < this.Hier.length; i++) {
      if (this.Hier[i]['lvl2_cd'] == this.Chartobj['lvl2_cd'] && this.Hier[i]['lvl3_cd'] != null) {
        if (!temp.includes(this.Hier[i]['lvl3_cd'])) {
          temp.push(this.Hier[i]['lvl3_cd'])
          let ob = new Object()
          ob['lvl3_cd'] = this.Hier[i]['lvl3_cd']
          ob['lvl3_value'] = this.Hier[i]['lvl3_value']
          this.level3.push(ob)
        }
      }
    }
    this.level4 = []
    this.level5 = []
    this.level6 = []
    this.level7 = []

    for (let i = 3; i < 8; i++) {
      this.Chartobj['lvl' + i + '_cd'] = null
      this.Chartobj['lvl' + i + '_value'] = null

    }

    await this.makingLeafValues()


  }

  async  onChangeLvl3() {
    for (let i = 0; i < this.level3.length; i++) {
      if (this.level3[i]['lvl3_cd'] == this.Chartobj['lvl3_cd']) {
        this.Chartobj['lvl3_value'] = this.level3[i]['lvl3_value']
      }
    }
    let temp = []
    this.level4 = []
    for (let i = 0; i < this.Hier.length; i++) {
      if (this.Hier[i]['lvl3_cd'] == this.Chartobj['lvl3_cd'] && this.Hier[i]['lvl4_cd'] != null) {
        if (!temp.includes(this.Hier[i]['lvl4_cd'])) {
          temp.push(this.Hier[i]['lvl4_cd'])
          let ob = new Object()
          ob['lvl4_cd'] = this.Hier[i]['lvl4_cd']
          ob['lvl4_value'] = this.Hier[i]['lvl4_value']
          this.level4.push(ob)
        }
      }

    }
    this.level5 = []
    this.level6 = []
    this.level7 = []

    for (let i = 4; i < 8; i++) {
      this.Chartobj['lvl' + i + '_cd'] = null
      this.Chartobj['lvl' + i + '_value'] = null

    }

    await this.makingLeafValues()


  }

  async   onChangeLvl4() {
    for (let i = 0; i < this.level4.length; i++) {
      if (this.level4[i]['lvl4_cd'] == this.Chartobj['lvl4_cd']) {
        this.Chartobj['lvl4_value'] = this.level4[i]['lvl4_value']
      }
    }
    let temp = []
    this.level5 = []
    for (let i = 0; i < this.Hier.length; i++) {
      if (this.Hier[i]['lvl4_cd'] == this.Chartobj['lvl4_cd'] && this.Hier[i]['lvl5_cd'] != null) {
        if (!temp.includes(this.Hier[i]['lvl5_cd'])) {
          temp.push(this.Hier[i]['lvl5_cd'])
          let ob = new Object()
          ob['lvl5_cd'] = this.Hier[i]['lvl5_cd']
          ob['lvl5_value'] = this.Hier[i]['lvl5_value']
          this.level5.push(ob)
        }
      }

    }
    this.level6 = []
    this.level7 = []

    for (let i = 5; i < 8; i++) {
      this.Chartobj['lvl' + i + '_cd'] = null
      this.Chartobj['lvl' + i + '_value'] = null

    }

    await this.makingLeafValues()


  }

  async   onChangeLvl5() {
    for (let i = 0; i < this.level5.length; i++) {
      if (this.level5[i]['lvl5_cd'] == this.Chartobj['lvl5_cd']) {
        this.Chartobj['lvl5_value'] = this.level5[i]['lvl5_value']
      }
    }
    let temp = []
    this.level6 = []
    for (let i = 0; i < this.Hier.length; i++) {
      if (this.Hier[i]['lvl5_cd'] == this.Chartobj['lvl5_cd'] && this.Hier[i]['lvl6_cd'] != null) {
        if (!temp.includes(this.Hier[i]['lvl6_cd'])) {
          temp.push(this.Hier[i]['lvl6_cd'])
          let ob = new Object()
          ob['lvl6_cd'] = this.Hier[i]['lvl6_cd']
          ob['lvl6_value'] = this.Hier[i]['lvl6_value']
          this.level6.push(ob)
        }
      }

    }
    this.level7 = []

    for (let i = 6; i < 8; i++) {
      this.Chartobj['lvl' + i + '_cd'] = null
      this.Chartobj['lvl' + i + '_value'] = null

    }


    await this.makingLeafValues()

  }

  async  onChangeLvl6() {
    for (let i = 0; i < this.level6.length; i++) {
      if (this.level6[i]['lvl6_cd'] == this.Chartobj['lvl6_cd']) {
        this.Chartobj['lvl6_value'] = this.level6[i]['lvl6_value']
      }
    }
    let temp = []
    this.level7 = []
    for (let i = 0; i < this.Hier.length; i++) {
      if (this.Hier[i]['lvl6_cd'] == this.Chartobj['lvl6_cd'] && this.Hier[i]['lvl7_cd'] != null) {
        if (!temp.includes(this.Hier[i]['lvl7_cd'])) {
          temp.push(this.Hier[i]['lvl7_cd'])
          let ob = new Object()
          ob['lvl7_cd'] = this.Hier[i]['lvl7_cd']
          ob['lvl7_value'] = this.Hier[i]['lvl7_value']
          this.level7.push(ob)
        }
      }

    }

    for (let i = 7; i < 8; i++) {
      this.Chartobj['lvl' + i + '_cd'] = null
      this.Chartobj['lvl' + i + '_value'] = null

    }
    await this.makingLeafValues()


  }

  async  onChangeLvl7() {
    for (let i = 0; i < this.level7.length; i++) {
      if (this.level7[i]['lvl7_cd'] == this.Chartobj['lvl7_cd']) {
        this.Chartobj['lvl7_value'] = this.level7[i]['lvl7_value']
      }
    }

    await this.makingLeafValues()



  }

  async makingLeafValues() {

    if (this.Chartobj['lvl7_cd'] != undefined && this.Chartobj['lvl7_cd'] != '' && this.Chartobj['lvl7_cd'] != null) {
      this.Chartobj['leaf_cd'] = this.Chartobj['lvl7_cd']
      this.Chartobj['leaf_value'] = this.Chartobj['lvl7_value']
    } else if (this.Chartobj['lvl6_cd'] != undefined && this.Chartobj['lvl6_cd'] != '' && this.Chartobj['lvl6_cd'] != null) {
      this.Chartobj['leaf_cd'] = this.Chartobj['lvl6_cd']
      this.Chartobj['leaf_value'] = this.Chartobj['lvl6_value']
    } else if (this.Chartobj['lvl5_cd'] != undefined && this.Chartobj['lvl5_cd'] != '' && this.Chartobj['lvl5_cd'] != null) {
      this.Chartobj['leaf_cd'] = this.Chartobj['lvl5_cd']
      this.Chartobj['leaf_value'] = this.Chartobj['lvl5_value']
    } else if (this.Chartobj['lvl4_cd'] != undefined && this.Chartobj['lvl4_cd'] != '' && this.Chartobj['lvl4_cd'] != null) {
      this.Chartobj['leaf_cd'] = this.Chartobj['lvl4_cd']
      this.Chartobj['leaf_value'] = this.Chartobj['lvl4_value']
    } else if (this.Chartobj['lvl3_cd'] != undefined && this.Chartobj['lvl3_cd'] != '' && this.Chartobj['lvl3_cd'] != null) {
      this.Chartobj['leaf_cd'] = this.Chartobj['lvl3_cd']
      this.Chartobj['leaf_value'] = this.Chartobj['lvl3_value']
    } else if (this.Chartobj['lvl2_cd'] != undefined && this.Chartobj['lvl2_cd'] != '' && this.Chartobj['lvl2_cd'] != null) {
      this.Chartobj['leaf_cd'] = this.Chartobj['lvl2_cd']
      this.Chartobj['leaf_value'] = this.Chartobj['lvl2_value']
    } else if (this.Chartobj['lvl1_cd'] != undefined && this.Chartobj['lvl1_cd'] != '' && this.Chartobj['lvl1_cd'] != null) {
      this.Chartobj['leaf_cd'] = this.Chartobj['lvl1_cd']
      this.Chartobj['leaf_value'] = this.Chartobj['lvl1_value']
    }

  }

  SubmitSelectedEvnetHier() {
    if (this.type == 'budget') {
      for (let i = 0; i < this.allBudget.length; i++) {
        if (this.allBudget[i]['code'] == this.Chartobj['leaf_cd']) {
          this.selectObj['bud_desc'] = this.allBudget[i]['desc'];
          this.selectObj['bud_cd'] = this.allBudget[i]['code'];
          this.selectObj['bud_lvl'] = this.allBudget[i]['level'];
        }
      }
    } else if (this.type == 'activity') {
      for (let i = 0; i < this.allActivity.length; i++) {
        if (this.allActivity[i]['code'] == this.Chartobj['leaf_cd']) {
          this.selectObj['act_desc'] = this.allActivity[i]['desc'];
          this.selectObj['act_cd'] = this.allActivity[i]['code'];
          this.selectObj['act_lvl'] = this.allActivity[i]['level'];
        }
      }
    } else if (this.type == 'project') {
      for (let i = 0; i < this.allProject.length; i++) {
        if (this.allProject[i]['code'] == this.Chartobj['leaf_cd']) {
          this.selectObj['proj_desc'] = this.allProject[i]['desc'];
          this.selectObj['proj_cd'] = this.allProject[i]['code'];
          this.selectObj['proj_lvl'] = this.allProject[i]['level'];
        }
      }
    } else if (this.type == 'product') {
      for (let i = 0; i < this.allProduct.length; i++) {
        if (this.allProduct[i]['code'] == this.Chartobj['leaf_cd']) {
          this.selectObj['prod_cd'] = this.allProduct[i]['code'];
          this.selectObj['prod_desc'] = this.allProduct[i]['desc'];
          this.selectObj['prod_lvl'] = this.allProduct[i]['level'];
        }
      }
    }

    $('#select').modal('hide');


  }

  ////////////////////////////////////////////////////////////////////////////////////////////

  selectObj = {}
  async FilteredEvents() {
    this.selectObj['b_acct_id'] = this.b_acct_id
    var resp = await this.EventsService.getFilteredEvents(this.selectObj);
    if (resp['error'] == false) {
      this.dataSource1 = new MatTableDataSource(resp.data);
      this.dataSource1.sort = this.sortCol2;
      this.dataSource1.paginator = this.paginator1;
    } else {
    }
  }
  select(element) {
    this.AllBillRow[this.index]['event_code'] = element['event_code'];
    this.AllBillRow[this.index]['event_desc'] = element['event_desc'];
    this.AllBillRow[this.index]['event_Obj'] = element;
    $('#myModal').modal('hide');
  }

  changeProject() {
    for (let i = 0; i < this.allProject.length; i++) {
      if (this.selectObj['proj_cd'] == this.allProject[i]['code']) {
        this.selectObj['proj_desc'] = this.allProject[i]['desc'];
        this.selectObj['proj_lvl'] = this.allProject[i]['level'];
      }
    }
  }

  changeProduct() {
    for (let i = 0; i < this.allProduct.length; i++) {
      if (this.selectObj['prod_cd'] == this.allProduct[i]['code']) {
        this.selectObj['prod_desc'] = this.allProduct[i]['desc'];
        this.selectObj['prod_lvl'] = this.allProduct[i]['level'];
      }
    }
  }

  changeActivity() {
    for (let i = 0; i < this.allActivity.length; i++) {
      if (this.selectObj['act_cd'] == this.allActivity[i]['code']) {
        this.selectObj['act_desc'] = this.allActivity[i]['desc'];
        this.selectObj['act_lvl'] = this.allActivity[i]['level'];
      }
    }
  }

  changeBudget() {
    for (let i = 0; i < this.allBudget.length; i++) {
      if (this.selectObj['bud_cd'] == this.allBudget[i]['code']) {
        this.selectObj['bud_desc'] = this.allBudget[i]['desc'];
        this.selectObj['bud_lvl'] = this.allBudget[i]['level'];
      }
    }
  }
  allBudget = [];
  allProject = [];
  allProduct = [];
  allActivity = [];
  setData() {

    this.allBudget = [];
    var temp = [];
    for (let i = 0; i < this.allBudgetHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allBudgetHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allBudgetHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allBudgetHier[i]['lvl' + j + "_cd"] + " - " + this.allBudgetHier[i]['lvl' + j + "_value"] + " - " + 'Level ' + j;
        if ((temp.indexOf(this.allBudgetHier[i]['lvl' + j + "_cd"]) < 0) && this.allBudgetHier[i]['lvl' + j + "_cd"] != null) {
          this.allBudget.push(obj);
          temp.push(this.allBudgetHier[i]['lvl' + j + "_cd"])
        }
      }

      var obj = new Object();
      obj['code'] = this.allBudgetHier[i]['leaf_cd']
      obj['value'] = this.allBudgetHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allBudgetHier[i]['leaf_cd'] + " - " + this.allBudgetHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allBudgetHier[i]['leaf_cd'])
      this.allBudget.splice(p, 1)
      this.allBudget.push(obj)
    }

    temp = []
    this.allProduct = [];
    for (let i = 0; i < this.allProductHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allProductHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allProductHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allProductHier[i]['lvl' + j + "_cd"] + " - " + this.allProductHier[i]['lvl' + j + "_value"] + " - " + 'Level ' + j;
        if ((temp.indexOf(this.allProductHier[i]['lvl' + j + "_cd"]) < 0) && this.allProductHier[i]['lvl' + j + "_cd"] != null) {
          this.allProduct.push(obj);
          temp.push(this.allProductHier[i]['lvl' + j + "_cd"])
        }
      }
      var obj = new Object();
      obj['code'] = this.allProductHier[i]['leaf_cd']
      obj['value'] = this.allProductHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allProductHier[i]['leaf_cd'] + " - " + this.allProductHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allProductHier[i]['leaf_cd'])
      this.allProduct.splice(p, 1)
      this.allProduct.push(obj);
    }

    temp = [];
    this.allProject = [];
    for (let i = 0; i < this.allProjectHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allProjectHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allProjectHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allProjectHier[i]['lvl' + j + "_cd"] + " - " + this.allProjectHier[i]['lvl' + j + "_value"] + " - " + 'Level ' + j;
        if ((temp.indexOf(this.allProjectHier[i]['lvl' + j + "_cd"]) < 0) && this.allProjectHier[i]['lvl' + j + "_cd"] != null) {
          this.allProject.push(obj);
          temp.push(this.allProjectHier[i]['lvl' + j + "_cd"])
        }
      }
      var obj = new Object();
      obj['code'] = this.allProjectHier[i]['leaf_cd']
      obj['value'] = this.allProjectHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allProjectHier[i]['leaf_cd'] + " - " + this.allProjectHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allProjectHier[i]['leaf_cd'])
      this.allProject.splice(p, 1)
      this.allProject.push(obj);

    }

    temp = [];
    this.allActivity = [];
    for (let i = 0; i < this.allActivityHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allActivityHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allActivityHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allActivityHier[i]['lvl' + j + "_cd"] + " - " + this.allActivityHier[i]['lvl' + j + "_value"] + " - " + 'Level ' + j;
        if ((temp.indexOf(this.allActivityHier[i]['lvl' + j + "_cd"]) < 0) && this.allActivityHier[i]['lvl' + j + "_cd"] != null) {
          this.allActivity.push(obj);
          temp.push(this.allActivityHier[i]['lvl' + j + "_cd"])
        }
      }
      var obj = new Object();
      obj['code'] = this.allActivityHier[i]['leaf_cd']
      obj['value'] = this.allActivityHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allActivityHier[i]['leaf_cd'] + " - " + this.allActivityHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allActivityHier[i]['leaf_cd'])
      this.allActivity.splice(p, 1)
      this.allActivity.push(obj)

    }

  }
  index;
  open_event_popup(i) {
    this.index = i;
    $('#myModal').modal('show');

  }
  async getAllRuleList() {
    var resp = await this.ruleService.getAllRules(this.b_acct_id);
    if (resp['error'] == false) {
      this.allRule = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all rule list", 'Error', {
        duration: 5000
      });
    }
  }
  async allAllocation() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp1 = await this.budgetService.getAllAllocation(JSON.stringify(obj));
    if (resp1['error'] == false) {
      let arr = resp1.data;
      this.allAllocationArr = []
      this.allocationAmountObj = new Object
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]['status'] == 'ACTIVE') {
          this.allAllocationArr.push(arr[i])
          this.allocationAmountObj[arr[i]['allocation_id']] = arr[i]['amount']

        }
      }
    } else {
    }
  }


  async getBudgetHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'bud_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allBudgetHier = resp.data;

    } else {
      swal.fire("Error", "...Error while getting hierchy list", 'error');
    }
  }

  async getProjectHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'proj_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProjectHier = resp.data;


    } else {
      swal.fire("Error", "...Error while getting hierchy list", 'error');
    }
  }

  async getProductHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'prod_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProductHier = resp.data;


    } else {
      swal.fire("Error", "...Error while getting hierchy list", 'error');
    }
  }

  async getActivityHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'activity_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allActivityHier = resp.data;

    } else {
      swal.fire("Error", "...Error while getting hierchy list", 'error');
    }
  }

  async getDedType() {
    var dedArr = []
    dedArr = await this.mainService.codeValueTechObj['ACC0057']
    this.dedTypeObj = new Object
    for (let i = 0; i < dedArr.length; i++) {
      this.dedTypeObj[dedArr[i]['code']] = dedArr[i]['value']
    }
  }
  dedDataArr = {};
  async getDedData() {
    var resp = await this.settingService.getDeductionMappingList(this.b_acct_id);
    if (resp['error'] == false) {
      var dd = Object.keys(this.dedTypeObj)
      for (let i = 0; i < dd.length; i++) {
        this.dedDataArr[dd[i]] = []
      }


      for (let j = 0; j < resp.data.length; j++) {
        this.dedDataArr[resp.data[j]['ded_code']].push(resp.data[j])
      }
    } else {
      swal.fire("Error", "...Error while getting list!", 'error');

    }
  }

  ChangeDed(deduction_type, i, j) {
    this.AllBillRow[i]['ded'][j]['ded_amount'] = this.dedDataArr[deduction_type][0]['amount'];
    this.AllBillRow[i]['ded'][j]['gov_rule'] = this.dedDataArr[deduction_type][0]['gov_rule'];
    this.AllBillRow[i]['ded'][j]['amt_type'] = this.dedDataArr[deduction_type][0]['ded_type'];

  }
  ChangeRule(gov_rule, deduction_type, i, j) {
    for (let p = 0; p < this.dedDataArr[deduction_type].length; p++) {
      if (gov_rule == this.dedDataArr[deduction_type][p]['gov_rule']) {
        this.AllBillRow[i]['ded'][j]['ded_amount'] = this.dedDataArr[deduction_type][p]['amount'];
        this.AllBillRow[i]['ded'][j]['amt_type'] = this.dedDataArr[deduction_type][p]['ded_type'];
      }
    }
  }



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
  async getgst() {

    var resp = await this.billService.getgst(this.b_acct_id);
    if (resp['error'] == false) {
      this.hsnArr = resp.data
      this.gstObj = new Object
      this.hsnObj = new Object
      this.rateObj = new Object
      for (let i = 0; i < this.hsnArr.length; i++) {
        this.gstObj[this.hsnArr[i]['hsn_code']] = this.hsnArr[i]
        this.hsnObj[this.hsnArr[i]['hsn_code']] = this.hsnArr[i]['hsn_desc']
        this.rateObj[this.hsnArr[i]['hsn_code']] = this.hsnArr[i]['igst']
      }

    } else {
      swal.fire("Error", "..Error while getting GST!", 'error');
    }
  }
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

  addRow() {
    let index = this.AllBillRow.length + 1
    this.AllBillRow.push({ event_id: index, amount: 0, tax_amount: 0, cgst: 0, sgst: 0, igst: 0, ded: [], payable_amount: 0, deduction_amount: 0 })
  }
  dedAdd(i) {
    this.AllBillRow[i]['ded'].push({ deduction_type: null, ded_amount: 0 })
  }
  deleteDed(i, j) {
    this.AllBillRow[i]['ded'].splice(j, 1)
  }

  async changeGst(i) {

    this.AllBillRow[i]['cgst'] = 0
    this.AllBillRow[i]['sgst'] = 0
    this.AllBillRow[i]['igst'] = 0
    if (this.AllBillRow[i]['gst_type'] == 'cgst_sgst') {
      let amt = 0
      amt = (this.AllBillRow[i]['amount'] * this.rateObj[this.AllBillRow[i]['hsn_code']] / 100)

      this.AllBillRow[i]['cgst'] = parseFloat((amt / 2).toFixed(2))
      this.AllBillRow[i]['sgst'] = parseFloat((amt / 2).toFixed(2))
    }

    if (this.AllBillRow[i]['gst_type'] == 'igst') {
      let amt = 0
      amt = (this.AllBillRow[i]['amount'] * this.rateObj[this.AllBillRow[i]['hsn_code']] / 100)

      this.AllBillRow[i]['igst'] = parseFloat((amt).toFixed(2))
    }

    let tax_amount = this.AllBillRow[i]['cgst'] + this.AllBillRow[i]['sgst'] + this.AllBillRow[i]['igst']

    this.AllBillRow[i]['tax_amount'] = parseFloat(tax_amount.toFixed(2))
    this.AllBillRow[i]['total_amount'] = this.AllBillRow[i]['amount'] + parseFloat(tax_amount.toFixed(2))

  }


  deleteRow(i) {
    for (let j = 0; j < this.AllBillRow.length; j++) {
      if (j > i) {
        this.AllBillRow[j]['event_id'] = this.AllBillRow[j]['event_id'] - 1
      }
    }
    this.AllBillRow.splice(i, 1);
  }

  async getAllCBInfo() {

    var resp = await this.billService.getAllContingentBills(this.b_acct_id);
    if (resp['error'] == false) {
      this.allCBInfo = resp.data;

      for (let i = 0; i < this.allCBInfo.length; i++) {
        this.allCBInfo[i]['select'] = false;
      }
      this.datasource = new MatTableDataSource(this.allCBInfo)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
      this.spinner.hide();
    } else {
      this.spinner.hide();

      swal.fire("Error", "..Error while getting  all CB list!", 'error');

    }
  }


  async printData(element) {
    this.obj = new Object();
    this.obj['party_id'] = element.party_id
    this.obj['cb_id'] = element.cb_id
    this.obj['cb_date'] = element.cb_date
    this.obj['bill_date'] = element.bill_date
    this.obj['bill_no'] = element.bill_no
    this.obj['status'] = element.status

    this.obj['work_order_no'] = element.work_order_no
    this.obj['work_or_service_name'] = element.work_or_service_name
    let ob = JSON.parse(element.data)
    this.AllBillRow = ob['payable_rows']
    await this.check1();
    this.print1();

    // $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
  async open_update(element) {
    this.obj = new Object();
    this.obj['party_id'] = element.party_id
    this.obj['cb_id'] = element.cb_id
    this.obj['cb_date'] = element.cb_date
    this.obj['bill_date'] = element.bill_date
    this.obj['bill_no'] = element.bill_no
    this.obj['status'] = element.status

    this.obj['work_order_no'] = element.work_order_no
    this.obj['work_or_service_name'] = element.work_or_service_name
    let ob = JSON.parse(element.data)
    this.AllBillRow = ob['payable_rows']

    this.selectObj = Object.assign({}, ob['selectObj']);
    await this.FilteredEvents();
    await this.check();

    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }



  refresh() {
    this.obj = {};
    this.obj['cb_date'] = this.systemDate
    this.AllBillRow = [];
    this.AllDedRow = []
    this.total_ded_amount = 0
    this.net_amount = 0
    this.total_amt = 0
    this.cgstAmount = 0
    this.sgstAmount = 0
    this.igstAmount = 0
    this.totalAmount = 0
    this.TaxAmount = 0

  }
  async save() {



    let flag = await this.check()
    if (flag == true) {
      this.spinner.show()

      let data = Object.assign({}, this.obj);
      data['payable_rows'] = this.AllBillRow;
      data['selectObj'] = this.selectObj;
      data['net_amt'] = this.net_amount.toFixed(2)
      let obj = Object.assign({}, this.obj);
      obj['b_acct_id'] = this.b_acct_id
      obj['net_amt'] = this.net_amount.toFixed(2)
      obj['create_user_id'] = this.erpUser.user_id
      obj['data'] = JSON.stringify(data)
      obj['status'] = 'GENERATED'


      var resp = await this.billService.addgenericcb(obj);
      if (resp['error'] == false) {
        this.spinner.hide();
        this.obj['cb_id'] = resp.data;
        //await this.schedule(this.obj);
        await this.getAllCBInfo();
        await this.allAllocation();


        swal.fire("Success", "Bill Added Successfully!", 'success');

        /*  this.snackBar.open("CB Bill Added Successfully!", 'Success', {
           duration: 5000
         }); */

      } else {
        this.spinner.hide();
        swal.fire("Error", "Error while Adding Bill!", 'error');

        /* this.snackBar.open("Error while Adding CB Bill", 'Error', {
          duration: 5000
        }); */
      }
    }
  }
  async check() {
    await this.allAllocation()
    var total1 = 0;
    var cgstAmount = 0;
    var sgstAmount = 0;
    var igstAmount = 0;
    var totalAmount = 0;
    this.net_amount = 0;
    let obj = new Object();
    for (let i = 0; i < this.AllBillRow.length; i++) {

      await this.changeGst(i)

      cgstAmount = cgstAmount + this.AllBillRow[i]['cgst']
      sgstAmount = sgstAmount + this.AllBillRow[i]['sgst']
      igstAmount = igstAmount + this.AllBillRow[i]['igst']
      let tax_amount = this.AllBillRow[i]['cgst'] + this.AllBillRow[i]['sgst'] + this.AllBillRow[i]['igst']

      this.AllBillRow[i]['tax_amount'] = parseFloat(tax_amount.toFixed(2))
      this.AllBillRow[i]['payable_amount'] = this.AllBillRow[i]['amount'] + parseFloat(tax_amount.toFixed(2))
      this.AllBillRow[i]['total_amount'] = this.AllBillRow[i]['amount'] + parseFloat(tax_amount.toFixed(2))
      let totalDed = 0
      for (let j = 0; j < this.AllBillRow[i]['ded'].length; j++) {
        if (obj[this.AllBillRow[i]['ded'][j]['deduction_type']] == undefined) {
          obj[this.AllBillRow[i]['ded'][j]['deduction_type']] = 0
        }

        if (this.AllBillRow[i]['ded'][j]['amt_type'] == 'percentage') {
          totalDed = totalDed + (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100)
          obj[this.AllBillRow[i]['ded'][j]['deduction_type']] = obj[this.AllBillRow[i]['ded'][j]['deduction_type']] + (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100)

        } else {
          totalDed = totalDed + this.AllBillRow[i]['ded'][j]['ded_amount']
          obj[this.AllBillRow[i]['ded'][j]['deduction_type']] = obj[this.AllBillRow[i]['ded'][j]['deduction_type']] + this.AllBillRow[i]['ded'][j]['ded_amount']
        }
      }

      this.AllBillRow[i]['payable_amount'] = this.AllBillRow[i]['payable_amount'] - totalDed
      this.AllBillRow[i]['deduction_amount'] = totalDed

      this.net_amount = this.net_amount + this.AllBillRow[i]['payable_amount']

      total1 = total1 + this.AllBillRow[i]['amount'] + this.AllBillRow[i]['tax_amount']
      totalAmount = totalAmount + this.AllBillRow[i]['amount']
    }
    this.total_amt = parseFloat(total1.toFixed(2))
    this.totalAmount = parseFloat(totalAmount.toFixed(2))
    this.cgstAmount = parseFloat(cgstAmount.toFixed(2))
    this.sgstAmount = parseFloat(sgstAmount.toFixed(2))
    this.igstAmount = parseFloat(igstAmount.toFixed(2))

    var keys = Object.keys(obj)
    this.total_ded_amount = 0
    this.AllDedRow = []
    for (let i = 0; i < keys.length; i++) {
      this.AllDedRow.push({ 'deduction_type': keys[i], 'ded_amount': obj[keys[i]] })
      this.total_ded_amount = this.total_ded_amount + obj[keys[i]]

    }
    let flag = await this.checkBudgetAmount()
    return flag;
  }

  async check1() {
    var total1 = 0;
    var cgstAmount = 0
    var sgstAmount = 0
    var igstAmount = 0
    var totalAmount = 0
    this.net_amount = 0
    let obj = new Object;
    for (let i = 0; i < this.AllBillRow.length; i++) {

      await this.changeGst(i)

      cgstAmount = cgstAmount + this.AllBillRow[i]['cgst']
      sgstAmount = sgstAmount + this.AllBillRow[i]['sgst']
      igstAmount = igstAmount + this.AllBillRow[i]['igst']
      let tax_amount = this.AllBillRow[i]['cgst'] + this.AllBillRow[i]['sgst'] + this.AllBillRow[i]['igst']

      this.AllBillRow[i]['tax_amount'] = parseFloat(tax_amount.toFixed(2))
      this.AllBillRow[i]['payable_amount'] = this.AllBillRow[i]['amount'] + parseFloat(tax_amount.toFixed(2))
      this.AllBillRow[i]['total_amount'] = this.AllBillRow[i]['amount'] + parseFloat(tax_amount.toFixed(2))
      let totalDed = 0
      for (let j = 0; j < this.AllBillRow[i]['ded'].length; j++) {
        if (obj[this.AllBillRow[i]['ded'][j]['deduction_type']] == undefined) {
          obj[this.AllBillRow[i]['ded'][j]['deduction_type']] = 0
        }

        if (this.AllBillRow[i]['ded'][j]['amt_type'] == 'percentage') {
          totalDed = totalDed + (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100)
          obj[this.AllBillRow[i]['ded'][j]['deduction_type']] = obj[this.AllBillRow[i]['ded'][j]['deduction_type']] + (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100)

        } else {
          totalDed = totalDed + this.AllBillRow[i]['ded'][j]['ded_amount']
          obj[this.AllBillRow[i]['ded'][j]['deduction_type']] = obj[this.AllBillRow[i]['ded'][j]['deduction_type']] + this.AllBillRow[i]['ded'][j]['ded_amount']

        }

      }


      this.AllBillRow[i]['payable_amount'] = this.AllBillRow[i]['payable_amount'] - totalDed
      this.AllBillRow[i]['deduction_amount'] = totalDed

      this.net_amount = this.net_amount + this.AllBillRow[i]['payable_amount']

      total1 = total1 + this.AllBillRow[i]['amount'] + this.AllBillRow[i]['tax_amount']
      totalAmount = totalAmount + this.AllBillRow[i]['amount']
    }
    this.total_amt = parseFloat(total1.toFixed(2))
    this.totalAmount = parseFloat(totalAmount.toFixed(2))
    this.cgstAmount = parseFloat(cgstAmount.toFixed(2))
    this.sgstAmount = parseFloat(sgstAmount.toFixed(2))
    this.igstAmount = parseFloat(igstAmount.toFixed(2))

    var keys = Object.keys(obj)
    this.total_ded_amount = 0
    this.AllDedRow = []
    for (let i = 0; i < keys.length; i++) {
      this.AllDedRow.push({ 'deduction_type': keys[i], 'ded_amount': obj[keys[i]] })
      this.total_ded_amount = this.total_ded_amount + obj[keys[i]]

    }

  }
  async checkBudgetAmount() {
    for (let i = 0; i < this.AllBillRow.length; i++) {

      let eventObj = this.AllBillRow[i]['event_Obj']

      var budObj = new Object
      var actObj = new Object
      var prodObj = new Object
      var projObj = new Object


      var budArr = [];
      var actArr = [];
      var prodArr = [];
      var projArr = [];

      for (let j = 0; j < this.allBudgetHier.length; j++) {

        if (eventObj['bud_cd'].trim() == this.allBudgetHier[j]['leaf_cd'].trim()) {
          budObj = this.allBudgetHier[j]
          for (let k = 1; k < 8; k++) {
            if (budObj['lvl' + k + '_cd'] != null) {
              budArr.push(budObj['lvl' + k + '_cd'])
            }
          }
        }
      }
      for (let j = 0; j < this.allActivityHier.length; j++) {
        if (eventObj['act_cd'].trim() == this.allActivityHier[j]['leaf_cd'].trim()) {
          actObj = this.allActivityHier[j]
          for (let k = 1; k < 8; k++) {
            if (actObj['lvl' + k + '_cd'] != null) {
              actArr.push(actObj['lvl' + k + '_cd'])
            }
          }
        }
      }
      for (let j = 0; j < this.allProductHier.length; j++) {
        if (eventObj['prod_cd'].trim() == this.allProductHier[j]['leaf_cd'].trim()) {
          prodObj = this.allProductHier[j]
          for (let k = 1; k < 8; k++) {
            if (prodObj['lvl' + k + '_cd'] != null) {
              prodArr.push(prodObj['lvl' + k + '_cd'])
            }
          }
        }
      }

      for (let j = 0; j < this.allProjectHier.length; j++) {
        if (eventObj['proj_cd'].trim() == this.allProjectHier[j]['leaf_cd'].trim()) {
          projObj = this.allProjectHier[j]
          for (let k = 1; k < 8; k++) {
            if (projObj['lvl' + k + '_cd'] != null) {
              projArr.push(projObj['lvl' + k + '_cd'])
            }
          }
        }
      }


      let tempAllocation = []

      for (let j = 0; j < this.allAllocationArr.length; j++) {
        if (budArr.includes(this.allAllocationArr[j]['bud_cd']) && actArr.includes(this.allAllocationArr[j]['act_cd'])
          && projArr.includes(this.allAllocationArr[j]['proj_cd']) && prodArr.includes(this.allAllocationArr[j]['prod_cd'])) {
          tempAllocation.push(this.allAllocationArr[j])
        }
      }

      this.AllBillRow[i]['allocation_id'] = 0
      this.AllBillRow[i]['allocation_amount'] = 0


      if (tempAllocation.length == 1) {
        this.AllBillRow[i]['allocation_id'] = tempAllocation[0]['allocation_id']
        this.AllBillRow[i]['allocation_amount'] = tempAllocation[0]['amount']

      } else if (tempAllocation.length > 1) {
        for (let j = 0; j < tempAllocation.length; j++) {
          if (this.AllBillRow[i]['allocation_id'] < tempAllocation[j]['allocation_id']) {
            this.AllBillRow[i]['allocation_id'] = tempAllocation[j]['allocation_id']
            this.AllBillRow[i]['allocation_amount'] = tempAllocation[j]['amount']
          }
        }
      }

      if (this.AllBillRow[i]['allocation_amount'] == 0) {
        swal.fire("Error!", "No Allocation found for this Event (" + this.AllBillRow[i]['event_desc'] + ").", 'error');
        return false;

        break;
      }


      this.allocationAmountObj[this.AllBillRow[i]['allocation_id']] = this.allocationAmountObj[this.AllBillRow[i]['allocation_id']] - this.AllBillRow[i]['amount']

      if (this.allocationAmountObj[this.AllBillRow[i]['allocation_id']] < 0) {
        let tempAmount = this.allocationAmountObj[this.AllBillRow[i]['allocation_id']] * (-1)
        swal.fire("Error!", "Allocation amount ( Need " + tempAmount.toFixed(2) + " more in allocation id " + this.AllBillRow[i]['allocation_id'] + " ) is less for this Event (" + this.AllBillRow[i]['event_desc'] + ") amount.", 'error');
        return false;

        break;
      }
      if (this.AllBillRow[i]['amount'] > this.AllBillRow[i]['allocation_amount']) {
        let tempAmount = this.AllBillRow[i]['amount'] - this.AllBillRow[i]['allocation_amount']
        swal.fire("Error!", "Allocation amount ( Need " + tempAmount.toFixed(2) + " more in allocation id " + this.AllBillRow[i]['allocation_id'] + " ) is less for this Event (" + this.AllBillRow[i]['event_desc'] + ") amount.", 'error');
        return false;

        break;
      }
    }
    return true;

  }



  async update() {
    let flag = await this.check()
    if (flag == true) {
      let data = Object.assign({}, this.obj);
      data['payable_rows'] = this.AllBillRow;
      data['net_amt'] = this.net_amount.toFixed(2)
      let obj = Object.assign({}, this.obj);
      obj['b_acct_id'] = this.b_acct_id
      obj['net_amt'] = this.net_amount.toFixed(2)
      obj['update_user_id'] = this.erpUser.user_id
      obj['data'] = JSON.stringify(data)

      this.spinner.show();

      var resp = await this.billService.updateGenericCb(obj);
      if (resp['error'] == false) {
        await this.getAllCBInfo();
        await this.allAllocation()

        this.spinner.hide();

        swal.fire("Success", "Bill Updated Successfully!", 'success');

        /*  this.snackBar.open("CB bill Delete Successfully!", 'Success', {
           duration: 5000
         }); */

      } else {
        this.spinner.hide();
        swal.fire("Error", "...Error while updating bill !", 'error');

        /*  this.snackBar.open("Error while delete CB bill ", 'Error', {
           duration: 5000
         }); */
      }
    }
  }


  async delete(element) {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['cb_id'] = element.cb_id;
    var resp = await this.billService.deleteContingentBill(JSON.stringify(obj1));
    if (resp['error'] == false) {
      await this.getAllCBInfo();
      this.spinner.hide();

      swal.fire("Success", "Bill Delete Successfully!", 'success');

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while delete bill !", 'error');
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter1(filterValue: string) {
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  async processSelected() {
    this.spinner.show();
    var processed = [];
    var generated = [];
    var rejected = [];
    var accepted = [];
    for (let i = 0; i < this.allCBInfo.length; i++) {
      if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'GENERATED') {
        generated.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'ACCEPTED') {
        accepted.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'REJECTED') {
        rejected.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'PROCESSED') {
        processed.push(this.allCBInfo[i]);
      }
    }


    if (processed.length != 0 || rejected.length != 0 || generated.length != 0) {
      swal.fire("Error", "...In the Selected Bill " + processed.length + " Of PROCESSED Bill And " + rejected.length + " Of REJECTED Bill And " + generated.length + " Of GENERATED Bill!!", "error");
      this.spinner.hide();
      return;
    } else {

      this.eventArr = [];
      for (let i = 0; i < accepted.length; i++) {
        await this.accept(accepted[i]);
      }

      var processed_data = await this.ruleProcessService.startProcessing(this.eventArr, this.allRule, this.systemDate, this.fin_year, this.orgShortName);
      if (processed_data['event'].length == 0) {
        var cb_id = [];
        for (let i = 0; i < accepted.length; i++) {
          cb_id.push(accepted[i]['cb_id']);
        }

        var obj1 = new Object();
        obj1['b_acct_id'] = this.b_acct_id;
        obj1['cb_id'] = cb_id;
        obj1['status'] = 'PROCESSED';
        obj1['update_user_id'] = this.erpUser.user_id;
        obj1['jrnl'] = processed_data['jrnl'];
        var resp = await this.billService.insertProcessedCBData(obj1);
        if (resp['error'] == false) {
          this.spinner.hide();
          await this.getAllCBInfo();
          swal.fire("Success", "Processed Successfully!", 'success');
        } else {
          this.spinner.hide();
          swal.fire("Error", "...Error while Processed  Bill Insert!", 'error');
        }
      } else {
        this.spinner.hide();
        swal.fire("Error", "...Some Events does not have rule  !", 'error');
      }
    }
  }

  async accept(element) {
    this.obj = new Object();
    this.obj['party_id'] = element.party_id
    this.obj['cb_id'] = element.cb_id
    this.obj['cb_date'] = element.cb_date
    this.obj['bill_date'] = element.bill_date
    this.obj['bill_no'] = element.bill_no
    this.obj['status'] = element.status
    this.obj['work_order_no'] = element.work_order_no
    this.obj['work_or_service_name'] = element.work_or_service_name
    let ob = JSON.parse(element.data)
    this.AllBillRow = ob['payable_rows']
    await this.process()
  }

  async process() {
    for (let i = 0; i < this.AllBillRow.length; i++) {
      var obj_temp1 = new Object();
      obj_temp1['evt_grp_dt'] = this.obj['cb_date']
      obj_temp1['bus_event_type'] = 'BILL';
      obj_temp1['invoice_id'] = this.obj['bill_no']
      obj_temp1['party_id'] = this.obj['party_id'];
      obj_temp1['event_code'] = this.AllBillRow[i]['event_code'];
      obj_temp1['ev_desc'] = this.AllBillRow[i]['event_desc'];
      obj_temp1['event_id'] = this.obj['cb_id']
      obj_temp1['event_ln_id'] = i + 1;
      obj_temp1['event_desc'] = this.obj['work_or_service_name'];
      obj_temp1['txn_amt'] = this.AllBillRow[i]['amount'];
      obj_temp1['create_user_id'] = this.erpUser.user_id;
      obj_temp1['arr_num'] = this.obj['party_id'];
      obj_temp1['party_name'] = this.partyArrObj[this.obj['party_id']]
      this.eventArr.push(obj_temp1)

      if (this.AllBillRow[i]['cgst'] != 0) {
        var obj_temp2 = new Object();
        obj_temp2['evt_grp_dt'] = this.obj['cb_date']
        obj_temp2['bus_event_type'] = 'BILL';
        obj_temp2['invoice_id'] = this.obj['bill_no']
        obj_temp2['party_id'] = this.obj['party_id'];
        obj_temp2['ev_desc'] = 'CGSTINPUT'
        obj_temp2['event_code'] = "CGSTINPUT";
        obj_temp2['event_id'] = this.obj['cb_id']
        obj_temp2['event_ln_id'] = i + 1;
        obj_temp2['event_desc'] = this.obj['work_or_service_name'];
        obj_temp2['txn_amt'] = this.AllBillRow[i]['cgst'];
        obj_temp2['create_user_id'] = this.erpUser.user_id;
        obj_temp2['arr_num'] = this.obj['party_id'];
        obj_temp2['party_name'] = this.partyArrObj[this.obj['party_id']]

        this.eventArr.push(obj_temp2)

      }


      if (this.AllBillRow[i]['sgst'] != 0) {
        var obj_temp3 = new Object();
        obj_temp3['evt_grp_dt'] = this.obj['cb_date']
        obj_temp3['bus_event_type'] = 'BILL';
        obj_temp3['invoice_id'] = this.obj['bill_no']
        obj_temp3['party_id'] = this.obj['party_id'];
        obj_temp3['ev_desc'] = 'SGSTINPUT'
        obj_temp3['event_code'] = 'SGSTINPUT';
        obj_temp3['event_id'] = this.obj['cb_id']
        obj_temp3['event_ln_id'] = i + 1;
        obj_temp3['event_desc'] = this.obj['work_or_service_name'];
        obj_temp3['txn_amt'] = this.AllBillRow[i]['sgst'];
        obj_temp3['create_user_id'] = this.erpUser.user_id;
        obj_temp3['arr_num'] = this.obj['party_id'];
        obj_temp3['party_name'] = this.partyArrObj[this.obj['party_id']]
        this.eventArr.push(obj_temp3)

      }
      if (this.AllBillRow[i]['igst'] != 0) {

        var obj_temp4 = new Object();
        obj_temp4['evt_grp_dt'] = this.obj['cb_date']
        obj_temp4['bus_event_type'] = 'BILL';
        obj_temp4['invoice_id'] = this.obj['bill_no']
        obj_temp4['ev_desc'] = 'IGSTINPUT'
        obj_temp4['party_id'] = this.obj['party_id'];
        obj_temp4['event_code'] = "IGSTINPUT";
        obj_temp4['event_id'] = this.obj['cb_id']
        obj_temp4['event_ln_id'] = i + 1;
        obj_temp4['event_desc'] = this.obj['work_or_service_name'];
        obj_temp4['txn_amt'] = this.AllBillRow[i]['igst'];
        obj_temp4['create_user_id'] = this.erpUser.user_id;
        obj_temp4['arr_num'] = this.obj['party_id'];
        obj_temp4['party_name'] = this.partyArrObj[this.obj['party_id']]
        this.eventArr.push(obj_temp4)
      }


      for (let j = 0; j < this.AllBillRow[i]['ded'].length; j++) {

        var amount = 0;
        if (this.AllBillRow[i]['ded'][j]['amt_type'] == 'percentage') {
          if (this.AllBillRow[i]['ded'][j]['deduction_type'] == 'TDS') {
            if (this.AllBillRow[i]['cgst'] != 0) {
              amount = (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100) / 2
            } else {
              amount = (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100)
            }

          } else {
            amount = (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100)
          }
          amount = (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100)
        } else {
          amount = this.AllBillRow[i]['ded'][j]['ded_amount']
        }

        if (amount != 0 && this.AllBillRow[i]['ded'][j]['deduction_type'] != 'TDS') {
          var obj_temp = new Object();
          obj_temp['evt_grp_dt'] = this.obj['cb_date']
          obj_temp['bus_event_type'] = 'BILL';
          obj_temp['invoice_id'] = this.obj['bill_no']
          obj_temp['party_id'] = this.obj['party_id'];
          obj_temp['event_code'] = this.AllBillRow[i]['ded'][j]['deduction_type'];
          obj_temp['event_id'] = this.obj['cb_id']
          obj_temp['event_ln_id'] = i + 1;
          obj_temp['event_desc'] = this.obj['work_or_service_name'];
          obj_temp['txn_amt'] = amount;
          obj_temp['create_user_id'] = this.erpUser.user_id;
          obj_temp['arr_num'] = this.obj['party_id'];
          obj_temp['ev_desc'] = this.AllBillRow[i]['event_desc'];
          this.eventArr.push(obj_temp)

        } else if (this.AllBillRow[i]['ded'][j]['deduction_type'] == 'TDS') {
          if (this.AllBillRow[i]['cgst'] != 0) {
            var obj_temp8 = new Object();
            obj_temp8['evt_grp_dt'] = this.obj['cb_date']
            obj_temp8['bus_event_type'] = 'BILL';
            obj_temp8['invoice_id'] = this.obj['bill_no']
            obj_temp8['party_id'] = this.obj['party_id'];
            obj_temp8['ev_desc'] = this.AllBillRow[i]['event_desc'];
            obj_temp8['event_code'] = "TDSC";
            obj_temp8['event_id'] = this.obj['cb_id']
            obj_temp8['event_ln_id'] = i + 1;
            obj_temp8['event_desc'] = this.obj['work_or_service_name'];
            obj_temp8['txn_amt'] = amount;
            obj_temp8['create_user_id'] = this.erpUser.user_id;
            obj_temp8['arr_num'] = this.obj['party_id'];
            obj_temp8['party_name'] = this.partyArrObj[this.obj['party_id']]

            this.eventArr.push(obj_temp8)

          }


          if (this.AllBillRow[i]['sgst'] != 0) {
            var obj_temp6 = new Object();
            obj_temp6['evt_grp_dt'] = this.obj['cb_date']
            obj_temp6['bus_event_type'] = 'BILL';
            obj_temp6['invoice_id'] = this.obj['bill_no']
            obj_temp6['party_id'] = this.obj['party_id'];
            obj_temp6['ev_desc'] = this.AllBillRow[i]['event_desc'];
            obj_temp6['event_code'] = 'TDSS';
            obj_temp6['event_id'] = this.obj['cb_id']
            obj_temp6['event_ln_id'] = i + 1;
            obj_temp6['event_desc'] = this.obj['work_or_service_name'];
            obj_temp6['txn_amt'] = amount;
            obj_temp6['create_user_id'] = this.erpUser.user_id;
            obj_temp6['arr_num'] = this.obj['party_id'];
            obj_temp6['party_name'] = this.partyArrObj[this.obj['party_id']]
            this.eventArr.push(obj_temp6)

          }
          if (this.AllBillRow[i]['igst'] != 0) {

            var obj_temp9 = new Object();
            obj_temp9['evt_grp_dt'] = this.obj['cb_date']
            obj_temp9['bus_event_type'] = 'BILL';
            obj_temp9['invoice_id'] = this.obj['bill_no']
            obj_temp9['ev_desc'] = this.AllBillRow[i]['event_desc'];
            obj_temp9['party_id'] = this.obj['party_id'];
            obj_temp9['event_code'] = "TDSI";
            obj_temp9['event_id'] = this.obj['cb_id']
            obj_temp9['event_ln_id'] = i + 1;
            obj_temp9['event_desc'] = this.obj['work_or_service_name'];
            obj_temp9['txn_amt'] = amount;
            obj_temp9['create_user_id'] = this.erpUser.user_id;
            obj_temp9['arr_num'] = this.obj['party_id'];
            obj_temp9['party_name'] = this.partyArrObj[this.obj['party_id']]
            this.eventArr.push(obj_temp9)
          }
        }
      }

    }

  }


  async rejectSelected() {


    this.spinner.show();
    var processed = [];
    var generated = [];
    var rejected = [];
    var accepted = [];
    for (let i = 0; i < this.allCBInfo.length; i++) {
      if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'APPROVED') {
        generated.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'ACCEPTED') {
        accepted.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'REJECTED') {
        rejected.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'PROCESSED') {
        processed.push(this.allCBInfo[i]);
      }
    }


    if (accepted.length != 0 || rejected.length != 0 || processed.length != 0) {
      swal.fire("Error", "...In the Selected Bill " + accepted.length + " Of ACCEPTED Bill And " + rejected.length + " Of REJECTED Bill And " + processed.length + " Of PROCESSED Bill!!", 'error');
      this.spinner.hide();
      return;
    } else {




      var cb_id = [];
      for (let i = 0; i < generated.length; i++) {
        cb_id.push(generated[i]['cb_id']);
      }

      var obj1 = new Object();
      obj1['b_acct_id'] = this.b_acct_id;
      obj1['cb_id'] = cb_id;
      obj1['status'] = 'REJECTED';
      obj1['update_user_id'] = this.erpUser.user_id;

      console.log(obj1)
      var resp = await this.billService.changeCbStatus(obj1);
      if (resp['error'] == false) {
        await this.getAllCBInfo();
        this.spinner.hide();
        swal.fire("Success", "Rejected Successfully!", 'success');

      } else {
        this.spinner.hide();
        swal.fire("Error", "...Error while rejecting bill !", 'error');
      }
    }

  }

  async changeCBStatus(cb_id, status) {
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['cb_id'] = [cb_id];
    obj1['status'] = status;
    obj1['update_user_id'] = this.erpUser.user_id;

    console.log(obj1)
    var resp = await this.billService.changeCbStatus(obj1);
    if (resp['error'] == false) {
      await this.getAllCBInfo();
      this.spinner.hide();
      swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating bill !", 'error');
    }
  }

  async acceptSelected() {
    var processed = [];
    var generated = [];
    var rejected = [];
    var accepted = [];
    for (let i = 0; i < this.allCBInfo.length; i++) {
      if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'APPROVED') {
        generated.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'ACCEPTED') {
        accepted.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'REJECTED') {
        rejected.push(this.allCBInfo[i]);
      } else if (this.allCBInfo[i]['select'] == true && this.allCBInfo[i]['status'] == 'PROCESSED') {
        processed.push(this.allCBInfo[i]);
      }
    }


    if (accepted.length != 0 || rejected.length != 0 || processed.length != 0) {
      swal.fire("Error", "...In the Selected Bill " + accepted.length + " Of ACCEPTED Bill And " + rejected.length + " Of REJECTED Bill And " + processed.length + " Of PROCESSED Bill!!", 'error');
      this.spinner.hide();
      return;
    } else {


      await this.allAllocation()
      let tempAllocationObj = new Object
      let flag = true
      let errorIds = []
      var cb_id = [];
      for (let i = 0; i < generated.length; i++) {


        let ob = JSON.parse(generated[i].data)
        let rows = ob['payable_rows']
        for (let j = 0; j < rows.length; j++) {
          if (tempAllocationObj[rows[j]['allocation_id']] == undefined) {
            if (this.allocationAmountObj[rows[j]['allocation_id']] == undefined) {
              errorIds.push(generated[i]['cb_id'])

            } else {
              tempAllocationObj[rows[j]['allocation_id']] = this.allocationAmountObj[rows[j]['allocation_id']]
            }
          }
          if (tempAllocationObj[rows[j]['allocation_id']] != undefined) {
            tempAllocationObj[rows[j]['allocation_id']] = tempAllocationObj[rows[j]['allocation_id']] - rows[j]['amount']
            if (tempAllocationObj[rows[j]['allocation_id']] < 0) {
              errorIds.push(generated[i]['cb_id'])
            }
          }
        }
        cb_id.push(generated[i]['cb_id']);
      }
      if (errorIds.length > 0) {
        swal.fire("Error", "Some Allocaton Amount is low/missing for CB Ids (" + errorIds.join(",") + ")!", 'error');

      } else {
        var obj1 = new Object();
        obj1['b_acct_id'] = this.b_acct_id;
        obj1['cb_id'] = cb_id;
        obj1['status'] = 'ACCEPTED';
        obj1['update_user_id'] = this.erpUser.user_id;

        obj1['allocation_obj'] = tempAllocationObj
        obj1['accrued_amount'] = new Object
        var keys1 = Object.keys(tempAllocationObj)


        for (let i = 0; i < this.allAllocationArr.length; i++) {
          if (keys1.includes(this.allAllocationArr[i]['allocation_id'] + '')) {

            obj1['accrued_amount'][this.allAllocationArr[i]['allocation_id']] = this.allAllocationArr[i]['amount'] + this.allAllocationArr[i]['accrued_amount'] - tempAllocationObj[this.allAllocationArr[i]['allocation_id']]

          }

        }



        this.spinner.show();

        var resp = await this.billService.acceptCb(obj1);
        if (resp['error'] == false) {
          await this.getAllCBInfo();
          await this.allAllocation()
          this.spinner.hide();
          swal.fire("Success", "Accepted Successfully!", 'success');

        } else {
          this.spinner.hide();
          swal.fire("Error", "...Error while accepting bill !", 'error');
        }
      }
    }
  }

  async print() {
    await this.check()
    let printContents, popupWin;
    printContents = document.getElementById('p').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        </head>
        <style>
        #tbl {
          font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
          max-width: 2480px;
      }
      
      #tbl td,
      #tbl th {
          border: 1px solid #ddd;
          padding: 8px;
          width: auto;
          overflow: hidden;
          word-wrap: break-word;
      }
      
      #tbl tr:nth-child(even) {
          background-color: #f2f2f2;
      }
      
      #tbl tr:hover {
          background-color: #ddd;
      }
      
      #tbl th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: rgb(63, 24, 233);
          color: white;
      }
      tr.mat-header-row {
        height: 40px !important;
    }
    
    tr.mat-row {
        height: 30px !important;
        font-size: 12px;
    }
    
    .example-container {
        max-height: 720px;
        overflow: auto;
    }
    
    table {
        width: 100%;
    }
    
    .mat-cell {
        padding: 5px 10px 5px 0;
    }
    
    .mat-header-cell {
        padding: 5px 10px 5px 0;
    }
    
    .mat-row:nth-child(even) {
        background-color: rgb(238, 224, 226);
    }
    
    .mat-row:nth-child(odd) {
        background-color: white;
    }
        </style>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();


  }
  async print1() {



    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")";
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var arr = []
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        arr.push(obj);
        var obj1 = { text: "CONTINGENT BILL", alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        arr.push(obj1);


        return arr;
      },

      pageOrientation: 'landscape',
      /*  yourFontName: {
         normal: 'fontFile.ttf',
         bold: 'fontFile2.ttf',
         italics: 'fontFile3.ttf',
         bolditalics: 'fontFile4.ttf'
       }, */
      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };
    var header1 = {
      columns: [
        {

          width: '*',
          text: 'Party Name :',
          bold: true
        },
        {
          width: '*',
          text: this.partyArrObj[this.obj['party_id']]
        },
        {

          width: '*',
          text: 'CB No. :',
          bold: true
        },
        {

          width: '*',
          text: this.obj['cb_id']
        }
      ],

    }
    var header2 = {
      columns: [
        {

          width: '*',
          text: 'Work Order No. :',
          bold: true
        },
        {
          width: '*',
          text: this.obj['work_order_no']
        },
        {

          width: '*',
          text: 'Date :',
          bold: true
        },
        {

          width: '*',
          text: this.mainService.dateFormatChange(this.obj['cb_date'])
        }
      ],


    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Work/Service Name :',
          bold: true
        },
        {
          width: '*',
          text: this.obj['work_or_service_name']
        },
        {

          width: '*',
          text: 'Invoice No. :',
          bold: true
        },
        {
          width: '*',
          text: this.obj['bill_no']
        }
      ],

    }
    var header4 = {
      columns: [
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
          text: 'Invoice Date :',
          bold: true
        },
        {
          width: '*',
          text: this.mainService.dateFormatChange(this.obj['bill_date'])
        }
      ],
    }
    dd.content.push({ text: " " });
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
    dd.content.push({ text: " " });

    var header5 = {
      columns: [
        {
          width: '*',
          text: 'DESCRIPTION',
          bold: true
        },
        {
          width: '*',
          text: 'HSN',
          bold: true
        },
        {
          width: '*',
          text: 'RATE',
          bold: true,
          alignment: 'right'
        },
        {
          width: '*',
          text: 'AMOUNT',
          bold: true,
          alignment: 'right'
        },
        {
          width: '*',
          text: 'CGST',
          bold: true,
          alignment: 'right'
        },
        {
          width: '*',
          text: 'SGST',
          bold: true,
          alignment: 'right'
        },
        {
          width: '*',
          text: 'IGST',
          bold: true,
          alignment: 'right'
        },
        {
          width: '*',
          text: 'TOTAL',
          bold: true,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(header5);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });

    for (var i = 0; i < this.AllBillRow.length; i++) {
      var objRow = {
        columns: [
          {
            width: '*',
            text: this.AllBillRow[i]['event_desc'],
            bold: true
          },
          {
            width: '*',
            text: this.hsnObj[this.AllBillRow[i]['hsn_code']]

          },
          {
            width: '*',
            text: this.rateObj[this.AllBillRow[i]['hsn_code']],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.AllBillRow[i]['amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.AllBillRow[i]['cgst'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.AllBillRow[i]['sgst'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.AllBillRow[i]['igst'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.AllBillRow[i]['total_amount'],
            bold: true,
            alignment: 'right'
          }
        ],

      }

      dd.content.push(objRow);
      dd.content.push({ text: " " });
      if (this.AllBillRow[i]['ded'].length > 0) {
        var objRow1 = {
          columns: [
            {
              width: '*',
              text: ''
            },
            {
              width: '*',
              text: 'Deductions',
              bold: true

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
            }
          ],

        }
        dd.content.push(objRow1);
        dd.content.push({ text: " " });
      }

      for (let j = 0; j < this.AllBillRow[i]['ded'].length; j++) {

        if (this.AllBillRow[i]['ded'][j]['amt_type'] == 'percentage') {

          var dedRowObj = {
            columns: [
              {
                width: '*',
                text: ''
              },
              {
                width: '*',
                text: j + 1 + '.'

              },
              {
                width: '*',
                text: this.dedTypeObj[this.AllBillRow[i]['ded'][j]['deduction_type']]

              },

              {
                width: '*',
                text: (this.AllBillRow[i]['amount'] * this.AllBillRow[i]['ded'][j]['ded_amount'] / 100).toFixed(2)

              },
              {
                width: '*',
                text: ''
              }
              ,
              {
                width: '*',
                text: ''
              }
              ,
              {
                width: '*',
                text: ''
              }
            ],

          }
          dd.content.push(dedRowObj);
        } else {

          var dedRowObj = {
            columns: [
              {
                width: '*',
                text: ''
              },
              {
                width: '*',
                text: j + 1 + '.'

              },
              {
                width: '*',
                text: this.dedTypeObj[this.AllBillRow[i]['ded'][j]['deduction_type']]

              },

              {
                width: '*',
                text: this.AllBillRow[i]['ded'][j]['ded_amount'].toFixed(2)

              },
              {
                width: '*',
                text: ''
              }
              ,
              {
                width: '*',
                text: ''
              }
              ,
              {
                width: '*',
                text: ''
              }
            ],

          }
          dd.content.push(dedRowObj);
        }

        dd.content.push({ text: " " });
      }
      var dedObj = {
        columns: [
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
          }
          ,

          {
            width: '*',
            text: 'DEDUCTION AMOUNT:',
            bold: true,
          }
          ,
          {
            width: '*',
            text: this.AllBillRow[i]['deduction_amount'].toFixed(2),
            bold: true,
            alignment: 'right'
          }
        ],

      }
      var paybObj = {
        columns: [
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
          }
          ,

          {
            width: '*',
            text: 'TOTAL PAYABLE AMOUNT:',
            bold: true,
          }
          ,
          {
            width: '*',
            text: this.AllBillRow[i]['payable_amount'].toFixed(2),
            bold: true,
            alignment: 'right'

          }
        ],

      }
      dd.content.push(dedObj);
      dd.content.push({ text: " " });
      dd.content.push(paybObj);
      dd.content.push({ text: " " });
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
      dd.content.push({ text: " " });

    }

    var totalObjRow = {
      columns: [
        {
          width: '*',
          text: '',
        },
        {
          width: '*',
          text: 'TOTAL',
          bold: true

        },
        {
          width: '*',
          text: ''

        },
        {
          width: '*',
          text: this.totalAmount.toFixed(2),
          bold: true,
          alignment: 'right'

        },
        {
          width: '*',
          text: this.cgstAmount.toFixed(2),
          bold: true,
          alignment: 'right'

        },
        {
          width: '*',
          text: this.sgstAmount.toFixed(2),
          bold: true,
          alignment: 'right'
        },
        {
          width: '*',
          text: this.igstAmount.toFixed(2),
          bold: true,
          alignment: 'right'

        },
        {
          width: '*',
          text: this.net_amount.toFixed(2),
          bold: true,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(totalObjRow);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    dd.content.push({ text: " " });


    var netPayRow = {
      columns: [

        {
          width: '*',
          text: 'NET PAYABLE AMOUNT:   ' + this.net_amount.toFixed(2),
          bold: true,
          fontSize: 20,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(netPayRow);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    var header7 = {
      columns: [
        {
          width: '*',
          text: 'DEDUCTIONS',
          bold: true
        }
      ],

    }
    dd.content.push(header7);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });

    var header6 = {
      columns: [
        {
          width: '*',
          text: 'DESCRIPTION',
          bold: true
        },
        {
          width: '*',
          text: 'AMOUNT',
          bold: true
        },
        {
          width: '*',
          text: ''
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
        }
      ],

    }
    dd.content.push(header6);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });

    for (var i = 0; i < this.AllDedRow.length; i++) {
      var ded = {
        columns: [
          {
            width: '*',
            text: this.dedTypeObj[this.AllDedRow[i]['deduction_type']]
          },
          {
            width: '*',
            text: this.AllDedRow[i]['ded_amount']
          },
          {
            width: '*',
            text: ''
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
          }
        ],

      }
      dd.content.push(ded);
      dd.content.push({ text: " " });

    }


    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });
    var dedPayRow = {
      columns: [

        {
          width: '*',
          text: 'TOTAL DEDUCTION AMOUNT:   ' + this.total_ded_amount.toFixed(2),
          bold: true,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(dedPayRow);
    dd.content.push({ text: " " });

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });

    dd.content.push({ text: "Passed for payment of Rupees.........................................................................................................................(in word)" })

    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });

    var sig = {
      columns: [

        {
          width: '*',
          text: 'Accounts Clerk',
          bold: true
        },
        {
          width: '*',
          text: 'Accountant',
          bold: true
        },
        {
          width: '*',
          text: 'AAO/AO',
          bold: true
        },
        {
          width: '*',
          text: 'FC',
          bold: true
        }


      ],

    }
    dd.content.push(sig);

    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: "Above paypent of Rupees.........................................................................................................................(in word) sanctioned" })

    pdfMake.createPdf(dd).download('bill.pdf');

  }

}
