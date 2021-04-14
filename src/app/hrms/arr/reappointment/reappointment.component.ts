import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import {AllEmpService} from '../../service/all-emp.service';
import {MainService} from '../../service/main.service';
import {EstablishService} from '../../service/establish.service';
declare var $: any
@Component({
  selector: 'app-reappointment',
  templateUrl: './reappointment.component.html',
  styleUrls: ['./reappointment.component.css']
})
export class ReappointmentComponent implements OnInit {

 
  constructor(public mainService: MainService, private estNewService:EstablishService ,private allEmpService: AllEmpService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private estabService: EstablishmentService) { }
  erpUser;
  b_acct_id;
  user_id;

  allEmployees = [];
  selectEmpObj = {};
  codeValueTechObj = {};
  reappointmentArr = [];
  allArr=[]
  employeeObj={};
  updateObj={}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['arr_id', 'party_name', 'effective_timestamp','order_id'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getAllMatrix()
    // await this.getAllCurrentArrangements();
  }
  allMatrix=[]
  matrixObj={}
  level=[]
  grade_pay=[]
  pay_scale=[]
  async getAllMatrix(){
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.estNewService.getMatrix(JSON.stringify(obj));
    var grade_pay_obj={};
    var lvlArr=[];
    var gradePayArr=[]
    var payScaleArr=[]
    var pay_band_obj={};
    var lvl_obj={};
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allMatrix = resp.data;
      for(var i=0;i<this.allMatrix.length;i++){
        if(grade_pay_obj[this.allMatrix[i].grade_pay_code] == undefined){
          gradePayArr.push({code:this.allMatrix[i].grade_pay_code,value: this.allMatrix[i].grade_pay_code});
          grade_pay_obj[this.allMatrix[i].grade_pay_code]='1';
        }
        if(pay_band_obj[this.allMatrix[i].pay_band] == undefined){
          payScaleArr.push({code:this.allMatrix[i].pay_band,value: this.allMatrix[i].pay_band});
          pay_band_obj[this.allMatrix[i].pay_band]='1';
        }
        if(lvl_obj[this.allMatrix[i].level_code] == undefined){
          lvlArr.push({code:this.allMatrix[i].level_code,value: this.allMatrix[i].level_code});
          lvl_obj[this.allMatrix[i].level_code]='1';
        }

        if(this.matrixObj[this.allMatrix[i].grade_pay_code]==undefined){
          this.matrixObj[this.allMatrix[i].grade_pay_code]=[]
        }
        this.matrixObj[this.allMatrix[i].grade_pay_code].push({code:this.allMatrix[i].basic_pay.toString(),value:this.allMatrix[i].basic_pay.toString()});
      }
      this.level = lvlArr;
      this.grade_pay = gradePayArr;
      this.pay_scale = payScaleArr;
      console.log(this.grade_pay)
      console.log(this.pay_scale)
    } else {
      this.spinner.hide()
      this.snackBar.open(resp.data, 'Error', {
        duration: 5000
      });
    }
  }
  baseArr=[]
  async getAllCurrentArrangements() {
    this.spinner.show();
    this.reappointmentArr = [];
    this.allArr =[];
    let obj=new Object()
    obj['b_acct_id']=this.b_acct_id
    obj['emp_id']=this.updateObj['emp_id']
    var resp = await this.estNewService.getCurrentEstablishementInfo(JSON.stringify(obj));
    console.log(resp)
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allArr = resp.data;
      this.updateObj=this.allArr[0]
      // retirement_age
      this.updateObj['grade_pay_code']=Number(this.updateObj['grade_pay_code'])
      this.updateObj['retirement_age']=this.updateObj['retirement_age'].toString()
      this.updateObj['basic_pay']=this.updateObj['basic_pay'].toString()
      this.baseArr=[];
      if(this.matrixObj[this.updateObj['grade_pay_code']] !=undefined){
        this.baseArr = this.matrixObj[this.updateObj['grade_pay_code']];
      }
      console.log(this.updateObj)
      this.datasource = new MatTableDataSource(this.allArr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting All DEATHS", 'Error', {
        duration: 5000
      });
    }
  }
  async getAllArrangementOfParty() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.updateObj['emp_id'];

    var resp = await this.estNewService.getEstablishementInfo(JSON.stringify(obj));
    console.log(resp)
    if (resp['error'] == false) {
      this.allArr = resp.data;
      for(let i=0;i<this.allArr.length;i++){
        
      }
      this.spinner.hide()      
      this.datasource = new MatTableDataSource(this.allArr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }

  }

  getCurrentArrangementOfSelected(){
    for(var i=0;i<this.allArr.length;i++){
      if(this.allArr[i].party_id == this.updateObj['party_id']){
        this.updateObj = this.allArr[i];
      }
    }
  }
  empIdToName={}
  allEmplyees=[]
  newallEmplyees=[]
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['party_status_code'] = ["JOINING", "JOINED", "LEFT"];
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
    console.log(resp)
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmployees = resp.data;
      for (let i=0; i<this.allEmployees.length ;i++){
        this.employeeObj[this.allEmployees[i]['party_id']]=this.allEmployees[i]['party_name'];
      }
      this.newallEmplyees = []
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      for (var i = 0; i < this.newallEmplyees.length; i++) {
        this.empIdToName[this.newallEmplyees[i].emp_id] = this.newallEmplyees[i].joining_date;
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }

  async submitReappointment(){
    this.spinner.show()
    this.updateObj['b_acct_id'] = this.b_acct_id;
    this.updateObj['create_user_id'] = this.erpUser.user_id;
    this.updateObj['arr_status_code'] = "REAPPOINTED";
    var resp_arr = await this.estNewService.updateAllEstablishmentInfo(this.updateObj);
    if (resp_arr['error'] == false) {
      this.spinner.hide()
      await this.getAllCurrentArrangements();
      this.snackBar.open(resp_arr.data, 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide()
      this.snackBar.open(resp_arr.data, 'Error', {
        duration: 5000
      });
    }
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }



}
