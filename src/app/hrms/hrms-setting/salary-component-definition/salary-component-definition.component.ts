import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service';
import Swal from 'sweetalert2';
declare var $: any
@Component({
  selector: 'app-salary-component-definition',
  templateUrl: './salary-component-definition.component.html',
  styleUrls: ['./salary-component-definition.component.css']
})
export class SalaryComponentDefinitionComponent implements OnInit {
  constructor(private settingService: SettingService,public mainService: MainService,  private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  no_of_inc=0;
  allSCD = [];
  obj = {};
  allPay =[];
  selectedComponentCode;
  employement_info={};
  allMatrix=[];
  componentCode=[{component_code:'GIS'},{component_code:'PBHATTA'}];
  dependentComponent=[{dependent_component:'BASIC'},{dependent_component:'GRADEPAY'}];
  rateType=[{rate_type:'FIX'},{rate_type:'PERCENTAGE'},{rate_type:'LIMIT'}];
  matrixObj={};
  allEmp=[];
  salArr =[];
  inc={};
  personalInfo={};
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'effective_date','component_code','dependent_component','rate_type','upper_limit','lower_limit','amount','status','pay_type_code','action'];
  datasource;
  newPayArr=[];
  allBasicPay={};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllSalaryComponentDefination();
    await this.getAllMatrix();
    await this.getPersonalInfo();
  }

  open_update(element) {
    this.obj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.obj = {};
  }
  changeComponent(){
    var arr=[];
    for(var i=0;i<this.allSCD.length;i++){
      if(this.allSCD[i].component_code == this.selectedComponentCode){
        arr.push(this.allSCD[i]);
      }
    }
    this.datasource = new MatTableDataSource(arr)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }
  async getAllSalaryComponentDefination() {
  this.spinner.show()
   var obj = new Object();
   obj['b_acct_id'] = this.b_acct_id;
   obj['effective_dt'] = '2090-10-10';
   obj['status'] = ['ACTIVE','INACTIVE'];
    var resp = await this.settingService.getAllSalaryCD(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.allSCD = resp.data;
      
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while getting  all salary component list", 'Error', {
        duration: 5000
      });
    }
  }
  async save() {
    this.spinner.show();
    var objectToSend={};
    if(this.obj['rate_type']=='FIX'){
      objectToSend['create_user_id'] = this.erpUser.user_id
      objectToSend['status'] = 'INACTIVE'
      objectToSend['b_acct_id'] = this.erpUser.b_acct_id
      objectToSend['rate_type'] = "FIX"
      objectToSend['component_code'] = this.obj['component_code'];
      objectToSend['dependent_component'] = ['BASIC'];
      objectToSend['amount'] = this.obj['amount'];
      objectToSend['pay_code'] = this.obj['pay_code'];
      objectToSend['effective_dt'] = this.obj['effective_dt'];
    }else if(this.obj['rate_type']=='LIMIT'){
      objectToSend['create_user_id'] = this.erpUser.user_id
      objectToSend['status'] = 'INACTIVE'
      objectToSend['b_acct_id'] = this.erpUser.b_acct_id
      objectToSend['rate_type'] = "LIMIT"
      objectToSend['component_code'] = this.obj['component_code'];
      objectToSend['amount'] = this.obj['amount'];
      objectToSend['pay_code'] = this.obj['pay_code'];
      objectToSend['dependent_component'] = ["GRADEPAY"];
      objectToSend['upper_limit'] = this.obj['upper_limit'];
      objectToSend['lower_limit'] = this.obj['lower_limit'];
      objectToSend['effective_dt'] = this.obj['effective_dt'];
    }else{
      objectToSend['create_user_id'] = this.erpUser.user_id
      objectToSend['status'] = 'INACTIVE'
      objectToSend['b_acct_id'] = this.erpUser.b_acct_id
      objectToSend['rate_type'] = "PERCENTAGE"
      objectToSend['component_code'] = this.obj['component_code'];
      objectToSend['amount'] = this.obj['amount'];
      objectToSend['pay_code'] = this.obj['pay_code'];
      objectToSend['dependent_component'] = this.obj['dependent_component'];
      
      objectToSend['effective_dt'] = this.obj['effective_dt'];
    }
    
    var resp = await this.settingService.createSalaryCD(objectToSend);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllSalaryComponentDefination();
      this.changeComponent()

      this.snackBar.open("Salary Component Defination Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Salary Component Defination", 'Error', {
        duration: 5000
      });
    }
  }
  async getFixedPay(element){
  
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = element.effective_dt.split('T')[0];
    var resp = await this.settingService.getAllFixedPay(obj);
    if(resp['error'] == false){
      this.allPay = resp.data;
      for(var i=0;i<this.allPay.length;i++){
        if(this.allPay[i].pay_component_code == 'BASIC'){
          this.allBasicPay[this.allPay[i].emp_id] = this.allPay[i].pay_component_amt;
        }
      }
      //this.applyRule(element);


    }else{
      this.spinner.hide()
      Swal.fire('Error','Error while getting employee salary')
    }
  }
  async getAllActiveEmployees(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ['ACTIVE']
    var resp = await this.settingService.getArrayAllCurrentEstablishementInfo(JSON.stringify(obj));
    if(resp['error']==false){
      var dt = resp['data'];
      this.allEmp = resp.data;
      for(var i=0;i<dt.length;i++){
        this.employement_info[dt[i].emp_id]=dt[i];

      }
      
    }else{
      this.spinner.hide()
      Swal.fire('Error','Error while getting employee salary')

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

  applyRule(element){
    var ruleObj = new Object();
    for(var i=0;i<this.allSCD.length;i++){
      if(this.allSCD[i].rate_type == 'PERCENTAGE' && this.allSCD[i].status == 'ACTIVE' &&  this.allSCD[i].component_code!=element.component_code){
        if(ruleObj[this.allSCD[i].component_code] == undefined){
          ruleObj[this.allSCD[i].component_code] = []
        }
  
        ruleObj[this.allSCD[i].component_code].push(this.allSCD[i]);
      }
      
    }
    var partyObj=new Object();
    for(var i=0;i<this.allPay.length;i++){
      if(partyObj[this.allPay[i].emp_id] == undefined){
        partyObj[this.allPay[i].emp_id]={};
      }
      partyObj[this.allPay[i].emp_id][this.allPay[i].pay_component_code] = this.allPay[i].pay_component_amt;
    }
    var partyArr=Object.keys(partyObj);
    this.newPayArr=[]
    for(var i=0;i<partyArr.length;i++){
      
      
      var newAmt =0;
      if(element.rate_type == 'FIX'){
        newAmt = element.amount;
      }else if(element.rate_type == 'PERCENTAGE'){
        var y = element.dependent_component.split(',');
        var amt=0;
        for(var j=0;j<y.length;j++){
          if(partyObj[partyArr[i]][y[j]] != undefined){
            amt = amt+ partyObj[partyArr[i]][y[j]];
          }
          
          
        }
         newAmt = parseFloat((amt* element.amount/100).toFixed(2));


      }else{
        if(element.upper_limit>= this.employement_info[partyArr[i]]['grade_pay_code'] && element.lower_limit<=this.employement_info[partyArr[i]]['grade_pay_code']){
          newAmt = element.amount;

        }else{
          newAmt = 0;
        }
      }
      if(partyObj[partyArr[i]][element.component_code]!=undefined){
        var ob={};
        ob['b_acct_id'] = this.b_acct_id;
        ob['emp_id'] = partyArr[i];
        ob['effective_start_dt'] = element.effective_dt.split('T')[0];
        ob['effective_end_dt'] = "2090-10-10"
  
        ob['status'] = 'ACTIVE';
        ob['create_user_id'] = this.erpUser.user_id;
        ob['component_status_code'] = 'ACTIVE';
        ob['pay_component_code'] = element.component_code;
        ob['pay_component_amt'] = newAmt;
        ob['pay_code'] = element.pay_code;
        partyObj[partyArr[i]][element.component_code] = newAmt
        this.newPayArr.push(ob); 
      }
      
    }
    
    for(var i=0;i<this.allPay.length;i++){
      var pay_component_code = this.allPay[i].pay_component_code;
      var rules = ruleObj[pay_component_code];
      var amt2=this.allPay[i].pay_component_amt;
      if(rules == undefined ){
        rules =[];
      }
      for(j=0;j<rules.length;j++){
        if(rules[j].rate_type == 'FIX'){
          amt2 = rules[j].amount;
        }else if(rules[j].rate_type == 'PERCENTAGE'){
          amt2=0;
          var y = rules[j].dependent_component.split(',');
          for(var k=0;k<y.length;k++){
            if(partyObj[this.allPay[i].emp_id][y[k]] != undefined){
              amt2 = amt2+ partyObj[this.allPay[i].emp_id][y[k]];
            }
            
            
          }
           amt2 = parseFloat((amt2* rules[j].amount/100).toFixed(2));
  
  
        }else{
          if(rules[j].upper_limit>= this.employement_info[this.allPay[i].emp_id]['grade_pay_code'] && rules[j].lower_limit<=this.employement_info[this.allPay[i].emp_id]['grade_pay_code']){
            amt2 = element.amount;
  
          }else{
            amt2 = 0;
          }
        }
      }
      if(rules.length>0 && amt2 != partyObj[this.allPay[i].emp_id][this.allPay[i].pay_component_code]){
        var ob={};
        ob['b_acct_id'] = this.b_acct_id;
        ob['emp_id'] = this.allPay[i].emp_id;
        ob['effective_start_dt'] = element.effective_dt.split('T')[0];
        ob['effective_end_dt'] = "2090-10-10"
  
        ob['status'] = 'ACTIVE';
        ob['create_user_id'] = this.erpUser.user_id;
        ob['component_status_code'] = 'ACTIVE';
        ob['pay_component_code'] = this.allPay[i].pay_component_code;
        ob['pay_component_amt'] = amt2;
        ob['pay_code'] = this.allPay[i].pay_code;
        partyObj[this.allPay[i].emp_id][this.allPay[i].pay_component_code] = amt2
        this.newPayArr.push(ob); 
      }
    }  
  }
  async activate(element) {
    //var obj = new Object();
    var obj =Object.assign({},element)
    obj['update_user_id'] = this.erpUser.user_id;
    obj['b_acct_id'] = this.b_acct_id;
    
    obj['status'] = 'ACTIVE';
    obj['end_dt'] = "2090-10-10";
    await this.getFixedPay(element);
    await this.getAllActiveEmployees();
    this.applyRule(element);
    obj['fixed_pay_info'] = this.newPayArr
    this.spinner.show();
    var resp = await this.settingService.updateSalaryCD(obj);
    if (resp['error'] == false) {
      await this.getAllSalaryComponentDefination();
      this.changeComponent()
      this.spinner.hide();

      Swal.fire('Success','Rule Activated')
    } else {
      this.spinner.hide();
      Swal.fire('Error','Error in Rule Activated')
    }
  }

  async delete(element) {
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id
    obj['id']=element.id;
    this.spinner.show();
    var resp = await this.settingService.deleteSalaryCD(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllSalaryComponentDefination();
      this.changeComponent()

      this.snackBar.open("Salary Component Defination Delete Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while deleting Salary Component Defination", 'Error', {
        duration: 5000
      });
    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async annualIncrement(){
    var month = this.inc['effective_dt'].split('-')[1];
    month = parseInt(month);
    await this.getFixedPay(this.inc);
    await this.getAllActiveEmployees();
    this.salArr=[]
    var obj ={};
    var partyObj=new Object();
    for(var i=0;i<this.allPay.length;i++){
      if(partyObj[this.allPay[i].emp_id] == undefined){
        partyObj[this.allPay[i].emp_id]={};
      }
      partyObj[this.allPay[i].emp_id][this.allPay[i].pay_component_code] = this.allPay[i].pay_component_amt;
    }
   
    for(var i=0;i<this.allEmp.length;i++){
      if(month == this.allEmp[i].inc_month && this.allEmp[i].establishment_type_code == 'REGULAR'){
        var basic_pay= this.allBasicPay[this.allEmp[i].emp_id];
        obj[this.allEmp[i]['emp_id']] = basic_pay;
        var key = this.allEmp[i].pay_scale_code+""+this.allEmp[i].grade_pay_code+""+this.allEmp[i].level_code;
        var arr = this.matrixObj[key];
        if(arr == undefined){
          arr=[]
        }
        var temp = basic_pay;
        for(var j=0;j<arr.length;j++){
          if(arr[j]>basic_pay){
            if(temp == basic_pay){
              temp = arr[j];
            }else if(arr[j]<temp){
              temp = arr[j];
  
            }
          }
        }
        obj[this.allEmp[i]['emp_id']]  = temp;
      }
      
    }
    var keys = Object.keys(obj);
    this.no_of_inc = keys.length;
    for(var i=0;i<keys.length;i++){
      var ob={};
      ob['b_acct_id'] = this.b_acct_id;
      ob['emp_id'] = keys[i];
      ob['effective_start_dt'] = this.inc['effective_dt'];
      ob['effective_end_dt'] = "2090-10-10"

      ob['status'] = 'ACTIVE';
      ob['create_user_id'] = this.erpUser.user_id;
      ob['component_status_code'] = 'ACTIVE';
      ob['pay_component_code'] = 'BASIC';
      ob['pay_component_amt'] = obj[keys[i]];
      ob['pay_code'] = 'PAY';
      if(this.employement_info[keys[i]].joining_type_code == 'DEPUTATION'){
        var amt =0;
        if(this.personalInfo[keys[i]].emp_local_addr_dist == 'LKO'){
          amt = parseFloat((obj[keys[i]]*5/100).toFixed(2));
          if(amt > 1500){
            amt = 1500;
          }
        }else{
          amt = parseFloat((obj[keys[i]]*5/100).toFixed(2));
          if(amt > 3000){
            amt = 3000;
          }
        }
        var ob1 = new Object();
        ob1['b_acct_id'] = this.b_acct_id;
        ob1['emp_id'] = keys[i];
        ob1['effective_start_dt'] = this.inc['effective_dt'];
        ob1['effective_end_dt'] = "2090-10-10"

        ob1['status'] = 'ACTIVE';
        ob1['create_user_id'] = this.erpUser.user_id;
        ob1['component_status_code'] = 'ACTIVE';
        ob1['pay_component_code'] = 'DEP';
        ob1['pay_component_amt'] = amt;
        ob1['pay_code'] = 'PAY';
        partyObj[keys[i]]['DEP'] = amt;
        this.salArr.push(ob1);
      }
      partyObj[keys[i]]['BASIC'] = obj[keys[i]];
      this.salArr.push(ob);
      var tempObj={}
      for(var j=0;j<this.allSCD.length;j++){
        var amt2=0
        if(this.allSCD[j].rate_type == 'PERCENTAGE'){
          var y = this.allSCD[j].dependent_component.split(',');
          for(var k=0;k<y.length;k++){
            if(partyObj[keys[i]][y[k]] != undefined){
              amt2 = amt2+ partyObj[keys[i]][y[k]];
            }
            
            
          }
           amt2 = parseFloat((amt2* this.allSCD[j].amount/100).toFixed(2));
           tempObj[this.allSCD[j].component_code] = {pay_component_amt : amt2,pay_code: this.allSCD[j].pay_code}
          
        }


      } 
      var arr1 = Object.keys(tempObj);
      for(var j=0;j<arr1.length;j++){
        var ob1=new Object();
        ob1['b_acct_id'] = this.b_acct_id;
        ob1['emp_id'] = keys[i];
        ob1['effective_start_dt'] = this.inc['effective_dt'];
        ob1['effective_end_dt'] = "2090-10-10"
  
        ob1['status'] = 'ACTIVE';
        ob1['create_user_id'] = this.erpUser.user_id;
        ob1['component_status_code'] = 'ACTIVE';
        ob1['pay_component_code'] = arr1[j];
        if(ob1['pay_component_code'] == 'NPS'){
          ob1['pay_component_amt'] = Math.round(tempObj[arr1[j]].pay_component_amt);

        }else{
          ob1['pay_component_amt'] = tempObj[arr1[j]].pay_component_amt;

        }
        ob1['pay_code'] = tempObj[arr1[j]].pay_code;
        if(partyObj[keys[i]][arr1[j]] != undefined){
         this.salArr.push(ob1);
         partyObj[keys[i]][arr1[j]] = amt2;
  
        }
      }
      

    }
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['fixed_pay_info'] = this.salArr;
    obj1['end_dt'] = '2090-10-10';
    if(obj1['fixed_pay_info'].length>0){
      Swal.fire({
        title: 'Are you sure?'+" There are "+this.no_of_inc+" employees eligible for increment.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        
        if (result.value) {
          this.incReq()
        }
      })
    }else{
      
      Swal.fire("Info","No Increment found")
    }
  }
  async incReq(){
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['fixed_pay_info'] = this.salArr;
    obj1['end_dt'] = '2090-10-10';
    this.spinner.show();
    var resp = await this.settingService.addFixedPay(obj1);
    if (resp['error'] == false) {
      this.spinner.hide();
      Swal.fire('Success','Successfully Increased');
      
      
    } else {
      
      this.spinner.hide();
      Swal.fire("Error","Error occurred while increment")
      
      
    }
  }
  async getAllMatrix() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    
    var resp = await this.settingService.getMatrix(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allMatrix = resp.data;
      for(var i=0;i<this.allMatrix.length;i++){
        if(this.matrixObj[this.allMatrix[i].pay_band+""+this.allMatrix[i].grade_pay_code+""+this.allMatrix[i].level_code] == undefined){
          this.matrixObj[this.allMatrix[i].pay_band+""+this.allMatrix[i].grade_pay_code+""+this.allMatrix[i].level_code] =[];
        }
        this.matrixObj[this.allMatrix[i].pay_band+""+this.allMatrix[i].grade_pay_code+""+this.allMatrix[i].level_code].push(this.allMatrix[i].basic_pay)
      }

    } else {
      Swal.fire('Error','Error while getting matrix');
    }
  }


}
