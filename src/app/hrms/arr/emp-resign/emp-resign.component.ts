import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import {MainService} from '../../service/main.service';
import { JsonPipe } from '@angular/common';
declare var $: any

@Component({
  selector: 'app-emp-resign',
  templateUrl: './emp-resign.component.html',
  styleUrls: ['./emp-resign.component.css']
})
export class EmpResignComponent implements OnInit {

  constructor(public mainService : MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private allEmpServ: EstablishmentService) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id', 'emp_name', 'resignation_date', 'notice_period', 'resignation_status', 'action'];
  datasource;
  employeeObj={};
  erpUser;
  b_acct_id;
  ERObj = {};
  selectEmpObj = {};
  completeERObj={};
  allEmployees = [];
  employeeIdtoName = {};
  allArr=[]
  newallEmplyees = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getResignedEmployee();
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['party_status_code'] = ["JOINING", "JOINED", "LEFT"];
    var resp = await this.allEmpServ.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmployees = resp.data;
      
      this.newallEmplyees = []
      for(let i=0;i<this.allEmployees.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.allEmployees[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      for (let i=0; i<this.allEmployees.length ;i++){
        this.employeeObj[this.allEmployees[i]['emp_id']]=this.allEmployees[i]['emp_name'];
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  async getResignedEmployee() {
    this.spinner.show()
var arr = []
var resignarr = []
    var resp = await this.allEmpServ.getAllResignation(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data
      
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
       resignarr.push(obj)
      }
      this.datasource = new MatTableDataSource(resignarr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  /* async getAllCurrentArrangements() {
    this.spinner.show();
    this.allArr =[];
    var resp = await this.allEmpServ.getAllCurrentArrangements(this.b_acct_id);
    if (resp['error'] == false) {
      this.allArr = resp.data;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting All DEATHS", 'Error', {
        duration: 5000
      });
    }
  } */
  /* getCurrentArrangementOfSelected(){
    for(var i=0;i<this.allArr.length;i++){
      if(this.allArr[i].emp_id == this.ERObj['emp_id']){
        this.ERObj['arr_id'] = this.allArr[i].arr_id;
      }
    }
  } */
  /* getArrangementStatus(){
    var arr_status_code=""
    for(var i=0;i<this.allArr.length;i++){
      if(this.allArr[i].emp_id == this.ERObj['emp_id']){
        arr_status_code = this.allArr[i].emp_status_code;
      }
    }
    return arr_status_code;
  } */
  async addResignation() {
    this.spinner.show()
    this.ERObj['b_acct_id'] = this.b_acct_id;
    this.ERObj['emp_id'] = this.selectEmpObj;
    this.ERObj['resignation_status'] = "APPLIED";
    var resp = await this.allEmpServ.addResign(this.ERObj);
    if (resp['error'] == false) {
      this.ERObj={};
      await this.getResignedEmployee();
      this.spinner.hide();
      this.snackBar.open("Employee Resgination Applied Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Applying Resignation Of Employee", 'Error', {
        duration: 5000
      });
    }

  }


  openUpdate(element) {
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.ERObj = Object.assign({}, element);
  }

  async approveResignation() {
    this.spinner.show();
    this.ERObj['b_acct_id'] = this.b_acct_id;
    this.ERObj['resignation_approval_user_id']  = this.erpUser.user_id;
    this.ERObj['create_user_id']  = this.erpUser.user_id;
    this.ERObj['emp_status_code'] = "NOTICE PERIOD"
        var resp = await this.allEmpServ.approveResignation(this.ERObj);
    if (resp['error'] == false) {
      await this.getResignedEmployee();
      this.spinner.hide()
      this.snackBar.open("Approved Employee Resignation", 'Success', {
        duration: 5000
      });
    } else {

      this.spinner.hide()
      this.snackBar.open("Error while getting employee resignation approve", 'Error', {
        duration: 5000
      });
    }

  }


  complete(element) {
    $('.nav-tabs a[href="#tab-4"]').tab('show');
    this.completeERObj = Object.assign({}, element);
  }


  async completeResignation() {
    this.spinner.show();
    var obj= new Object();
    obj['b_acct_id']=this.b_acct_id;
    obj['id']=this.completeERObj['id'];
    obj['calculation_id']=this.completeERObj['calculation_id'];
    obj['emp_id']=this.completeERObj['emp_id'];
    for(let i=0;i<this.allEmployees.length;i++){
      if(this.allEmployees[i].emp_id==this.completeERObj['emp_id']){
        obj['emp_name']=this.allEmployees[i]['emp_name'];
        obj['emp_email']=this.allEmployees[i]['emp_email'];
      }
    }    
    var resp = await this.allEmpServ.resignationComplete(obj);
    if (resp['error'] == false) {
      await this.getResignedEmployee();
      this.spinner.hide()
      this.snackBar.open(" Employee Resignation Completed", 'Success', {
        duration: 5000
      });
    } else {

      this.spinner.hide()
      this.snackBar.open("Error while getting employee resignation complete", 'Error', {
        duration: 5000
      });
    }

  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
