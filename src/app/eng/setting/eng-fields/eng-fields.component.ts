import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
declare var $: any

@Component({
  selector: 'app-eng-fields',
  templateUrl: './eng-fields.component.html',
  styleUrls: ['./eng-fields.component.css']
})
export class EngFieldsComponent implements OnInit {

  constructor(private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;


  allFields = [];
  allDataTyeps=[];
  field = {};


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['field_id', 'field_business_name','field_code', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllFields();
    await this.getAllDataTypes();

  }

  async getAllDataTypes(){
    var resp = await this.settingService.getDataTypes(this.b_acct_id);
    if (resp['error'] == false) {
      this.allDataTyeps = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all dataTypes list", 'Error', {
        duration: 5000
      });
    }
  }

  open_update(element) {
    this.field = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.field = {};
  }

  async getAllFields() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['domain_code'] = 'ENG';
    var resp = await this.settingService.getFields(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allFields = resp.data;
      this.datasource = new MatTableDataSource(this.allFields)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all fields list", 'Error', {
        duration: 5000
      });
    }
  }
  async save() {
    this.spinner.show();
    
    this.field['field_logical_id'] =0;
    this.field['b_acct_id'] = this.b_acct_id;
    this.field['is_code_value_present'] =1;
    this.field['is_code_values_present'] = 0;
    this.field['is_hierarchy_present'] = 0;
    this.field['domain_code'] = 'ENG';
    this.field['create_user_id'] = this.erpUser.user_id;
    this.field['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.createFields(this.field);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllFields();
      this.snackBar.open("Field Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Field", 'Error', {
        duration: 5000
      });
    }
  }

  async update() {
    this.spinner.show();
    this.field['update_user_id'] = this.erpUser.user_id;
    this.field['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateFields(this.field);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllFields();
      this.snackBar.open("Field Update Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while updating Field", 'Error', {
        duration: 5000
      });
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}
