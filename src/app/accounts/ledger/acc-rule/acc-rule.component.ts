import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { RuleService } from '../../service/rule.service';
import { EventsService } from '../../service/events.service';
import { JournalService } from '../../service/journal.service';
import { element } from 'protractor';

import { HierarchyService } from '../../service/hierarchy.service';

declare var $: any

@Component({
  selector: 'app-acc-rule',
  templateUrl: './acc-rule.component.html',
  styleUrls: ['./acc-rule.component.css']
})
export class AccRuleComponent implements OnInit {


  constructor(private hierarchyService:HierarchyService,private journalService: JournalService, private EventsService: EventsService, private ruleService: RuleService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;

  obj = {
    id: '',
    ruleDesc: '',
    rulePriority: 0,
    when: [{ condition: 'AND', key: "event_code", value: '', operator: '==' }],
    journals: [{}, {}]
  };
  ledgerTypeArr = [{ code: 'A', value: 'A' }, { code: 'B', value: 'B' }]
  allRule = [];
  allEvents = []
  fieldTechnicalNames = {}
  fieldBusinessNames = {}
  allFields = [];
  journalFieldsCodes = []
  journalObjArray = []
  allEventLayouts = []
  selectedJournal = []
  allDBIND = [{ code: 'CR', value: 'CREDIT' }, { code: "DB", value: 'DEBIT' }]
  cRdBObj = { CR: 'CREDIT', DB: 'DEBIT' }
  defaultObj = {
    jrnl_desc: 'evt_grp_desc', amount: 'evt_grp_ln_dist_amt', arr_id: 'evt_grp_cp_arr_id', accounting_dt: 'evt_grp_dt',
    event_code: 'event_code', fin_year: 'evt_grp_dt', event_id: 'evt_grp_ln_dist_id', arr_num: 'evt_grp_cp_arr_id',
    fiscal_period: 'evt_grp_dt', curr_cd: 'evt_grp_curr_cd'
  }
  askFields = ['ledger_type', 'chart_of_account', 'db_cd_ind']

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  type = [{ code: 'field', value: 'FIELD' }, { code: 'static', value: 'STATIC' }];

  displayedColumns = ['id', 'rule_name', 'priority', 'action'];
  datasource;
  allChartOfAccount = [];
  selectLayoutFields = []
  index = 0;
  fieldTechNameTOBusinessName = {};
  allOperator = [{ code: "==", value: "EQUAL TO" }, { code: "!=", value: "NOT EQUAL TO" }, { code: "<", value: "GRATER THEN" }, { code: ">", value: "LESS THEN" }]
  async ngOnInit() {
    this.spinner.show();
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    //await this.getAllEvent();
    await this.getallFields();
    await this.getallChartOfAccount();
    await this.getJouranlDetals();
    await this.getAllRuleList();
    await this.makeJournalObj()
    await this.getAllEventLayouts();




    await this.getAllBudget();
    await this.getAllProject();
    await this.getAllProduct();
    await this.getAllActivity();
    await this.setData();
    this.spinner.hide();

  }
  ///***************************************Select Event New  Code**************************************///


  allProjectHier = []
  allProductHier = []
  allActivityHier = [];
  allBudgetHier = [];

  selectObj = {};
  displayedColumns1 = ['event_code', 'event_desc', 'action'];
  dataSource1;

  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;

  level1 = [];
  level2 = [];
  level3 = [];
  level4 = [];
  level5 = [];
  level6 = [];
  level7 = [];
  Chartobj = {};
  Hier = [];
  hier_type;

  async Select(type) {
    $('#select').modal('show');
    this.hier_type = type;
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
    if (this.hier_type == 'budget') {
      for (let i = 0; i < this.allBudget.length; i++) {
        if (this.allBudget[i]['code'] == this.Chartobj['leaf_cd']) {
          this.selectObj['bud_desc'] = this.allBudget[i]['desc'];
          this.selectObj['bud_cd'] = this.allBudget[i]['code'];
          this.selectObj['bud_lvl'] = this.allBudget[i]['level'];
        }
      }
    } else if (this.hier_type == 'activity') {
      for (let i = 0; i < this.allActivity.length; i++) {
        if (this.allActivity[i]['code'] == this.Chartobj['leaf_cd']) {
          this.selectObj['act_desc'] = this.allActivity[i]['desc'];
          this.selectObj['act_cd'] = this.allActivity[i]['code'];
          this.selectObj['act_lvl'] = this.allActivity[i]['level'];
        }
      }
    } else if (this.hier_type == 'project') {
      for (let i = 0; i < this.allProject.length; i++) {
        if (this.allProject[i]['code'] == this.Chartobj['leaf_cd']) {
          this.selectObj['proj_desc'] = this.allProject[i]['desc'];
          this.selectObj['proj_cd'] = this.allProject[i]['code'];
          this.selectObj['proj_lvl'] = this.allProject[i]['level'];
        }
      }
    } else if (this.hier_type == 'product') {
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

  eventObj={};

  async FilteredEvents() {
    this.selectObj['b_acct_id'] = this.b_acct_id;

    var resp = await this.EventsService.getFilteredEvents(this.selectObj);
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

  async select(element) {
    this.obj['event_code'] = element['event_code'];
    this.obj['event_desc'] = this.obj['event_code']+" - "+this.eventObj[element['event_code']];
    await this.eventChange();
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

  open_event_popup() {
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
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'prod_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProductHier = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
    }
  }

  async getAllBudget() {
    this.spinner.show()
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

   ///***************************************Select Event New  Code**************************************///


  async getAllEventLayouts() {
    this.spinner.show()
    var resp = await this.EventsService.getEventLayoutss(this.b_acct_id);
    if (resp['error'] == false) {
      this.allEventLayouts = resp.data;
      this.spinner.hide()
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting Event Records", 'Error', {
        duration: 5000
      });
    }
  }

  async getallFields() {
    var obj = new Object();
    obj['domain_code'] = 'ACCOUNT';
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.journalService.getFields(obj);
    this.allFields = [];
    if (resp['error'] == false) {
      this.allFields = resp.data;
      this.fieldTechNameTOBusinessName = {};

      for (let i = 0; i < this.allFields.length; i++) {
        this.fieldTechnicalNames[this.allFields[i]['field_code']] = this.allFields[i]['field_technical_name']
        this.fieldBusinessNames[this.allFields[i]['field_code']] = this.allFields[i]['field_business_name'];
        this.fieldTechNameTOBusinessName[this.allFields[i]['field_technical_name']] = this.allFields[i]['field_business_name']

      }
    } else {
      this.snackBar.open("Error while getting Fields", "Error", {
        duration: 5000,
      });
    }
  }


  async getJouranlDetals() {
    var resp = await this.journalService.getJournal(this.b_acct_id);
    if (resp['error'] == false) {
      var journal_dtl = resp.data[0];

      var jrnl_fileds_code = [];
      jrnl_fileds_code = journal_dtl.field_code.split(",");
      this.journalFieldsCodes = [];
      for (let i = 0; i < jrnl_fileds_code.length; i++) {
        this.journalFieldsCodes.push(jrnl_fileds_code[i]);
      }


    } else {
      this.snackBar.open("Error while getting Journal Records", "Error", {
        duration: 5000,
      });
    }
  }
  tempObj = new Object;
  async makeJournalObj() {
    this.journalObjArray = [];
    //var journalObjArray1 = [];
    for (let i = 0; i < this.journalFieldsCodes.length; i++) {
      if (this.askFields.includes(this.fieldTechnicalNames[this.journalFieldsCodes[i]])) {
        var obj = new Object();
        obj['value'] = this.defaultObj[this.fieldTechnicalNames[this.journalFieldsCodes[i]]];
        obj['type'] = 'field';
        obj['key'] = this.fieldTechnicalNames[this.journalFieldsCodes[i]]
        this.journalObjArray.push(Object.assign({}, obj));

      } else {
        var obj = new Object();
        obj['value'] = '';
        obj['type'] = 'static';
        obj['key'] = this.fieldTechnicalNames[this.journalFieldsCodes[i]]
        this.journalObjArray.push(Object.assign({}, obj));

      }
    }


    var arr = [];
    var arr1 = []
    for (var i = 0; i < this.journalObjArray.length; i++) {
      var obj = new Object();
      obj = Object.assign({}, this.journalObjArray[i]);
      var objx = Object.assign({}, this.journalObjArray[i]);

      if (this.journalObjArray[i]['key'] == 'db_cd_ind') {
        obj['value'] = 'CR'
        objx['value'] = 'DB'

      }
      arr.push(obj);
      arr1.push(objx)
    }
    var obj1 = new Object();
    obj1['db_cd_ind'] = 'CR';
    obj1['chart_of_account'] = null;
    obj1['arr'] = arr
    var obj2 = new Object();
    obj2['db_cd_ind'] = 'DB';
    obj2['chart_of_account'] = null;
    obj2['arr'] = arr1
    this.obj.journals[0] = obj1;
    this.obj.journals[1] = obj2;
  }
  changeChartOfAccount(j) {
    this.selectedJournal = []
    var chart_of_account = this.obj.journals[j]['chart_of_account'];


    for (let i = 0; i < this.obj.journals[j]['arr'].length; i++) {
      if (this.obj.journals[j]['arr'][i]['key'] == 'chart_of_account') {
        this.obj.journals[j]['arr'][i]['value'] = chart_of_account;
      }


    }
  }
  changeDebitCreditIndicator(j) {
    this.selectedJournal = []
    var db_cr_ind = this.obj.journals[j]['db_cd_ind'];


    for (let i = 0; i < this.obj.journals[j]['arr'].length; i++) {
      if (this.obj.journals[j]['arr'][i]['key'] == 'db_cd_ind') {
        this.obj.journals[j]['arr'][i]['value'] = db_cr_ind;
      }


    }
  }

  changeJournal(i) {
    this.index = i
    this.selectedJournal = []
    var chart_of_account = this.obj.journals[i]['chart_of_account'];
    var db_cd_ind = this.obj.journals[i]['db_cd_ind'];
    var temp = this.obj.journals[i]['arr']
    this.selectedJournal = temp;

    $('#myModal2').modal('show');
  }

  saveJournal() {
    this.obj.journals[this.index]['arr'] = [];
    for (let i = 0; i < this.selectedJournal.length; i++) {
      this.obj.journals[this.index]['arr'].push(Object.assign({}, this.selectedJournal[i]))
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

  async getAllEvent() {
    this.spinner.show()
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    this.spinner.show();
    var resp = await this.EventsService.getevents(obj);
    if (resp['error'] == false) {
      this.allEvents = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Events", 'Error', {
        duration: 5000,
      });
    }
  }

  addRow() {

    var arr = [];
    var arr1 = []
    for (var i = 0; i < this.journalObjArray.length; i++) {
      var obj = new Object();
      obj = Object.assign({}, this.journalObjArray[i]);
      var objx = Object.assign({}, this.journalObjArray[i]);

      if (this.journalObjArray[i]['key'] == 'db_cd_ind') {
        obj['value'] = 'CR'
        objx['value'] = 'DB'

      }
      arr.push(obj);
      arr1.push(objx)
    }
    var obj1 = new Object();
    obj1['db_cd_ind'] = 'CR';
    obj1['chart_of_account'] = null;
    obj1['arr'] = arr
    var obj2 = new Object();
    obj2['db_cd_ind'] = 'DB';
    obj2['chart_of_account'] = null;
    obj2['arr'] = arr1
    this.obj.journals.push(obj1)
    this.obj.journals.push(obj2)
  }

  deleteRow(i) {
    this.obj.journals.splice(i, 2)
  }

  async getAllRuleList() {
    this.spinner.show()
    var resp = await this.ruleService.getAllRules(this.b_acct_id);
    if (resp['error'] == false) {
      this.allRule = resp.data;
      this.datasource = new MatTableDataSource(this.allRule)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all rule list", 'Error', {
        duration: 5000
      });
    }
  }

  refresh() {
    this.obj = {
      id: '',
      ruleDesc: '',
      rulePriority: 0,
      when: [{ condition: 'AND', key: "event_code", value: '', operator: '==' }],
      journals: [{}, {}]
    };
  }
  refresh1() {
    this.obj = {
      id: '',
      ruleDesc: '',
      rulePriority: 0,
      when: [{ condition: 'AND', key: "event_code", value: '', operator: '==' }],
      journals: [{}, {}]
    };
    var arr = [];
    var arr1 = []
    for (var i = 0; i < this.journalObjArray.length; i++) {
      var obj = new Object();

      obj = Object.assign({}, this.journalObjArray[i]);
      var objx = Object.assign({}, this.journalObjArray[i]);

      if (this.journalObjArray[i]['key'] == 'db_cd_ind') {
        obj['value'] = 'CR'
        objx['value'] = 'DB'

      }
      arr.push(obj);
      arr1.push(objx)
    }
    var obj1 = new Object();
    obj1['db_cd_ind'] = 'CR';
    obj1['chart_of_account'] = null;
    obj1['arr'] = arr
    var obj2 = new Object();
    obj2['db_cd_ind'] = 'DB';
    obj2['chart_of_account'] = null;
    obj2['arr'] = arr1
    this.obj.journals[0] = obj1;
    this.obj.journals[1] = obj2;


  }

  condition = [{ code: 'OR', value: 'OR' }, { code: 'AND', value: 'AND' }]

  async save() {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['rule_name'] = this.obj['ruleDesc'];
    obj1['priority'] = this.obj['rulePriority'];
    obj1['rule_data'] = JSON.stringify({event_desc:this.obj['event_desc'], when: this.obj['when'], then: this.obj['journals'] });
    obj1['event_code'] = this.obj['event_code'];
    obj1['create_user_id'] = this.erpUser.user_id;
    var resp = await this.ruleService.createRule(obj1);

    if (resp['error'] == false) {
      await this.getAllRuleList();
      this.snackBar.open("Rule Created Successfully!!", 'Success!', {
        duration: 5000
      });
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while creating rule", 'Error', {
        duration: 5000
      });
    }

  }



  async open_update(element) {

    this.obj['ruleDesc'] = element['rule_name'];
    this.obj['rulePriority'] = element['priority'];
    this.obj['id'] = element['id'];
    this.obj['event_code'] = element['event_code'];
    var data = JSON.parse(element['rule_data']);
    this.obj['journals'] = data['then'];
    this.obj['when'] = data['when'];
    this.obj['event_desc'] = data['event_desc'];
    this.eventChange();
    $('.nav-tabs a[href="#tab-3"]').tab('show');
  }

  async update() {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['rule_name'] = this.obj['ruleDesc'];
    obj1['priority'] = this.obj['rulePriority'];
    obj1['id'] = this.obj['id'];
    obj1['rule_data'] = JSON.stringify({event_desc:this.obj['event_desc'], when: this.obj['when'], then: this.obj['journals'] });
    obj1['event_code'] = this.obj['event_code'];
    obj1['update_user_id'] = this.erpUser.user_id;

    var resp = await this.ruleService.updateRule(obj1);

    if (resp['error'] == false) {
      await this.getAllRuleList();
      this.spinner.hide();
      this.snackBar.open("Rule Update Successfully!!", 'Success!', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while updating rule", 'Error', {
        duration: 5000
      });
    }
  }



  async delete(element) {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['id'] = element['id'];
    var resp = await this.ruleService.deleteRule(JSON.stringify(obj1));
    if (resp['error'] == false) {
      await this.getAllRuleList();
      this.snackBar.open("Rule Delete Successfully!!", 'Success!', {
        duration: 5000
      });
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while deleting rule", 'Error', {
        duration: 5000
      });
    }

  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  applyFilter1(filterValue: string) {
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  eventChange() {
    var selectedLayout = 'R101'
    this.selectLayoutFields = []

    // for (let i = 0; i < this.allEvents.length; i++) {

    //   if (this.allEvents[i]['event_code'] == this.obj['event_code']) {
    //     
    //   }
    // }
    for (let j = 0; j < this.allEventLayouts.length; j++) {
        if ("R101" == this.allEventLayouts[j]['record_code']) {
               selectedLayout = this.allEventLayouts[j]
        }
    }
    let fieldsCodes = selectedLayout['field_code'].split(",")

    for (let i = 0; i < fieldsCodes.length; i++) {
      let ob = new Object
      ob['code'] = this.fieldTechnicalNames[fieldsCodes[i]]
      ob['value'] = fieldsCodes[i] + " - " + this.fieldBusinessNames[fieldsCodes[i]] + " - " + this.fieldTechnicalNames[fieldsCodes[i]]
      this.selectLayoutFields.push(ob)
    }
    this.obj['when'][0]['value'] = this.obj['event_code'];
  }

  changeEvent() {
    $('#myModal1').modal('show');
  }


  addwhenCondition() {
    this.obj['when'].push({ condition: '', key: '', value: '', operator: '' })
  }
  deletewhenCondition(i) {
    this.obj['when'].splice(i, 1)
  }



}
