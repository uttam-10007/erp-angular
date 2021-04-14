import swal from 'sweetalert2';
import { Component, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../_services/script-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MainService } from '../service/main.service';
import { BatchItemService } from '../service/batch-item.service';
import { BaseItemService } from '../service/base-item.service';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { element } from 'protractor';
import { HierarchyService } from '../../accounts/service/hierarchy.service';
import { EstimateService } from '../service/estimate.service';
import { SettingService } from '../service/setting.service';
declare var $: any
@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})
export class EstimateComponent implements OnInit {

  constructor(private settingService:SettingService,private EstimateService:EstimateService,private baseItemService: BaseItemService,private hierarchyService:HierarchyService, private batchItemService: BatchItemService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  Obj = { dataArr: [],contractor_prof:0,overhead:0,output_capacity_quantity:1 };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['batch_item_id', 'batch_item_desc', 'batch_item_code', 'activity_code', 'output_capacity_unit', 'output_capacity_quantity',
    'costing_rate_unit','costing_rate_at_site', 'action'];
  datasource;
  allBaseItem = [];
  allEstimate = [];
  allProjectHier=[];
  allProductHier=[];
  allActivityHier=[];
  allBudgetHier=[];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllBudget();
    await this.getAllBaseItem();
    await this.getAllProject();
    await this.getAllProduct();
    await this.getAllActivity();
    await this.getAllEstimate()
    await this.getAllBatchItem()
    await this.getunit()
    await this.setData();

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
          this.Obj['bud_desc'] = this.allBudget[i]['desc'];
          this.Obj['bud_cd'] = this.allBudget[i]['code'];
          this.Obj['bud_lvl'] = this.allBudget[i]['level'];
        }
      }
    } else if (this.hier_type == 'activity') {
      for (let i = 0; i < this.allActivity.length; i++) {
        if (this.allActivity[i]['code'] == this.Chartobj['leaf_cd']) {
          this.Obj['act_desc'] = this.allActivity[i]['desc'];
          this.Obj['act_cd'] = this.allActivity[i]['code'];
          this.Obj['act_lvl'] = this.allActivity[i]['level'];
        }
      }
    } else if (this.hier_type == 'project') {
      for (let i = 0; i < this.allProject.length; i++) {
        if (this.allProject[i]['code'] == this.Chartobj['leaf_cd']) {
          this.Obj['proj_desc'] = this.allProject[i]['desc'];
          this.Obj['proj_cd'] = this.allProject[i]['code'];
          this.Obj['proj_lvl'] = this.allProject[i]['level'];
        }
      }
    } else if (this.hier_type == 'product') {
      for (let i = 0; i < this.allProduct.length; i++) {
        if (this.allProduct[i]['code'] == this.Chartobj['leaf_cd']) {
          this.Obj['prod_cd'] = this.allProduct[i]['code'];
          this.Obj['prod_desc'] = this.allProduct[i]['desc'];
          this.Obj['prod_lvl'] = this.allProduct[i]['level'];
        }
      }
    }

    $('#select').modal('hide');


  }
  changeProject() {
    for (let i = 0; i < this.allProject.length; i++) {
      if (this.Obj['proj_cd'] == this.allProject[i]['code']) {
        this.Obj['proj_desc'] = this.allProject[i]['desc'];
        this.Obj['proj_lvl'] = this.allProject[i]['level'];
      }
    }
  }

  changeProduct() {
    for (let i = 0; i < this.allProduct.length; i++) {
      if (this.Obj['prod_cd'] == this.allProduct[i]['code']) {
        this.Obj['prod_desc'] = this.allProduct[i]['desc'];
        this.Obj['prod_lvl'] = this.allProduct[i]['level'];
      }
    }
  }

  changeActivity() {
    for (let i = 0; i < this.allActivity.length; i++) {
      if (this.Obj['act_cd'] == this.allActivity[i]['code']) {
        this.Obj['act_desc'] = this.allActivity[i]['desc'];
        this.Obj['act_lvl'] = this.allActivity[i]['level'];
      }
    }
  }

  changeBudget() {
    for (let i = 0; i < this.allBudget.length; i++) {
      if (this.Obj['bud_cd'] == this.allBudget[i]['code']) {
        this.Obj['bud_desc'] = this.allBudget[i]['desc'];
        this.Obj['bud_lvl'] = this.allBudget[i]['level'];
      }
    }
  }
  async getAllBaseItem() {
    var resp = await this.baseItemService.getbaseitem(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBaseItem = []
      for (let j = 0; j < resp.data.length; j++) {
     
        var obj = Object()
        obj = resp.data[j]
        obj['desc'] = obj['base_item_desc']
        obj['item_id'] = obj['base_item_id'] +"-base"
        this.allBaseItem.push(obj)
        this.baseitemarr.push(obj)
      
    }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Base Item !','error');
    }
  }
  allBatchItem = []
  async getAllBatchItem() {
    var resp = await this.batchItemService.getbatchitem(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBatchItem = []
      for (let j = 0; j < resp.data.length; j++) {
      
        var obj = Object()
        obj = resp.data[j]
        obj['desc'] = obj['batch_item_desc']
        obj['item_id'] = obj['batch_item_id'] +"-batch"
        this.allBatchItem.push(obj)
        this.baseitemarr.push(obj)
      
    }
  
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Batch Item !','error');
    }
  }
  total_item_cost=0;
  addline() {
    this.baseitemarr = []
    this.Obj['dataArr'].push({ item_id: '', marked_rate: '', marked_rate_unit: '', estimated_consumption_quantity: '', estimated_consumption_quantiy_unit: '', calculated_cost: 0 })
  }
  deleteline(i) {
    this.baseitemarr = []
    this.Obj['dataArr'].splice(i, 1);
  }
  change(i) {

    this.Obj['dataArr'][i]['estimated_consumption_quantity'] = 1
    for (let j = 0; j < this.baseitemarr.length; j++) {
      

      if (this.baseitemarr[j]['item_id'] == this.Obj['dataArr'][i]['item_id']) {
        this.Obj['dataArr'][i]['marked_rate'] = this.baseitemarr[j]['costing_rate_at_site']
        this.Obj['dataArr'][i]['marked_rate_unit'] = this.baseitemarr[j]['costing_rate_unit']
      }
    }
   
     this.unitconversion(i)
     this.changeQty(i)
  }
  baseitemarr = []
  changecategory(i){
    this.baseitemarr = []
    for (let j = 0; j < this.allBaseItem.length; j++) {
      if (this.allBaseItem[j]['base_item_code'] == this.Obj['dataArr'][i]['item_category_code']) {
        
        this.baseitemarr.push(this.allBaseItem[j])
      }
    }
     for (let j = 0; j < this.allBatchItem.length; j++) {
      if (this.allBatchItem[j]['batch_item_code'] == this.Obj['dataArr'][i]['item_category_code']) {
        var obj = Object()
        obj = this.allBatchItem[j]
        
        this.baseitemarr.push(obj)
      }
    } 
  }
  allBudgetobj = {}
  async getAllBudget(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='bud_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allBudgetHier = resp.data;
      for(var i=0;i<resp.data.length;i++){
        
        for(let j=1;j<=7;j++){
          this.allBudgetobj[resp.data[i]['lvl'+j+"_cd"]] = resp.data[i]['lvl'+j+"_value"]
            
          }
      }
    } else {
    }
  }
  refresh() {
    this.baseitemarr = []
    this.Obj = { dataArr: [],contractor_prof:0,overhead:0,output_capacity_quantity:1 };
  }
  allunit = []
  async getunit(){
    
    var resp = await this.settingService.getunit(this.b_acct_id);
    if (resp['error'] == false) {
      this.allunit = resp.data;
      
      
      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all Units!",'error');

    }
  }
  unitconvert = []
  unitconversion(i){
    this.unitconvert = []
    var unit = this.Obj['dataArr'][i]['marked_rate_unit']
    var obj = Object()
    obj['from_unit'] = unit
    obj['to_unit'] = unit
    obj['amount'] = 1
    this.unitconvert.push(obj)
    for (let i = 0; i < this.allunit.length; i++) {
      if(unit == this.allunit[i]['from_unit']){
        var obj = Object()
        obj['from_unit'] = this.allunit[i]['from_unit']
        obj['to_unit'] = this.allunit[i]['to_unit']
        obj['amount'] = this.allunit[i]['amount']
        this.unitconvert.push(obj)


      }

    }
    if(this.Obj['dataArr'][i]['estimated_consumption_quantiy_unit'] == undefined || this.Obj['dataArr'][i]['estimated_consumption_quantiy_unit'] == ''){
    this.Obj['dataArr'][i]['estimated_consumption_quantiy_unit'] = unit
    }
  }
  allactobj = {}
  async getAllActivity(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='activity_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allActivityHier = resp.data;
      for(var i=0;i<resp.data.length;i++){
        
        for(let j=1;j<=7;j++){
          this.allactobj[resp.data[i]['lvl'+j+"_cd"]] = resp.data[i]['lvl'+j+"_value"]
            
          }
      }
    } else {
    }
  }
allprojobj = {}
  async getAllProject(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='proj_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProjectHier = resp.data;

      for(var i=0;i<this.allProjectHier.length;i++){
        for(let j=1;j<=7;j++){
        this.allprojobj[this.allProjectHier[i]['lvl'+j+"_cd"]] = this.allProjectHier[i]['lvl'+j+"_value"]
          
        }
        
      }
    } else {
    }
  }
  changeQty(j) {
    var amount = 1
    
    if(this.Obj['dataArr'][j]['estimated_consumption_quantiy_unit'] != undefined){
      var unit = this.Obj['dataArr'][j]['estimated_consumption_quantiy_unit']
    for (let i = 0; i < this.allunit.length; i++) {
      if(this.Obj['dataArr'][j]['estimated_consumption_quantiy_unit'] == this.allunit[i]['to_unit'] && this.Obj['dataArr'][j]['marked_rate_unit'] == this.allunit[i]['from_unit']){
        var amountunit = this.allunit[i]['amount']
       var arr = amountunit.split('/')
       if(arr.length == 2){
        var amt = arr[0]
        var amtunit = arr[1]
        amount = parseFloat(amt) / parseFloat(amtunit)
       }
       else{
         amount = this.allunit[i]['amount'].trim()
       }


      }
    }
    this.Obj['dataArr'][j]['estimated_consumption_quantiy_unit'] = unit
  }
  
    this.Obj['dataArr'][j]['calculated_cost'] = parseFloat((this.Obj['dataArr'][j]['estimated_consumption_quantity'] * this.Obj['dataArr'][j]['marked_rate']/ amount).toFixed(2));
   
  }
  check() {
    
    var total = 0;
    this.total_item_cost=0;
    for (let i = 0; i < this.Obj['dataArr'].length; i++) {
      total = total + this.Obj['dataArr'][i]['calculated_cost'];
    }
    this.Obj['est_amt'] = total
  }
  allprodobj = {}
  async getAllProduct(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='prod_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProductHier = resp.data;
      for(var i=0;i<resp.data.length;i++){
        
        for(let j=1;j<=7;j++){
          this.allprodobj[resp.data[i]['lvl'+j+"_cd"]] = resp.data[i]['lvl'+j+"_value"]
            
          }
      }
    } else {
    }
  }
  async getAllEstimate() {
    this.spinner.show()
    var resp = await this.EstimateService.getestimate(this.b_acct_id);
    if (resp['error'] == false) {
      this.allEstimate = resp.data;
      this.datasource = new MatTableDataSource(this.allEstimate);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Estimate !','error');
    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async open_update(element) {
  
    await this.getAllBatchItem();
    await this.getAllBaseItem();

    this.Obj = Object.assign({}, element);
    this.Obj['dataArr'] = JSON.parse(element['data']);
    await this.check();
    this.changeActivity()
this.changeBudget()
this.changeProduct()
this.changeProject()
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');
  }
  async submit() {
    this.spinner.show()
    /* if ((this.Obj['costing_rate_unit'] == undefined || this.Obj['costing_rate_unit'] == '') || (this.Obj['batch_item_code'] == undefined || this.Obj['batch_item_code'] == '')) {
      swal.fire('Error', 'Fill Required  Batch Item Fields!');
      return;
    } */
    await this.check();

    var data = JSON.stringify(this.Obj['dataArr']);
    this.Obj['data'] = data;
    this.Obj['create_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
     var resp = await this.EstimateService.insertestimate(this.Obj);
    if (resp['error'] == false) {
      await this.getAllEstimate();
      this.spinner.hide();
      swal.fire('Success', 'Estimate  Created Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while adding  Estimate!','error');
    } 
  }
  async update() {
    this.spinner.show()

    /* if ((this.Obj['costing_rate_unit'] == undefined || this.Obj['costing_rate_unit'] == '') || (this.Obj['batch_item_code'] == undefined || this.Obj['batch_item_code'] == '')) {
      swal.fire('Error', 'Fill Required  Base Item Fields!');
      return;
    } */
    
    await this.check();
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var data = JSON.stringify(this.Obj['dataArr']);
    this.Obj['data'] = data;
    var resp = await this.EstimateService.updateestimate(this.Obj);
    if (resp['error'] == false) {
      await this.getAllEstimate();
      this.spinner.hide();

      swal.fire('Success', 'Estimate Updated Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while updating  Estimate!','error');
    }
  }
  async delete(element) {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = [element['id']];
    var resp = await this.EstimateService.deleteestimate(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllEstimate();

      this.spinner.hide();
      swal.fire('Success', 'Estimate Deleted Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Deleting  Estimate !','error');
    }
  }
  async deleteAll() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    var id = [];
    for (let i = 0; i < this.allEstimate.length; i++) {
      id.push(this.allEstimate[i]['id']);
    }

    obj['id'] = id;
    var resp = await this.EstimateService.deleteestimate(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllEstimate();

      this.spinner.hide();
      swal.fire('Success', 'All Estimate  Deleted Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Deleting All Estimate !','error');
    }
  }
}
