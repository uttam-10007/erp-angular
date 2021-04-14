import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { MainService } from '../service/main.service';
import { ChallanService } from '../service/challan.service';
import { LedgerService } from '../service/ledger.service';
import { EventsService } from '../service/events.service';
import { SettingService } from '../service/setting.service';
import { RuleService } from '../service/rule.service';
import { RuleProcessService } from '../service/rule-process.service';
import { BillService } from '../service/bill.service';
import swal from 'sweetalert2';
import { BudgetService } from '../service/budget.service';
import { HierarchyService } from '../service/hierarchy.service';
import { JsonPipe } from '@angular/common';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
declare var $: any
@Component({
  selector: 'app-challan',
  templateUrl: './challan.component.html',
  styleUrls: ['./challan.component.css']
})

export class ChallanComponent implements OnInit {
  displayedColumns = ['select', 'id', 'party_id', 'party_name', 'amount', 'purpose', 'demand_id', 'status', 'action'];
  datasource;
  displayedColumns1 = ['event_code', 'event_desc', 'action'];
  dataSource1;
  
  constructor(private hierarchyService: HierarchyService, private ruleService: RuleService, private ruleProcessService: RuleProcessService, private billService: BillService, private settingService: SettingService, private eventsService: EventsService, private budgetService: BudgetService, private ledgerService: LedgerService, private challanService: ChallanService, public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;
  erpUser;
  b_acct_id;
  AllDummyChallan = [];
  AllPaidChallan = [];
  challantype = [{ challantypes: 'Paid' }, { challantypes: 'Dummy' }]
  typechallan = ''
  obj = {}
  dummy_challan_no;
  paid_challan_no;
  challan = [];


  paid_obj = {};
  dummy_obj = {};
  payobj = [];
  paid_flag = 0;
  dummy_flag = 0;
  allAccountInfo = [];
  fin_year;
  RecivalbeAccount = [{ account_code: '', account_amount: 0 }]
  date


  allProjectHier = []
  allProductHier = []
  allActivityHier = [];
  allBudgetHier = [];

  partyArr = []
  partyArrObj = {}
  challanRows = []
  challanObj = {}
  totalAmt = 0;
  totalGst = 0;
  netTotal = 0;

  gstType = [{ code: 'IGST', value: 'IGST' }, { code: 'CGST/SGST', value: 'CGST/SGST' }]


  account = [{ branch: 'BLM', bank: 'Punjab National Bank', account_num: 101010, ifsc_code: 'BLM00753' }
    , { branch: 'LKO', bank: 'Punjab National Bank', account_num: 1010, ifsc_code: 'LKO00753' },
  { branch: 'LKO', bank: 'Bank Of India', account_num: 1010, ifsc_code: 'LKO753' }];


  bankObj = { bank: null, branch: null, account_num: null, ifsc_code: null };
  Obj = {};

  allEvents = [];
  allHSNAccounts = [];
  systemDate;
  orgShortName = '';
  selectObj = {};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.billService.getSystemDate();
    this.systemDate = resp.data
    this.orgShortName = await this.mainService.accInfo['account_short_name']
    this.spinner.show();
    await this.getIp();
    await this.getAllAccountInfo();
    await this.getHSNAccount();
    await this.getAllRuleList();
    await this.getChallanInfo();
    await this.getActiveFinYear();
    await this.getAllBudget();
    await this.getAllProject();
    await this.getAllProduct();
    await this.getAllActivity();
    await this.setData();
    this.spinner.hide();


  }
  level1 = [];
  level2 = [];
  level3 = [];
  level4 = [];
  level5 = [];
  level6 = [];
  level7 = [];
  Chartobj = {};
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

  async FilteredEvents() {
    this.selectObj['b_acct_id'] = this.b_acct_id;
    var resp = await this.eventsService.getFilteredEvents(this.selectObj);
    if (resp['error'] == false) {
      this.allEvents = resp.data;
      for (let i = 0; i < this.allEvents.length; i++) {
        this.eventObj[this.allEvents[i]['event_code']] = this.allEvents[i]['event_desc']
      }

      this.dataSource1 = new MatTableDataSource(resp.data);
      this.dataSource1.sort = this.sortCol2;
      this.dataSource1.paginator = this.paginator1;
    } else {

    }



  }
  select(element) {
    this.challanRows[this.index]['event_code'] = element['event_code'];
    this.challanRows[this.index]['event_desc'] = element['event_desc'];
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
  async getAllActivity() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'activity_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allActivityHier = resp.data;
    } else {
    }
  }

  async getAllProject() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'proj_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProjectHier = resp.data;
    } else {
    }
  }

  async getAllProduct() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'prod_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProductHier = resp.data;

    } else {
    }
  }


  async getAllBudget() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'bud_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allBudgetHier = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide()
    }
  }

  async getActiveFinYear() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getActiveFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      if (resp.data.length == 0) {
        swal.fire("Warning", "..Active Financial Year Not set!",'warning');
      } else {
        this.fin_year = resp.data[0].fin_year;
      }
    } else {
      swal.fire("Error", "..Error while getting active  fin year!",'error');
    }
  }


  async  payment_received() {

    var paid = [];
    var processed = [];
    var generated = [];

    for (let i = 0; i < this.allChallan.length; i++) {
      if (this.allChallan[i]['select'] == true) {
        if (this.allChallan[i]['status'] == 'GENERATED') {
          generated.push(this.allChallan[i]);
        } else if (this.allChallan[i]['status'] == 'PROCESSED') {
          processed.push(this.allChallan[i]);
        } else if (this.allChallan[i]['status'] == 'PAID') {
          paid.push(this.allChallan[i]);
        }
      }
    }

    if (paid.length != 0 || processed.length != 0) {
      swal.fire("Error", "...In the Selected Challan " + paid.length + " Of PAID Challan And " + processed.length + " Of PROCESSED Challan!!",'error');
      return;
    } else {
      var id = [];
      for (let i = 0; i < generated.length; i++) {
        id.push(generated[i]['id']);
      }
      var obj = new Object();
      obj['b_acct_id'] = this.b_acct_id;
      obj['status'] = 'PAID';
      obj['id'] = id;
      obj['update_user_id'] = this.erpUser.user_id;

      this.spinner.show();
      var resp = await this.challanService.updateChallanStatus(obj);
      if (resp['error'] == false) {
        this.spinner.hide();
        this.getChallanInfo();
        swal.fire("Success", "...Challan PAID Successfuly!",'success');
      } else {
        this.spinner.hide();
        swal.fire("Error", "...Error while paid Challan!!",'error');

      }

    }


  }

  allRule = [];
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
  async process() {
    var paid = [];
    var processed = [];
    var generated = [];

    for (let i = 0; i < this.allChallan.length; i++) {
      if (this.allChallan[i]['select'] == true) {
        if (this.allChallan[i]['status'] == 'GENERATED') {
          generated.push(this.allChallan[i]);
        } else if (this.allChallan[i]['status'] == 'PROCESSED') {
          processed.push(this.allChallan[i]);
        } else if (this.allChallan[i]['status'] == 'PAID') {
          paid.push(this.allChallan[i]);
        }
      }
    }

    if (generated.length != 0 || processed.length != 0) {
      swal.fire("Error", "...In the Selected Challan " + generated.length + " Of Generated Challan And " + processed.length + " Of PROCESSED Challan!!",'error');
      return;
    } else {

      var data = await this.processPaidChallanData(paid);
      var processed_data = await this.ruleProcessService.startProcessing(data, this.allRule, this.systemDate, this.fin_year, this.orgShortName);
      if (processed_data['event'].length > 0) {
        swal.fire("Some Events does not have rule to be processed",'','info');
      } else {
        var id = [];
        for (let i = 0; i < paid.length; i++) {
          id.push(paid[i]['id']);
        }
        var obj = new Object();
        obj['b_acct_id'] = this.b_acct_id;
        obj['status'] = 'PROCESSED';
        obj['id'] = id;
        obj['jrnl'] = processed_data['jrnl'];
        obj['update_user_id'] = this.erpUser.user_id;
        this.spinner.show();
       var resp = await this.challanService.insertProcessedChallanData(obj);
        if (resp['error'] == false) {
          this.spinner.hide();
          this.getChallanInfo();
          swal.fire("Success", "...Challan PRCCESSED Successfuly!",'success');
        } else {
          this.spinner.hide();
          swal.fire("Error", "Some Events does not have rule!!",'error');

        } 
      }



    }
  }


  processPaidChallanData(paid) {
    var temp = [];

    for (let i = 0; i < paid.length; i++) {
      var challanRows = [];
      var challanObj = new Object();

      var obj = JSON.parse(paid[i]['data'])
      challanRows = obj['arr'];
      challanObj = obj['obj'];
      for (let j = 0; j < challanRows.length; j++) {

        var obj_temp1 = new Object();
        obj_temp1['evt_grp_dt'] = paid[i]['challan_generate_date']
        obj_temp1['bus_event_type'] = 'CHALLAN';
        obj_temp1['demand_id'] = challanObj['demand_id'];
        obj_temp1['party_id'] = challanObj['party_id'];
        obj_temp1['event_code'] = challanRows[j]['event_code'];
        obj_temp1['event_id'] = paid[i]['id'];
        obj_temp1['event_ln_id'] = j + 1;
        obj_temp1['bank_acct_num'] = challanRows[j]['bank_acct_no'];
        obj_temp1['ev_desc'] = challanRows[j]['event_desc'];
        obj_temp1['event_desc'] = challanObj['purpose'];
        obj_temp1['txn_amt'] = challanRows[j]['amount'];
        obj_temp1['create_user_id'] = this.erpUser.user_id;
        obj_temp1['arr_num'] = challanObj['party_id'];
        obj_temp1['party_name'] = challanObj['party_name'];
        if (challanRows[j]['cgst_amount'] != 0) {
          var obj_temp2 = new Object();
          obj_temp2['evt_grp_dt'] = paid[i]['challan_generate_date']
          obj_temp2['bus_event_type'] = 'CHALLAN';
          obj_temp2['demand_id'] = challanObj['demand_id'];
          obj_temp2['party_id'] = challanObj['party_id'];
          obj_temp2['event_code'] = "CGSTOUTPUT";
          obj_temp2['event_id'] = paid[i]['id'];
          obj_temp2['event_ln_id'] = j + 1;
          obj_temp2['bank_acct_num'] = challanRows[j]['bank_acct_no'];
          obj_temp2['ev_desc'] ='CGSTOUTPUT'
          obj_temp2['event_desc'] = challanObj['purpose'];
          obj_temp2['txn_amt'] = challanRows[j]['cgst_amount'];
          obj_temp2['create_user_id'] = this.erpUser.user_id;
          obj_temp2['arr_num'] = challanObj['party_id'];
          obj_temp2['party_name'] = challanObj['party_name'];
          temp.push(obj_temp2);
        }
        if (challanRows[j]['sgst_amount'] != 0) {
          var obj_temp3 = new Object();
          obj_temp3['evt_grp_dt'] = paid[i]['challan_generate_date']
          obj_temp3['bus_event_type'] = 'CHALLAN';
          obj_temp3['demand_id'] = challanObj['demand_id'];
          obj_temp3['party_id'] = challanObj['party_id'];
          obj_temp3['event_code'] = "SGSTOUTPUT";
          obj_temp3['event_id'] = paid[i]['id'];
          obj_temp3['event_ln_id'] = j + 1;
          obj_temp3['bank_acct_num'] = challanRows[j]['bank_acct_no'];
          obj_temp3['ev_desc'] = 'SGSTOUTPUT'
          obj_temp3['event_desc'] = challanObj['purpose'];
          obj_temp3['txn_amt'] = challanRows[j]['sgst_amount'];
          obj_temp3['create_user_id'] = this.erpUser.user_id;
          obj_temp3['arr_num'] = challanObj['party_id'];
          obj_temp3['party_name'] = challanObj['party_name'];
          temp.push(obj_temp3);
        }
        if (challanRows[j]['igst_amount'] != 0) {
          var obj_temp4 = new Object();
          obj_temp4['evt_grp_dt'] = paid[i]['challan_generate_date']
          obj_temp4['bus_event_type'] = 'CHALLAN';
          obj_temp4['demand_id'] = challanObj['demand_id'];
          obj_temp4['party_id'] = challanObj['party_id'];
          obj_temp4['event_code'] = "IGSTOUTPUT";
          obj_temp4['event_id'] = paid[i]['id'];
          obj_temp4['event_ln_id'] = j + 1;
          obj_temp4['bank_acct_num'] = challanRows[j]['bank_acct_no'];
          obj_temp4['event_desc'] = challanObj['purpose'];
          obj_temp4['txn_amt'] = challanRows[j]['igst_amount'];
          obj_temp4['ev_desc'] = 'IGSTOUTPUT'
          obj_temp4['create_user_id'] = this.erpUser.user_id;
          obj_temp4['arr_num'] = challanObj['party_id'];
          obj_temp4['party_name'] = challanObj['party_name'];
          temp.push(obj_temp4);
        }



        temp.push(obj_temp1);

      }
    }

    return temp;
  }
  eventObj = {}



  hsnObj = {}
  async getHSNAccount() {
    var resp = await this.settingService.getHSNAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allHSNAccounts = resp.data;
      for (let i = 0; i < this.allHSNAccounts.length; i++) {
        this.hsnObj[this.allHSNAccounts[i]['hsn_code']] = this.allHSNAccounts[i]['hsn_desc']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all HSN list!",'error');
    }
  }

  async getAllAccountInfo() {
    var resp = await this.challanService.getAccountInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.allAccountInfo = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while getting all account Type!",'error');
    }
  }

  changeParty() {
    for (let i = 0; i < this.partyArr.length; i++) {
      if (this.challanObj['party_id'] == this.partyArr[i]['party_id']) {
        this.challanObj['party_name'] = this.partyArr[i]['party_name']
        this.challanObj['party_email'] = this.partyArr[i]['email']
        this.challanObj['party_phone_no'] = this.partyArr[i]['phone_no']
        this.challanObj['party_address'] = this.partyArr[i]['addr_line_1'] + ","
          + this.partyArr[i]['addr_line_2']
          + "," + this.partyArr[i]['city']
          + "," + this.partyArr[i]['zip']
      }
    }
  }

  changeHSN(i) {
    for (let j = 0; j < this.allHSNAccounts.length; j++) {
      if (this.allHSNAccounts[j]['hsn_code'] == this.challanRows[i]['hsn_code']) {
        this.challanRows[i]['igst'] = this.allHSNAccounts[j]['igst'];
      }
    }
  }

  changeGSTType(i) {
    if (this.challanRows[i]['gst_type'] == 'IGST') {
      this.challanRows[i]['gst_amount'] = (parseInt(this.challanRows[i]['amount']) * this.challanRows[i]['igst']) / 100;
      this.challanRows[i]['igst_amount'] = (parseInt(this.challanRows[i]['amount']) * this.challanRows[i]['igst']) / 100;
      this.challanRows[i]['cgst_amount'] = 0;
      this.challanRows[i]['sgst_amount'] = 0;
    } else {
      this.challanRows[i]['gst_amount'] = (parseInt(this.challanRows[i]['amount']) * this.challanRows[i]['igst']) / 100;
      this.challanRows[i]['igst_amount'] = 0;
      this.challanRows[i]['cgst_amount'] = (parseInt(this.challanRows[i]['amount']) * this.challanRows[i]['igst']) / 200;
      this.challanRows[i]['sgst_amount'] = (parseInt(this.challanRows[i]['amount']) * this.challanRows[i]['igst']) / 200;

    }
  }

  async getIp() {
    this.spinner.show();

    var resp = await this.challanService.getPartyInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.partyArr = resp.data;
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

  addRow() {
    this.challanRows.push({ amount: 0, gst_amount: 0, igst: 0, total_amount: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0 })
  }

  deleteRow(i) {
    this.challanRows.splice(i, 1);
  }

  refresh() {
    this.challanRows = []
    this.challanObj = new Object
    this.totalAmt = 0;
    this.totalGst = 0
    this.netTotal = 0
    this.addRow()
  }

  igstAmount = 0;
  cgstAmount = 0;
  sgstAmount = 0;
  async check() {

    this.totalAmt = 0;
    this.totalGst = 0;
    this.netTotal = 0;
    this.igstAmount = 0;
    this.cgstAmount = 0;
    this.sgstAmount = 0;
    let obj = new Object;
    for (let i = 0; i < this.challanRows.length; i++) {
      this.challanRows[i]['total_amount'] = this.challanRows[i]['amount'] + this.challanRows[i]['gst_amount']
      this.totalAmt = this.totalAmt + this.challanRows[i]['amount'];
      this.totalGst = this.totalGst + this.challanRows[i]['gst_amount']
      this.netTotal = this.netTotal + this.challanRows[i]['total_amount']
      this.igstAmount = this.igstAmount + this.challanRows[i]['igst_amount']
      this.cgstAmount = this.cgstAmount + this.challanRows[i]['cgst_amount']
      this.sgstAmount = this.sgstAmount + this.challanRows[i]['sgst_amount']
    }
  }

  changeBank() {
    for (let i = 0; i < this.allAccountInfo.length; i++) {
      if (this.challanObj['account_id'] == this.allAccountInfo[i]['id']) {
        this.challanObj['bank_code'] = this.allAccountInfo[i]['bank_code']
        this.challanObj['branch_code'] = this.allAccountInfo[i]['branch_code']
        this.challanObj['bank_acct_no'] = this.allAccountInfo[i]['bank_acct_no']
        this.challanObj['ifsc_code'] = this.allAccountInfo[i]['ifsc_code']

      }
    }


  }



  async createChallan() {
    this.spinner.show();
    this.check();
    this.challanObj['amount'] = this.netTotal
    var obj1 = new Object
    obj1['obj'] = Object.assign(this.challanObj)
    obj1['arr'] = Object.assign(this.challanRows)
    var obj = Object.assign(this.challanObj)
    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.erpUser.user_id
    obj['data'] = JSON.stringify(obj1)
    obj['challan_source'] = 'ACC'
    obj['status'] = 'GENERATED'

    var resp = await this.challanService.createChallan(obj);
    if (resp['error'] == false) {
      await this.getChallanInfo();

      this.spinner.hide();
      swal.fire("Success", "...Challan Generated Successfuly!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while generating challan!",'error');
    }

  }

  open_update(element) {
    var obj = JSON.parse(element.data)
    this.challanRows = obj['arr']
    this.challanObj = obj['obj']
    this.challanObj['id'] = element.id
    this.challanObj['challan_source'] = element['challan_source']
    this.challanObj['status'] = element['status']
    this.challanObj['challan_generate_date'] = element['challan_generate_date']
    this.challanObj['amount'] = element['amount'];



    this.check()
    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }

  allChallan = [];
  async getChallanInfo() {
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    this.spinner.show();
    var resp = await this.challanService.getChallanInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allChallan = resp.data;
      for (let i = 0; i < this.allChallan.length; i++) {
        this.allChallan['select'] = false;
      }
      this.datasource = new MatTableDataSource(this.allChallan)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while getting challan!",'error');
    }
  }



  async updateChallan() {
    this.spinner.show();
    this.check();
    this.challanObj['amount'] = this.netTotal
    var obj1 = new Object
    obj1['obj'] = Object.assign(this.challanObj)
    obj1['arr'] = Object.assign(this.challanRows)

    var obj = Object.assign(this.challanObj)
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id'] = this.erpUser.user_id
    obj['data'] = JSON.stringify(obj1)
    var resp = await this.challanService.updateChallan(obj);
    if (resp['error'] == false) {
      await this.getChallanInfo();

      this.spinner.hide();
      swal.fire("Success", "...Challan Updated Successfuly!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while updating challan!",'error');
    }

  }


  async deleteChallan(element) {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    this.spinner.show();
    var resp = await this.challanService.deleteChallan(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.dummy_obj = {};
      this.RecivalbeAccount = [];
      await this.getChallanInfo();
      this.spinner.hide();
      swal.fire("Success", "...Challan Deleted Successfuly!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while deleting challan!",'error');
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter1(filterValue: string) {
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  async print(element) {
    var obj = JSON.parse(element.data)
    this.challanRows = obj['arr']
    this.challanObj = obj['obj']
    this.challanObj['id'] = element.id
    this.challanObj['challan_source'] = element['challan_source']
    this.challanObj['status'] = element['status']
    this.challanObj['challan_generate_date'] = element['challan_generate_date']
    this.challanObj['amount'] = element['amount'];
    await this.check();
    await this.print1();
  }
  async print1() {

    //print_data=[];

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")";
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var arr = []
        var obj = { text: txt + "  Page No. - " + currentPage, alignment: 'left', margin: [72, 40], fontSize: 15, bold: true };
        //arr.push(obj);
        //var obj1 = { text: "CONTINGENT BILL", alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        //arr.push(obj1);
        return arr;
      },
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };


    //Compny Name Copy
    var header_copy1 = {
      columns: [
        {
          width: '*',
          text: this.mainService.accInfo['account_name'] + "-" + this.mainService.accInfo['account_short_name'] + "'s Copy:",
          bold: true,
          alignment: 'left'
        }
      ],

    }
    var header1 = {
      columns: [
        {

          width: '*',
          text: 'Demand Id :',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['demand_id']
        },
        {

          width: '*',
          text: 'Print Date :',
          bold: true
        },
        {

          width: '*',
          text:this.mainService.dateFormatChange(this.systemDate)
        }
      ],

    }
    var header2 = {
      columns: [
        {

          width: '*',
          text: 'Challan Date :',
          bold: true
        },
        {
          width: '*',
          text: this.mainService.dateFormatChange(this.challanObj['challan_generate_date'])
        },
        {

          width: '*',
          text: 'Challan No :',
          bold: true
        },
        {

          width: '*',
          text: this.challanObj['id']
        }
      ],


    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Bank Name :',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['bank_code'] + " - " + this.challanObj['branch_code'] + " - " + this.challanObj['bank_acct_no'] + " - " + this.challanObj['ifsc_code']
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
    var header4 = {
      columns: [
        {
          width: '*',
          text: 'Applicant Name: '
        },
        {
          width: '*',
          text: this.challanObj['party_name']
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

    var header5 = {
      columns: [
        {
          width: '*',
          text: 'Mobile Number: '
        },
        {
          width: '*',
          text: this.challanObj['party_phone_no']
        },
        {
          width: '*',
          text: 'Email: ',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['party_email']
        }
      ],

    }

    var header6 = {
      columns: [
        {
          width: '*',
          text: 'Address: '
        },
        {
          width: '*',
          text: this.challanObj['party_address']
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

    var header7 = {
      columns: [
        {
          width: '*',
          text: 'Purpose: '
        },
        {
          width: '*',
          text: this.challanObj['purpose']
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
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header_copy1);
    //print_data.push(header_copy1)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })


    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header1);
    //print_data.push(header1)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header2);
    //print_data.push(header2)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header3);
    //print_data.push(header3)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header4);
    //print_data.push(header4)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header5);
    //print_data.push(header5)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header6);
    //print_data.push(header6)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header7);
    //print_data.push(header7)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })



    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })


    var header8 = {
      columns: [
        {
          width: '*',
          text: 'HEAD DESCRIPTION',
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
    dd.content.push(header8);
    //print_data.push(header8)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })


    for (var i = 0; i < this.challanRows.length; i++) {
      var objRow = {
        columns: [
          {
            width: '*',
            text: this.challanRows[i]['event_desc'],
            bold: true
          },
          {
            width: '*',
            text: this.hsnObj[this.challanRows[i]['hsn_code']]

          },
          {
            width: '*',
            text: this.challanRows[i]['igst'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['cgst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['sgst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['igst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['total_amount'],
            bold: true,
            alignment: 'right'
          }
        ],

      }

      dd.content.push(objRow);
      //print_data.push(objRow)

      dd.content.push({ text: " " });
      //print_data.push({ text: " " })


      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
      //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

      dd.content.push({ text: " " });
      //print_data.push({ text: " " })


    }

    var totalObjRow = {
      columns: [

        {
          width: '*',
          text: 'TOTAL',
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
          text: this.totalAmt.toFixed(2),
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
          text: this.netTotal.toFixed(2),
          bold: true,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(totalObjRow);
    //print_data.push(totalObjRow)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })



    var sig = {
      columns: [

        {
          width: '*',
          text: "Applicant's Signature",
          bold: true
        },
        {
          width: '*',
          text: '',
          bold: true
        },
        {
          width: '*',
          text: '',
          bold: true
        },
        {
          width: '*',
          text: "Receiver's Signature",
          bold: true
        }


      ],

    }
    dd.content.push(sig);
    //print_data.push(sig)


    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })





    //Main Office copy




    var header_copy1 = {
      columns: [
        {
          width: '*',
          text: "Bank Copy:",
          bold: true,
          alignment: 'left'
        }
      ],

    }
    var header1 = {
      columns: [
        {

          width: '*',
          text: 'Demand Id :',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['demand_id']
        },
        {

          width: '*',
          text: 'Print Date :',
          bold: true
        },
        {

          width: '*',
          text: this.mainService.dateFormatChange(this.systemDate)
        }
      ],

    }
    var header2 = {
      columns: [
        {

          width: '*',
          text: 'Challan Date :',
          bold: true
        },
        {
          width: '*',
          text: this.mainService.dateFormatChange(this.challanObj['challan_generate_date'])
        },
        {

          width: '*',
          text: 'Challan No :',
          bold: true
        },
        {

          width: '*',
          text: this.challanObj['id']
        }
      ],


    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Bank Name :',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['bank_code'] + " - " + this.challanObj['branch_code'] + " - " + this.challanObj['bank_acct_no'] + " - " + this.challanObj['ifsc_code']
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
    var header4 = {
      columns: [
        {
          width: '*',
          text: 'Applicant Name: '
        },
        {
          width: '*',
          text: this.challanObj['party_name']
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

    var header5 = {
      columns: [
        {
          width: '*',
          text: 'Mobile Number: '
        },
        {
          width: '*',
          text: this.challanObj['party_phone_no']
        },
        {
          width: '*',
          text: 'Email: ',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['party_email']
        }
      ],

    }

    var header6 = {
      columns: [
        {
          width: '*',
          text: 'Address: '
        },
        {
          width: '*',
          text: this.challanObj['party_address']
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

    var header7 = {
      columns: [
        {
          width: '*',
          text: 'Purpose: '
        },
        {
          width: '*',
          text: this.challanObj['purpose']
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
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }], pageBreak: 'before' });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header_copy1);
    //print_data.push(header_copy1)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })


    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header1);
    //print_data.push(header1)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header2);
    //print_data.push(header2)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header3);
    //print_data.push(header3)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header4);
    //print_data.push(header4)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header5);
    //print_data.push(header5)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header6);
    //print_data.push(header6)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header7);
    //print_data.push(header7)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })



    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })


    var header8 = {
      columns: [
        {
          width: '*',
          text: 'HEAD DESCRIPTION',
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

    dd.content.push(header8);
    //print_data.push(header8)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    for (var i = 0; i < this.challanRows.length; i++) {
      var objRow1 = {
        columns: [
          {
            width: '*',
            text: this.challanRows[i]['event_desc'],
            bold: true
          },
          {
            width: '*',
            text: this.hsnObj[this.challanRows[i]['hsn_code']]

          },
          {
            width: '*',
            text: this.challanRows[i]['igst'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['cgst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['sgst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['igst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['total_amount'],
            bold: true,
            alignment: 'right'
          }
        ],

      }

      dd.content.push(objRow1);
      //print_data.push(objRow)

      dd.content.push({ text: " " });
      //print_data.push({ text: " " })


      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
      //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

      dd.content.push({ text: " " });
      //print_data.push({ text: " " })


    }

    var totalObjRow = {
      columns: [

        {
          width: '*',
          text: 'TOTAL',
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
          text: this.totalAmt.toFixed(2),
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
          text: this.netTotal.toFixed(2),
          bold: true,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(totalObjRow);
    //print_data.push(totalObjRow)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })



    var sig = {
      columns: [

        {
          width: '*',
          text: "Applicant's Signature",
          bold: true
        },
        {
          width: '*',
          text: '',
          bold: true
        },
        {
          width: '*',
          text: '',
          bold: true
        },
        {
          width: '*',
          text: "Receiver's Signature",
          bold: true
        }


      ],

    }
    dd.content.push(sig);
    //print_data.push(sig)


    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " });





    //Receiver copy


    var header_copy1 = {
      columns: [
        {
          width: '*',
          text: this.mainService.accInfo['account_name'] + "-" + "Receiver's Copy:",
          bold: true,
          alignment: 'left'
        }
      ],

    }
    var header1 = {
      columns: [
        {

          width: '*',
          text: 'Demand Id :',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['demand_id']
        },
        {

          width: '*',
          text: 'Print Date :',
          bold: true
        },
        {

          width: '*',
          text: this.mainService.dateFormatChange(this.systemDate)
        }
      ],

    }
    var header2 = {
      columns: [
        {

          width: '*',
          text: 'Challan Date :',
          bold: true
        },
        {
          width: '*',
          text: this.mainService.dateFormatChange(this.challanObj['challan_generate_date'])
        },
        {

          width: '*',
          text: 'Challan No :',
          bold: true
        },
        {

          width: '*',
          text: this.challanObj['id']
        }
      ],


    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Bank Name :',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['bank_code'] + " - " + this.challanObj['branch_code'] + " - " + this.challanObj['bank_acct_no'] + " - " + this.challanObj['ifsc_code']
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
    var header4 = {
      columns: [
        {
          width: '*',
          text: 'Applicant Name: '
        },
        {
          width: '*',
          text: this.challanObj['party_name']
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

    var header5 = {
      columns: [
        {
          width: '*',
          text: 'Mobile Number: '
        },
        {
          width: '*',
          text: this.challanObj['party_phone_no']
        },
        {
          width: '*',
          text: 'Email: ',
          bold: true
        },
        {
          width: '*',
          text: this.challanObj['party_email']
        }
      ],

    }

    var header6 = {
      columns: [
        {
          width: '*',
          text: 'Address: '
        },
        {
          width: '*',
          text: this.challanObj['party_address']
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

    var header7 = {
      columns: [
        {
          width: '*',
          text: 'Purpose: '
        },
        {
          width: '*',
          text: this.challanObj['purpose']
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
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }], pageBreak: 'before' });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header_copy1);
    //print_data.push(header_copy1)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })


    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header1);
    //print_data.push(header1)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header2);
    //print_data.push(header2)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header3);
    //print_data.push(header3)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header4);
    //print_data.push(header4)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header5);
    //print_data.push(header5)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header6);
    //print_data.push(header6)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push(header7);
    //print_data.push(header7)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })



    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })


    var header8 = {
      columns: [
        {
          width: '*',
          text: 'HEAD DESCRIPTION',
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
    dd.content.push(header8);
    //print_data.push(header8)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })


    for (var i = 0; i < this.challanRows.length; i++) {
      var objRow5 = {
        columns: [
          {
            width: '*',
            text: this.challanRows[i]['event_desc'],
            bold: true
          },
          {
            width: '*',
            text: this.hsnObj[this.challanRows[i]['hsn_code']],
            alignment: "center"

          },
          {
            width: '*',
            text: this.challanRows[i]['igst'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['cgst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['sgst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['igst_amount'],
            alignment: 'right'

          },
          {
            width: '*',
            text: this.challanRows[i]['total_amount'],
            bold: true,
            alignment: 'right'
          }
        ],

      }

      dd.content.push(objRow5);
      //print_data.push(objRow)

      dd.content.push({ text: " " });
      //print_data.push({ text: " " })


      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
      //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] })

      dd.content.push({ text: " " });
      //print_data.push({ text: " " })


    }

    var totalObjRow = {
      columns: [

        {
          width: '*',
          text: 'TOTAL',
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
          text: this.totalAmt.toFixed(2),
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
          text: this.netTotal.toFixed(2),
          bold: true,
          alignment: 'right'
        }
      ],

    }
    dd.content.push(totalObjRow);
    //print_data.push(totalObjRow)

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    //print_data.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })



    var sig = {
      columns: [

        {
          width: '*',
          text: "Applicant's Signature",
          bold: true
        },
        {
          width: '*',
          text: '',
          bold: true
        },
        {
          width: '*',
          text: '',
          bold: true
        },
        {
          width: '*',
          text: "Receiver's Signature",
          bold: true
        }


      ],

    }
    dd.content.push(sig);
    //print_data.push(sig)


    dd.content.push({ text: " " });
    //print_data.push({ text: " " })

    dd.content.push({ text: " " });
    //print_data.push({ text: " " })









    pdfMake.createPdf(dd).download();

  }

}
