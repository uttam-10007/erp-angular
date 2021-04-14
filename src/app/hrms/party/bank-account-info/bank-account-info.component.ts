import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { AllEmpService } from '../../service/all-emp.service'
import swal from 'sweetalert2';

import { MainService } from '../../service/main.service';
declare var $: any
@Component({
  selector: 'app-bank-account-info',
  templateUrl: './bank-account-info.component.html',
  styleUrls: ['./bank-account-info.component.css']
})
export class BankAccountInfoComponent implements OnInit {

  constructor(public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private allEmpService: AllEmpService) { }
  errorMsg = ''

  b_acct_id;
  user_id;
  id_obj = {};
  datasource;
  bankaccObj = {};
  selectEmpObj = {};
  allEmployees = [];
  selectedbankObj = [];
  erpUser;
  codeValueTechObj = {};
  allEmplyees_new = [];
  emp_id = 0;
  displayedColumns = ['bank_code', 'branch_code', 'ifsc_code', 'acct_no', 'pf_acct_no', 'action'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllEmployees();
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    //obj['party_status_code'] = ["JOINING", "JOINED","LEFT"];
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        this.allEmployees.push(obj)
      } 
      this.allEmplyees_new=[];
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.allEmplyees_new.push(obj)
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  async changeEmployee() {
    this.emp_id = this.selectEmpObj['emp_id']
    for(var i=0;i<this.allEmployees.length;i++){
      if(this.allEmployees[i].emp_id == this.selectEmpObj['emp_id']){
        this.bankaccObj = this.allEmployees[i];
      }
    }
  }
  openUpdate() {
    this.errorMsg = ''
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    

  }

  async addBankAcctInfo() {
    
 

      swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        if (result.value) {
          this.finaladdBankAcctInfo()
        }
      })


    
  }
  async finaladdBankAcctInfo() {
    this.bankaccObj['b_acct_id'] = this.b_acct_id;
    this.bankaccObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.bankaccObj['create_user_id'] = this.user_id;
    //var myDate = new Date();
    //this.bankaccObj['effective_dt']= myDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })

    this.spinner.show();
    var resp = await this.allEmpService.updatePersonalInfo(this.bankaccObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee()

      swal.fire("Yaaay", "Bank Info Added",'success');


    } else {
      this.spinner.hide();
      swal.fire("Sorry", "...Some error occured!",'error');

    }
  }

  async updateBankAcctInfo() {
    this.errorMsg = ''
    if (
      this.bankaccObj['bank_code'] == "" || this.bankaccObj['bank_code'] == undefined
      || this.bankaccObj['branch_code'] == "" || this.bankaccObj['branch_code'] == undefined
      || this.bankaccObj['ifsc_code'] == "" || this.bankaccObj['ifsc_code'] == undefined
      || this.bankaccObj['acct_no'] == "" || this.bankaccObj['acct_no'] == undefined
      || this.bankaccObj['pf_acct_no'] == "" || this.bankaccObj['pf_acct_no'] == undefined
    ) {

      this.errorMsg = "* fields required."


    }
    else {

      swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Update it!'
      }).then((result) => {
        if (result.value) {
          this.finalupdateBankAcctInfo()
        }
      })


    }
  }
  async finalupdateBankAcctInfo() {

    this.bankaccObj['b_acct_id'] = this.b_acct_id;
    this.bankaccObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.bankaccObj['update_user_id'] = this.user_id;

    this.spinner.show();
    var resp = await this.allEmpService.updatePersonalInfo(this.bankaccObj);
    if (resp['error'] == false) {
      this.getAllEmployees();
      this.spinner.hide();
      await this.changeEmployee()
      swal.fire("Yaaay", "Bank Info Updated",'success');


    } else {
      this.spinner.hide();
      swal.fire("Sorry", "...Faiz will check the error!",'error');

    }
  }

  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  chamgeTab() {
    this.errorMsg = ''
  }

}
