import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { MainService } from '../../service/main.service';
declare var $: any;

@Component({
  selector: 'app-other-payment',
  templateUrl: './other-payment.component.html',
  styleUrls: ['./other-payment.component.css']
})
export class OtherPaymentComponent implements OnInit {


  constructor(public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  erpUser;
  b_acct_id;
  arr_id;

  allEmplyees = [];
 
  otherpayObj = {};
  codeValueTechObj = {};

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'other_pay_component_code', 'other_pay_component_amount', 'pay_status_code', 'action'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getAllOtherPayment();

  }


  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.payableService.getEmployeeMasterData(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmplyees = resp.data;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }


  async getAllOtherPayment() {

    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['other_pay_component_code'] = [];
    var resp = await this.payableService.getOtherPayments(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {


      this.spinner.hide();
      this.snackBar.open("Error while getting employee all Other Payment list", 'Error', {
        duration: 5000
      });
    }
  }

  open_update(element) {
    this.otherpayObj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }

/*   async deactive(element) {
    var obj = new Object();
    obj['id'] = element.id;
    obj['update_user_id'] = this.erpUser.user_id;
    obj['b_acct_id'] = this.b_acct_id;
    obj['pay_status_code'] = "INACTIVE";
    this.spinner.show();
    var resp = await this.payableService.updateStatusOfPayment(obj);
    if (resp['error'] == false) {
      await this.getAllOtherPayment();
      this.spinner.hide();
      this.snackBar.open("Updated Other Pay  Of Employee", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Updating Other Pay  Of Employee", 'Error', {
        duration: 5000
      });
    }
  } */



  async submitotherPay() {
    this.otherpayObj['pay_status_code'] = 'GENRATED';
    this.otherpayObj['create_user_id'] = this.erpUser.user_id;


    var obj = new Object();
    obj['other_payments'] = [this.otherpayObj];
    obj['b_acct_id'] = this.b_acct_id;

    this.spinner.show();
    var resp = await this.payableService.defineOtherPayments(obj);
    if (resp['error'] == false) {
      this.otherpayObj = {};
      this.spinner.hide();
      this.getAllOtherPayment();
      this.snackBar.open("Other Pay Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Other Pay  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }


  async updateotherPay() {
    this.otherpayObj['b_acct_id'] = this.b_acct_id;
    this.otherpayObj['create_user_id'] = this.erpUser.user_id;
    this.spinner.show();
    var resp = await this.payableService.updateOtherPayment(this.otherpayObj);
    if (resp['error'] == false) {
      this.otherpayObj = {};
      this.spinner.hide();
      this.getAllOtherPayment();
      this.snackBar.open("Other Pay Update Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while updating Other Pay  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}
