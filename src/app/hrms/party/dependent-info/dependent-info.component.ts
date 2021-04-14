import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import {AllEmpService} from '../../service/all-emp.service';
import {MainService} from '../../service/main.service';
declare var $: any
import swal from 'sweetalert2';


@Component({
  selector: 'app-dependent-info',
  templateUrl: './dependent-info.component.html',
  styleUrls: ['./dependent-info.component.css']
})
export class DependentInfoComponent implements OnInit {

  constructor(public mainService: MainService,private spinner: NgxSpinnerService,private snackBar: MatSnackBar,private allEmpService : AllEmpService) { }
  personalInfoObj={};
  errorMsg = ''
  erpUser;
  user_id;
  b_acct_id;
  allEmployees=[];
  selectEmpObj={};
  selectedEmpEducation=[];
  eductionObj={};
  dependentObj={};
  allEmplyees_new = []
  selectedEmpDependent=[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
 
  displayedColumns = ['dependent_name', 'relation_code', 'action'];
  datasource;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id=this.erpUser.user_id;
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
        obj['emp_name']=this.mainService.accInfo['account_short_name']+ this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.allEmplyees_new.push(obj)
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list" ,'Error',{
        duration:5000
      });
    }
  }
  async changeEmployee(){
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    this.spinner.show();
    var resp = await this.allEmpService.getDependentInfo(obj);
    this.selectedEmpDependent=[];
    this.eductionObj={};
    if (resp['error'] == false) {
      this.spinner.hide()
      this.selectedEmpDependent = resp.data;
        this.datasource = new MatTableDataSource(this.selectedEmpDependent)
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort
      
      
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list" ,'Error',{
        duration:5000
      });
    }
  }

  openUpdate(element){
    this.errorMsg = ''
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.dependentObj=Object.assign({},element);

  }
  async submitDependentInfo(){
    this.errorMsg = ''
    if (
      this.dependentObj['dependent_name'] == "" || this.dependentObj['dependent_name'] == undefined
      || this.dependentObj['relation_code'] == "" || this.dependentObj['relation_code'] == undefined
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
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        if (result.value) {
          this.finalsubmitDependentInfo()
        }
      })


    }
  }
  async finalsubmitDependentInfo(){
    this.dependentObj['b_acct_id']=this.b_acct_id;
    this.dependentObj['emp_id']=this.selectEmpObj['emp_id'];
    this.dependentObj['create_user_id']=this.user_id;
    this.spinner.show();
    var resp = await this.allEmpService.addDependentInfo(this.dependentObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
     
      swal.fire("Yaaay","Dependent Info Added",'success');

    } else {
      this.spinner.hide();
     
      swal.fire("Sorry","...Some Error Occured!",'error');
    }
  }

  async updateDependentInfo(){
    this.errorMsg = ''
    if (
      this.dependentObj['dependent_name'] == "" || this.dependentObj['dependent_name'] == undefined
      || this.dependentObj['relation_code'] == "" || this.dependentObj['relation_code'] == undefined
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
          this.finalupdateDependentInfo()
        }
      })


    }
  }
  async finalupdateDependentInfo(){

    var  obj= new Object();
    obj = Object.assign({},this.dependentObj)
    obj['b_acct_id']=this.b_acct_id;
    obj['update_user_id']=this.user_id;
    
    this.spinner.show();
    var resp = await this.allEmpService.updateDependentInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
    
      swal.fire("Yaaay","Dependent Info Updated",'success');

      
    } else {
      this.spinner.hide();
      swal.fire("Sorry","...Some Error Occured!",'error');

    }
  }

  async deleteDependent(element){
    var obj=new Object();

    obj['b_acct_id']=this.b_acct_id;
    obj['id']=element['id'];
    this.spinner.show();
    var resp = await this.allEmpService.deleteDependentInfo((obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
      swal.fire("Yaaay","Dependent Info Deleted",'success');

      
    } else {
      this.spinner.hide();
      swal.fire("Sorry","...Some Error Occured!",'error');

    }
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  chamgeTab() {
    this.errorMsg = ''
    this.dependentObj = {}
  }
}
