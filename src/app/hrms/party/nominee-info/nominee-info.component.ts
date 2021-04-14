import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { AllEmpService } from '../../service/all-emp.service';
import swal from 'sweetalert2';
import { MainService } from '../../service/main.service';

declare var $: any
@Component({
  selector: 'app-nominee-info',
  templateUrl: './nominee-info.component.html',
  styleUrls: ['./nominee-info.component.css']
})
export class NomineeInfoComponent implements OnInit {


  constructor(public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private allEmpService: AllEmpService) { }
  personalInfoObj = {};
  errorMsg = ''
  codeValueTechObj = {};

  erpUser;
  user_id;
  b_acct_id;
  allEmployees = [];
  selectEmpObj = {};
  selectedEmpNominee = [];
  nomineeObj = {};
  allEmplyees_new = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['nom_id', 'nom_name', 'nom_email', 'nom_phone_no','nominee_relation_code', 'nom_share', 'nom_bank_name', 'nom_branch_name', 'nom_ifsc_code', 'nom_bank_acct_no', 'action'];
  datasource;

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
var arr = []
this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
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
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    this.spinner.show();
    var resp = await this.allEmpService.getNominee(obj);
    this.selectedEmpNominee = [];
  
    if (resp['error'] == false) {
      this.spinner.hide()
      if (resp.data.length > 0) {
        this.selectedEmpNominee = resp.data;
        this.datasource = new MatTableDataSource(this.selectedEmpNominee)
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort
      }
      else {
        this.datasource = new MatTableDataSource(this.selectedEmpNominee)
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort
      }

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }

  openUpdate(element) {
    this.errorMsg = ''
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.nomineeObj = Object.assign({}, element);

  }

  async submitNomineeInfo() {
    this.errorMsg = ''
    if (
      this.nomineeObj['nom_name'] == "" || this.nomineeObj['nom_name'] == undefined
      || this.nomineeObj['nom_email'] == "" || this.nomineeObj['nom_email'] == undefined
      || this.nomineeObj['nom_phone_no'] == null || this.nomineeObj['nom_phone_no'] == undefined
      || this.nomineeObj['nom_bank_name'] == "" || this.nomineeObj['nom_bank_name'] == undefined
      || this.nomineeObj['nom_branch_name'] == "" || this.nomineeObj['nom_branch_name'] == undefined
      || this.nomineeObj['nom_ifsc_code'] == "" || this.nomineeObj['nom_ifsc_code'] == undefined
      || this.nomineeObj['nom_bank_acct_no'] == "" || this.nomineeObj['nom_bank_acct_no'] == undefined
      || this.nomineeObj['nom_share'] == null || this.nomineeObj['nom_share'] == undefined

    ) {

      this.errorMsg = "* fields required."
    }
    else if( this.nomineeObj['nom_phone_no'].toString().length != 10){
       
      this.errorMsg = "Incorrect Phone Number."
    }
    else {

      swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        if (result.value) {
          this.finalsubmitNomineeInfo()
        }
      })


    }
  }
  async finalsubmitNomineeInfo() {
    this.nomineeObj['b_acct_id'] = this.b_acct_id;
    this.nomineeObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.nomineeObj['create_user_id'] = this.user_id;
    this.spinner.show();
    var resp = await this.allEmpService.addNominee(this.nomineeObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
      swal.fire("Yaaay", "Nominee Info Added",'success');


    } else {
      this.spinner.hide();
      // this.snackBar.open("Error while Adding Nominee Info Of Employee", 'Error', {
      //   duration: 5000
      // });
      swal.fire("Sorry", "...Some Error Occured!",'error');

    }
  }

  async updateNomineeInfo() {
    this.errorMsg = ''
    if (
      this.nomineeObj['nom_name'] == "" || this.nomineeObj['nom_name'] == undefined
      || this.nomineeObj['nom_email'] == "" || this.nomineeObj['nom_email'] == undefined
      || this.nomineeObj['nom_phone_no'] == null || this.nomineeObj['nom_phone_no'] == undefined
      || this.nomineeObj['nom_bank_name'] == "" || this.nomineeObj['nom_bank_name'] == undefined
      || this.nomineeObj['nom_branch_name'] == "" || this.nomineeObj['nom_branch_name'] == undefined
      || this.nomineeObj['nom_ifsc_code'] == "" || this.nomineeObj['nom_ifsc_code'] == undefined
      || this.nomineeObj['nom_bank_acct_no'] == "" || this.nomineeObj['nom_bank_acct_no'] == undefined
      || this.nomineeObj['nom_share'] == null || this.nomineeObj['nom_share'] == undefined

    ) {

      this.errorMsg = "* fields required."
    }
    else if( this.nomineeObj['nom_phone_no'].toString().length != 10){
       
      this.errorMsg = "Incorrect Phone Number."
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
          this.finalupdateNomineeInfo()
        }
      })


    }
  }
  async finalupdateNomineeInfo() {

    this.nomineeObj['b_acct_id'] = this.b_acct_id;
    this.nomineeObj['update_user_id'] = this.user_id;
    this.spinner.show();
    var resp = await this.allEmpService.updateNominee(this.nomineeObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
      swal.fire("Yaaay", "Nominee Info Updated",'success');


    } else {
      this.spinner.hide();
      swal.fire("Sorry", "...Some Error Occured!",'error');

    }
  }

  async deleteEducation(element) {
    var obj = new Object();

    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    this.spinner.show();
    var resp = await this.allEmpService.deleteNominee((obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
     
      swal.fire("Yaaay", "Nominee Info Deleted",'success');

    } else {
      this.spinner.hide();
    
      swal.fire("Sorry", "Error while deleting Nominee Info Of Employee",'error');

    }
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  chamgeTab() {
    this.errorMsg = ''
    this.nomineeObj = {}
  }

}
