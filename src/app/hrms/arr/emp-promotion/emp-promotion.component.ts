import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { MainService } from '../../service/main.service';
import {SettingService} from '../../service/setting.service';
import Swal from 'sweetalert2';
import { element } from 'protractor';

declare var $: any

@Component({
  selector: 'app-emp-promotion',
  templateUrl: './emp-promotion.component.html',
  styleUrls: ['./emp-promotion.component.css']
})


export class EmpPromotionComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private settingService: SettingService,public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private establishmentService: EstablishmentService) { }

  displayedColumns = ['emp_id','emp_name', 'promotion_type_code', 'order_id', 'grade_pay_code','basic_pay', 'promotion_interval', 'promotion_date','effective_dt'];
  displayedColumns1 = ['emp_id', 'emp_name', 'next_promotion', 'next_promotion_date', 'action'];


    
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;
  intArr=[{code: '10',value:'FIRST'},{code: '16',value:'SECOND'},{code: '26',value:'THIRD'}]
  newallEmplyees
  datasource;
  datasource1;
  allMatrix = [];
  matrixObj = {};
  baseArr = []
  addEstObj = {};
  acpObj={};
  erpUser;
  b_acct_id = 11;
  promObj = {};
  allEmployeesObj = {};
  selectEmpObj = {};
  allPromotion = [];
  codeValueTechObj = {};
  allEmplyees = [];
  allCurrentArrangements = [];
  expPromotion = [];
  empNameMap;
  empServiceDateMap;
  selectedEstablishment={};

  gradePayArr = []
  payScaleArr = []
  levelArr = []
  basicPayArr = []
  htmlgradePayArr = []
  htmlpayScaleArr = []
  htmllevelArr = []
  htmlbasicPayArr = []
  htmlDesignationArr=[];
  scheduledPromotions=[]
  allPay=[];
  allBasicPay={};
  today='';
  dateToday;
  addDCPEstObj={};
  personalInfo={};
  salArr=[];
  allSCD=[]
  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getDate();
    await this.getAllActiveEmployees();
    await this.getPersonalInfo();
    await this.getAllSalaryComponentDefination();
    await this.getAllPromotions();
    await this.getAllMatrix();
    await this.getFixedPay();

    await this.buildExpectedPromotionArray();

  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllSalaryComponentDefination() {
  
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = '2090-10-10';
    obj['status'] = ['ACTIVE','INACTIVE'];
     var resp = await this.settingService.getAllSalaryCD(obj);
     if (resp['error'] == false) {
       this.allSCD = resp.data;
       
     } else {
       this.snackBar.open("Error while getting  all salary component list", 'Error', {
         duration: 5000
       });
     }
  }
  async addACP(){
    this.acpObj['b_acct_id'] = this.b_acct_id;
    this.acpObj['promotion_type_code'] = 'ACP';
    this.acpObj['order_id'] = 1;
    this.acpObj['grade_pay_code'] = 0;
    this.acpObj['create_user_id'] = this.erpUser.user_id;
    this.acpObj['promotion_status'] = 'SCHEDULED';
    this.spinner.show()
    var resp = await this.establishmentService.addACP(this.acpObj);

    if(resp['error'] == false){
      await this.getAllPromotions();
      await this.buildExpectedPromotionArray();

      this.spinner.hide();
      Swal.fire('Success','Successfully Added ACP','success');

    }else{
      this.spinner.hide();
      Swal.fire('Error','Error in Adding ACP','error');
    }
  }
  async deleteACP(element){
    var obj = new Object();

    obj['b_acct_id'] = this.b_acct_id;
    obj['promotion_id'] = element['promotion_id'];
    
    this.spinner.show()
    var resp = await this.establishmentService.deleteACP(obj);

    if(resp['error'] == false){
      await this.getAllPromotions();
      await this.buildExpectedPromotionArray();
      this.spinner.hide();
      Swal.fire('Success','Successfully Deleted ACP','success');

    }else{
      this.spinner.hide();
      Swal.fire('Error','Error in Deleting ACP','error');
    }
  }
  async getPersonalInfo() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getAllPartyFields(JSON.stringify(obj));
    if (resp['error'] == false) {
      var dt = resp.data;
      for (var i = 0; i < dt.length; i++) {
        this.personalInfo[dt[i].emp_id] = dt[i];
      }

    } else {
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }


  }
  async getDate(){
    var resp = await this.establishmentService.getDate();
    if(resp['error'] == false){
      this.dateToday = resp.data;
    }else{

    }
  }

 async  addEmpDCPPromotion(){
    this.addDCPEstObj['b_acct_id'] = this.b_acct_id;
    this.addDCPEstObj['create_user_id'] = this.erpUser.user_id;
    this.addDCPEstObj['promotion_status'] = "PROMOTED";
    this.spinner.show();
    var resp = await this.establishmentService.addDCPPromtion(this.addDCPEstObj);
    if (resp['error'] == false) {
      await this.incReq();
      await this.getAllActiveEmployees();
      await this.getAllPromotions();
      await this.buildExpectedPromotionArray();

      this.spinner.hide();
      Swal.fire('Success','Successfully Added Employee Promotion','success');
    } else {
      this.spinner.hide();
      Swal.fire('Error','Error while Adding DCP Promotion Info Of Employee','error');
      
    }
  }
  async calSalaryAfterAcp(establishment,promotionObj){
    var obj={};
    var obj1={};
    for(var i=0;i<this.allPay.length;i++){
      if(this.allPay[i]['emp_id'] == promotionObj['emp_id']){
        obj1[this.allPay[i]['pay_component_code']] = this.allPay[i]['pay_component_amt'];
      }
    }
    obj['BASIC'] = {amt: parseFloat(promotionObj['basic_pay']),pay_code:'PAY'};
    obj1['BASIC'] = parseFloat(promotionObj['basic_pay']);
    if(establishment['joining_type_code'] == 'DEPUTATION'){
      var mn =  0;
      if(this.personalInfo[establishment['emp_id']]['emp_local_addr_dist'] == 'LKO'){
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

    }
    for(var i=0;i<this.allSCD.length;i++){

      
        var amt=0;
        if(this.allSCD[i].rate_type == 'PERCENTAGE'){
          amt = 0;
          var arr = this.allSCD[i].dependent_component.split(',');
          for(var j=0;j<arr.length;j++){
            if(obj1[arr[j]] == undefined){
              obj1[arr[j]]=0;
            }
            amt += obj1[arr[j]];
            
          }
          amt = parseFloat((amt* this.allSCD[i].amount/100).toFixed(2));
          if(obj1[this.allSCD[i].component_code]!=undefined && obj1[this.allSCD[i].component_code]>amt){
            amt=obj1[this.allSCD[i].component_code];
          }
          obj1[this.allSCD[i].component_code] = amt;
          obj[this.allSCD[i].component_code] = {amt: amt,pay_code:this.allSCD[i].pay_code};


        }else{
          if(this.allSCD[i].upper_limit>= promotionObj['grade_pay_code'] && this.allSCD[i].lower_limit<=promotionObj['grade_pay_code']){
            obj[this.allSCD[i].component_code] = {amt: this.allSCD[i].amount,pay_code:this.allSCD[i].pay_code};
            obj1[this.allSCD[i].component_code] = this.allSCD[i].amount;;

          }
        }
       
       
    } 
    var fixPay =[];
    
    var comp=Object.keys(obj);
    for(var i=0;i<comp.length;i++){
      var ob={};
      ob['b_acct_id'] = this.b_acct_id;
      ob['emp_id'] = establishment['emp_id'];
      ob['effective_start_dt'] = promotionObj['promotion_date'];
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
      fixPay.push(ob);
    }
    this.salArr = fixPay;
  }

  async incReq(){
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['fixed_pay_info'] = this.salArr;
    obj1['end_dt'] = '2090-10-10';
    var resp = await this.settingService.addFixedPay(obj1);
    if (resp['error'] == false) {
      $('#myModal').modal('hide')
      $('#myModal1').modal('hide')
      
      
    } else {
      $('#myModal').modal('hide')
      $('#myModal1').modal('hide')
      this.spinner.hide();
      Swal.fire("Error","Error occurred while increment",'error')
      
      
    }
  }
  async getFixedPay(){
  
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = this.dateToday.split(' ')[0];
    var resp = await this.establishmentService.getAllFixedPay(obj);
    if(resp['error'] == false){
      this.allPay = resp.data;
      for(var i=0;i<this.allPay.length;i++){
        if(this.allPay[i].pay_component_code == 'BASIC'){
          this.allBasicPay[this.allPay[i].emp_id] = this.allPay[i].pay_component_amt;
        }
      }


    }else{
      this.spinner.hide()
      Swal.fire('Error','Error while getting employee salary','error')
    }
  }

  async buildExpectedPromotionArray() {
var arr = []
    this.expPromotion = []
    for (let i = 0; i < this.scheduledPromotions.length; i++){
      var obj = new Object;
      obj=this.scheduledPromotions[i]
      for (let j = 0; j < this.allCurrentArrangements.length; j++){
        if (this.allCurrentArrangements[j]['emp_id'] == this.scheduledPromotions[i]['emp_id']){
          obj['emp_name'] = this.allCurrentArrangements[j]['emp_name']
          obj['old_grade_pay_code'] = this.allCurrentArrangements[j]['grade_pay_code']
          obj['old_pay_scale_code'] = this.allCurrentArrangements[j]['pay_scale_code']
          obj['old_level_code'] = this.allCurrentArrangements[j]['level_code']
          obj['old_basic_pay'] = this.allBasicPay[this.allCurrentArrangements[j]['emp_id']]
          obj['old_designation_code']=this.allCurrentArrangements[j]['designation_code']

          this.expPromotion.push(obj)


        }
      }

    }
    arr = this.expPromotion
    var expPromotion = []
     for(let i=0;i<arr.length;i++){
      var obj=new Object();
      obj=Object.assign({},arr[i]);
     obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
      expPromotion.push(obj)
    }
    for (let i = 0; i < expPromotion.length; i++) {
      expPromotion[i]['temppromotion_date'] = this.mainService.dateformatchange(expPromotion[i]['promotion_date'])
      
    }
    this.datasource1 = new MatTableDataSource(expPromotion)
    this.datasource1.paginator = this.paginator1;
    this.datasource1.sort = this.sortCol2

  }

  async getAllActiveEmployees() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    // obj['emp_status_code'] = ['ACTIVE']
    var resp = await this.establishmentService.getArrayAllCurrentEstablishementInfo(obj);
    this.empServiceDateMap=new Map;
    this.empNameMap=new Map;
    if (resp['error'] == false) {
      this.allCurrentArrangements = resp['data'];
      this.allEmplyees = resp['data'];
     
      this.newallEmplyees = []
      for(let i=0;i<this.allEmplyees.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.allEmplyees[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      for (let i = 0; i < this.allCurrentArrangements.length; i++) {
        this.empNameMap.set(this.allCurrentArrangements[i]['emp_id'], this.allCurrentArrangements[i]['emp_name'])
        this.empServiceDateMap.set(this.allCurrentArrangements[i]['emp_id'], this.allCurrentArrangements[i]['joining_service_date']);
      }
    }
  }

 async  changeDCPEmployee(){
    for (let j = 0; j < this.allCurrentArrangements.length; j++){
      if (this.allCurrentArrangements[j]['emp_id'] == this.addDCPEstObj['emp_id']){
        this.addDCPEstObj['emp_name'] = this.allCurrentArrangements[j]['emp_name']
        this.addDCPEstObj['old_grade_pay_code'] = this.allCurrentArrangements[j]['grade_pay_code']
        this.addDCPEstObj['old_pay_scale_code'] = this.allCurrentArrangements[j]['pay_scale_code']
        this.addDCPEstObj['old_level_code'] = this.allCurrentArrangements[j]['level_code']
        this.addDCPEstObj['old_basic_pay'] =this.allBasicPay[this.addDCPEstObj['emp_id']];
        this.addDCPEstObj['old_designation_code']=this.allCurrentArrangements[j]['designation_code'];
        this.selectedEstablishment = this.allCurrentArrangements[j];
      }
    }
    this.gradePayArr = []
    this.payScaleArr = []
    this.levelArr = []
    this.basicPayArr = []
    this.htmlgradePayArr = []
    this.htmlpayScaleArr = []
    this.htmllevelArr = []
    this.htmlbasicPayArr = []
    this.htmlDesignationArr=[];
  

    for (let i = 0; i < this.allMatrix.length; i++) {

      if (!this.payScaleArr.includes(this.allMatrix[i]['pay_band'])) {
        this.payScaleArr.push(this.allMatrix[i]['pay_band'])
        let obj = new Object

        obj['value'] = this.allMatrix[i]['pay_band']
        this.htmlpayScaleArr.push(obj)
      }

    }


    await this.changePayScaleDCP()
    await this.changeGradePayDCP()
    await this.changeLevelDCP()
   
 }

  async changeGradePayDCP() {
    
    this.levelArr = []
    this.basicPayArr = []
    this.htmllevelArr = []
    this.htmlbasicPayArr = []
    for (let i = 0; i < this.allMatrix.length; i++) {
      if (this.addDCPEstObj['grade_pay_code'] == this.allMatrix[i]['grade_pay_code']) {
        if (!this.levelArr.includes(this.allMatrix[i]['level_code'])) {
          this.levelArr.push(this.allMatrix[i]['level_code'])
          let obj = new Object
          obj['value'] = this.allMatrix[i]['level_code']
          this.htmllevelArr.push(obj)
        }
      }
    }
  }

  async changePayScaleDCP() {
    this.gradePayArr = []
    this.levelArr = []
    this.basicPayArr = []
    this.htmlgradePayArr = []
    this.htmllevelArr = []
    this.htmlbasicPayArr = []
    for (let i = 0; i < this.allMatrix.length; i++) {
      if (this.addDCPEstObj['pay_scale_code'] == this.allMatrix[i]['pay_band']) {
        if (!this.gradePayArr.includes(this.allMatrix[i]['grade_pay_code'])) {
          this.gradePayArr.push(this.allMatrix[i]['grade_pay_code'])
          let obj = new Object
          obj['value'] = this.allMatrix[i]['grade_pay_code']
          this.htmlgradePayArr.push(obj)
        }
      }
    }
  }
  async changeLevelDCP() {
    this.basicPayArr = []
    this.htmlbasicPayArr = []

    for (let i = 0; i < this.allMatrix.length; i++) {
      if (this.addDCPEstObj['level_code'] == this.allMatrix[i]['level_code']) {
        if (!this.levelArr.includes(this.allMatrix[i]['basic_pay'])) {
          this.levelArr.push(this.allMatrix[i]['basic_pay'])
          let obj = new Object
          obj['value'] = this.allMatrix[i]['basic_pay']
          this.htmlbasicPayArr.push(obj)
        }
      }
    }
  }
  async getAllMatrix() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.establishmentService.getMatrix(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allMatrix = resp.data;
      } else {
      this.snackBar.open(resp.data, 'Error', {
        duration: 5000
      });
    }
  }


  async promote(element) {
    this.gradePayArr = []
    this.payScaleArr = []
    this.levelArr = []
    this.basicPayArr = []
    this.htmlgradePayArr = []
    this.htmlpayScaleArr = []
    this.htmllevelArr = []
    this.htmlbasicPayArr = []
    this.htmlDesignationArr=[];
    this.addEstObj = Object.assign({}, element);
    for(var i=0;i<this.allCurrentArrangements.length;i++){
      if(this.allCurrentArrangements[i]['emp_id'] == element['emp_id']){
        this.selectedEstablishment = this.allCurrentArrangements[i];
      }
    }
    for (let i = 0; i < this.allMatrix.length; i++) {

      if (!this.payScaleArr.includes(this.allMatrix[i]['pay_band'])) {
        this.payScaleArr.push(this.allMatrix[i]['pay_band'])
        let obj = new Object

        obj['value'] = this.allMatrix[i]['pay_band']
        this.htmlpayScaleArr.push(obj)
      }




      if (this.addEstObj['old_pay_scale_code'] == this.allMatrix[i]['pay_band']) {

        if (Number(this.addEstObj['old_grade_pay_code']) == this.allMatrix[i]['grade_pay_code']) {

          if (this.addEstObj['old_level_code'] == this.allMatrix[i]['level_code']) {
            if (this.addEstObj['old_basic_pay'] < this.allMatrix[i]['basic_pay']) {
              if (this.addEstObj['compare_basic_pay'] == undefined) {
                this.addEstObj['compare_basic_pay'] = this.allMatrix[i]['basic_pay']
              }
              else {
                if (this.addEstObj['compare_basic_pay'] > this.allMatrix[i]['basic_pay']) {
                  this.addEstObj['compare_basic_pay'] = this.allMatrix[i]['basic_pay']

                }
              }

            }
          }
        }
      }
    }
    for (let i = 0; i < this.allMatrix.length; i++) {
      if (this.addEstObj['compare_basic_pay'] < this.allMatrix[i]['basic_pay']) {
        if ((Number(this.addEstObj['old_level_code']) + 1) == this.allMatrix[i]['level_code']) {
          if (this.addEstObj['basic_pay'] == undefined) {
            this.addEstObj['basic_pay'] = this.allMatrix[i]['basic_pay']
            this.addEstObj['pay_scale_code'] = this.allMatrix[i]['pay_band']
            this.addEstObj['grade_pay_code'] = this.allMatrix[i]['grade_pay_code']

            this.addEstObj['level_code'] = this.allMatrix[i]['level_code']

          }
          else {
            if (this.addEstObj['basic_pay'] > this.allMatrix[i]['basic_pay']) {
              this.addEstObj['basic_pay'] = this.allMatrix[i]['basic_pay']
              this.addEstObj['pay_scale_code'] = this.allMatrix[i]['pay_band']
              this.addEstObj['grade_pay_code'] = this.allMatrix[i]['grade_pay_code']
              this.addEstObj['level_code'] = this.allMatrix[i]['level_code']

            }
          }
        }

      }
    }
    await this.changePayScale()
    await this.changeGradePay()
    await this.changeLevel()


    $('.nav-tabs a[href="#tab-3"]').tab('show');
  }
  async reject(element) {
    var obj = Object.assign({}, element);
    obj['promotion_status'] = "REJECTED";
    obj['update_user_id'] = this.erpUser.user_id;
    obj['b_acct_id'] = this.b_acct_id;
    this.spinner.show();
    var resp = await this.establishmentService.rejectPromotion(obj);
    if (resp['error'] == false) {
      await this.getAllPromotions();
      this.spinner.hide();
      this.snackBar.open("Promotion Info Rejected", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while rejecting Promotion Info Of Employee", 'Error', {
        duration: 5000
      });
    }

  }



  async getAllPromotions() {

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.establishmentService.getPreviousPromotions(obj);
    if (resp['error'] == false) {
      this.allPromotion=[]
      this.scheduledPromotions=[]
      for(let i=0;i<resp.data.length;i++){
        if(resp.data[i]['promotion_status']=='PROMOTED'){
          var ob = Object.assign({},resp.data[i]);
          ob['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(ob['emp_id'])

          this.allPromotion.push(ob);
        }

        if(resp.data[i]['promotion_status']=='SCHEDULED'){
          this.scheduledPromotions.push(resp.data[i])
        }
      }
      for (let i = 0; i < this.allPromotion.length; i++) {
        this.allPromotion[i]['temppromotion_effective_dt'] = this.mainService.dateformatchange(this.allPromotion[i]['promotion_effective_dt'])
        this.allPromotion[i]['temppromotion_date'] = this.mainService.dateformatchange(this.allPromotion[i]['promotion_date'])

      }
      this.datasource = new MatTableDataSource(this.allPromotion)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
    } else {
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  askAcp(){
    this.calSalaryAfterAcp(this.selectedEstablishment,this.addEstObj)
    $('#myModal').modal('show');
  }
  askDpc(){
    for(var i=0;i<this.allCurrentArrangements.length;i++){
      if(this.allCurrentArrangements[i]['emp_id'] == this.addDCPEstObj['emp_id']){
        this.selectedEstablishment = this.allCurrentArrangements[i];
      }
    }
    this.addDCPEstObj['promotion_date'] = this.addDCPEstObj['effective_dt']
    this.calSalaryAfterAcp(this.selectedEstablishment,this.addDCPEstObj)
    $('#myModal1').modal('show');
  }
  deleteSalArr(i){
    this.salArr.splice(i,1);
  }
  async addEmpPromotion() {
    this.addEstObj['b_acct_id'] = this.b_acct_id;
    this.addEstObj['create_user_id'] = this.erpUser.user_id;
    this.addEstObj['promotion_status'] = "PROMOTED";
    this.spinner.show();
    var resp = await this.establishmentService.addPromtion(this.addEstObj);
    if (resp['error'] == false) {
      await this.incReq()
      await this.getAllActiveEmployees();
      await this.getAllPromotions();
      await this.buildExpectedPromotionArray();

      this.spinner.hide();
      this.snackBar.open("Employee Promoted Successfully", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Promotion Info Of Employee", 'Error', {
        duration: 5000
      });
    }
  }


  async changePayScale() {
    this.gradePayArr = []
    this.levelArr = []
    this.basicPayArr = []
    this.htmlgradePayArr = []
    this.htmllevelArr = []
    this.htmlbasicPayArr = []
    for (let i = 0; i < this.allMatrix.length; i++) {
      if (this.addEstObj['pay_scale_code'] == this.allMatrix[i]['pay_band']) {
        if (!this.gradePayArr.includes(this.allMatrix[i]['grade_pay_code'])) {
          this.gradePayArr.push(this.allMatrix[i]['grade_pay_code'])
          let obj = new Object
          obj['value'] = this.allMatrix[i]['grade_pay_code']
          this.htmlgradePayArr.push(obj)
        }
      }
    }
  }
 
  async changeLevel() {
    this.basicPayArr = []
    this.htmlbasicPayArr = []

    for (let i = 0; i < this.allMatrix.length; i++) {
      if (this.addEstObj['level_code'] == this.allMatrix[i]['level_code']) {
        if (!this.levelArr.includes(this.allMatrix[i]['basic_pay'])) {
          this.levelArr.push(this.allMatrix[i]['basic_pay'])
          let obj = new Object
          obj['value'] = this.allMatrix[i]['basic_pay']
          this.htmlbasicPayArr.push(obj)
        }
      }
    }
  }


  async changeGradePay() {
    
    this.levelArr = []
    this.basicPayArr = []
    this.htmllevelArr = []
    this.htmlbasicPayArr = []
    for (let i = 0; i < this.allMatrix.length; i++) {
      if (this.addEstObj['grade_pay_code'] == this.allMatrix[i]['grade_pay_code']) {
        if (!this.levelArr.includes(this.allMatrix[i]['level_code'])) {
          this.levelArr.push(this.allMatrix[i]['level_code'])
          let obj = new Object
          obj['value'] = this.allMatrix[i]['level_code']
          this.htmllevelArr.push(obj)
        }
      }
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  applyFilter1(filterValue: string) {
    this.datasource1.filter = filterValue.trim().toLowerCase();
  }

}
