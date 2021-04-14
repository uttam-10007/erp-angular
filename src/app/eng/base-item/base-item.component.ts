import swal from 'sweetalert2';
import { Component, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../_services/script-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MainService } from '../service/main.service';
import { BaseItemService } from '../service/base-item.service';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { element } from 'protractor';
declare var $: any
@Component({
  selector: 'app-base-item',
  templateUrl: './base-item.component.html',
  styleUrls: ['./base-item.component.css']
})
export class BaseItemComponent implements OnInit {



  constructor(private baseItemService: BaseItemService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
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
  Obj = {};


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['base_item_id', 'base_item_desc', 'base_item_code', 'activity_code', 'output_capacity_unit', 'output_capacity_quantity',
    'costing_rate_unit', 'costing_rate_at_source', 'costing_rate_at_site', 'create_user_id', 'action'];
  datasource;
  allBaseItem = [];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAllBaseItem();
  }



  async getAllBaseItem() {
    this.spinner.show()
    var resp = await this.baseItemService.getbaseitem(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBaseItem = resp.data;
      this.datasource = new MatTableDataSource(this.allBaseItem);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Base Item !','error');
    }
  }
  async deleteAll() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    var base_item_id = [];
    for (let i = 0; i < this.allBaseItem.length; i++) {
      base_item_id.push(this.allBaseItem[i]['base_item_id']);
    }

    obj['base_item_id'] = base_item_id;
    var resp = await this.baseItemService.deletebaseitem(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllBaseItem();

      this.spinner.hide();
      swal.fire('Success', 'All Base Item  Delete Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Delete All Base Item !','error');
    }
  }

  refresh() {
    this.Obj = {};
  }


  async delete(element) {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['base_item_id'] = [element['base_item_id']];
    var resp = await this.baseItemService.deletebaseitem(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllBaseItem();

      this.spinner.hide();
      swal.fire('Success', 'Base Item Delete Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Delete  Base Item !','error');
    }
  }

  open_update(element) {
    this.Obj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');

  }

  async submit() {
    this.spinner.show()
    if ((this.Obj['costing_rate_unit'] == undefined || this.Obj['costing_rate_unit'] == '') || (this.Obj['base_item_code'] == undefined || this.Obj['base_item_code'] == '')) {
      swal.fire('Error', 'Fill Required  Base Item Fields!','error');
      return;
    }
    if ((this.Obj['costing_rate_at_source'] == undefined || this.Obj['costing_rate_at_source'] == '') && (this.Obj['costing_rate_at_site'] == undefined || this.Obj['costing_rate_at_site'] == '')) {
      swal.fire('Error', 'Fill Required  Base Item Fields!','error');
      return;
    }
    this.Obj['create_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.baseItemService.insertbaseitem(this.Obj);
    if (resp['error'] == false) {
      await this.getAllBaseItem();
      this.spinner.hide();
      swal.fire('Success', 'Base Item  Created Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while adding  Base Item!','error');
    }
  }

  async update() {
    this.spinner.show()
    if ((this.Obj['costing_rate_unit'] == undefined || this.Obj['costing_rate_unit'] == '') || (this.Obj['base_item_code'] == undefined || this.Obj['base_item_code'] == '')) {
      swal.fire('Error', 'Fill Required  Base Item Fields!','error');
      return;
    }
    if ((this.Obj['costing_rate_at_source'] == undefined || this.Obj['costing_rate_at_source'] == '') && (this.Obj['costing_rate_at_site'] == undefined || this.Obj['costing_rate_at_site'] == '')) {
      swal.fire('Error', 'Fill Required  Base Item Fields!','error');
      return;
    }
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.baseItemService.updatebaseitem(this.Obj);
    if (resp['error'] == false) {
      await this.getAllBaseItem();
      this.spinner.hide();

      swal.fire('Success', 'Base Item Updated Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while updating  Base Item!','error');
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
          await this.getAllBaseItem();
          this.spinner.hide();
          swal.fire('Success', 'File Uploaded Successfully!!','success');
        } else {
          this.spinner.hide()
          swal.fire('Error', resp.data,'error');
        }
      };
    }
    else {
      this.spinner.hide();
      swal.fire('Error', 'Please Upload Our Template File !!','error');
    }
  }

}
