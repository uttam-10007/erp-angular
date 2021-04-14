import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../hrms/service/setting.service';
import { ApprService } from '../../hrms/service/appr.service';
import { MainService } from '../service/main.service';
declare var $: any
import swal from 'sweetalert2';
import Swal from 'sweetalert2';
import { UserAddService } from '../service/user-add.service';

@Component({
  selector: 'app-approval',
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.css']
})
export class ApprovalComponent implements OnInit {

  constructor(public mainService: MainService, private userAdd: UserAddService, private apprService: ApprService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'doc_type', 'action'];
  datasource;
  erpUser;
  b_acct_id;
  ruleObj = {};
  allApproval = [];
  allDocType = [];
  selectedDocTypeObj = {}
  selectedApproval = {}
  fileType = { doc_type: '', data: [] };
  docType = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    console.log(this.mainService.codeValueTechObj);
    this.docType = this.mainService.codeValueTechObj['MD0005'];
    await this.getAllRule();
    await this.getAllUsersInfo();

  }
  allUser = [];
  async getAllUsersInfo() {
    var obj = { b_acct_id: this.b_acct_id };
    var resp = await this.userAdd.getAllUsersInfo(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      this.allUser = resp['data'];
      for (let i = 0; i < this.allUser.length; i++) {
        this.allUser[i]['name'] = this.allUser[i]['first_name'] + " " + this.allUser[i]['last_name']
      }
    } else {

    }
  }

  back() {
    this.router.navigate(['/index'])
  }
  async getAllRule() {
    this.allDocType = [];
    this.spinner.show()
    var resp = await this.apprService.getAllApproval(this.b_acct_id);
    console.log(resp);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allApproval = resp['data'];
      var obj = {};
      for (var i = 0; i < this.allApproval.length; i++) {
        if (obj[this.allApproval[i].doc_type] == undefined) {

          this.allDocType.push(this.allApproval[i]);
          obj[this.allApproval[i].doc_type] = 1;
        }
      }
      this.datasource = new MatTableDataSource(this.allDocType)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;

    } else {
      this.spinner.hide()
    }
  }
  addRow() {
    this.fileType.data.push({ user_id: '' });
  }
  deleteRow(i) {
    this.fileType.data.splice(i, 1);
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async createRule() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = [];
    for (var i = 0; i < this.fileType.data.length; i++) {
      obj['data'].push({ doc_type: this.fileType.doc_type, user_id: this.fileType.data[i]['user_id'], level_of_approval: i+1, create_user_id: this.erpUser.create_user_id });
    }
    this.spinner.show();
    var resp = await this.apprService.createRule(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllRule()
      Swal.fire('Success', 'Addedd', 'success');
    } else {
      this.spinner.hide()
      Swal.fire('Error', 'Not Added', 'error');
    }
  }
  async updateRule() {
    var obj = new Object();
    obj['update_user_id'] = this.erpUser.user_id;
    obj['b_acct_id'] = this.erpUser.b_acct_id;

    var data=[];
    for(let i=0;i<this.fileType.data.length;i++){
      data.push({ doc_type: this.fileType.doc_type, 
        user_id: this.fileType.data[i]['user_id'], 
        level_of_approval: i+1, 
        create_user_id: this.erpUser['user_id'],
        update_user_id: this.erpUser['user_id'] })
    }
    obj['data']=data;

    obj['doc_type']=this.fileType.doc_type;
    console.log(obj)
    var resp = await this.apprService.updateApprovalData(obj);
    console.log(resp)
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllRule();
      Swal.fire('Success', 'Updated', 'success');
    } else {
      this.spinner.hide()
      Swal.fire('Error', 'Not Updated', 'error');
    }
  }
  async viewRule(element) {
    console.log(element);
    this.fileType.data = [];
    this.selectedApproval = element
    for (var i = 0; i < this.allApproval.length; i++) {
      if (this.allApproval[i]['doc_type'] == element['doc_type']) {
        this.fileType.data.push(this.allApproval[i]);
      }
    }
    var s = this.fileType.data[0]['doc_type'];
    this.fileType.doc_type = s;
    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }
  async deleteRule(element) {
    var obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['doc_type'] = element['doc_type'];
    this.spinner.show();
    var resp = await this.apprService.deleteRule(obj);
    if (resp['error'] == false) {
      await this.getAllRule();
      // await this.viewRule(this.selectedApproval);
      this.spinner.hide();
      Swal.fire('Success', 'Rule Deleted', 'success')
    } else {
      this.spinner.hide();
      Swal.fire('Error', 'Some Error Occurred', 'error')
    }
  }



}
