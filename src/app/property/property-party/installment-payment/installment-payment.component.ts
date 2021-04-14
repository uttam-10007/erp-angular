import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ScheduleService } from '../../service/schedule.service';

import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstallmentService } from '../../service/installment.service';

declare var $: any;

@Component({
  selector: 'app-installment-payment',
  templateUrl: './installment-payment.component.html',
  styleUrls: ['./installment-payment.component.css']
})
export class InstallmentPaymentComponent implements OnInit {
  displayedColumns = ['arr_id', 'txn_amt', 'txn_date','txn_desc', 'action'];
  obj = {}
  arr_id_create = ''
  emiArr = [{}];
  erpUser;
  b_acct_id
  data;
  schemeArr;
  selectedSchemeCode = ''
  dataSource
  schemeObject = {}
  arr_id = ''
  costCodeArr = []
  scheduleArr = [];
  user_id
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private scheduleService: ScheduleService, private service: InstallmentService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }


  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id =this.erpUser.b_acct_id;
    this.user_id =this.erpUser.user_id;

  }


  async changeCost() {

    for (let i = 0; i < this.scheduleArr.length; i++) {
      if (this.obj['cost_code'] == this.scheduleArr[i]['cost_code']) {
        var amtArr = this.scheduleArr[i]['amount'].split(",")
        var emiArr = this.scheduleArr[i]['emi_code'].split(",")
        var arr = []

        for (let j = 0; j < emiArr.length; j++) {
          arr.push(Object.assign({}, { "emi_code": emiArr[j], "amount": amtArr[j], "schedule_date": "" }))
        }
        this.obj['data'] = arr;
      }

    }


  }
  async  fetch() {
    if (this.arr_id != '') {
      this.spinner.show()

      var obj = new Object;
      obj['b_acct_id'] = this.b_acct_id
      obj['arr_id'] = this.arr_id
      var resp = await this.service.getAllInstallmentPayments(obj);
      if (resp['error'] == false) {
        this.spinner.hide()
        this.data = resp.data;
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.sort = this.sort;

        this.dataSource.paginator = this.paginator;


      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Information", 'Error', {
          duration: 5000,
        });
      }

    }
  }


  async fetchInfo() {
    this.spinner.show()
    var obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['arr_id'] = this.arr_id_create
    var resp = await this.service.getInstallmentPaymentdata(obj);
    if (resp['error'] == false) {
      this.emiArr = resp.data;
     if( resp.data.length == 0){
      this.spinner.hide();
      this.snackBar.open("Already Completed All Installments", 'Error', {
        duration: 5000,
      });
     }
     else{
        this.obj['emi_code']=this.emiArr[0]['emi_code']
        this.obj['txn_amt']=this.emiArr[0]['amount']
     }
      

      this.spinner.hide()


    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Information", 'Error', {
        duration: 5000,
      });
    }
  }


  selectEmi() {
    for (let i = 0; i < this.emiArr.length; i++) {
      if (this.obj['emi_code'] == this.emiArr[i]['emi_code']) {
        this.obj['txn_amt'] = this.emiArr[i]['amount']
      }
    }
  }
  async addNew() {
   var obj=Object.assign({},this.obj)
   obj['b_acct_id'] = this.b_acct_id
   obj['create_user_id']=this.user_id
   obj['arr_id'] = this.arr_id_create
    
    this.spinner.show();
    var resp = await this.service.createInstallmentPayments(obj);
    if (resp['error'] == false) {

      this.obj = Object.assign({}, { data: [] })
      this.arr_id = ''
      this.spinner.hide();
      this.snackBar.open("Done Successfully", 'Success!', {
        duration: 5000,
      });
      
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
      //this.toastr.errorToastr(resp['data']);
    }

  }


  async edit(element, i) {


    this.obj = element


    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }










 
  async update() {
    var obj=Object.assign({},this.obj)
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id']=this.user_id
    this.spinner.show();
    var resp = await this.service.updateInstallmentPayment(obj);
    if (resp['error'] == false) {

this.fetch()
      this.spinner.hide();

      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.snackBar.open("Updated Successfully", 'Success!', {
        duration: 5000,
      });
      //this.toastr.successToastr('Updated Successfully')
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
      //this.toastr.errorToastr(resp['data']);
    }
  }
  refressadd() {
    this.obj = Object.assign({}, {})



  }

  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
