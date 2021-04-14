import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import swal from 'sweetalert2';

declare var $: any

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})
export class AccountInfoComponent implements OnInit {

  constructor(private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;


  allAccountType = [{account_type:'Payable'},{account_type:'Receivable'}];
  obj = {};
  selectAccountType;
  allAccountInfo=[];
  selectedAccountType=[]

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'account_type', 'account_desc','account_code', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    
    await this.getAllAccountInfo();

  }
  async getAllAccountInfo(){
    this.spinner.show()
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    var resp = await this.settingService.getAccountInfo(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      this.allAccountInfo = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all chart of account list");

      /* this.snackBar.open("Error while getting  all fields code value list", 'Error', {
        duration: 5000
      }); */
    }
  }
  open_update(element) {
    console.log(element);
    this.obj = Object.assign({}, element);
    this.selectAccountType= element.account_type;
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.obj = {};
  }


  async changeAccountType() {
    this.selectedAccountType =[];
    for(var i=0;i<this.allAccountInfo.length;i++){
      if(this.selectAccountType == this.allAccountInfo[i].account_type){
        this.selectedAccountType.push(this.allAccountInfo[i])
      }
    }
    this.datasource = new MatTableDataSource(this.selectedAccountType)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }


  async save() {
    this.spinner.show();
    console.log(this.obj);
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['account_type'] = this.selectAccountType;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.addAccountInfo(this.obj);
    console.log(resp);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllAccountInfo();
      await this.changeAccountType();

      swal.fire("Success", "...Account Type Added Successfully!",'success');

    /*   this.snackBar.open("Account Type Added Successfully!", 'Success', {
        duration: 5000
      }); */

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while Adding Account Type!",'error');

      /* this.snackBar.open("Error while Adding Account Type", 'Error', {
        duration: 5000
      }); */
    }
  }

  async update() {
    this.spinner.show();
    console.log(this.obj);
    this.obj['update_user_id'] = this.erpUser.user_id;
    this.obj['account_type'] = this.selectAccountType;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateAccountInfo(this.obj);
    console.log(resp);
    if (resp['error'] == false) {
      await this.getAllAccountInfo();
      await this.changeAccountType();
      this.spinner.hide();

      swal.fire("Success", "...Account Type Update Successfully!",'success');

    /*   this.snackBar.open("Account Info Update Successfully!", 'Success', {
        duration: 5000
      }); */

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating Account Type!",'error');

     /*  this.snackBar.open("Error while updating Account Info", 'Error', {
        duration: 5000
      }); */
    }
  }

  async delete(element) {
    this.spinner.show();
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['id'] = element.id;
    var resp = await this.settingService.deleteAccountInfo(JSON.stringify(obj1));
    console.log(resp);
    if (resp['error'] == false) {
      await this.getAllAccountInfo();
      await this.changeAccountType();
      this.spinner.hide();

      swal.fire("Success", "...Account Type Delete Successfully!",'success');

     /*  this.snackBar.open("Account Type Delete Successfully!", 'Success', {
        duration: 5000
      }); */

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while delete Account Type!",'error');

     /*  this.snackBar.open("Error while delete Account Type", 'Error', {
        duration: 5000
      }); */
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
