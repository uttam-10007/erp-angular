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
declare var $: any
@Component({
  selector: 'app-batch-item',
  templateUrl: './batch-item.component.html',
  styleUrls: ['./batch-item.component.css']
})
export class BatchItemComponent implements OnInit {


  constructor(private baseItemService: BaseItemService, private batchItemService: BatchItemService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;

  //////////////////////////////////////
  erpUser;
  b_acct_id;
  Obj = { dataArr: [],contractor_prof:0,overhead:0,output_capacity_quantity:1 };


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['batch_item_id', 'batch_item_desc', 'batch_item_code', 'activity_code', 'output_capacity_unit', 'output_capacity_quantity',
    'costing_rate_unit','costing_rate_at_site', 'create_user_id', 'action'];
  datasource;
  allBaseItem = [];
  allBatchItem = [];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAllBaseItem();
    await this.getAllBatchItem();

  }


  async getAllBaseItem() {
    var resp = await this.baseItemService.getbaseitem(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBaseItem = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Base Item !','error');
    }
  }

  total_item_cost=0;
  open() {
    $('#myModal1').modal('show');
  }
  save_popUp() {
    var total = 0;
    this.total_item_cost=0;
    for (let i = 0; i < this.Obj['dataArr'].length; i++) {
      total = total + this.Obj['dataArr'][i]['item_cost'];
    }
    this.total_item_cost=total;
    this.Obj['costing_rate_at_site'] = ((total + this.Obj['contractor_prof'] + this.Obj['overhead']) /this.Obj['output_capacity_quantity']).toFixed(2);
    $('#myModal1').modal('hide');
  }
  check() {
    
    this.save_popUp();
  }

  addline() {
    this.Obj['dataArr'].push({ base_item_id: '', base_item_desc: '---', costing_rate_at_site: '---', costing_rate_unit: '---', item_qty: 0, item_cost: 0 })
  }

  change(i) {

    for (let j = 0; j < this.allBaseItem.length; j++) {
      if (this.allBaseItem[j]['base_item_id'] == this.Obj['dataArr'][i]['base_item_id']) {
        this.Obj['dataArr'][i]['base_item_desc'] = this.allBaseItem[j]['base_item_desc']
        this.Obj['dataArr'][i]['costing_rate_at_site'] = this.allBaseItem[j]['costing_rate_at_site']
        this.Obj['dataArr'][i]['costing_rate_unit'] = this.allBaseItem[j]['costing_rate_unit']
      }
    }
  }

  changeQty(i) {
    
    this.Obj['dataArr'][i]['item_cost'] = parseInt((this.Obj['dataArr'][i]['item_qty'] * this.Obj['dataArr'][i]['costing_rate_at_site']).toFixed(2));
  }

  deleteline(i) {
    this.Obj['dataArr'].splice(i, 1);
  }





  async getAllBatchItem() {
    this.spinner.show()
    var resp = await this.batchItemService.getbatchitem(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBatchItem = resp.data;
      this.datasource = new MatTableDataSource(this.allBatchItem);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Batch Item !','error');
    }
  }
  async deleteAll() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    var batch_item_id = [];
    for (let i = 0; i < this.allBaseItem.length; i++) {
      batch_item_id.push(this.allBaseItem[i]['batch_item_id']);
    }

    obj['batch_item_id'] = batch_item_id;
    var resp = await this.batchItemService.deletebatchitem(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllBatchItem();

      this.spinner.hide();
      swal.fire('Success', 'All Batch Item  Delete Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Delete All Batch Item !','error');
    }
  }

  refresh() {
    this.Obj = { dataArr: [],contractor_prof:0,overhead:0,output_capacity_quantity:1 };
  }


  async delete(element) {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['batch_item_id'] = [element['batch_item_id']];
    var resp = await this.batchItemService.deletebatchitem(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllBatchItem();

      this.spinner.hide();
      swal.fire('Success', 'Batch Item Delete Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Delete  Batch Item !','error');
    }
  }

  async open_update(element) {
    this.Obj = Object.assign({}, element);
    this.Obj['contractor_prof'] = parseInt(this.Obj['contractor_prof'].toString());
    this.Obj['overhead'] = parseInt(this.Obj['overhead'].toString());
    this.Obj['dataArr'] = JSON.parse(element['data']);
    await this.save_popUp();
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');
  }

  async submit() {
    this.spinner.show()
    if ((this.Obj['costing_rate_unit'] == undefined || this.Obj['costing_rate_unit'] == '') || (this.Obj['batch_item_code'] == undefined || this.Obj['batch_item_code'] == '')) {
      swal.fire('Error', 'Fill Required  Batch Item Fields!','error');
      return;
    }
    await this.check();

    var data = JSON.stringify(this.Obj['dataArr']);
    this.Obj['data'] = data;
    this.Obj['create_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.batchItemService.insertbatchitem(this.Obj);
    if (resp['error'] == false) {
      await this.getAllBatchItem();
      this.spinner.hide();
      swal.fire('Success', 'Batch Item  Created Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while adding  Batch Item!','error');
    }
  }

  async update() {
    this.spinner.show()

    if ((this.Obj['costing_rate_unit'] == undefined || this.Obj['costing_rate_unit'] == '') || (this.Obj['batch_item_code'] == undefined || this.Obj['batch_item_code'] == '')) {
      swal.fire('Error', 'Fill Required  Base Item Fields!','error');
      return;
    }

    await this.check();

    
    var data = JSON.stringify(this.Obj['dataArr']);
    this.Obj['data'] = data;
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.batchItemService.updatebatchitem(this.Obj);
    if (resp['error'] == false) {
      await this.getAllBatchItem();
      this.spinner.hide();

      swal.fire('Success', 'Batch Item Updated Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while updating  Batch Item!','error');
    }
  }

  ngAfterViewInit() {
    this._script.load('./assets/js/scripts/form-plugins.js');
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  ///upload File Code
  onFileUpload(event, files) {
    this.selectedFile = <File>event.target.files[0];

    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
    };

  }

  is_header_present = false;
  exportTemplate() {
    var arr1 = [["", "", "", "", "Instruction to Fill The data in Sheet 2", "", "", "", ""],
    ["1", "Please use only Numbers and character and sign to fill the data", "", "", "", "", "", "", ""],
    ["2", "All Value are alpha neumeric", "", "", "", "", "", "", ""],
    ["3", "Duplicate value will be removed while processing the file", "", "", "", "", "", "", ""]];
    var arr2 = [["Business Code", "Business Term", "Definition", "Domain Code", "Data Type", "Master Data Type", "Default Value", "Heirarchy"]]
    this.mainService.exportAsExcelFile(arr1, arr2, "Business-Terms-Template")
  }
  async upload() {
    this.spinner.show();
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['file_name'] = this.uploader.queue[0].some.name;
    var extention = obj['file_name'].split(".")
    obj['create_user_id'] = this.erpUser.user_id;
    obj['is_header_present'] = 1;
    this.spinner.show()
    const params = JSON.stringify(obj);
    if (extention[1].toLowerCase() == 'xlsx') {
      this.uploader.queue[0].url = this.httpUrl + '/metadata/bussTerms/processBussinessTermFile' + params;
      this.uploader.queue[0].upload();
      this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
        var resp = JSON.parse(response)
        if (resp.error == false) {
          await this.getAllBatchItem();
          this.spinner.hide();
          swal.fire('Success', 'File Uploaded Successfully!!');
        } else {
          this.spinner.hide()
          swal.fire('Error', resp.data);
        }
      };
    }
    else {
      this.spinner.hide();
      swal.fire('Error', 'Please Upload Our Template File !!');
    }
  }
}
