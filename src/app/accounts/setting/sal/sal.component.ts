import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalService } from '../../service/sal.service';
declare var $: any;

@Component({
  selector: 'app-sal',
  templateUrl: './sal.component.html',
  styleUrls: ['./sal.component.css']
})
export class SalComponent implements OnInit {

  erpUser;
  b_acct_id;

  constructor(private salService: SalService, private snackBar: MatSnackBar, private router: Router, private spinner: NgxSpinnerService) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;




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
    await this.getSalDetals();
  }


  async getallFields() {
    var obj = new Object();
    obj['domain_code'] = 'ACCOUNT';
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.salService.getFields(obj);
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

  async getSalDetals() {
    this.spinner.show()
    var resp = await this.salService.getSal(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      var sal_dtl = resp.data[0];
      this.record_obj['record_code'] = sal_dtl.record_code;
      this.record_obj['record_business_name'] = sal_dtl.record_business_name;
      this.record_obj['record_technical_name'] = sal_dtl.record_technical_name;
      var sal_fileds_code = [];
      sal_fileds_code = sal_dtl.field_code.split(",");
      this.old_field_code = [];
      for (let i = 0; i < sal_fileds_code.length; i++) {
        this.old_field_code.push(sal_fileds_code[i]);
      }

      this.usedField = [];
      for (let i = 0; i < sal_fileds_code.length; i++) {
        this.usedField.push({ field_code: sal_fileds_code[i] })
      }

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting Sal Records", "Error", {
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
      field_xref_info.push({ record_code: this.record_obj['record_code'], field_code: this.usedField[i].field_code, col_seq_no: i })
    }

    for (let i = 0; i < field_xref_info.length; i++) {
      for (let j = 0; j < this.allFields.length; j++) {
        if (this.allFields[j]['field_code'] == field_xref_info[i]['field_code']) {
          field_xref_info[i]['datatype_code'] = this.allFields[j]['datatype_code'];
          field_xref_info[i]['field_technical_name'] = this.allFields[j]['field_technical_name'];

        }
      }
    }

    obj['data'] = field_xref_info;
    var resp = await this.salService.updateSystemRecords(obj);
    if (resp['error'] == false) {
      await this.getSalDetals();
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
