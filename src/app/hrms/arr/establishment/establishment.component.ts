import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishService } from '../../service/establish.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';

import { MainService } from '../../service/main.service';
import { min } from 'moment';
declare var $: any
@Component({
  selector: 'app-establishment',
  templateUrl: './establishment.component.html',
  styleUrls: ['./establishment.component.css']
})
export class EstablishmentComponent implements OnInit {

  constructor(public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private estNewService: EstablishService, private _formBuilder: FormBuilder) { }
  personalInfoObj = {};
  erpUser;
  b_acct_id;
  allEmplyees = [];

  addselectEmpObj = {};
  newallEmplyees = []
  emp_id;
  
  flag = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;




  displayedColumns = ['emp_id', 'emp_name', 'establishment_type_code','designation_group_code', 'designation_code', 'cadre_code', 'class_code', 'pay_commission_code', 'grade_pay_code', 'pay_scale_code','level_code', 'retirement_age','emp_status_code','order_id','inc_month','joining_type_code','joining_date','notice_period'];
  datasource;

  addEstObj = {};
 


 

  Allleave = [];
  AllFixPay = [];
  allArr = [];
  empIdToName = {};

  errorFlag=false;
  updateObj = {}

  basic_pay;
  allRules = [];
  allMatrix=[];
  matrixObj={};
  allSalRule =[];
  allLeaveRule=[]
  dateToday="0000-00-00";
  baseArr=[];
  grade_pay=[];
  pay_scale=[];
  level =[]
  variablepayObj={};
  promotionArr=[];
  objectToSend={};
  basicObj={};
  async ngOnInit() {



    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getAllMatrix();
    await this.getAllPayRules();
    await this.getAllLeaveRules();
    await this.getDate();
    await this.getAllBasic()
    
    //await this.SalaryComponetDefination();


  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  //Reference Data
  async getDate(){
    var resp = await this.estNewService.getDate();
    if(resp['error'] == false){
      this.dateToday = resp.data;
    }else{

    }
  }
  async getAllLeaveRules(){
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    var resp = await this.estNewService.getAllRules(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allLeaveRule = resp.data;
    } else {
     
      this.snackBar.open("Error while getting  all Leave Rule list", 'Error', {
        duration: 5000
      });
    }
  }
  async getAllPayRules(){
    this.spinner.show()
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = '2090-10-10';
    obj['status'] = ['ACTIVE']
    var resp = await this.estNewService.getComponentDefinition(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allSalRule = resp.data;
      
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all salary component list", 'Error', {
        duration: 5000
      });
    }
  }
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
    } else {
      this.spinner.hide()
      this.snackBar.open(resp.data, 'Error', {
        duration: 5000
      });
    }
  }
  changeGradePay(){
    this.baseArr=[];
    if(this.matrixObj[this.addEstObj['grade_pay_code']] !=undefined){
      this.baseArr = this.matrixObj[this.addEstObj['grade_pay_code']];


    }
    this.addEstObj['basic_pay'] = undefined;

  }
  //Actual Get
  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.estNewService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()      
      arr = resp.data
      
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
       this.allEmplyees.push(obj)
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

  async getAllArrangementOfParty() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.emp_id;

    var resp = await this.estNewService.getEstablishementInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allArr = resp.data;
      this.spinner.hide()
      for (let i = 0; i < this.allArr.length; i++) {
        this.allArr[i]['tempjoining_date'] = this.mainService.dateformatchange(this.allArr[i]['joining_date'])
        
      }
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

  async changeEmployee() {
    for(var i=0;i<this.allEmplyees.length;i++){
      if(this.allEmplyees[i].emp_id == this.emp_id){
        this.addEstObj = this.allEmplyees[i];
      }
    }
    var startdt;
    if(this.addEstObj['joining_time'] == 'MORNING'){
      startdt = this.addEstObj['joining_date'].split(' ')[0];
    }else{
      startdt = this.addOneDay(this.addEstObj['joining_date'].split(' ')[0]);

    }
    this.addEstObj['start_dt'] = startdt;
    this.updateObj = Object.assign(this.addEstObj);
    this.baseArr=[];
    if(this.matrixObj[this.addEstObj['pay_scale_code']+this.addEstObj['grade_pay_code']+this.addEstObj['level_code']] !=undefined){
      this.baseArr = this.matrixObj[this.addEstObj['pay_scale_code']+this.addEstObj['grade_pay_code']+this.addEstObj['level_code']];


    }
    if(this.updateObj['uniform_ind']!=null && this.updateObj['uniform_ind']!=undefined){
      this.updateObj['uniform_ind'] = this.updateObj['uniform_ind'].toString()
      this.updateObj['inc_month'] = this.updateObj['inc_month'].toString()
      this.updateObj['retirement_age'] = this.updateObj['retirement_age'].toString()
      this.updateObj['family_planning'] = this.updateObj['family_planning'].toString()
      this.updateObj['grade_pay_code'] = parseInt(this.updateObj['grade_pay_code']);
      this.updateObj['level_code'] = parseInt(this.updateObj['level_code'])
      this.updateObj['basic_pay'] = this.updateObj['basic_pay'].toString()
    }
    
  }
  async changeEmployee1() {

    for(var i=0;i<this.allEmplyees.length;i++){
      if(this.allEmplyees[i].emp_id == this.emp_id){
        this.addEstObj = this.allEmplyees[i];
      }
    }
    this.updateObj = Object.assign(this.addEstObj);
    var emp_id = this.updateObj['emp_id'];
    this.updateObj['basic_pay1'] = this.basicObj[emp_id];
    this.baseArr=[];
    if(this.matrixObj[this.addEstObj['grade_pay_code']] !=undefined){
      this.baseArr = this.matrixObj[this.addEstObj['grade_pay_code']];


    }
    if(this.updateObj['uniform_ind']!=null && this.updateObj['uniform_ind']!=undefined){
      this.updateObj['uniform_ind'] = this.updateObj['uniform_ind'].toString()
      this.updateObj['inc_month'] = this.updateObj['inc_month'].toString()
      this.updateObj['retirement_age'] = this.updateObj['retirement_age'].toString()
      this.updateObj['family_planning'] = this.updateObj['family_planning'].toString()
      this.updateObj['grade_pay_code'] = parseInt(this.updateObj['grade_pay_code']);
      this.updateObj['level_code'] = parseInt(this.updateObj['level_code'])
      this.updateObj['basic_pay'] = this.updateObj['basic_pay'].toString()
    }

    
  }
  async getAllBasic(){
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = this.dateToday.split(' ')[0];
    var resp = await this.estNewService.getPartyFixedPay(obj);
    if(resp['error'] == false){
      this.spinner.hide()
        var dt = resp['data'];
        for(var i=0;i<dt.length;i++){
          if(dt[i]['pay_component_code']=='BASIC'){
            this.basicObj[dt[i]['emp_id']] = dt[i]['pay_component_amt']

          }
        }
      
    }else{
      this.spinner.hide()      
      swal.fire("Error","Error while getting basic pay",'error')
    }
  }
  async updateArangment() {
    this.spinner.show()
    this.updateObj['b_acct_id'] = this.b_acct_id;
    this.updateObj['create_user_id'] = this.erpUser.user_id;
    this.updateObj['emp_status_code'] = "ACTIVE";
    var resp_arr = await this.estNewService.updateAllEstablishmentInfo(this.updateObj);

    if (resp_arr['error'] == false) {
      this.spinner.hide()
      $('.nav-tabs a[href="#tab-1"]').tab('show');
      this.updateObj = {}
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
  // Calculation and Save..........................
 
  async saveArangment() {
    this.promotionArr =[];
    this.Allleave = [];
    this.AllFixPay = [];
    var empInfo = new Object();
    empInfo['b_acct_id'] = this.b_acct_id;
    empInfo['emp_id'] = this.emp_id;
    var resp = await this.estNewService.getEmployeePersonalInfo(JSON.stringify(empInfo));
    if(resp['error'] == false){
      this.personalInfoObj = resp.data[0];
    }else{
      swal.fire('Error','Error while getting employee date of birth','error');
    }

    //*****************************************Fixed Pay Calculation */
    
    var salArr=[];
    var obj={};
    var obj1={};
    obj['BASIC'] = {amt: parseFloat(this.addEstObj['basic_pay']),pay_code:'PAY'};
    obj1['BASIC'] = parseFloat(this.addEstObj['basic_pay']);
    if(this.addEstObj['joining_type_code'] == 'DEPUTATION'){
      var mn =  0;
      if(this.personalInfoObj['emp_local_addr_dist'] == 'LKO'){
        mn = obj1['BASIC']*5/100;
        if(mn > 1500){
          mn = 1500;
        }
      }else{
        mn = obj1['BASIC']*10/100;
        if(mn > 3000){
          mn = 3000;
        }
      }
      
     
      obj['DEP'] = {amt: parseFloat(mn.toFixed(2)),pay_code:'PAY'};
      obj1['DEP'] = parseFloat(mn.toFixed(2));

    }else{
      obj['MED'] = {amt: 300,pay_code:'PAY'};
      obj1['MED'] = 300;
    }

    
    if(this.addEstObj['class_code'] == 'IV' && this.addEstObj['conv_code'] == 'CYCLE'){
      
      obj['CONV'] = {amt: 350,pay_code:'PAY'};
      obj1['CONV'] = 350;

    }
    if(this.addEstObj['class_code'] == 'III' && this.addEstObj['conv_code'] == 'MOTORCYCLE'){
      
      obj['CONV'] = {amt: 800,pay_code:'PAY'};
      obj1['CONV'] = 800;

    }
    if((this.addEstObj['class_code'] == 'I' || this.addEstObj['class_code'] == 'II')  && this.addEstObj['conv_code'] == 'CAR'){
      
      obj['CONV'] = {amt: 1600,pay_code:'PAY'};
      obj1['CONV'] = 1600;

    }
    for(var i=0;i<this.allSalRule.length;i++){

      var eff_dt = this.allSalRule[i].effective_dt.split('T')[0];
      
        var amt=0;
        var pay_code=this.allSalRule[i].pay_code;
        var effective_dt = eff_dt;
        if(this.allSalRule[i].rate_type == 'FIX'){
          amt = this.allSalRule[i].amount;
          obj1[this.allSalRule[i].component_code] = amt;
          obj[this.allSalRule[i].component_code] = {amt: amt,pay_code:this.allSalRule[i].pay_code};
         
        }else if(this.allSalRule[i].rate_type == 'PERCENTAGE'){
          amt = 0;
          var arr = this.allSalRule[i].dependent_component.split(',');
          for(var j=0;j<arr.length;j++){
            if(obj1[arr[j]] == undefined){
              obj1[arr[j]]=0;
            }
            amt += obj1[arr[j]];
            
          }
          amt = parseFloat((amt* this.allSalRule[i].amount/100).toFixed(2));
          obj1[this.allSalRule[i].component_code] = amt;
          obj[this.allSalRule[i].component_code] = {amt: amt,pay_code:this.allSalRule[i].pay_code};


        }else{
          if(this.allSalRule[i].upper_limit>= this.addEstObj['grade_pay_code'] && this.allSalRule[i].lower_limit<=this.addEstObj['grade_pay_code']){
            obj[this.allSalRule[i].component_code] = {amt: this.allSalRule[i].amount,pay_code:this.allSalRule[i].pay_code};
            obj1[this.allSalRule[i].component_code] = this.allSalRule[i].amount;;

          }
        }
       
       
    } 
    this.AllFixPay =[];
    if(this.addEstObj['class_code'] == 'IV' && this.addEstObj['uniform_ind'] == '1'){

      obj['WA'] = {amt: 50,pay_code:'PAY'};
      obj1['WA'] = 50;

    }else{
      obj['WA'] = {amt: 0,pay_code:'PAY'};
      obj1['WA'] = 0;
    }
    var comp=Object.keys(obj);
    for(var i=0;i<comp.length;i++){
      var ob={};
      ob['b_acct_id'] = this.b_acct_id;
      ob['emp_id'] = this.emp_id;
      ob['effective_start_dt'] = this.addEstObj['start_dt'];
      ob['effective_end_dt'] = "2090-10-10"
      ob['status'] = 'ACTIVE';
      ob['create_user_id'] = this.erpUser.user_id;
      ob['component_status_code'] = 'ACTIVE';
      ob['pay_component_code'] = comp[i];
      if(ob['pay_component_code'] == 'NPS'){
        ob['pay_component_amt'] = Math.round(obj[comp[i]].amt);

      }else{
        ob['pay_component_amt'] = obj[comp[i]].amt;

      }
      ob['pay_code'] = obj[comp[i]].pay_code;
      this.AllFixPay.push(ob);
    }
    
    for(var i=0;i<this.AllFixPay.length;i++){
      for(var j=i+1;j<this.AllFixPay.length;j++){
        if(this.AllFixPay[i].pay_component_code == this.AllFixPay[j].pay_component_code){
          this.AllFixPay[i].effective_end_dt = this.AllFixPay[j].effective_start_dt;
        }
      }
    }
    
    //*************************************Leave Calculation */
    this.Allleave =[];
    var x= this.dateToday.split('-');
    for(var i=0;i<this.allLeaveRule.length;i++){
      var ob = {}
      ob['emp_id'] = this.emp_id;
      ob['leave_code'] = this.allLeaveRule[i].leave_code;
      ob['leave_rate'] = this.allLeaveRule[i].leave_rate;
      ob['is_leave_carry_fwd'] = this.allLeaveRule[i].is_leave_carry_fwd;
      ob['renew_ind_on_year_change'] = this.allLeaveRule[i].renew_ind_on_year_change;
      ob['year'] = parseInt(x[0]); 
      ob['month'] = parseInt(x[1]); 
      ob['num_of_leaves'] = this.allLeaveRule[i].num_of_leaves;
      ob['leaves_remaining'] = this.allLeaveRule[i].num_of_leaves;
      ob['adjust_remaining_leaves'] = 0;
      ob['carry_forward_leaves'] = 0;
      ob['create_user_id'] = this.erpUser.user_id;
      this.Allleave.push(ob);

     
    }
    //***************************************Arrear Calculation */
    var obj = {};

    for(var i=0;i<this.AllFixPay.length;i++){
      obj[this.AllFixPay[i].pay_component_code] = this.AllFixPay[i];
    }
    var arrear=0;
    var keys = Object.keys(obj);
    for(var i=0;i<keys.length;i++){
      if(obj[keys[i]].pay_code == 'PAY'){
        arrear = arrear + obj[keys[i]].pay_component_amt;
      }
    }

    var Difference_In_Time = new Date(this.dateToday).getTime() - new Date(this.addEstObj['start_dt']).getTime(); 
    
    var num_of_days = Difference_In_Time / (1000 * 3600 * 24);
    arrear = arrear * num_of_days/30;
    this.variablepayObj['pay_component_amt'] = 0;
    var year = this.addEstObj['start_dt'].split('-');
    this.variablepayObj['b_acct_id'] = this.b_acct_id;
    this.variablepayObj['emp_id'] = this.emp_id;
    this.variablepayObj['pay_status_code'] = 'ACTIVE';
    this.variablepayObj['pay_component_code'] = 'JOINING ARREAR';
    if(arrear != undefined && arrear >0){
      this.variablepayObj['pay_component_amt'] = parseFloat(arrear.toFixed(2));

    }
    this.variablepayObj['pay_code'] = 'PAY';
    this.variablepayObj['pay_type'] = 'ARREAR';
    this.variablepayObj['create_user_id'] = this.erpUser.user_id;
    this.variablepayObj['pay_status_code'] = 'ACTIVE';
    this.variablepayObj['fin_year'] = year[0];
    this.variablepayObj['month'] = year[1];
    //*******************************Promotion Calculation */

    if(this.addEstObj['promotion_type_code'] != undefined && this.addEstObj['promotion_type_code']!=null && this.addEstObj['promotion_type_code']!='NA'){
      var x = this.addEstObj['promotion_type_code'].split('-');
      for(var i=0;i<x.length;i++){
        var dt = this.convert(this.add_years(this.addEstObj['joining_service_date'],x[i]));
        var ob2 = new Object();
        ob2['grade_pay_code'] = '0'
        ob2['emp_id'] = this.addEstObj['emp_id'];
        ob2['promotion_status'] = 'SCHEDULED'
        ob2['promotion_type_code'] = 'ACP'
        ob2['order_id'] = this.addEstObj['order_id']
        ob2['promotion_interval'] = x[i];
        ob2['promotion_date'] = dt;
        ob2['create_user_id'] = this.erpUser.user_id;
        ob2['promotion_effective_dt'] = dt;
        ob2['level_code'] = '0'
        ob2['basic_pay'] = '0'
        ob2['pay_scale_code'] = '0'
        this.promotionArr.push(ob2);

      }

    }





    //******************************************Retirement Date Calculation */
    
    var dt = this.addSixtyYears(this.personalInfoObj['emp_dob'],this.addEstObj['retirement_age']);
    this.addEstObj['retirement_date'] = dt;

    
    
    

    
    
  }
  

  addSixtyYears(dt,age) {
    dt = new Date(dt);
    age = parseInt(age)
    var date=new Date(dt.setFullYear(dt.getFullYear() + age))
    var returmDate=""
    var mnth;
    var day;
    if(date.getDate()==1){
        date=new Date(date.setDate(date.getDate() - 1))
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
         returmDate= [date.getFullYear(), mnth, day].join("-");
    }else{
        mnth = ("0" + (date.getMonth() + 2)).slice(-2)
         date= new Date([date.getFullYear(), mnth, "01"].join("-"));
         date=new Date(date.setDate(date.getDate() - 1))
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
         returmDate= [date.getFullYear(), mnth, day].join("-");
    }
   
   return returmDate;
  }
  addOneDay(dt) {
    var tomorrow = new Date(dt);

    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];

  }
  add_years(dt, n) {
    n = parseInt(n)
    dt = new Date(dt);
    return new Date(dt.setFullYear(dt.getFullYear() + n));
  }
  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }


  

  deleteFixPay(i){
    this.AllFixPay.splice(i,1);
  }
  deleteLeave(i) {
    this.Allleave.splice(i, 1)
  }



  async  allDone() {
    this.spinner.show()
    this.objectToSend ={};
    this.objectToSend ['b_acct_id'] = this.b_acct_id;
    this.addEstObj['emp_status_code'] = 'ACTIVE';
    this.objectToSend ['establishment_info'] = this.addEstObj;
    this.objectToSend ['fixed_pay_amount'] = {b_acct_id: this.b_acct_id,fixed_pay_info: this.AllFixPay,end_dt: '2090-10-10'};
    this.objectToSend ['leave_info'] = this.Allleave;
    this.objectToSend ['variable_pay'] = this.variablepayObj;
    this.objectToSend ['promotion'] = this.promotionArr;
    //this.spinner.show();
    
    var resp = await this.estNewService.addNewEstabishment(this.objectToSend);
    if (resp['error'] == false) {
      this.spinner.hide()
      await this.getAllEmployees();
      swal.fire("Success","Employee Activated",'success')

    } else {
      this.spinner.hide()
      swal.fire("Error","Error occurred",'error')
    }

    
    
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }




}
