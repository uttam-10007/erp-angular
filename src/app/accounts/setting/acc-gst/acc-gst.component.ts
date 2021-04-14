import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import {MainService} from '../../service/main.service';
import swal from 'sweetalert2';
//import { element } from 'protractor';
declare var $: any


@Component({
  selector: 'app-acc-gst',
  templateUrl: './acc-gst.component.html',
  styleUrls: ['./acc-gst.component.css']
})
export class AccGstComponent implements OnInit {

 
  constructor(public mainService:MainService,private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  allHSNAccounts = [];
  Obj = {};
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'hsn_code', 'hsn_desc','cgst','sgst','igst','action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getHSNAccount();
  }

  open_update(element) {
    this.Obj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.Obj = {};
  }

  async getHSNAccount() {
    this.spinner.show()
    var resp = await this.settingService.getHSNAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allHSNAccounts = resp.data;
      this.datasource = new MatTableDataSource(this.allHSNAccounts)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all HSN list!",'error');
    }
  }
  async save() {
    this.spinner.show();
    this.Obj['create_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.createHSNAccount(this.Obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getHSNAccount();
      swal.fire("Success", "...HSN  Added Successfully!!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while Adding hsn !",'error');
    }
  }

  async update() {
    this.spinner.show();
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateHSNAccount(this.Obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getHSNAccount();
      swal.fire("Success", "...HSN  Update Successfully!!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating HSN !",'error');
    }
  }

  async delete(element) {
    this.spinner.show();
    var obj=new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['id'] = element['id'];
    var resp = await this.settingService.deleteHSNAccount(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getHSNAccount();
      swal.fire("Success", "...HSN Delete Successfully!!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while deleting HSN !",'error');
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}
