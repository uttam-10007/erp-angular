import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../../service/payroll.service';
import { MainService } from '../../../service/main.service';
declare var $: any
@Component({
  selector: 'app-da-arrear',
  templateUrl: './da-arrear.component.html',
  styleUrls: ['./da-arrear.component.css']
})
export class DaArrearComponent implements OnInit {
  erpUser;
  b_acct_id;

  allEmplyees = [];
  selectEmpObj = {};
  variablepayObj = {};
  codeValueTechObj={};

  arr_id;
  systemDate
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id', 'emp_name', 'designation_code','areear_type', 'amount', 'arrear_start_dt', 'arrear_end_dt', 'status','action'];
  datasource;
  constructor(public mainService: MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.payableService.getSystemDate();
    this.systemDate = resp.data
    await this.getAllEmployees();
    await this.getarrear()
    await this.fixedpayamt()
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  chamgeTab(){
    this.selectEmpObj = {}
  }
  allEmplyees_new=[];
  async getAllEmployees() {
    this.spinner.show()
    var arr =[]
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.payableService.getEmployeeMasterData(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        this.allEmplyees.push(obj)
      }
      this.allEmplyees_new=[];
      var allemp = {emp_desc:'ALL EMPLOYEE',emp_id:'ALL'}
      this.allEmplyees_new.push(allemp)
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_desc']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.allEmplyees_new.push(obj)
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  fixedpay =[]
  async fixedpayamt() {

    this.spinner.show();
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
   

    var resp = await this.payableService.getAllFixedPay(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.fixedpay = resp.data
      
        var arr = []
        for(let i=0;i<this.fixedpay.length;i++){
          var obj=new Object();
          obj= Object.assign(this.fixedpay[i]);
          if(obj['effective_end_dt'] >= this.systemDate && (obj['pay_component_code'] == 'BASIC' || obj['pay_component_code'] == 'DA' )){
            arr.push(obj)
          }
         
       
  
      }
      this.fixedpay = arr
      
    } else {


      this.spinner.hide();
      this.snackBar.open("Error while getting employee all Fixed Pay list", 'Error', {
        duration: 5000
      });
    }
  }

  encashment = []
 
  async getarrear() {
  
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    this.spinner.show();
    
    var resp1 = await this.payableService.getarrear(JSON.stringify(this.b_acct_id));
    if (resp1['error'] == false) {

      this.spinner.hide();
      this.datasource = new MatTableDataSource(resp1.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all Variable Pay list", 'Error', {
        duration: 5000
      });
    }
  }
dadata = []
  changeda(){
    var fixedarr ={}
    if(this.selectEmpObj['emp_id'][0] == 'ALL'){
      this.selectEmpObj['emp_id'] = []
      for(var i=0;i<this.allEmplyees.length;i++){
        this.selectEmpObj['emp_id'].push(this.allEmplyees[i]['emp_id'])
        fixedarr[this.allEmplyees[i]['emp_id']] = {}
        for(var j=0;j<this.fixedpay.length;j++){
          if(this.allEmplyees[i]['emp_id'] == this.fixedpay[j]['emp_id']){
           
            fixedarr[this.allEmplyees[i]['emp_id']][this.fixedpay[j]['pay_component_code']] = this.fixedpay[j]['pay_component_amt']
          }
        
        }
      }
    }
    else{
    for(var i=0;i<this.selectEmpObj['emp_id'].length;i++){
      fixedarr[this.selectEmpObj['emp_id'][i]] = {}
      for(var j=0;j<this.fixedpay.length;j++){
        if(this.selectEmpObj['emp_id'][i] == this.fixedpay[j]['emp_id']){
         
          fixedarr[this.selectEmpObj['emp_id'][i]][this.fixedpay[j]['pay_component_code']] = this.fixedpay[j]['pay_component_amt']
        }
      
      }
    }
  }
    var month = 0
    if(this.selectEmpObj['arrear_start_dt'] != undefined && this.selectEmpObj['arrear_end_dt'] != undefined){
    var arrfrom = this.selectEmpObj['arrear_start_dt'].split('-')
    var arrto = this.selectEmpObj['arrear_end_dt'].split('-');
    arrto[0] = parseInt(arrto[0])
    arrto[1] = parseInt(arrto[1])
    arrfrom[0] = parseInt(arrfrom[0])
    arrfrom[1] = parseInt(arrfrom[1])
    if(arrto[0] == arrfrom[0]){
      month = arrto[1] - arrfrom[1]+1
    }else if(arrto[0] == arrfrom[0]+1){
      month=12-arrfrom[1]+1+arrto[1];
      
    }else{
      month=12-arrfrom[1]+1+arrto[1]+(arrto[0]-arrfrom[0]-1)*12;
      
    }
    
    }
    this.dadata = []
    for(var i=0;i<this.selectEmpObj['emp_id'].length;i++){
      if(Object.keys(fixedarr[this.selectEmpObj['emp_id'][i]]).length > 1){
      var old_da = ( fixedarr[this.selectEmpObj['emp_id'][i]]['DA'] / fixedarr[this.selectEmpObj['emp_id'][i]]['BASIC'] ) * 100
    var da = this.selectEmpObj['new_da'] - old_da
    var basic = fixedarr[this.selectEmpObj['emp_id'][i]]['BASIC']
    var amt = ((da/100) * basic * month).toFixed(2);
      var obj = Object()
      obj['emp_id'] = this.selectEmpObj['emp_id'][i]
      obj['amount'] = amt
      obj['emp_id'] = this.selectEmpObj['emp_id'][i]
      for(var j=0;j<this.allEmplyees.length;j++){
        if(obj['emp_id'] == this.allEmplyees[j]['emp_id']){
          obj['emp_name'] = this.allEmplyees[j]['emp_name']
        }
      }
      var data = []
    var dataobj = Object()
    dataobj['new_da'] = this.selectEmpObj['new_da']
    dataobj['da'] = old_da
    dataobj['basic'] = basic
    dataobj['arrear_start_dt'] = this.selectEmpObj['arrear_start_dt']
    dataobj['arrear_end_dt'] = this.selectEmpObj['arrear_end_dt']
    data.push(dataobj)
    obj['data'] = JSON.stringify(data)
      this.dadata.push(obj)
    }
    }


  }
  async openarear() {
   
    
    for(var i=0;i<this.encashment.length;i++){
      if(this.selectEmpObj['encash_id'] == this.encashment[i]['id']){
    this.selectEmpObj = Object.assign({}, this.encashment[i]);
      }
    }
    var da = this.selectEmpObj['da']
    var basic = this.selectEmpObj['basic']
    this.selectEmpObj['da'] = (da/basic) * 100
    //this.total_amount = this.selectEmpObj['amount'] + this.selectEmpObj['paid'];
    $('.nav-tabs a[href="#tab-4"]').tab('show');
    //await this.changePaidAmount();

  }
  async arear(){
    this.selectEmpObj['b_acct_id'] = this.b_acct_id;
    this.selectEmpObj['update_user_id'] = this.erpUser.user_id;
    // this.selectEmpObj['da'] = this.selectEmpObj['new_da']
    this.selectEmpObj['arrear_type'] = 'DA ARREAR'
    
    this.selectEmpObj['create_user_id'] = this.erpUser.user_id;
    this.selectEmpObj['status'] = 'GENRATED'
    this.selectEmpObj['dadata'] = this.dadata
     this.spinner.show();
    
      var resp = await this.payableService.insertarrayarrear(this.selectEmpObj);
    if (resp['error'] == false) {
      //await this.getAllLeaveEncashment();
      await this.getarrear();
      this.spinner.hide();
      this.snackBar.open("Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding !!", 'Error', {
        duration: 5000
      });
    }  
  }
  async openUpdate(element) {
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    
   
    this.selectEmpObj = Object.assign({}, element);
    var data = JSON.parse(this.selectEmpObj['data'])[0]
    this.selectEmpObj['arrear_end_dt'] = data['arrear_end_dt']
    this.selectEmpObj['arrear_start_dt'] = data['arrear_start_dt']
    this.selectEmpObj['basic'] = data['basic']
    this.selectEmpObj['da'] = data['da']
    this.selectEmpObj['new_da'] = data['new_da']
    
    

  }
  changedaupdate(){
    var month = 0
    if(this.selectEmpObj['arrear_start_dt'] != undefined && this.selectEmpObj['arrear_end_dt'] != undefined){
    var arrfrom = this.selectEmpObj['arrear_start_dt'].split('-')
    var arrto = this.selectEmpObj['arrear_end_dt'].split('-');
    arrto[0] = parseInt(arrto[0])
    arrto[1] = parseInt(arrto[1])
    arrfrom[0] = parseInt(arrfrom[0])
    arrfrom[1] = parseInt(arrfrom[1])
    if(arrto[0] == arrfrom[0]){
      month = arrto[1] - arrfrom[1]+1
    }else if(arrto[0] == arrfrom[0]+1){
      month=12-arrfrom[1]+1+arrto[1];
      
    }else{
      month=12-arrfrom[1]+1+arrto[1]+(arrto[0]-arrfrom[0]-1)*12;
      
    }
    
    }
    var da = this.selectEmpObj['new_da'] - this.selectEmpObj['da']
    var basic = this.selectEmpObj['basic']
    this.selectEmpObj['amount'] = ((da/100) * basic * month).toFixed(2);


  }


  async update() {
    this.selectEmpObj['b_acct_id'] = this.b_acct_id;
    var data = []
    var obj = Object()
    obj['new_da'] = this.selectEmpObj['new_da']
    obj['da'] = this.selectEmpObj['da']
    obj['basic'] = this.selectEmpObj['basic']
    obj['arrear_start_dt'] = this.selectEmpObj['arrear_start_dt']
    obj['arrear_end_dt'] = this.selectEmpObj['arrear_end_dt']
    obj['encash_id'] = this.selectEmpObj['encash_id']
    data.push(obj)
    this.selectEmpObj['data'] = JSON.stringify(data)
    this.selectEmpObj['update_user_id'] = this.erpUser.user_id;
    this.spinner.show();
   var resp = await this.payableService.updatearrear(this.selectEmpObj);
    if (resp['error'] == false) {
      
      this.spinner.hide();
      await this.getarrear();
      this.snackBar.open("Updated Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Updating", 'Error', {
        duration: 5000
      });
    } 
  }
  async delete(element) {

    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = [element['id']];
    var resp = await this.payableService.deletearrear(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getarrear();
      this.spinner.hide();
      this.snackBar.open("Deleted Successfully", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while deleting Leave Encashment!!", 'Error', {
        duration: 5000
      });
    }
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}
