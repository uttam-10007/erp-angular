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
import { element } from 'protractor';
import { SettingService } from '../../service/setting.service';

declare var $: any

@Component({
  selector: 'app-field-measure',
  templateUrl: './field-measure.component.html',
  styleUrls: ['./field-measure.component.css']
})
export class FieldMeasureComponent implements OnInit {

  constructor(public mainService: MainService, private settingService: SettingService, private baseItemService: BaseItemService, private hierarchyService: HierarchyService, private batchItemService: BatchItemService, private _script: ScriptLoaderService, private EstimateService: EstimateService, private EmbService: EmbService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }

  httpUrl;
  uploader;

  //////////////////////////////////////
  erpUser;
  b_acct_id;

  Obj = {}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'field_measurement_desc', 'est_id', 'est_desc', 'remark', 'action'];
  datasource;
  data1 = []
  data = []
  allEstimate = []
  allEstimate1 = []
  Obj1 = {}
  tmq = []
  allunit;
  tmq_f = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEstimate()
    await this.getAllField_Item()
    await this.getAllBaseItem()
    await this.getAllBatchItem()
    await this.getAllBudget();

    await this.getAllProject();
    await this.getAllProduct();
    await this.getAllActivity();
    await this.getunit();
  }
  async getunit() {

    var resp = await this.settingService.getunit(this.b_acct_id);
    if (resp['error'] == false) {
      this.allunit = resp.data;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all units!",'error');

    }
  }

  async getAllEstimate() {
    var resp = await this.EstimateService.getestimate(this.b_acct_id);
    if (resp['error'] == false) {
      this.allEstimate = resp.data;
      this.allEstimate1 = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error While Getting All Estimate !','error');
    }
  }
  line = []

  allProjectHier = [];
  allProductHier = [];
  allActivityHier = [];
  allBudgetHier = [];




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

  check() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i]['total'] = 0
      this.data[i]['net_quantity'] = this.data[i]['total_measurement_quantity']
      for (let j = 0; j < this.data[i]['arr'].length; j++) {
        if (this.data[i]['arr'][j]['quantity'] != undefined && this.data[i]['arr'][j]['unit'] != undefined) {
          if (this.data[i]['arr'][j]['quantity'] != null && this.data[i]['arr'][j]['unit'] != null) {
            for (var k = 0; k < this.data[i]['unit_arr'].length; k++) {
              if (this.data[i]['arr'][j]['unit'] == this.data[i]['unit_arr'][k]['to_unit']) {
                let amount = this.data[i]['unit_arr'][k]['amount'].split('/')
                if (amount.length == 2) {
                  let temp = Number(amount[0]) / Number(amount[1])

                  this.data[i]['total'] = this.data[i]['total'] + (this.data[i]['arr'][j]['quantity'] / temp)
                  this.data[i]['net_quantity'] = this.data[i]['net_quantity'] - (this.data[i]['arr'][j]['quantity'] / temp)

                } else {
                  let temp = Number(amount[0])
                  this.data[i]['total'] = this.data[i]['total'] + (this.data[i]['arr'][j]['quantity'] / temp)
                  this.data[i]['net_quantity'] = this.data[i]['net_quantity'] - (this.data[i]['arr'][j]['quantity'] / temp)
                }
              }
            }
          }
        }
        this.data[i]['total'] = Number(this.data[i]['total'].toFixed(2))
        this.data[i]['net_quantity'] = Number(this.data[i]['net_quantity'].toFixed(2))

      }
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

  changeEstimate() {
    this.data = []
    this.line = []
    for (var i = 0; i < this.allEstimate.length; i++) {
      if (this.allEstimate[i]['id'] == this.Obj['est_id']) {

        this.Obj['proj_cd'] = this.allEstimate[i]['proj_cd']
        this.Obj['remark'] = this.allEstimate[i]['remark']
        this.Obj['est_desc'] = this.allEstimate[i]['est_desc']
        this.Obj['prod_cd'] = this.allEstimate[i]['prod_cd']
        this.Obj['act_cd'] = this.allEstimate[i]['act_cd']
        this.Obj['bud_cd'] = this.allEstimate[i]['bud_cd']
        this.Obj['est_amt'] = this.allEstimate[i]['est_amt']
        var arr = JSON.parse(this.allEstimate[i]['data'])
        for (var j = 0; j < arr.length; j++) {
          var m = arr[j]['item_id'].split('-')
          if (m[1] == 'batch') {
            for (var k = 0; k < this.allBatchItem.length; k++) {
              if (this.allBatchItem[k]['batch_item_id'] == m[0]) {
                let ob = Object.assign({}, this.allBatchItem[k])
                ob['marked_rate'] = arr[j]['marked_rate']
                ob['marked_rate_unit'] = arr[j]['marked_rate_unit']


                this.line.push(ob)
              }
            }
          }
          else {
            for (var k = 0; k < this.allBaseItem.length; k++) {
              if (this.allBaseItem[k]['base_item_id'] == m[0]) {
                let ob = Object.assign({}, this.allBaseItem[k])
                ob['marked_rate'] = arr[j]['marked_rate']
                ob['marked_rate_unit'] = arr[j]['marked_rate_unit']


                this.line.push(ob)
              }
            }
          }

        }

      }
    }
  }





  changeitem(i) {
    this.data[i]['arr'] = []
    var id = this.data[i]['item_id'].split(" - ")



    if (id[2] == 'base') {
      for (var j = 0; j < this.allBaseItem.length; j++) {
        if (this.allBaseItem[j]['base_item_id'] == id[0]) {

          // this.data[i]=this.allBaseItem[j]
          this.data[i]['item_cd'] = this.allBaseItem[j]['base_item_code']
          this.data[i]['desc'] = this.allBaseItem[j]['base_item_desc']
          this.data[i]['total_measurement_quantity'] = Number(this.allBaseItem[j]['output_capacity_quantity'])
          this.data[i]['measurement_unit'] = this.allBaseItem[j]['costing_rate_unit']
          this.data[i]['total'] = 0;
          this.data[i]['net_quantity'] = Number(this.allBaseItem[j]['output_capacity_quantity'])

          this.data[i]['marked_rate'] = this.allBaseItem[j]['costing_rate_at_site']
          this.data[i]['marked_rate_unit'] = this.allBaseItem[j]['costing_rate_unit']



        }
      }
    } else if (id[2] == 'batch') {
      for (var j = 0; j < this.allBatchItem.length; j++) {
        if (this.allBatchItem[j]['batch_item_id'] == id[0]) {
          //this.data[i]=this.allBatchItem[j]
          this.data[i]['item_cd'] = this.allBatchItem[j]['batch_item_code']
          this.data[i]['desc'] = this.allBatchItem[j]['batch_item_desc']
          this.data[i]['total_measurement_quantity'] = Number(this.allBatchItem[j]['output_capacity_quantity'])
          this.data[i]['measurement_unit'] = this.allBatchItem[j]['costing_rate_unit']
          this.data[i]['total'] = 0;
          this.data[i]['net_quantity'] = Number(this.allBatchItem[j]['output_capacity_quantity'])
          this.data[i]['marked_rate'] = this.allBatchItem[j]['costing_rate_at_site']
          this.data[i]['marked_rate_unit'] = this.allBatchItem[j]['costing_rate_unit']

        }
      }
    }
    this.data[i]['unit_arr'] = []
    for (var a = 0; a < this.allunit.length; a++) {
      if (this.data[i]['measurement_unit'] == this.allunit[a]['from_unit']) {
        this.data[i]['unit_arr'].push(this.allunit[a])

      }
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
      swal.fire('Error', 'Error While Getting All Base Item !','error');
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
    this.data.push({ item_id: '', item_cd: '', desc: '', length: '', width: '', height: '', unit_arr: [], total_measure_quantity: '', arr: [] });
  }
  ChangeUnit(i, j) {
    // ------------
    this.data[i]['total'] = Number(this.data[i]['total'].toFixed(2))
    this.data[i]['net_quantity'] = Number(this.data[i]['net_quantity'].toFixed(2))
    if (this.data[i]['arr'][j]['quantity'] != undefined && this.data[i]['arr'][j]['unit'] != undefined) {
      if (this.data[i]['arr'][j]['quantity'] != null && this.data[i]['arr'][j]['unit'] != null) {
        for (var k = 0; k < this.data[i]['unit_arr'].length; k++) {
          if (this.data[i]['arr'][j]['unit'] == this.data[i]['unit_arr'][k]['to_unit']) {
            let amount = this.data[i]['unit_arr'][k]['amount'].split('/')
            if (amount.length == 2) {
              let temp = Number(amount[0]) / Number(amount[1])

              this.data[i]['total'] = this.data[i]['total'] + (this.data[i]['arr'][j]['quantity'] / temp)
              this.data[i]['net_quantity'] = this.data[i]['net_quantity'] - (this.data[i]['arr'][j]['quantity'] / temp)

            } else {
              let temp = Number(amount[0])
              this.data[i]['total'] = this.data[i]['total'] + (this.data[i]['arr'][j]['quantity'] / temp)
              this.data[i]['net_quantity'] = this.data[i]['net_quantity'] - (this.data[i]['arr'][j]['quantity'] / temp)
            }
          }
        }
      }
    }
    this.data[i]['total'] = Number(this.data[i]['total'].toFixed(2))
    this.data[i]['net_quantity'] = Number(this.data[i]['net_quantity'].toFixed(2))

  }

  delete1(i) {
    this.data1.splice(i, 1);
  }
  delete(i) {
    this.data.splice(i, 1);

  }




  addInnerRow(i) {

    this.data[i]['arr'].push(Object.assign({}, {}))
  }

  allField_item;
  async getAllField_Item() {
    this.spinner.show()
    var resp = await this.EmbService.getFieldMeasurement(this.b_acct_id);
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
  async submit() {
    this.spinner.show()
    this.Obj['data'] = JSON.stringify(this.data)
    this.Obj['b_acct_id'] = this.b_acct_id
    this.Obj['create_user_id'] = this.erpUser.user_id
 
    var resp = await this.EmbService.create_Field_meas(this.Obj);
    if (resp.error == true) {
      await this.getAllField_Item();
      this.spinner.hide()
      swal.fire(' error occured at server side','','error')
    }
    else {
      await this.getAllField_Item();
      this.spinner.hide()
      swal.fire(' successfully saved','','success')
    }
    await this.getAllField_Item();

  }
  add_quantity(i, j) {
    this.data[i]['total'] = this.data[i]['total'] + this.data[i]['arr'][j]['quantity']
    this.data[i]['net_quantity'] = this.data[i]['net_quantity'] - this.data[i]['arr'][j]['quantity']

  }

  deleteInnerRow(i, j) {

    if (this.data[i]['arr'][j]['quantity'] != undefined && this.data[i]['arr'][j]['unit'] != undefined) {
      if (this.data[i]['arr'][j]['quantity'] != null && this.data[i]['arr'][j]['unit'] != null) {
        for (var k = 0; k < this.data[i]['unit_arr'].length; k++) {
          if (this.data[i]['arr'][j]['unit'] == this.data[i]['unit_arr'][k]['to_unit']) {
            let amount = this.data[i]['unit_arr'][k]['amount'].split('/')
            if (amount.length == 2) {
              let temp = Number(amount[0]) / Number(amount[1])

              this.data[i]['total'] = this.data[i]['total'] - (this.data[i]['arr'][j]['quantity'] / temp)
              this.data[i]['net_quantity'] = this.data[i]['net_quantity'] + (this.data[i]['arr'][j]['quantity'] / temp)

            } else {
              let temp = Number(amount[0])
              this.data[i]['total'] = this.data[i]['total'] - (this.data[i]['arr'][j]['quantity'] / temp)
              this.data[i]['net_quantity'] = this.data[i]['net_quantity'] + (this.data[i]['arr'][j]['quantity'] / temp)
            }
          }
        }
      }
    }
    this.data[i]['total'] = Number(this.data[i]['total'].toFixed(2))
    this.data[i]['net_quantity'] = Number(this.data[i]['net_quantity'].toFixed(2))
    this.data[i]['arr'].splice(j, 1)

  }

  async open_update(element) {

    this.Obj = element
    this.data = JSON.parse(element.data);

    for (var i = 0; i < this.allEstimate.length; i++) {
      if (this.allEstimate[i]['id'] == this.Obj['est_id']) {
        this.Obj['proj_cd'] = this.allEstimate[i]['proj_cd']
        this.Obj['remark'] = this.allEstimate[i]['remark']
        this.Obj['est_desc'] = this.allEstimate[i]['est_desc']
        this.Obj['prod_cd'] = this.allEstimate[i]['prod_cd']
        this.Obj['act_cd'] = this.allEstimate[i]['act_cd']
        this.Obj['bud_cd'] = this.allEstimate[i]['bud_cd']
        this.Obj['est_amt'] = this.allEstimate[i]['est_amt']
        this.line = JSON.parse(this.allEstimate[i]['data'])

      }
    }
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
    var resp = await this.EmbService.updateFieldMeasurement(this.Obj);
    if (resp.error == false) {
      this.spinner.hide()
      swal.fire(' successfully updated','','success')

    }
    else {
      this.spinner.hide()
      swal.fire(' error occured at server side','','error')
    }
    await this.getAllField_Item();

  }
  async open_delete(element) {
    this.spinner.show()
    var Obj = new Object();
    Obj['b_acct_id'] = this.b_acct_id;
    Obj['id'] = [element.id]
    var resp = await this.EmbService.deleteFieldMeasurement(JSON.stringify(Obj));
    if (resp.error == false) {
      await this.getAllField_Item();
      this.spinner.hide()
      swal.fire('ID ' + element['id'], 'successfully deleted','success')

    }
    else {
      this.spinner.hide()
      swal.fire('error occured at server side','','error')
    }
    await this.getAllField_Item();

  }

}
