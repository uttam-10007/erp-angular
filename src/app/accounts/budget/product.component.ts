import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../service/setting.service';
import { BudgetService } from '../service/budget.service';

import { MainService } from '../service/main.service';
import swal from 'sweetalert2';

declare var $: any


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  constructor(private budgetService: BudgetService, public mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'bud_cd', 'proj_cd', 'prod_cd', 'act_cd', 'amount'];
  displayedColumns1 = ['id', 'bud_cd', 'proj_cd', 'prod_cd', 'act_cd', 'amount', 'action'];

  datasource;
  datasource1;


  allBudgetInfo = [];
  budgetObject = {};
  allocatObject = {};
  selectObj = {};
  budHierObj = {};

  allocationArrayObj = { project: [], product: [], budget: [], act: [] }
  budgetArrayObj = { project: [], product: [], budget: [], act: [] };
  hierCodeValue = { project: {}, product: {}, budget: {}, act: {} }

  allocatUpdateObject = {};
  allBudgetHier = [];
  allActivityHier = [];
  allProjectHier = [];
  allProductHier = [];
  allBudget = [];
  allTypeBudgetInfo = [];

  validationObj = { budObj: {}, prodObj: {}, projObj: {}, actObj: {} }


  allocation_child_amount = 0;
  allocation_parent_amount = 0;
  allocation_previews_amount = 0;


  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;


  allocatlistObject = {};
  budgetlistObject = {};
  status = [{ code: 'ACTIVE', value: 'ACTIVE' }, { code: 'INACTIVE', value: 'INACTIVE' }]
  childAllocatioId = [];
  allActiveBudget = [];
  allActiveAllocation = [];
  total = 0;

  allocated_amount = 0;
  fin_year;
  allFinYear = [];

  allBudgetHierCodeValue = [];
  allProjectHierCodeValue = [];
  allProductHierCodeValue = [];
  allActivityHierCodeValue = [];

  repeatedValue = '';

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getBudgetHier();
    await this.getProjectHier();
    await this.getActivityHier();
    await this.getProductHier();
    await this.getBudget();
    await this.allAllocation();
    await this.getAllFinYear();
    await this.getActiveFinYear();
  }

  budgetList() {
    var data = [];
    for (let i = 0; i < this.allBudget.length; i++) {
      if (this.allBudget[i]['status'] == this.budgetlistObject['status'] && this.allBudget[i]['fin_year'] == this.budgetlistObject['fin_year']) {
        data.push(this.allBudget[i]);
      }
    }
    this.datasource = new MatTableDataSource(data)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  allocationList() {


    var data = [];
    for (let i = 0; i < this.allTypeBudgetInfo.length; i++) {
      if (this.allTypeBudgetInfo[i]['status'] == this.allocatlistObject['status'] && this.allTypeBudgetInfo[i]['fin_year'] == this.allocatlistObject['fin_year']) {
        data.push(this.allTypeBudgetInfo[i]);
      }
    }

    this.datasource1 = new MatTableDataSource(data)
    this.datasource1.paginator = this.paginator1;
    this.datasource1.sort = this.sortCol2;
  }

  async getBudget() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.budgetService.getBudgetInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allBudget = resp.data;
      this.allActiveBudget = [];
      this.validationObj = { budObj: {}, prodObj: {}, projObj: {}, actObj: {} };


      for (var i = 0; i < this.allBudget.length; i++) {
        if (this.allBudget[i]['status'] == 'ACTIVE') {

          this.allBudget[i]['desc'] = this.hierCodeValue['budget'][this.allBudget[i]['bud_cd']] + "-->"
            + this.hierCodeValue['project'][this.allBudget[i]['proj_cd']] + "-->"
            + this.hierCodeValue['product'][this.allBudget[i]['prod_cd']] + "-->"
            + this.hierCodeValue['act'][this.allBudget[i]['act_cd']] + "-->"
            + this.allBudget[i]['amount'];


          this.allActiveBudget.push(this.allBudget[i]);

          var row = this.allBudget[i];
          for (var j = 0; j < this.allBudgetHier.length; j++) {
            var bud_level = "lvl" + row.bud_level + '_cd';

            if (this.allBudgetHier[j][bud_level] == row.bud_cd) {

              this.validationObj.budObj[this.allBudgetHier[j]['lvl1_cd']] = row.bud_cd;
              this.validationObj.budObj[this.allBudgetHier[j]['lvl2_cd']] = row.bud_cd;
              this.validationObj.budObj[this.allBudgetHier[j]['lvl3_cd']] = row.bud_cd;
              this.validationObj.budObj[this.allBudgetHier[j]['lvl4_cd']] = row.bud_cd;
              this.validationObj.budObj[this.allBudgetHier[j]['lvl5_cd']] = row.bud_cd;
              this.validationObj.budObj[this.allBudgetHier[j]['lvl6_cd']] = row.bud_cd;
              this.validationObj.budObj[this.allBudgetHier[j]['lvl7_cd']] = row.bud_cd;
            }
          }
          for (var j = 0; j < this.allActivityHier.length; j++) {
            var act_level = "lvl" + row.act_level + '_cd';
            if (this.allActivityHier[j][act_level] == row.act_cd) {
              this.validationObj.actObj[this.allActivityHier[j]['lvl1_cd']] = row.act_cd;
              this.validationObj.actObj[this.allActivityHier[j]['lvl2_cd']] = row.act_cd;
              this.validationObj.actObj[this.allActivityHier[j]['lvl3_cd']] = row.act_cd;
              this.validationObj.actObj[this.allActivityHier[j]['lvl4_cd']] = row.act_cd;
              this.validationObj.actObj[this.allActivityHier[j]['lvl5_cd']] = row.act_cd;
              this.validationObj.actObj[this.allActivityHier[j]['lvl6_cd']] = row.act_cd;
              this.validationObj.actObj[this.allActivityHier[j]['lvl7_cd']] = row.act_cd;
            }
          }
          for (var j = 0; j < this.allProductHier.length; j++) {
            var prod_level = 'lvl' + row.prod_level + '_cd';
            if (this.allProductHier[j][prod_level] == row.prod_cd) {
              this.validationObj.prodObj[this.allProductHier[j]['lvl1_cd']] = row.prod_cd;
              this.validationObj.prodObj[this.allProductHier[j]['lvl2_cd']] = row.prod_cd;
              this.validationObj.prodObj[this.allProductHier[j]['lvl3_cd']] = row.prod_cd;
              this.validationObj.prodObj[this.allProductHier[j]['lvl4_cd']] = row.prod_cd;
              this.validationObj.prodObj[this.allProductHier[j]['lvl5_cd']] = row.prod_cd;
              this.validationObj.prodObj[this.allProductHier[j]['lvl6_cd']] = row.prod_cd;
              this.validationObj.prodObj[this.allProductHier[j]['lvl7_cd']] = row.prod_cd;
            }
          }
          for (var j = 0; j < this.allProjectHier.length; j++) {
            var proj_level = 'lvl' + row.proj_level + '_cd';
            if (this.allProjectHier[j][proj_level] == row.proj_cd) {
              this.validationObj.projObj[this.allProjectHier[j]['lvl1_cd']] = row.proj_cd;
              this.validationObj.projObj[this.allProjectHier[j]['lvl2_cd']] = row.proj_cd;
              this.validationObj.projObj[this.allProjectHier[j]['lvl3_cd']] = row.proj_cd;
              this.validationObj.projObj[this.allProjectHier[j]['lvl4_cd']] = row.proj_cd;
              this.validationObj.projObj[this.allProjectHier[j]['lvl5_cd']] = row.proj_cd;
              this.validationObj.projObj[this.allProjectHier[j]['lvl6_cd']] = row.proj_cd;
              this.validationObj.projObj[this.allProjectHier[j]['lvl7_cd']] = row.proj_cd;
            }
          }

        }

      }
    } else {
      swal.fire("Error", "...Error while getting all Budget list",'error');
    }
  }

  createUniqeBudgetHierCodeValue() {
    this.allBudgetHierCodeValue = [];
    for (let i = 0; i < this.allBudgetHier.length; i++) {
      for (let k = 1; k < 8; k++) {
        if (this.valueIsNotExit(this.allBudgetHierCodeValue, this.allBudgetHier[i]['lvl' + k + '_cd']) && this.allBudgetHier[i]['lvl' + k + '_cd'] != null) {
          this.allBudgetHierCodeValue.push({ code: this.allBudgetHier[i]['lvl' + k + '_cd'], value: this.allBudgetHier[i]['lvl' + k + '_value'], level: k, desc: this.allBudgetHier[i]['lvl' + k + '_value'] + "-" + this.allBudgetHier[i]['lvl' + k + '_cd'] })
        }

      }
    }
  }

  createUniqeProjectHierCodeValue() {
    this.allProjectHierCodeValue = [];
    for (let i = 0; i < this.allProjectHier.length; i++) {
      for (let k = 1; k < 8; k++) {
        if (this.valueIsNotExit(this.allProjectHierCodeValue, this.allProjectHier[i]['lvl' + k + '_cd']) && this.allProjectHier[i]['lvl' + k + '_cd'] != null) {
          this.allProjectHierCodeValue.push({ code: this.allProjectHier[i]['lvl' + k + '_cd'], value: this.allProjectHier[i]['lvl' + k + '_value'], level: k, desc: this.allProjectHier[i]['lvl' + k + '_value'] + "-" + this.allProjectHier[i]['lvl' + k + '_cd'] })
        }

      }
    }
  }

  createUniqeProductHierCodeValue() {
    this.allProductHierCodeValue = [];
    for (let i = 0; i < this.allProductHier.length; i++) {
      for (let k = 1; k < 8; k++) {
        if (this.valueIsNotExit(this.allProductHierCodeValue, this.allProductHier[i]['lvl' + k + '_cd']) && this.allProductHier[i]['lvl' + k + '_cd'] != null) {
          this.allProductHierCodeValue.push({ code: this.allProductHier[i]['lvl' + k + '_cd'], value: this.allProductHier[i]['lvl' + k + '_value'], level: k, desc: this.allProductHier[i]['lvl' + k + '_value'] + "-" + this.allProductHier[i]['lvl' + k + '_cd'] })
        }

      }
    }
  }

  createUniqeActivityHierCodeValue() {
    this.allActivityHierCodeValue = [];
    for (let i = 0; i < this.allActivityHier.length; i++) {
      for (let k = 1; k < 8; k++) {
        if (this.valueIsNotExit(this.allActivityHierCodeValue, this.allActivityHier[i]['lvl' + k + '_cd']) && this.allActivityHier[i]['lvl' + k + '_cd'] != null) {
          this.allActivityHierCodeValue.push({ code: this.allActivityHier[i]['lvl' + k + '_cd'], value: this.allActivityHier[i]['lvl' + k + '_value'], level: k, desc: this.allActivityHier[i]['lvl' + k + '_value'] + "-" + this.allActivityHier[i]['lvl' + k + '_cd'] })
        }

      }
    }
  }

  async getBudgetHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'bud_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allBudgetHier = resp.data;
      await this.createUniqeBudgetHierCodeValue();
      for (let i = 0; i < this.allBudgetHier.length; i++) {

        this.hierCodeValue['budget'][this.allBudgetHier[i]['lvl1_cd']] = this.allBudgetHier[i]['lvl1_value'];
        this.hierCodeValue['budget'][this.allBudgetHier[i]['lvl2_cd']] = this.allBudgetHier[i]['lvl2_value'];
        this.hierCodeValue['budget'][this.allBudgetHier[i]['lvl3_cd']] = this.allBudgetHier[i]['lvl3_value'];
        this.hierCodeValue['budget'][this.allBudgetHier[i]['lvl4_cd']] = this.allBudgetHier[i]['lvl4_value'];
        this.hierCodeValue['budget'][this.allBudgetHier[i]['lvl5_cd']] = this.allBudgetHier[i]['lvl5_value'];
        this.hierCodeValue['budget'][this.allBudgetHier[i]['lvl6_cd']] = this.allBudgetHier[i]['lvl6_value'];
        this.hierCodeValue['budget'][this.allBudgetHier[i]['lvl7_cd']] = this.allBudgetHier[i]['lvl7_value'];

        this.allBudgetHier[i]['desc'] = this.allBudgetHier[i]['lvl1_value'] + "-->"
          + this.allBudgetHier[i]['lvl2_value'] + "-->" + this.allBudgetHier[i]['lvl3_value'] + "-->" + this.allBudgetHier[i]['lvl4_value'] + "-->"
          + this.allBudgetHier[i]['lvl5_value'] + "-->" + this.allBudgetHier[i]['lvl6_value'] + "-->" + this.allBudgetHier[i]['lvl7_value'];
      }
    } else {
      swal.fire("Error", "...Error while getting hierchy list",'error');
    }
  }

  async getProjectHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'proj_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProjectHier = resp.data;
      await this.createUniqeProjectHierCodeValue();


      for (let i = 0; i < this.allProjectHier.length; i++) {
        this.hierCodeValue['project'][this.allProjectHier[i]['lvl1_cd']] = this.allProjectHier[i]['lvl1_value'];
        this.hierCodeValue['project'][this.allProjectHier[i]['lvl2_cd']] = this.allProjectHier[i]['lvl2_value'];
        this.hierCodeValue['project'][this.allProjectHier[i]['lvl3_cd']] = this.allProjectHier[i]['lvl3_value'];
        this.hierCodeValue['project'][this.allProjectHier[i]['lvl4_cd']] = this.allProjectHier[i]['lvl4_value'];
        this.hierCodeValue['project'][this.allProjectHier[i]['lvl5_cd']] = this.allProjectHier[i]['lvl5_value'];
        this.hierCodeValue['project'][this.allProjectHier[i]['lvl6_cd']] = this.allProjectHier[i]['lvl6_value'];
        this.hierCodeValue['project'][this.allProjectHier[i]['lvl7_cd']] = this.allProjectHier[i]['lvl7_value'];

        this.allProjectHier[i]['desc'] = this.allProjectHier[i]['lvl1_value'] + "-->"
          + this.allProjectHier[i]['lvl2_value'] + "-->" + this.allProjectHier[i]['lvl3_value'] + "-->" + this.allProjectHier[i]['lvl4_value'] + "-->"
          + this.allProjectHier[i]['lvl5_value'] + "-->" + this.allProjectHier[i]['lvl6_value'] + "-->" + this.allProjectHier[i]['lvl7_value'];
      }

    } else {
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
      await this.createUniqeProductHierCodeValue();

      for (let i = 0; i < this.allProductHier.length; i++) {
        this.hierCodeValue['product'][this.allProductHier[i]['lvl1_cd']] = this.allProductHier[i]['lvl1_value']
        this.hierCodeValue['product'][this.allProductHier[i]['lvl2_cd']] = this.allProductHier[i]['lvl2_value']
        this.hierCodeValue['product'][this.allProductHier[i]['lvl3_cd']] = this.allProductHier[i]['lvl3_value']
        this.hierCodeValue['product'][this.allProductHier[i]['lvl4_cd']] = this.allProductHier[i]['lvl4_value'];
        this.hierCodeValue['product'][this.allProductHier[i]['lvl5_cd']] = this.allProductHier[i]['lvl5_value'];
        this.hierCodeValue['product'][this.allProductHier[i]['lvl6_cd']] = this.allProductHier[i]['lvl6_value'];
        this.hierCodeValue['product'][this.allProductHier[i]['lvl7_cd']] = this.allProductHier[i]['lvl7_value'];


        this.allProductHier[i]['desc'] = this.allProductHier[i]['lvl1_value'] + "-->"
          + this.allProductHier[i]['lvl2_value'] + "-->" + this.allProductHier[i]['lvl3_value'] + "-->" + this.allProductHier[i]['lvl4_value'] + "-->"
          + this.allProductHier[i]['lvl5_value'] + "-->" + this.allProductHier[i]['lvl6_value'] + "-->" + this.allProductHier[i]['lvl7_value'];
      }
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
      await this.createUniqeActivityHierCodeValue();


      for (let i = 0; i < this.allActivityHier.length; i++) {
        this.hierCodeValue['act'][this.allActivityHier[i]['lvl1_cd']] = this.allActivityHier[i]['lvl1_value'];
        this.hierCodeValue['act'][this.allActivityHier[i]['lvl2_cd']] = this.allActivityHier[i]['lvl2_value'];
        this.hierCodeValue['act'][this.allActivityHier[i]['lvl3_cd']] = this.allActivityHier[i]['lvl3_value'];
        this.hierCodeValue['act'][this.allActivityHier[i]['lvl4_cd']] = this.allActivityHier[i]['lvl4_value'];
        this.hierCodeValue['act'][this.allActivityHier[i]['lvl5_cd']] = this.allActivityHier[i]['lvl5_value'];
        this.hierCodeValue['act'][this.allActivityHier[i]['lvl6_cd']] = this.allActivityHier[i]['lvl6_value'];
        this.hierCodeValue['act'][this.allActivityHier[i]['lvl7_cd']] = this.allActivityHier[i]['lvl7_value'];

        this.allActivityHier[i]['desc'] = this.allActivityHier[i]['lvl1_value'] + "-->"
          + this.allActivityHier[i]['lvl2_value'] + "-->" + this.allActivityHier[i]['lvl3_value'] + "-->" + this.allActivityHier[i]['lvl4_value'] + "-->"
          + this.allActivityHier[i]['lvl5_value'] + "-->" + this.allActivityHier[i]['lvl6_value'] + "-->" + this.allActivityHier[i]['lvl7_value'];
      }

    } else {
      swal.fire("Error", "...Error while getting hierchy list",'error');
    }
  }

  async  saveBudget() {
    //add level
    for (let i = 0; i < this.allBudgetHierCodeValue.length; i++) {
      if (this.allBudgetHierCodeValue[i]['code'] == this.budgetObject['bud_cd']) {
        this.budgetObject['bud_level'] = this.allBudgetHierCodeValue[i]['level'];
        break;
      }
    }

    for (let i = 0; i < this.allProjectHierCodeValue.length; i++) {
      if (this.allProjectHierCodeValue[i]['code'] == this.budgetObject['proj_cd']) {
        this.budgetObject['proj_level'] = this.allProjectHierCodeValue[i]['level'];
        break;
      }
    }

    for (let i = 0; i < this.allProductHierCodeValue.length; i++) {
      if (this.allProductHierCodeValue[i]['code'] == this.budgetObject['prod_cd']) {
        this.budgetObject['prod_level'] = this.allProductHierCodeValue[i]['level'];
        break;
      }
    }

    for (let i = 0; i < this.allActivityHierCodeValue.length; i++) {
      if (this.allActivityHierCodeValue[i]['code'] == this.budgetObject['act_cd']) {
        this.budgetObject['act_level'] = this.allActivityHierCodeValue[i]['level'];
        break;
      }
    }


    //add hier


    this.budgetObject['bud_hier'] = [];
    for (let i = 0; i < this.allBudgetHier.length; i++) {
      if (this.budgetObject['bud_cd'] == this.allBudgetHier[i]['lvl' + this.budgetObject['bud_level'] + '_cd']) {
        this.budgetObject['bud_hier'].push(this.allBudgetHier[i]);
      }
    }
    this.budgetObject['prod_hier'] = [];
    for (let i = 0; i < this.allProductHier.length; i++) {
      if (this.budgetObject['prod_cd'] == this.allProductHier[i]['lvl' + this.budgetObject['prod_level'] + '_cd']) {
        this.budgetObject['prod_hier'].push(this.allProductHier[i]);
      }
    }
    this.budgetObject['proj_hier'] = [];
    for (let i = 0; i < this.allProjectHier.length; i++) {
      if (this.budgetObject['proj_cd'] == this.allProjectHier[i]['lvl' + this.budgetObject['proj_level'] + '_cd']) {
        this.budgetObject['proj_hier'].push(this.allProjectHier[i]);
      }
    }
    this.budgetObject['act_hier'] = [];
    for (let i = 0; i < this.allActivityHier.length; i++) {
      if (this.budgetObject['act_cd'] == this.allActivityHier[i]['lvl' + this.budgetObject['act_level'] + '_cd']) {
        this.budgetObject['act_hier'].push(this.allActivityHier[i]);
      }
    }

    this.budgetObject['status'] = 'ACTIVE';
    this.budgetObject['fin_year'] = this.fin_year;
    this.budgetObject['b_acct_id'] = this.b_acct_id;
    this.budgetObject['create_user_id'] = this.erpUser.user_id;

    if (this.validation()) {
      this.budgetObject['flag'] = 'insert';
      this.submitBudget();


    } else {
      this.budgetObject['flag'] = 'insert_and_update';
      swal.fire({
        title: 'Are you sure For Budget Version Update? Repeated Value-:::' + this.repeatedValue,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Update it!'
      }).then((result) => {
        if (result.value) {
          this.submitBudget();
        }
      })
    }




  }

  async submitBudget() {
    this.spinner.show();
    var resp = await this.budgetService.createBudgetInfo(this.budgetObject);
    if (resp['error'] == false) {
      await this.getBudget();
      await this.allAllocation();
      this.spinner.hide();

      if (this.budgetObject['flag'] == 'insert_and_update') {
        swal.fire("Success", "...Added Updated Version Successfully!",'success');
      } else {
        swal.fire("Success", "...Added Successfully!",'success');
      }

      this.budgetObject = {};
      this.budgetArrayObj = { project: [], product: [], budget: [], act: [] };
    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while adding Budget",'error');
    }
  }

  async allAllocation() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp1 = await this.budgetService.getAllAllocation(JSON.stringify(obj));
    if (resp1['error'] == false) {
      this.allTypeBudgetInfo = resp1.data;
      this.allActiveAllocation = [];

      for (let i = 0; i < this.allTypeBudgetInfo.length; i++) {

        this.allTypeBudgetInfo[i]['desc'] = this.hierCodeValue['budget'][this.allTypeBudgetInfo[i]['bud_cd']] + "-->"
          + this.hierCodeValue['project'][this.allTypeBudgetInfo[i]['proj_cd']] + "-->"
          + this.hierCodeValue['product'][this.allTypeBudgetInfo[i]['prod_cd']] + "-->"
          + this.hierCodeValue['act'][this.allTypeBudgetInfo[i]['act_cd']] + "-->"
          + this.allTypeBudgetInfo[i]['amount'];


        if (this.allTypeBudgetInfo[i]['status'] == 'ACTIVE') {
          this.allActiveAllocation.push(this.allTypeBudgetInfo[i]);
        }
      }
    } else {
    }
  }

  ChangeBudgetOnAllocate() {
    this.spinner.show();
    for (let i = 0; i < this.allTypeBudgetInfo.length; i++) {
      if (this.allocatObject['allocation_id'] == this.allTypeBudgetInfo[i]['allocation_id']) {
        this.allocated_amount = this.allTypeBudgetInfo[i]['amount']
        this.allocationArrayObj = { project: [], product: [], budget: [], act: [] };



        for (let j = 0; j < this.allProjectHier.length; j++) {

          if (this.allTypeBudgetInfo[i]['proj_cd'] == this.allProjectHier[j]['lvl1_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl2_cd']) && this.allProjectHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl2_cd'], value: this.allProjectHier[j]['lvl2_value'], level: 2, desc: this.allProjectHier[j]['lvl2_value'] + "-" + this.allProjectHier[j]['lvl2_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl1_cd']) && this.allProjectHier[j]['lvl1_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl1_cd'], value: this.allProjectHier[j]['lvl1_value'], level: 1, desc: this.allProjectHier[j]['lvl1_value'] + "-" + this.allProjectHier[j]['lvl1_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['proj_cd'] == this.allProjectHier[j]['lvl2_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl3_cd']) && this.allProjectHier[j]['lvl3_cd'] != null) {

              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl3_cd'], value: this.allProjectHier[j]['lvl3_value'], level: 3, desc: this.allProjectHier[j]['lvl3_value'] + "-" + this.allProjectHier[j]['lvl3_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl2_cd']) && this.allProjectHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl2_cd'], value: this.allProjectHier[j]['lvl2_value'], level: 2, desc: this.allProjectHier[j]['lvl2_value'] + "-" + this.allProjectHier[j]['lvl2_cd'] })
            }

          }
          if (this.allTypeBudgetInfo[i]['proj_cd'] == this.allProjectHier[j]['lvl3_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl4_cd']) && this.allProjectHier[j]['lvl4_cd'] != null) {

              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl4_cd'], value: this.allProjectHier[j]['lvl4_value'], level: 4, desc: this.allProjectHier[j]['lvl4_value'] + "-" + this.allProjectHier[j]['lvl4_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl3_cd']) && this.allProjectHier[j]['lvl3_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl3_cd'], value: this.allProjectHier[j]['lvl3_value'], level: 3, desc: this.allProjectHier[j]['lvl3_value'] + "-" + this.allProjectHier[j]['lvl3_cd'] })
            }
          }

          if (this.allTypeBudgetInfo[i]['proj_cd'] == this.allProjectHier[j]['lvl4_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl5_cd']) && this.allProjectHier[j]['lvl5_cd'] != null) {

              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl5_cd'], value: this.allProjectHier[j]['lvl5_value'], level: 5, desc: this.allProjectHier[j]['lvl5_value'] + "-" + this.allProjectHier[j]['lvl5_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl4_cd']) && this.allProjectHier[j]['lvl4_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl4_cd'], value: this.allProjectHier[j]['lvl4_value'], level: 4, desc: this.allProjectHier[j]['lvl4_value'] + "-" + this.allProjectHier[j]['lvl4_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['proj_cd'] == this.allProjectHier[j]['lvl5_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl6_cd']) && this.allProjectHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl6_cd'], value: this.allProjectHier[j]['lvl6_value'], level: 6, desc: this.allProjectHier[j]['lvl6_value'] + "-" + this.allProjectHier[j]['lvl6_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl5_cd']) && this.allProjectHier[j]['lvl5_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl5_cd'], value: this.allProjectHier[j]['lvl5_value'], level: 5, desc: this.allProjectHier[j]['lvl5_value'] + "-" + this.allProjectHier[j]['lvl5_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['proj_cd'] == this.allProjectHier[j]['lvl6_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl7_cd']) && this.allProjectHier[j]['lvl7_cd'] != null) {

              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl7_cd'], value: this.allProjectHier[j]['lvl7_value'], level: 7, desc: this.allProjectHier[j]['lvl7_value'] + "-" + this.allProjectHier[j]['lvl7_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl6_cd']) && this.allProjectHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl6_cd'], value: this.allProjectHier[j]['lvl6_value'], level: 6, desc: this.allProjectHier[j]['lvl6_value'] + "-" + this.allProjectHier[j]['lvl6_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['proj_cd'] == this.allProjectHier[j]['lvl7_cd']) {

            if (this.valueIsNotExit(this.allocationArrayObj['project'], this.allProjectHier[j]['lvl7_cd']) && this.allProjectHier[j]['lvl7_cd'] != null) {
              this.allocationArrayObj['project'].push({ code: this.allProjectHier[j]['lvl7_cd'], value: this.allProjectHier[j]['lvl7_value'], level: 7, desc: this.allProjectHier[j]['lvl7_value'] + "-" + this.allProjectHier[j]['lvl7_cd'] })
            }
          }
        }

        for (let j = 0; j < this.allProductHier.length; j++) {

          if (this.allTypeBudgetInfo[i]['prod_cd'] == this.allProductHier[j]['lvl1_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl2_cd']) && this.allProductHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl2_cd'], value: this.allProductHier[j]['lvl2_value'], level: 2, desc: this.allProductHier[j]['lvl2_value'] + "-" + this.allProductHier[j]['lvl2_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl1_cd']) && this.allProductHier[j]['lvl1_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl1_cd'], value: this.allProductHier[j]['lvl1_value'], level: 1, desc: this.allProductHier[j]['lvl1_value'] + "-" + this.allProductHier[j]['lvl1_cd'] })
            }
          }



          if (this.allTypeBudgetInfo[i]['prod_cd'] == this.allProductHier[j]['lvl2_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl3_cd']) && this.allProductHier[j]['lvl3_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl3_cd'], value: this.allProductHier[j]['lvl3_value'], level: 3, desc: this.allProductHier[j]['lvl3_value'] + "-" + this.allProductHier[j]['lvl3_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl2_cd']) && this.allProductHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl2_cd'], value: this.allProductHier[j]['lvl2_value'], level: 2, desc: this.allProductHier[j]['lvl2_value'] + "-" + this.allProductHier[j]['lvl2_cd'] })
            }

          }
          if (this.allTypeBudgetInfo[i]['prod_cd'] == this.allProductHier[j]['lvl3_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl4_cd']) && this.allProductHier[j]['lvl4_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl4_cd'], value: this.allProductHier[j]['lvl4_value'], level: 4, desc: this.allProductHier[j]['lvl4_value'] + "-" + this.allProductHier[j]['lvl4_cd'] })
            }
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl3_cd']) && this.allProductHier[j]['lvl3_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl3_cd'], value: this.allProductHier[j]['lvl3_value'], level: 3, desc: this.allProductHier[j]['lvl3_value'] + "-" + this.allProductHier[j]['lvl3_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['prod_cd'] == this.allProductHier[j]['lvl4_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl5_cd']) && this.allProductHier[j]['lvl5_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl5_cd'], value: this.allProductHier[j]['lvl5_value'], level: 5, desc: this.allProductHier[j]['lvl5_value'] + "-" + this.allProductHier[j]['lvl5_cd'] })
            }
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl4_cd']) && this.allProductHier[j]['lvl4_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl4_cd'], value: this.allProductHier[j]['lvl4_value'], level: 4, desc: this.allProductHier[j]['lvl4_value'] + "-" + this.allProductHier[j]['lvl4_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['prod_cd'] == this.allProductHier[j]['lvl5_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl6_cd']) && this.allProductHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl6_cd'], value: this.allProductHier[j]['lvl6_value'], level: 6, desc: this.allProductHier[j]['lvl6_value'] + "-" + this.allProductHier[j]['lvl6_cd'] })
            }
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl5_cd']) && this.allProductHier[j]['lvl5_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl5_cd'], value: this.allProductHier[j]['lvl5_value'], level: 5, desc: this.allProductHier[j]['lvl5_value'] + "-" + this.allProductHier[j]['lvl5_cd'] })
            }
          }



          if (this.allTypeBudgetInfo[i]['prod_cd'] == this.allProductHier[j]['lvl6_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl7_cd']) && this.allProductHier[j]['lvl7_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl7_cd'], value: this.allProductHier[j]['lvl7_value'], level: 7, desc: this.allProductHier[j]['lvl7_value'] + "-" + this.allProductHier[j]['lvl7_cd'] })
            }
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl6_cd']) && this.allProductHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl6_cd'], value: this.allProductHier[j]['lvl6_value'], level: 6, desc: this.allProductHier[j]['lvl6_value'] + "-" + this.allProductHier[j]['lvl6_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['prod_cd'] == this.allProductHier[j]['lvl7_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['product'], this.allProductHier[j]['lvl7_cd']) && this.allProductHier[j]['lvl7_cd'] != null) {
              this.allocationArrayObj['product'].push({ code: this.allProductHier[j]['lvl7_cd'], value: this.allProductHier[j]['lvl7_value'], level: 7, desc: this.allProductHier[j]['lvl7_value'] + "-" + this.allProductHier[j]['lvl7_cd'] })
            }
          }
        }

        for (let j = 0; j < this.allActivityHier.length; j++) {

          if (this.allTypeBudgetInfo[i]['act_cd'] == this.allActivityHier[j]['lvl1_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl2_cd']) && this.allActivityHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl2_cd'], value: this.allActivityHier[j]['lvl2_value'], level: 2, desc: this.allActivityHier[j]['lvl2_value'] + "-" + this.allActivityHier[j]['lvl2_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl1_cd']) && this.allActivityHier[j]['lvl1_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl1_cd'], value: this.allActivityHier[j]['lvl1_value'], level: 1, desc: this.allActivityHier[j]['lvl1_value'] + "-" + this.allActivityHier[j]['lvl1_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['act_cd'] == this.allActivityHier[j]['lvl2_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl3_cd']) && this.allActivityHier[j]['lvl3_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl3_cd'], value: this.allActivityHier[j]['lvl3_value'], level: 3, desc: this.allActivityHier[j]['lvl3_value'] + "-" + this.allActivityHier[j]['lvl3_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl2_cd']) && this.allActivityHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl2_cd'], value: this.allActivityHier[j]['lvl2_value'], level: 2, desc: this.allActivityHier[j]['lvl2_value'] + "-" + this.allActivityHier[j]['lvl2_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['act_cd'] == this.allActivityHier[j]['lvl3_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl4_cd']) && this.allActivityHier[j]['lvl4_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl4_cd'], value: this.allActivityHier[j]['lvl4_value'], level: 4, desc: this.allActivityHier[j]['lvl4_value'] + "-" + this.allActivityHier[j]['lvl4_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl3_cd']) && this.allActivityHier[j]['lvl3_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl3_cd'], value: this.allActivityHier[j]['lvl3_value'], level: 3, desc: this.allActivityHier[j]['lvl3_value'] + "-" + this.allActivityHier[j]['lvl3_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['act_cd'] == this.allActivityHier[j]['lvl4_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl5_cd']) && this.allActivityHier[j]['lvl5_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl5_cd'], value: this.allActivityHier[j]['lvl5_value'], level: 5, desc: this.allActivityHier[j]['lvl5_value'] + "-" + this.allActivityHier[j]['lvl5_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl4_cd']) && this.allActivityHier[j]['lvl4_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl4_cd'], value: this.allActivityHier[j]['lvl4_value'], level: 4, desc: this.allActivityHier[j]['lvl4_value'] + "-" + this.allActivityHier[j]['lvl4_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['act_cd'] == this.allActivityHier[j]['lvl5_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl6_cd']) && this.allActivityHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl6_cd'], value: this.allActivityHier[j]['lvl6_value'], level: 6, desc: this.allActivityHier[j]['lvl6_value'] + "-" + this.allActivityHier[j]['lvl6_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl5_cd']) && this.allActivityHier[j]['lvl5_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl5_cd'], value: this.allActivityHier[j]['lvl5_value'], level: 5, desc: this.allActivityHier[j]['lvl5_value'] + "-" + this.allActivityHier[j]['lvl5_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['act_cd'] == this.allActivityHier[j]['lvl6_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl7_cd']) && this.allActivityHier[j]['lvl7_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl7_cd'], value: this.allActivityHier[j]['lvl7_value'], level: 7, desc: this.allActivityHier[j]['lvl7_value'] + "-" + this.allActivityHier[j]['lvl7_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl6_cd']) && this.allActivityHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl6_cd'], value: this.allActivityHier[j]['lvl6_value'], level: 6, desc: this.allActivityHier[j]['lvl6_value'] + "-" + this.allActivityHier[j]['lvl6_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['act_cd'] == this.allActivityHier[j]['lvl7_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['act'], this.allActivityHier[j]['lvl7_cd']) && this.allActivityHier[j]['lvl7_cd'] != null) {
              this.allocationArrayObj['act'].push({ code: this.allActivityHier[j]['lvl7_cd'], value: this.allActivityHier[j]['lvl7_value'], level: 7, desc: this.allActivityHier[j]['lvl7_value'] + "-" + this.allActivityHier[j]['lvl7_cd'] })
            }
          }
        }

        for (let j = 0; j < this.allBudgetHier.length; j++) {

          if (this.allTypeBudgetInfo[i]['bud_cd'] == this.allBudgetHier[j]['lvl1_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl2_cd']) && this.allBudgetHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl2_cd'], value: this.allBudgetHier[j]['lvl2_value'], level: 2, desc: this.allBudgetHier[j]['lvl2_value'] + "-" + this.allBudgetHier[j]['lvl2_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl1_cd']) && this.allBudgetHier[j]['lvl1_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl1_cd'], value: this.allBudgetHier[j]['lvl1_value'], level: 1, desc: this.allBudgetHier[j]['lvl1_value'] + "-" + this.allBudgetHier[j]['lvl1_cd'] })
            }
          }



          if (this.allTypeBudgetInfo[i]['bud_cd'] == this.allBudgetHier[j]['lvl2_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl3_cd']) && this.allBudgetHier[j]['lvl3_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl3_cd'], value: this.allBudgetHier[j]['lvl3_value'], level: 3, desc: this.allBudgetHier[j]['lvl3_value'] + "-" + this.allBudgetHier[j]['lvl3_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl2_cd']) && this.allBudgetHier[j]['lvl2_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl2_cd'], value: this.allBudgetHier[j]['lvl2_value'], level: 2, desc: this.allBudgetHier[j]['lvl2_value'] + "-" + this.allBudgetHier[j]['lvl2_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['bud_cd'] == this.allBudgetHier[j]['lvl3_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl4_cd']) && this.allBudgetHier[j]['lvl4_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl4_cd'], value: this.allBudgetHier[j]['lvl4_value'], level: 4, desc: this.allBudgetHier[j]['lvl4_value'] + "-" + this.allBudgetHier[j]['lvl4_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl3_cd']) && this.allBudgetHier[j]['lvl3_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl3_cd'], value: this.allBudgetHier[j]['lvl3_value'], level: 3, desc: this.allBudgetHier[j]['lvl3_value'] + "-" + this.allBudgetHier[j]['lvl3_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['bud_cd'] == this.allBudgetHier[j]['lvl4_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl5_cd']) && this.allBudgetHier[j]['lvl5_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl5_cd'], value: this.allBudgetHier[j]['lvl5_value'], level: 5, desc: this.allBudgetHier[j]['lvl5_value'] + "-" + this.allBudgetHier[j]['lvl5_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl4_cd']) && this.allBudgetHier[j]['lvl4_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl4_cd'], value: this.allBudgetHier[j]['lvl4_value'], level: 4, desc: this.allBudgetHier[j]['lvl4_value'] + "-" + this.allBudgetHier[j]['lvl4_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['bud_cd'] == this.allBudgetHier[j]['lvl5_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl6_cd']) && this.allBudgetHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl6_cd'], value: this.allBudgetHier[j]['lvl6_value'], level: 6, desc: this.allBudgetHier[j]['lvl6_value'] + "-" + this.allBudgetHier[j]['lvl6_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl5_cd']) && this.allBudgetHier[j]['lvl5_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl5_cd'], value: this.allBudgetHier[j]['lvl5_value'], level: 5, desc: this.allBudgetHier[j]['lvl5_value'] + "-" + this.allBudgetHier[j]['lvl5_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['bud_cd'] == this.allBudgetHier[j]['lvl6_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl7_cd']) && this.allBudgetHier[j]['lvl7_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl7_cd'], value: this.allBudgetHier[j]['lvl7_value'], level: 7, desc: this.allBudgetHier[j]['lvl7_value'] + "-" + this.allBudgetHier[j]['lvl7_cd'] })
            }

            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl6_cd']) && this.allBudgetHier[j]['lvl6_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl6_cd'], value: this.allBudgetHier[j]['lvl6_value'], level: 6, desc: this.allBudgetHier[j]['lvl6_value'] + "-" + this.allBudgetHier[j]['lvl6_cd'] })
            }
          }


          if (this.allTypeBudgetInfo[i]['bud_cd'] == this.allBudgetHier[j]['lvl7_cd']) {
            if (this.valueIsNotExit(this.allocationArrayObj['budget'], this.allBudgetHier[j]['lvl7_cd']) && this.allBudgetHier[j]['lvl7_cd'] != null) {
              this.allocationArrayObj['budget'].push({ code: this.allBudgetHier[j]['lvl7_cd'], value: this.allBudgetHier[j]['lvl7_value'], level: 7, desc: this.allBudgetHier[j]['lvl7_value'] + "-" + this.allBudgetHier[j]['lvl7_cd'] })
            }
          }
        }
      }
    }

    this.spinner.hide();

  }

  async saveAllocate() {

    var obj = new Object();
    var prevObj = new Object();
    for (let i = 0; i < this.allTypeBudgetInfo.length; i++) {
      if (this.allocatObject['allocation_id'] == this.allTypeBudgetInfo[i]['allocation_id']) {
        prevObj = Object.assign({}, this.allTypeBudgetInfo[i])
        obj['parent_obj'] = this.allTypeBudgetInfo[i];
      }
    }

    //add level

    for (let i = 0; i < this.allocationArrayObj['budget'].length; i++) {
      if (this.allocationArrayObj['budget'][i]['code'] == this.allocatObject['bud_cd']) {
        this.allocatObject['bud_level'] = this.allocationArrayObj['budget'][i]['level'];
        break;
      }
    }

    for (let i = 0; i < this.allocationArrayObj['project'].length; i++) {
      if (this.allocationArrayObj['project'][i]['code'] == this.allocatObject['proj_cd']) {
        this.allocatObject['proj_level'] = this.allocationArrayObj['project'][i]['level'];
        break;
      }
    }

    for (let i = 0; i < this.allocationArrayObj['product'].length; i++) {
      if (this.allocationArrayObj['product'][i]['code'] == this.allocatObject['prod_cd']) {
        this.allocatObject['prod_level'] = this.allocationArrayObj['product'][i]['level'];
        break;
      }
    }

    for (let i = 0; i < this.allocationArrayObj['act'].length; i++) {
      if (this.allocationArrayObj['act'][i]['code'] == this.allocatObject['act_cd']) {
        this.allocatObject['act_level'] = this.allocationArrayObj['act'][i]['level'];
        break;
      }
    }


    this.allocatObject['status'] = 'ACTIVE';
    obj['allocation_obj'] = this.allocatObject;
    obj['create_user_id'] = this.erpUser.user_id;
    obj['b_acct_id'] = this.b_acct_id;
    obj['fin_year'] = this.fin_year;
    if (prevObj['amount'] >= this.allocatObject['amount']) {
      var resp = await this.budgetService.createAllocation(obj);
      if (resp['error'] == false) {
        this.allocatObject = {};
        this.allAllocation();
        this.spinner.hide();

        swal.fire("Success", "... Allocation Added Successfully!",'success');
      } else {
        this.spinner.hide();

        swal.fire("Error", "...Error while adding Allocate",'error');
      }
    } else {
      this.spinner.hide();

      swal.fire("Error", "...Allocation Amount more than Budget Amount!",'error');
    }

  }

  async inactive(element, i) {
    this.allocation_child_amount = 0;
    this.allocation_parent_amount = 0;
    this.allocation_previews_amount = 0;
    this.childAllocatioId = []
    this.childAmount([element['allocation_id']]);
    this.parentAmount(element['parent_allocation_id']);
    this.allocation_previews_amount = element['amount'];

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['child_amount'] = this.allocation_child_amount;
    obj['amount'] = this.allocation_previews_amount;
    obj['parent_amount'] = this.allocation_parent_amount;
    obj['allocation_id'] = element['allocation_id'];
    obj['parent_allocation_id'] = element['parent_allocation_id'];
    obj['update_user_id'] = this.erpUser.user_id;
    obj['child_arr'] = this.childAllocatioId;
    var resp = await this.budgetService.AllocationInactive(obj);
    if (resp['error'] == false) {
      await this.allAllocation();
      await this.allocationList();
      swal.fire("Success", "...  Allocation INACTIVE!!",'success');
    } else {
      swal.fire("Error", "... Error While Allocation INACTIVE!!",'error');
    }
  }

  open_update(element, i) {
    this.allocatUpdateObject = Object.assign({}, element);
    this.allocation_child_amount = 0;
    this.allocation_parent_amount = 0;
    this.allocation_previews_amount = 0;
    this.childAmount([this.allocatUpdateObject['allocation_id']]);
    this.parentAmount(this.allocatUpdateObject['parent_allocation_id']);
    this.allocation_previews_amount = this.allocatUpdateObject['amount'];
    this.total = this.allocation_child_amount + this.allocation_parent_amount + this.allocation_previews_amount;

    $('.nav-tabs a[href="#tab-5"]').tab('show');

  }

  async updateAllocate() {

    if (this.allocation_child_amount <= parseInt(this.allocatUpdateObject['amount'])) {
      if (parseInt(this.allocatUpdateObject['amount']) <= this.total) {


        var obj = new Object();
        obj['b_acct_id'] = this.b_acct_id;
        obj['child_amount'] = this.allocation_child_amount;
        obj['past_amount'] = this.allocation_previews_amount;
        obj['parent_amount'] = this.allocation_parent_amount;
        obj['amount'] = this.allocatUpdateObject['amount'];
        obj['allocation_id'] = this.allocatUpdateObject['allocation_id'];
        obj['parent_allocation_id'] = this.allocatUpdateObject['parent_allocation_id'];
        obj['update_user_id'] = this.erpUser.user_id;
        var resp = await this.budgetService.updateAllocationAmount(obj);
        if (resp['error'] == false) {
          await this.allAllocation();
          swal.fire("Success", "...  Amount Updated!",'success');
        }
      } else {
        swal.fire("Error", "... Enter Amount is more than Max Amount!",'error');
      }
    } else {
      swal.fire("Error", "... Enter Amount is less than Min Amount!",'error');

    }
  }

  childAmount(id_arr) {
    var amount = 0;
    var temp_arr = [];
    for (let i = 0; i < this.allActiveAllocation.length; i++) {
      if (id_arr.includes(this.allActiveAllocation[i]['parent_allocation_id']))
        temp_arr.push(this.allActiveAllocation[i]);
    }
    var parent_id_temp = []
    if (temp_arr.length > 0) {
      for (let i = 0; i < temp_arr.length; i++) {
        parent_id_temp.push(temp_arr[i]['allocation_id']);
        this.childAllocatioId.push(temp_arr[i]['allocation_id']);
        amount += temp_arr[i]['amount']
      }

      this.allocation_child_amount = this.allocation_child_amount + amount

      this.childAmount(parent_id_temp)
    }
  }

  parentAmount(parent_allocation_id) {
    for (let i = 0; i < this.allActiveAllocation.length; i++) {
      if (parent_allocation_id == this.allActiveAllocation[i]['allocation_id']) {
        this.allocation_parent_amount = this.allActiveAllocation[i]['amount']
      }
    }
  }

  valueIsNotExit(array, code) {
    var flag = true;
    for (let i = 0; i < array.length; i++) {
      if (array[i]['code'] == code) {
        flag = false;
      }
    }
    return flag;
  }

  validation() {
    var flag = true;
    this.repeatedValue = '';


    if (this.validationObj['budObj'][this.budgetObject['bud_cd']] != undefined) {
      flag = false;
      this.repeatedValue = this.repeatedValue + " --> " + this.hierCodeValue['budget'][this.validationObj['budObj'][this.budgetObject['bud_cd']]] + " - " + this.validationObj['budObj'][this.budgetObject['bud_cd']];

    }
    else if (this.validationObj['projObj'][this.budgetObject['proj_cd']] != undefined) {
      flag = false;
      this.repeatedValue = this.repeatedValue + " --> " + this.hierCodeValue['project'][this.validationObj['projObj'][this.budgetObject['proj_cd']]] + " - " + this.validationObj['projObj'][this.budgetObject['proj_cd']];
    }

    else if (this.validationObj['prodObj'][this.budgetObject['prod_cd']] != undefined) {
      flag = false;
      this.repeatedValue = this.repeatedValue + " --> " + this.hierCodeValue['product'][this.validationObj['prodObj'][this.budgetObject['prod_cd']]] + " - " + this.validationObj['prodObj'][this.budgetObject['prod_cd']];

    }
    else if (this.validationObj['actObj'][this.budgetObject['act_cd']] != undefined) {
      flag = false;
      this.repeatedValue = this.repeatedValue + " --> " + this.hierCodeValue['act'][this.validationObj['actObj'][this.budgetObject['act_cd']]] + " - " + this.validationObj['actObj'][this.budgetObject['act_cd']];

    }
    return flag;
  }

  refresh() {
    this.allocatObject = {};
    this.allocatUpdateObject = {};
    this.budgetObject = {};
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter1(filterValue: string) {
    this.datasource1.filter = filterValue.trim().toLowerCase();
  }

  async getActiveFinYear() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.budgetService.getActiveFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      if (resp.data.length == 0) {
        swal.fire("Warning", "..Active Financial Year Not set!",'warning');
      } else {
        this.fin_year = resp.data[0].fin_year;
      }
    } else {
      swal.fire("Error", "..Error while getting active  fin year!");
    }
  }


  async getAllFinYear() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.budgetService.getAllFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allFinYear = resp.data;
    } else {
      swal.fire("Error", "..Error while getting all  fin year!",'error');
    }
  }




}
