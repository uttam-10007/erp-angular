import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service';

import swal from 'sweetalert2';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any
@Component({
  selector: 'app-deductiion-mapping',
  templateUrl: './deductiion-mapping.component.html',
  styleUrls: ['./deductiion-mapping.component.css']
})

export class DeductiionMappingComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  list = ['Sr_n', 'ded_code', 'ded_type', 'amount', 'ded_date', 'gov_rule', 'action'];
  ded_type = [{ code: 'fixed', value: 'FIXED' }, { code: 'percentage', value: 'PERCENTAGE' }]

  datasource;
  constructor( public mainService:MainService,
    private router: Router, private spinner: NgxSpinnerService, private settingService: SettingService) { }

  Obj = {}
  erpUser;
  b_acct_id;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getList();
  }

  async submit() {
    this.spinner.show()
    let obj = {}
    obj = this.Obj
    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.erpUser.user_id
    var resp = await this.settingService.createDeductionMapping(obj)
    if (resp['error'] == false) {
      this.spinner.hide()
      await this.getList()
      swal.fire('Successfully Submitted', '', 'success')
    }
    else {
      this.spinner.hide()
      swal.fire('Some Error Occured', '', 'error')
    }
  }
  async getList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getDeductionMappingList(this.b_acct_id);
    if (resp['error'] == false) {
      this.datasource = new MatTableDataSource(resp['data'])
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();


    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting list!", 'error');

    }
  }
  refresh() {
    this.Obj = {}
  }
  async open_update(e) {
    this.Obj = e
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
  async update() {
    this.spinner.show()
    let obj = {}
    obj = this.Obj
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id'] = this.erpUser.user_id
    var resp = await this.settingService.updateDeductionMapping(obj)
    if (resp['error'] == false) {
      this.spinner.hide()
      await this.getList()
      swal.fire('Successfully Updated', '', 'success')
    }
    else {
      this.spinner.hide()
      swal.fire('Some Error Occured', '', 'error')
    }
  }
  async delete(e) {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = e['id']
    var resp = await this.settingService.deleteDeductionMappingRow(obj)
    if (resp['error'] == false) {
      this.spinner.hide()
      await this.getList()
      swal.fire('Successfully Deleted', '', 'success')
    }
    else {
      this.spinner.hide()
      swal.fire('Some Error Occured', '', 'error')
    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}
