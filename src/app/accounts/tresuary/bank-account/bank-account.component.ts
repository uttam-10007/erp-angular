import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import {MainService} from '../../service/main.service';
import swal from 'sweetalert2';

declare var $: any


@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css']
})
export class BankAccountComponent implements OnInit {

  constructor(public mainService:MainService,private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  allBankAccounts = [];
  bankObj = {};
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'bank_acct_no', 'bank_code','ifsc_code','branch_code','bank_manager_name','bank_email','bank_phone_no','bank_acct_desc','action'];
  datasource;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getBankAccount();
  }

  open_update(element) {
    this.bankObj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.bankObj = {};
  }

  async getBankAccount() {
    var resp = await this.settingService.getBankAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBankAccounts = resp.data;
      this.datasource = new MatTableDataSource(this.allBankAccounts)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while getting  all fields list!",'error');

     /*  this.snackBar.open("Error while getting  all fields list", 'Error', {
        duration: 5000
      }); */
    }
  }
  async save() {
    this.spinner.show();
    this.bankObj['create_user_id'] = this.erpUser.user_id;
    this.bankObj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.createBankAccount(this.bankObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getBankAccount();

      swal.fire("Success", "...Bank Account Added Successfully!!",'success');

    /*   this.snackBar.open("Bank Account Added Successfully!", 'Success', {
        duration: 5000
      }); */

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while Adding Bank Account!",'error');

     /*  this.snackBar.open("Error while Adding Bank Account", 'Error', {
        duration: 5000
      }); */
    }
  }

  async update() {
    this.spinner.show();
    this.bankObj['update_user_id'] = this.erpUser.user_id;
    this.bankObj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateBankAccount(this.bankObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getBankAccount();

      swal.fire("Success", "...Bank Account Update Successfully!!",'success');

     /*  this.snackBar.open("Bank Account Update Successfully!", 'Success', {
        duration: 5000
      }); */

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while updating Bank Account!",'error');
    /* this.snackBar.open("Error while updating Bank Account", 'Error', {
        duration: 5000
      }); */
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
