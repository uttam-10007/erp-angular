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
import { DemandService } from '../service/demand.service'

import { JsonPipe } from '@angular/common';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
declare var $: any

@Component({
  selector: 'app-demand',
  templateUrl: './demand.component.html',
  styleUrls: ['./demand.component.css']
})
export class DemandComponent implements OnInit {

  //new


  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;

  constructor(private hierarchyService: HierarchyService,
    private EventsService: EventsService, private ruleService: RuleService, private demandS: DemandService, private ruleProcessService: RuleProcessService, private billService: BillService, private settingService: SettingService, private eventsService: EventsService, private budgetService: BudgetService, private ledgerService: LedgerService, private challanService: ChallanService, public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  header = {}
  erpUser;
  b_acct_id;
  allHsn = [];
  selectObj = {}
  partyArr = []
  demandObj = { data: [] }
  displayedColumns = ['id', 'party_id','party_name','remark', 'demand_date', 'org_bank', 'org_gistn', 'status', 'action'];
  datasource;
  systemDate;
  orgShortName
  displayedColumns1 = ['event_code', 'event_desc', 'action'];
  dataSource1;
  
  async ngOnInit() {
    var resp = await this.billService.getSystemDate();
    this.systemDate = resp.data
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.orgShortName = await this.mainService.accInfo['account_short_name']

    await this.getHsn();
    await this.getIp();

    await this.getBudgetHier();
    await this.getProjectHier();
    await this.getActivityHier();
    await this.getProductHier()
    await this.setData();
    await this.getBankAccount()
    await this.getDemadList()
    await this.getAllRuleList();
    await this.getActiveFinYear();
    await this.getHSNAccount()

  }

  allHSNAccounts=[]
  hsnObj = {}
  
  async getHSNAccount() {
    var resp = await this.settingService.getHSNAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allHSNAccounts = resp.data;
      for (let i = 0; i < this.allHSNAccounts.length; i++) {
        this.hsnObj[this.allHSNAccounts[i]['hsn_code']] = this.allHSNAccounts[i]
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all HSN list!",'error');
    }
  }

  fin_year
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
  allRule=[]
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
  async refresh() {
    this.demandObj = { data: [] }

  }
  allBankAccounts = []
  async getBankAccount() {
    var resp = await this.settingService.getBankAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBankAccounts = resp.data;
      for(let i=0;i<this.allBankAccounts.length;i++){
        this.allBankAccounts[i]['desc']=this.allBankAccounts[i]['bank_acct_no']+" - "+this.allBankAccounts[i]['bank_acct_desc']
      }

      this.spinner.hide();

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while getting  all fields list!",'error');

      /*  this.snackBar.open("Error while getting  all fields list", 'Error', {
         duration: 5000
       }); */
    }
  }
  async delete(e) {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = e['id']
    var resp = await this.demandS.deleteDEmand(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()

      swal.fire('success','Record Deleted Successfully','success')
      await this.getDemadList()
    }
    else {
      this.spinner.hide()

      swal.fire('Error','Some Error Occured','error')
    }
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
  event_data = []

  async select(element) {
    this.event_data[this.index] = element
    this.demandObj['data'][this.index]['event'] = element['event_code']
    this.demandObj['data'][this.index]['event_desc'] = element['event_desc']

    $('#myModal').modal('hide');
  }
  index;
  open_event_popup(i) {
    this.index = i;
    $('#myModal').modal('show');

  }
  async getHsn() {
    var resp = await this.settingService.getHSNAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allHsn = resp.data;

    } else {

      swal.fire("Error", "...Error while getting  all HSN list!",'error');
    }
  }
  Select(s){

  }
  async FilteredEvents() {
    this.selectObj['b_acct_id'] = this.b_acct_id
    this.spinner.show()
    var resp = await this.EventsService.getFilteredEvents(this.selectObj);
    if (resp['error'] == false) {
      this.dataSource1 = new MatTableDataSource(resp.data);
      this.dataSource1.sort = this.sortCol2;
      this.dataSource1.paginator = this.paginator1;
      this.spinner.hide()
    } else {
      this.spinner.hide()

    }
    
  }

  sum = []
 

  allActivityHier = []
  allBudgetHier = []
  allProductHier = []
  allProjectHier = []
  async setData() {

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

  async getBudgetHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'bud_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allBudgetHier = resp.data;

    } else {
      swal.fire("Error", "...Error while getting hierchy list",'error');
    }
  }

  async getProjectHier() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'proj_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allProjectHier = resp.data;


    } else {
      this.spinner.hide()
      swal.fire("Error", "...Error while getting hierchy list",'error');
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
      swal.fire("Error", "...Error while getting hierchy list",'error');
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
      swal.fire("Error", "...Error while getting hierchy list",'error');
    }
  }

  AllRow = []
  obj = {}
  eventArr = []
  async process(element) {
    this.spinner.show();
    this.eventArr=[]
    this.demandObj =Object.assign({},element) 
    this.demandObj['data']  = JSON.parse(element['data'])
    await this.check()
    for (let i = 0; i < this.demandObj['data'].length; i++) {
      let obj_temp1 = new Object();
      obj_temp1['evt_grp_dt'] = this.demandObj['demand_date']
      obj_temp1['bus_event_type'] = 'DEMAND';
      obj_temp1['invoice_id'] = this.demandObj['id']
      obj_temp1['party_id'] = this.demandObj['party_id'];
      obj_temp1['event_code'] = this.demandObj['data'][i]['event'];
      obj_temp1['event_id'] =  this.demandObj['id']
      obj_temp1['event_ln_id'] = i ;
      obj_temp1['remark']=this.demandObj['remark'];
      obj_temp1['event_desc'] =this.demandObj['data'][i]['event_desc']
      obj_temp1['txn_amt'] =  this.demandObj['data'][i]['amount'];
      obj_temp1['create_user_id'] = this.erpUser.user_id;
      obj_temp1['arr_num'] = this.demandObj['party_id'];
      obj_temp1['party_name']=this.partyArrObj[this.demandObj['party_id']]
      this.eventArr.push(obj_temp1)
      if (this.demandObj['data'][i]['gst_type']=='CGST-SGST') {
        let obj_temp2 = new Object();
        obj_temp2['evt_grp_dt'] = this.demandObj['demand_date']
        obj_temp2['bus_event_type'] = 'DEMAND';
        obj_temp2['invoice_id'] = this.demandObj['id']
        obj_temp2['party_id'] = this.demandObj['party_id'];
        obj_temp2['event_code'] = "CGSTOUTPUT"
        obj_temp2['event_id'] =  this.demandObj['id']
        obj_temp2['event_ln_id'] = i + 1;
        obj_temp2['remark']=this.demandObj['remark'];
        obj_temp2['event_desc'] ='CGSTOUTPUT'
        obj_temp2['txn_amt'] =  this.demandObj['data'][i]['cgst'];
        obj_temp2['create_user_id'] = this.erpUser.user_id;
        obj_temp2['arr_num'] = this.demandObj['party_id'];
        obj_temp2['party_name']=this.partyArrObj[this.demandObj['party_id']]

        this.eventArr.push(obj_temp2)

        let obj_temp3 = new Object();
        obj_temp3['evt_grp_dt'] = this.demandObj['demand_date']
        obj_temp3['bus_event_type'] = 'DEMAND';
        obj_temp3['invoice_id'] = this.demandObj['id']
        obj_temp3['party_id'] = this.demandObj['party_id'];
        obj_temp3['event_code'] = "SGSTOUTPUT"
        obj_temp3['event_id'] =  this.demandObj['id']
        obj_temp3['event_ln_id'] = i + 2;
        obj_temp3['remark']=this.demandObj['remark'];
        obj_temp3['event_desc'] ='SGSTOUTPUT'
        obj_temp3['txn_amt'] =  this.demandObj['data'][i]['sgst'];
        obj_temp3['create_user_id'] = this.erpUser.user_id;
        obj_temp3['arr_num'] = this.demandObj['party_id'];
        obj_temp3['party_name']=this.partyArrObj[this.demandObj['party_id']]
        this.eventArr.push(obj_temp3)
      }
      if (this.demandObj['data'][i]['gst_type']=='IGST') {
        let obj_temp3 = new Object();
        obj_temp3['evt_grp_dt'] = this.demandObj['demand_date']
        obj_temp3['bus_event_type'] = 'DEMAND';
        obj_temp3['invoice_id'] = this.demandObj['id']
        obj_temp3['party_id'] = this.demandObj['party_id'];
        obj_temp3['event_code'] = "IGSTOUTPUT"
        obj_temp3['remark']=this.demandObj['remark'];
        obj_temp3['event_id'] =  this.demandObj['id']
        obj_temp3['event_ln_id'] = i + 2;
        obj_temp3['event_desc'] ='IGSTOUTPUT'
        obj_temp3['txn_amt'] =  this.demandObj['data'][i]['igst'];
        obj_temp3['create_user_id'] = this.erpUser.user_id;
        obj_temp3['arr_num'] = this.demandObj['party_id'];
        obj_temp3['party_name']=this.partyArrObj[this.demandObj['party_id']]
        this.eventArr.push(obj_temp3)        
      }
    }
    var processed_data = await this.ruleProcessService.startProcessing(this.eventArr, this.allRule, this.systemDate, this.fin_year, this.orgShortName);
    if (processed_data['event'].length == 0) {
      var id = [];
     id.push(element.id)
      var obj1 = new Object();
      obj1['b_acct_id'] = this.b_acct_id;
      obj1['id'] = id;
      obj1['status'] = 'PROCESSED';
      obj1['update_user_id'] = this.erpUser.user_id;
      obj1['jrnl'] = processed_data['jrnl'];
      var resp = await this.demandS.insertProcessedDemandData(obj1);
      if (resp['error'] == false) {
        this.spinner.hide();
        await this.getDemadList();
        swal.fire("Success", "Processed Successfully!",'success');
      } else {
        await this.getDemadList();

        this.spinner.hide();
        swal.fire("Error", "...Error while Processed  Demand Insert!",'error');
      }
    } else {
      await this.getDemadList();
      this.spinner.hide();
      swal.fire("Error", "...Some Events does not have rule  !",'error');
    }

  }
  partyArrObj={}
  async getIp() {
    this.spinner.show()

    var resp = await this.challanService.getPartyInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.partyArr = resp.data;
      this.partyArrObj = new Object
      for (let i = 0; i < this.partyArr.length; i++) {
        this.partyArrObj[this.partyArr[i]['party_id']] = this.partyArr[i]['party_name']
      }


    } else {
      this.spinner.hide()
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  changeParty() {
    for (let i = 0; i < this.partyArr.length; i++) {
      if (this.demandObj['party_id'] == this.partyArr[i]['party_id']) {
        this.demandObj['party_gstin_no'] = this.partyArr[i]['gstin_no'];
        this.demandObj['party_name'] = this.partyArr[i]['party_name']
        this.demandObj['party_email'] = this.partyArr[i]['email']
        this.demandObj['party_phone_no'] = this.partyArr[i]['phone_no']
        this.demandObj['party_address'] = this.partyArr[i]['addr_line_1'] + ", "
          + this.partyArr[i]['addr_line_2']
          + ", " + this.partyArr[i]['city']
          + ", " + this.partyArr[i]['zip']
      }
    }
  }

  changeHSN(i) {
    
    if (this.demandObj['data'][i]['gst_type']=='CGST-SGST') {
      let amt=( this.demandObj['data'][i]['amount']*this.hsnObj[this.demandObj['data'][i]['hsn']]['cgst'])/100
      this.demandObj[ 'data'][i][ 'cgst'] =  parseInt(amt.toFixed(2));
      let amt1=( this.demandObj['data'][i]['amount']*this.hsnObj[this.demandObj['data'][i]['hsn']]['sgst'])/100
      this.demandObj[ 'data'][i][ 'sgst'] =  parseInt(amt1.toFixed(2));
      this.demandObj[ 'data'][i][ 'igst'] =0
      this.demandObj[ 'data'][i][ 'total']=this.demandObj['data'][i]['amount']+ this.demandObj[ 'data'][i][ 'cgst'] +this.demandObj[ 'data'][i][ 'sgst'] 

    }else{
      let amt=( this.demandObj['data'][i]['amount']*this.hsnObj[this.demandObj['data'][i]['hsn']]['igst'])/100
      this.demandObj[ 'data'][i][ 'igst'] =  parseInt(amt.toFixed(2));
      this.demandObj[ 'data'][i][ 'sgst'] =0
      this.demandObj[ 'data'][i][ 'cgst']=0
      this.demandObj[ 'data'][i][ 'total']=this.demandObj['data'][i]['amount']+ this.demandObj[ 'data'][i][ 'igst'] 
    }


    
 

}

check(){
  for (let i = 0; i < this.demandObj['data'].length; i++) {
    if(this.demandObj['data'][i]['gst_type']=='CGST-SGST' || this.demandObj['data'][i]['gst_type']=='IGST'){
    if (this.demandObj['data'][i]['gst_type']=='CGST-SGST') {
      let amt=( this.demandObj['data'][i]['amount']*this.hsnObj[this.demandObj['data'][i]['hsn']]['cgst'])/100
      this.demandObj[ 'data'][i][ 'cgst'] =  parseInt(amt.toFixed(2));
      let amt1=( this.demandObj['data'][i]['amount']*this.hsnObj[this.demandObj['data'][i]['hsn']]['sgst'])/100
      this.demandObj[ 'data'][i][ 'sgst'] =  parseInt(amt1.toFixed(2));
      this.demandObj[ 'data'][i][ 'igst'] =0
      this.demandObj[ 'data'][i][ 'total']=this.demandObj['data'][i]['amount']+ this.demandObj[ 'data'][i][ 'cgst'] +this.demandObj[ 'data'][i][ 'sgst'] 

    }else{
      let amt=( this.demandObj['data'][i]['amount']*this.hsnObj[this.demandObj['data'][i]['hsn']]['igst'])/100
      this.demandObj[ 'data'][i][ 'igst'] =  parseInt(amt.toFixed(2));
      this.demandObj[ 'data'][i][ 'sgst'] =0
      this.demandObj[ 'data'][i][ 'cgst']=0
      this.demandObj[ 'data'][i][ 'total']=this.demandObj['data'][i]['amount']+ this.demandObj[ 'data'][i][ 'igst'] 
    }
  }else{
    this.demandObj[ 'data'][i][ 'igst'] =0

    this.demandObj[ 'data'][i][ 'sgst'] =0
      this.demandObj[ 'data'][i][ 'cgst']=0
      this.demandObj[ 'data'][i][ 'total']=this.demandObj['data'][i]['amount']
  }
  }
}

gstType(i){
  this.demandObj[ 'data'][i][ 'sgst'] =0
      this.demandObj[ 'data'][i][ 'cgst']=0
      this.demandObj[ 'data'][i][ 'igst'] =0
      this.demandObj['data'][i]['hsn']=null
      this.demandObj[ 'data'][i][ 'total']=this.demandObj['data'][i]['amount']
}
  addRow() {
    var obj = new Object();
    obj['amount']=0
    obj['rate']=0
    obj['unit']=0
    this.demandObj.data.push(Object.assign({},obj));
  }

  calculateAmount(i){
    let amt= this.demandObj.data[i]['rate']* this.demandObj.data[i]['unit']
    this.demandObj.data[i]['amount']=Number(amt.toFixed(2))
    this.changeHSN(i)
  }
  deleteRow(i) {
    this.demandObj.data.splice(i, 1);
  }
  async submit() {
    this.spinner.show()
    await this.check();

    let obj = {}
    obj = Object.assign({},this.demandObj)
    obj['b_acct_id'] = this.b_acct_id
    obj['data'] = [JSON.stringify(this.demandObj['data'])]
    obj['status'] = 'GENERATED'
    obj['demand_date'] = this.systemDate


    var resp = await this.demandS.createDemand(obj)
    if (resp['error'] == false) {
      obj['id']=resp['data']
      swal.fire('success','Submitted Successfully','success')
      await this.process(obj)
      this.spinner.hide()

      await this.getDemadList()

    }
    else {
      this.spinner.hide()
      swal.fire('Error ',  'error','error')
    }
  }
  async open_update(element) {

    this.demandObj =Object.assign({},element) 
    this.demandObj['data']  = JSON.parse(element['data'])
    await this.changeParty();
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  async update() {
    this.spinner.show()
    await this.check()

    let obj = {}
    obj = this.demandObj
    obj['b_acct_id'] = this.b_acct_id
    obj['demand_date'] = this.systemDate
    obj['update_user_id']=this.erpUser.user_id
    obj['data'] = [JSON.stringify(this.demandObj['data'])]
    
    var resp = await this.demandS.updateDemand(obj)
    if (resp['error'] == false) {
      this.spinner.hide()

      swal.fire('success','Demand Updated Successfully','success')
      await this.process(obj)
      await this.getDemadList()

    }
    else {
      this.spinner.hide()

      swal.fire('Error ', '', 'error')
    }
  }
  async getDemadList() {
    this.spinner.show()
    var resp = await this.demandS.getDemandList(JSON.stringify(this.b_acct_id));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.datasource = new MatTableDataSource(resp.data);
      this.datasource.sort = this.sortCol2;
      this.datasource.paginator = this.paginator;
    } else {
      this.spinner.hide()
    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  applyFilter1(filterValue: string) {
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }
  // 


  async print(element) {
    for (let i = 0; i < this.partyArr.length; i++) {
      if (this.partyArr[i]['party_id'] == element['party_id']) {
        element['party_name'] = this.partyArr[i]['party_name']
        element['mobile'] = this.partyArr[i]['phone_no']
        element['email'] = this.partyArr[i]['email']
        element['address'] = this.partyArr[i]['addr_line_1'] + ','+this.partyArr[i]['city'] +','+ this.partyArr[i]['party_state']
      }
    }
    this.spinner.show()
    let dum = JSON.parse(element['data'])
    let data = []
    for (let i = 0; i < dum.length; i++) {
      let obj = {}
      if (dum[i]['event']) {
        obj['event'] = dum[i]['event'] + '-' + dum[i]['event_desc']
      } else {
        obj['event'] = ''

      }
      if (dum[i]['amount']) {
        obj['amount'] = dum[i]['amount']
      } else {
        obj['amount'] = ''
      }
      if (dum[i]['cgst']) {
        obj['cgst'] = dum[i]['cgst']
      } else {
        obj['cgst'] = ''
      }
      if (dum[i]['gst_type']) {
        obj['gst_type'] = dum[i]['gst_type']
      } else {
        obj['gst_type'] = ''
      }
      if (dum[i]['hsn']) {
        obj['hsn'] = dum[i]['hsn']
      } else {
        obj['hsn'] = ''
      }
      if (dum[i]['igst']) {
        obj['igst'] = dum[i]['igst']
      } else {
        obj['igst'] = 0
      }
      if (dum[i]['measurement_unit']) {
        obj['measurement_unit'] = dum[i]['measurement_unit']
      } else {
        obj['measurement_unit'] = ''
      }
      if (dum[i]['rate']) {
        obj['rate'] = dum[i]['rate']
      } else {
        obj['rate'] = ''
      }
      if (dum[i]['sgst']) {
        obj['sgst'] = dum[i]['sgst']
      } else {
        obj['sgst'] = 0
      }
      if (dum[i]['total']) {
        obj['total'] = dum[i]['total']
      } else {
        obj['total'] = 0
      }
      if (dum[i]['unit']) {
        obj['unit'] = dum[i]['unit']
      } else {
        obj['unit'] = ''
      }
      data.push(obj)

    }
    // var obj = new Object();
    // obj['b_acct_id'] = this.b_acct_id;
    // var resp = await this.partyService.getPartydetail(JSON.stringify(obj));
    // ------------
    var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
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
          text: 'Demand',
          bold: true,
          alignment: 'center'
        }

      ],
    }
    var header9 = {
      columns: [
        {
          width: '*',
          text: '* Note : This is a computer generated document.',
          bold: true,
          alignment: 'left'
        }

      ],
    }
    var header1 = {
      columns: [
        {
          width: '*',
          text: 'Demand ID :',
          bold: true
        },

        {
          width: '*',
          text: element['id']
        },
        {
          width: '*',
          text: 'Demand Date :',
          bold: true
        },

        {
          width: '*',
          text:this.mainService.dateFormatChange(element['demand_date'])
        }

      ],
    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Section :',
          bold: true
        },

        {
          width: '*',
          text: element['section']
        },
        {
          width: '*',
          text: 'Party :',
          bold: true
        },

        {
          width: '*',
          text: element['party_name']
        }

      ],
    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Party Mobile Number :',
          bold: true
        },

        {
          width: '*',
          text: element['mobile']
        },
        {
          width: '*',
          text: 'Party Email :',
          bold: true
        },

        {
          width: '*',
          text: element['email']
        }

      ],
    }
    var header4 = {
      columns: [
        {
          width: '*',
          text: 'Party Address :',
          bold: true
        },

        {
          width: '*',
          text: element['address']
        },
        {
          width: '*',
          text: 'Demand Valid Date :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.dateFormatChange(element['demand_valid_date'])
        }

      ],
    }
    var header5 = {
      columns: [
        {
          width: '*',
          text: 'Organization GSTIN  :',
          bold: true
        },

        {
          width: '*',
          text: element['org_gstin']
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
    var header6 = {
      columns: [
        {
          width: '*',
          text: 'Bank Account :',
          bold: true
        },

        {
          width: '*',
          text: element['org_bank_acct_no']
        },
        {
          width: '*',
          text: 'Remark :',
          bold: true
        },

        {
          width: '*',
          text: element['remark']
        }

      ],
    }
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

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header0);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push({ text: " " });
    dd.content.push(header2);
    dd.content.push({ text: " " });
    dd.content.push(header3);
    dd.content.push({ text: " " });
    dd.content.push(header4);
    dd.content.push({ text: " " });
    dd.content.push(header5);
    dd.content.push({ text: " " });
    dd.content.push(header6);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
          ['S NO.', 'Event', 'Measurement Unit', {text:'Unit',alignment:'right'}, {text:'Rate',alignment:'right'}, {text:'Amount',alignment:'right'}, 'GST', {text:'HSN',alignment:'right'}, {text:'IGST',alignment:'right'}, {text:'SGST',alignment:'right'}, {text:'CGST',alignment:'right'}, {text:'Total Amount',alignment:'right'}]
        ],
      }
    };
    dd.content.push(tbl);
    for (var i = 0; i < data.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(data[i]['event']);
      arr.push(data[i]['measurement_unit']);
      arr.push({text:data[i]['unit'],alignment:'right'});
      arr.push({text:data[i]['rate'],alignment:'right'});
      arr.push({text:data[i]['amount'],alignment:'right'});
      arr.push(data[i]['gst_type']);
      arr.push({text:data[i]['hsn'],alignment:'right'});
      arr.push({text:data[i]['igst'],alignment:'right'});
      arr.push({text:data[i]['sgst'],alignment:'right'});
      arr.push({text:data[i]['cgst'],alignment:'right'});
      arr.push({text:data[i]['total'],alignment:'right'});
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push(sig);
    this.spinner.hide()
    pdfMake.createPdf(dd).download("demand");
  }




}
