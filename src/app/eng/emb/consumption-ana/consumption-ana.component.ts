import { Component, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../../_services/script-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MainService } from '../../service/main.service';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { EstimateService } from '../../service/estimate.service';
import swal from 'sweetalert2';
import { EmbService } from '../../service/emb.service'
import { BaseItemService } from '../../service/base-item.service';
import { BatchItemService } from '../../service/batch-item.service';
import { HierarchyService } from '../../../accounts/service/hierarchy.service';
import { ConsumptionService } from '../../service/consumption.service'



import { element } from 'protractor';
import { threadId } from 'worker_threads';
declare var $: any

@Component({
  selector: 'app-consumption-ana',
  templateUrl: './consumption-ana.component.html',
  styleUrls: ['./consumption-ana.component.css']
})
export class ConsumptionAnaComponent implements OnInit {


  constructor(public mainService: MainService, private baseItemService: BaseItemService,
    private hierarchyService: HierarchyService, private batchItemService: BatchItemService,
    private ConsumptioService: ConsumptionService,
    private _script: ScriptLoaderService, private EstimateService: EstimateService, private EmbService: EmbService,
    private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }

  httpUrl;
  uploader;

  //////////////////////////////////////
  erpUser;
  b_acct_id;

  Obj = {}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'consumption_analysis_desc', 'est_id', 'est_desc', 'remark', 'action'];
  datasource;
  data1 = []
  data = []
  allEstimate = []
  allEstimate1 = []
  Obj1 = {}
  tmq = []
  tmq_f = []
  line = []


  async ngOnInit() {

    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.getall_field_mea();
    this.getAllBaseItem();
    this.getAllBatchItem();
    await this.getAllBudget();
    this.getAllField_Item()
    await this.getAllProject();
    await this.getAllProduct();
    await this.getAllActivity();
  }


  changeEstimate() {
    this.data = []
    this.line = []
    
    for (var i = 0; i < this.allField_item2.length; i++) {
      if (this.allField_item2[i]['id'] == this.Obj['field_measurement_id']) {
        this.Obj['est_id'] = this.allField_item2[i]['est_id']
        this.Obj['proj_cd'] = this.allField_item2[i]['proj_cd']
        this.Obj['remark'] = this.allField_item2[i]['remark']
        this.Obj['est_desc'] = this.allField_item2[i]['est_desc']
        this.Obj['prod_cd'] = this.allField_item2[i]['prod_cd']
        this.Obj['act_cd'] = this.allField_item2[i]['act_cd']
        this.Obj['bud_cd'] = this.allField_item2[i]['bud_cd']
        this.Obj['cal_amt'] = this.allField_item2[i]['est_amt']
        this.data = JSON.parse(this.allField_item2[i]['data'])
        
      }
    }
    for(var j=0;j<this.data.length;j++){
      this.data[j]['arr']=[]
      this.data[j]['total_quantity']=0
    }

  }

  allField_item2;
  async getall_field_mea() {
    var resp = await this.EmbService.getFieldMeasurement(this.b_acct_id);
    if (resp['error'] == false) {
      this.allField_item2 = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Some error occured...!','','error');
    }
  }

  allBaseItem = [];
  async getAllBaseItem() {
    var resp = await this.baseItemService.getbaseitem(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBaseItem = []
      for (let j = 0; j < resp.data.length; j++) {

        var obj = Object()
        obj = resp.data[j]
        obj['item_cd'] = obj['base_item_code']
        obj['desc'] = obj['base_item_desc']
        obj['item_id'] = obj['base_item_id'] + ' - ' + obj['base_item_desc'] + " - base"
        obj['id'] = obj['base_item_id']

        this.allBaseItem.push(obj)


      } 

      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Base Item !','error');
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  allBatchItem = []
  async getAllBatchItem() {
    var resp = await this.batchItemService.getbatchitem(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBatchItem = []
      for (let j = 0; j < resp.data.length; j++) {

        var obj = Object()
        obj = resp.data[j]
        obj['item_cd'] = obj['batch_item_code']
        obj['desc'] = obj['batch_item_desc']
        obj['item_id'] = obj['batch_item_id'] + ' - ' + obj['batch_item_desc'] + " - batch"
        obj['id'] = obj['batch_item_id']
        this.allBatchItem.push(obj)


      }

      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Batch Item !','error');
    }
  }

  add() {
    this.data.push({ item_id: '', item_cd: '', desc: '', marked_rate: '', marked_rate_unit: '', measurement_unit: '', measured_quantity: '', arr: [] });
  }

  delete1(i) {
    this.data1.splice(i, 1);
  }

  async submit() {
    this.spinner.show()
    this.Obj['data'] = JSON.stringify(this.data)
    this.Obj['b_acct_id'] = this.b_acct_id
    this.Obj['create_user_id'] = this.erpUser.user_id
    var resp = await this.ConsumptioService.createConsumption(this.Obj);
    if (resp.error == true) {
      this.spinner.hide()
       await this.getAllField_Item()
      swal.fire(' error occured at server side','','error')
    }
    else {
      await this.getAllField_Item()
      this.spinner.hide()
      swal.fire(' successfully saved','','error')
    }
  }


  addInnerRow(i) {
    this.data[i]['arr'].push(Object.assign({}, {}))
  }

  allField_item;
  async getAllField_Item() {
    this.spinner.show()
    var resp = await this.ConsumptioService.getConsumption(this.b_acct_id);
    if (resp['error'] == false) {
      this.allField_item = resp.data;
      this.datasource = new MatTableDataSource(this.allField_item);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Some error occured...!','','error');
    }
  }
  
  add_quantity(i, j) {
  
    this.data[i]['total_quantity'] = this.data[i]['total_quantity'] + this.data[i]['arr'][j]['quantity']



  }

  deleteInnerRow(i, j) {
    this.data[i]['total_quantity'] = this.data[i]['total_quantity'] - this.data[i]['arr'][j]['quantity']
    this.data[i]['arr'].splice(j, 1)

  }

  async open_update(element) {

    this.Obj = element
    this.data = JSON.parse(element.data);
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');
  }

  refresh() {
    this.Obj = new Object()
    this.data = []
  }

  async update() {
    this.spinner.show()
    this.Obj['data'] = JSON.stringify(this.data)
    this.Obj['b_acct_id'] = this.b_acct_id
    this.Obj['create_user_id'] = this.erpUser.user_id

    var resp = await this.ConsumptioService.updatConsumption(this.Obj);

    if (resp.error == false) {
      await this.getAllField_Item();
      this.spinner.hide()
      swal.fire(' successfully updated','','success')

    }
    else {
      this.spinner.hide()
      swal.fire(' error occured at server side','','error')
    }
  }

  async open_delete(element) {
    this.spinner.show()
    var Obj = new Object();
    Obj['b_acct_id'] = this.b_acct_id;
    Obj['id'] = [element.id]
    var resp = await this.ConsumptioService.deleteConsumption(JSON.stringify(Obj));
    if (resp.error == false) {
      await this.getAllField_Item();
      this.spinner.hide()
      swal.fire('ID ' + element['id'], 'successfully deleted','success')

    }
    else {
      this.spinner.hide()
      swal.fire('error occured at server side','','error')
    }
  }
  // ============
  allProjectHier = [];
  allProductHier = [];
  allActivityHier = [];
  allBudgetHier = [];



  check() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i]['total_quantity'] = 0
      for (let j = 0; j < this.data[i]['arr'].length; j++) {     
        this.data[i]['total_quantity'] = this.data[i]['total_quantity']+this.data[i]['arr'][j]['quantity']
      }
      this.data[i]['total_quantity'] = Number(this.data[i]['total_quantity'].toFixed(2))
    }
  }

  allactobj = {}
  async getAllActivity() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'activity_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
   
    if (resp['error'] == false) {
      this.allActivityHier = resp.data;
      for (var i = 0; i < resp.data.length; i++) {

        for (let j = 1; j <= 7; j++) {
          this.allactobj[resp.data[i]['lvl' + j + "_cd"]] = resp.data[i]['lvl' + j + "_value"]

        }
      }
    } else {
    }
  }
  allprojobj = {}
  async getAllProject() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'proj_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
   
    if (resp['error'] == false) {
      this.allProjectHier = resp.data;

      for (var i = 0; i < this.allProjectHier.length; i++) {
        for (let j = 1; j <= 7; j++) {
          this.allprojobj[this.allProjectHier[i]['lvl' + j + "_cd"]] = this.allProjectHier[i]['lvl' + j + "_value"]

        }

      }
    } else {
    }
  }


  allBudgetobj = {}
  async getAllBudget() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'bud_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
  
    if (resp['error'] == false) {
      this.allBudgetHier = resp.data;
      for (var i = 0; i < resp.data.length; i++) {

        for (let j = 1; j <= 7; j++) {
          this.allBudgetobj[resp.data[i]['lvl' + j + "_cd"]] = resp.data[i]['lvl' + j + "_value"]

        }
      }
    } else {
    }
  }


  allprodobj = {}
  async getAllProduct() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'prod_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    
    if (resp['error'] == false) {
      this.allProductHier = resp.data;
      for (var i = 0; i < resp.data.length; i++) {

        for (let j = 1; j <= 7; j++) {
          this.allprodobj[resp.data[i]['lvl' + j + "_cd"]] = resp.data[i]['lvl' + j + "_value"]

        }
      }
    } else {
    }
  }



}
