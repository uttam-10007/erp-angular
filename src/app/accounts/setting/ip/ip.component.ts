import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { IpService } from '../../service/ip.service';
import { findReadVarNames } from '@angular/compiler/src/output/output_ast';
declare var $: any;

@Component({
  selector: 'app-ip',
  templateUrl: './ip.component.html',
  styleUrls: ['./ip.component.css']
})
export class IpComponent implements OnInit {

  erpUser;
  b_acct_id;

  constructor(private ipService: IpService, private snackBar: MatSnackBar, private router: Router, private spinner: NgxSpinnerService) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  sectionOfRecord = [{ section_of_record_name: 'Line', section_of_record: 'line' }, { section_of_record_name: 'Detail Line', section_of_record: 'detail_line' }, { section_of_record_name: 'Header', section_of_record: 'header' }]
  allRefRecords = [];
  allDomain = [];
  allRefFields = [];
  allFields = [];

  record_obj = {};
  usedField = [];
  old_record_obj = {};
  old_field_code = [];


  async ngOnInit() {

    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getallFields();
    await this.getIpDetails();

  }
  async getallFields() {

    var obj = new Object();
    obj['table_name'] = 'field_info';
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ipService.getFields(obj);
    this.allRefFields = [];
    this.allFields = [];
    if (resp['error'] == false) {
      this.allFields = resp.data;
      for (let i = 0; i < this.allFields.length; i++) {
        this.allFields[i]['desc'] = this.allFields[i]['field_code'] + " - " + this.allFields[i]['field_business_name'] + " - " + this.allFields[i]['field_technical_name']
      }
    } else {
      this.snackBar.open("Error while getting Fields", "Error", {
        duration: 5000,
      });
    }


  }





  async getIpDetails() {
    this.spinner.show()
    var resp = await this.ipService.getipdata(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide();
      var ip_dtl = resp.data[0];
      this.record_obj['record_code'] = ip_dtl.record_code;
      this.record_obj['record_business_name'] = ip_dtl.record_business_name;
      this.record_obj['record_technical_name'] = ip_dtl.record_technical_name;
      var ip_fields_code = [];
      ip_fields_code = ip_dtl.field_code.split(",");
      this.old_field_code = [];
      for (let i = 0; i < ip_fields_code.length; i++) {
        this.old_field_code.push(ip_fields_code[i]);
      }
      this.usedField = [];
      for (let i = 0; i < ip_fields_code.length; i++) {
        this.usedField.push({ field_code: ip_fields_code[i] })
      }
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while getting Journal Records", "Error", {
        duration: 5000,
      });
    }
  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.usedField, event.previousIndex, event.currentIndex);
  }

  addRow() {
    this.usedField.push({ field_code: '-1' })
  }

  deleteRow(i) {
    this.usedField.splice(i, 1)
  }


  async update() {
    var obj = new Object();
    var old_field_codes = this.old_field_code;
    var new_field_codes = [];
    for (let i = 0; i < this.usedField.length; i++) {
      new_field_codes.push(this.usedField[i].field_code);
    }

    obj['record_code'] = this.record_obj['record_code']
    obj['new_field_codes'] = new_field_codes;
    obj['old_field_codes'] = old_field_codes;
    obj['b_acct_id'] = this.b_acct_id;
    obj['record_technical_name'] = this.record_obj['record_technical_name'];
    obj['domain_db_name'] = "svayam_" + this.b_acct_id + "_data";

    var field_xref_info = [];

    for (let i = 0; i < this.usedField.length; i++) {
      field_xref_info.push({ record_code: this.record_obj['record_code'], field_code: this.usedField[i].field_code, col_seq_no: i})
    }


    for(let i=0;i<field_xref_info.length;i++){
      for(let j=0;j<this.allFields.length;j++){
        if(this.allFields[j]['field_code']==field_xref_info[i]['field_code']){
          field_xref_info[i]['datatype_code']=this.allFields[j]['datatype_code'];
          field_xref_info[i]['field_technical_name']=this.allFields[j]['field_technical_name'];
          
        }
      }
    }

    obj['data'] = field_xref_info;
    var resp = await this.ipService.updateSystemRecords(obj);
    if (resp['error'] == false) {
      await this.getIpDetails();
      this.spinner.hide();
      this.snackBar.open("Update Successfully", "Success", {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while update Records", "Error", {
        duration: 5000,
      });
    }

  }




}
