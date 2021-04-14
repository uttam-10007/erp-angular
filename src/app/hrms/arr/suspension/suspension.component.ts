import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import {MainService} from '../../service/main.service';
import { EstablishmentService } from '../../service/establishment.service'
declare var $: any
@Component({
  selector: 'app-suspension',
  templateUrl: './suspension.component.html',
  styleUrls: ['./suspension.component.css']
})
export class SuspensionComponent implements OnInit {

 
  constructor(private mainService:MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private establishmentService: EstablishmentService) { }
  erpUser;
  b_acct_id;

  allEmplyees = [];
  selectEmpObj = {};
  suspensionObj = {};
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id', 'order_id', 'suspension_start_dt','suspension_end_dt','charge_sheet_dt','en_officer_name','action'];
  datasource;
  empIdToName={};
  arrearArray=[{value:"YES"},{value:"NO"}]
  allActiveEmplyees=[]
  newallEmplyees = []
  amountObj={}
  allSuspensionArray=[]
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllActiveEmployees();
  //  await this.getAllEmployees();

    await this.getAllSuspended();
  }

  async getAllSuspended() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['ineligible_party_status_codes'] = ['TT'];
    var resp = await this.establishmentService.getAllsuspensions(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allSuspensionArray=[]
      this.spinner.hide();
      for(let i=0;i<resp.data.length;i++){
        if(resp.data[i]['suspension_status']=='ACTIVE'){
          this.allSuspensionArray.push(resp.data[i])
        }
      }
      this.datasource = new MatTableDataSource(this.allSuspensionArray)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting All suspensions", 'Error', {
        duration: 5000
      });
    }
  }
 
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllActiveEmployees() {
    var obj=new Object();
     obj['b_acct_id']=this.b_acct_id;
     obj['emp_status_code'] = ['ACTIVE','INACTIVE']
    var resp = await this.establishmentService.getArrayAllCurrentEstablishementInfo(obj);
  this.allActiveEmplyees=[]

    if (resp['error'] == false) {
      this.allEmplyees = resp.data;     
      for(let i=0;i<this.allEmplyees.length;i++){
        this.empIdToName[this.allEmplyees[i].emp_id]=this.allEmplyees[i].emp_name;
        if(this.allEmplyees[i].emp_status_code=='ACTIVE'){
          if(this.allEmplyees[i].employee_current_type_code!='SUSPENDED'){
            this.allActiveEmplyees.push(this.allEmplyees[i])
          }
        }
      }
      
      this.newallEmplyees = []
      for(let i=0;i<this.allActiveEmplyees.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.allActiveEmplyees[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
    } else {
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
    async submitSuspension() {
      this.spinner.show()
    this.suspensionObj['b_acct_id'] = this.b_acct_id;
    this.suspensionObj['create_user_id'] = this.erpUser.user_id;
    this.suspensionObj['employee_current_type_code'] = 'SUSPENDED'  
    var resp = await this.establishmentService.suspendEmployee(this.suspensionObj);
    if (resp['error'] == false) {
      await this.getAllSuspended();
      this.spinner.hide();
      this.snackBar.open("Suspension  Added Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Suspension  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }

  
  openUpdate(element) {
    this.suspensionObj = Object.assign({}, element);
    this.suspensionObj['old_fraction_per'] =element['fraction_per'];
     $('.nav-tabs a[href="#tab-3"]').tab('show');
 
   }
   async updateSuspension() {
    this.suspensionObj['b_acct_id'] = this.b_acct_id;
    this.suspensionObj['update_user_id'] = this.erpUser.user_id;
    // this.suspensionObj['emp_status_code'] = 'ACTIVE';
    // this.suspensionObj['employee_current_type_code'] = 'SUSPENDED'
    this.spinner.show()
    var arr=[]
  if( this.suspensionObj['arrear']=='YES'){
    
    await this.check()
    var ob1=new Object
    ob1['b_acct_id']=this.b_acct_id
    ob1['emp_id']=this.suspensionObj['emp_id']
    ob1['data']= [this.amountObj]
    ob1['create_user_id'] = this.erpUser.user_id;
   
     var resp1 = await this.establishmentService.addarrayVariablePay(ob1);
    if (resp1['error'] == false) {
      
    } else {
      this.snackBar.open("Error while Adding Arrear of Employee", 'Error', {
        duration: 5000
      });
    }
  }


    var resp = await this.establishmentService.updatesuspension(this.suspensionObj);
    if (resp['error'] == false) {
      await this.getAllSuspended();
      this.spinner.hide();
      this.snackBar.open("Suspension Updated Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Updating Suspension  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }

  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return new Date([date.getFullYear(), mnth, "01"].join("-"));
  }
  add_months(dt, n) 
 {

   return new Date(dt.setMonth(dt.getMonth() + n));      
 }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }

async check(){
  this.suspensionObj['b_acct_id'] = this.b_acct_id;
  this.suspensionObj['update_user_id'] = this.erpUser.user_id;
  this.suspensionObj['emp_status_code'] = 'INACTIVE';
  this.suspensionObj['employee_current_type_code'] = 'SUSPENDED'
  this.spinner.show()
  var arr=[]
if( this.suspensionObj['arrear']=='YES'){
  
  var startDate=new Date(this.convert(this.suspensionObj['suspension_start_dt']))
  var endDate=new Date(this.convert(this.suspensionObj['suspension_end_dt']))

  while(startDate<=endDate){
    var obj=new Object()
    if((startDate.getMonth()+1)<4){
      obj['year']=startDate.getFullYear()-1
      obj['month']=startDate.getMonth()+1
    }else{
      obj['year']=startDate.getFullYear()
      obj['month']=startDate.getMonth()+1
    }
    arr.push(obj)
    startDate=new Date(this.add_months(startDate,1))
  }

  var obj=new Object
  obj['b_acct_id']=this.b_acct_id
  obj['emp_id']=this.suspensionObj['emp_id']
  obj['data']=arr
  var resp = await this.establishmentService.getbillforSuspension(JSON.stringify(obj));
  var basicDaArr=[]
  for(let i=0;i<resp['data'].length;i++){
    if(resp['data'][i]['pay_component_code']=='BASIC' || resp['data'][i]['pay_component_code']=='DA'){
      basicDaArr.push(resp['data'][i])
    }
  }
   startDate=new Date(this.suspensionObj['suspension_start_dt'])

   endDate=new Date(this.suspensionObj['suspension_end_dt'])
   var  variablePayArr=[]
   var arrearPercent=this.suspensionObj['fraction_per'] - this.suspensionObj['old_fraction_per']
   var startDateFinYear
   var endDateFinYear

   if((startDate.getMonth()+1)<4){
    startDateFinYear=startDate.getFullYear()-1
   }else{
    startDateFinYear=startDate.getFullYear()
   }
   if((endDate.getMonth()+1)<4){
    endDateFinYear=endDate.getFullYear()-1
   }else{
    endDateFinYear=endDate.getFullYear()
   }
  for(let i=0;i<basicDaArr.length;i++){
    var ob=new Object
    if(basicDaArr[i]['fin_year']==startDateFinYear && (basicDaArr[i]['month']==(startDate.getMonth() + 1)) && basicDaArr[i]['fin_year']==endDateFinYear && (basicDaArr[i]['month']==(endDate.getMonth() + 1)) ){
   
      let timeDiff  =  endDate.getTime() - startDate.getTime();
        let days     = timeDiff / (1000 * 60 * 60 * 24)
      ob['fin_year']=basicDaArr[i]['fin_year']
      ob['month']=basicDaArr[i]['month']
      ob['pay_component_code']='SUSPENSION ARREAR'
      ob['pay_code']=basicDaArr[i]['pay_component_code']
      ob['pay_status_code']='ACTIVE'
      ob['emp_id']=basicDaArr[i]['emp_id']
      ob['pay_component_amt']= ((((basicDaArr[i]['pay_component_amt'] * days)/31)*arrearPercent)/100).toFixed(2)
      variablePayArr.push(ob)
    }
    else if(basicDaArr[i]['fin_year']==startDateFinYear && (basicDaArr[i]['month']==(startDate.getMonth() + 1)) ){
     
      let days=31-startDate.getDate()
      // ob['fin_year']=basicDaArr[i]['fin_year']
      // ob['month']=basicDaArr[i]['month']
      // ob['pay_component_code']='SUSPENSION ARREAR'
      // ob['pay_code']=basicDaArr[i]['pay_component_code']
      // ob['pay_status_code']='ACTIVE'
      // ob['emp_id']=basicDaArr[i]['emp_id']
      ob['pay_component_amt']= ((((basicDaArr[i]['pay_component_amt'] * days)/31)*arrearPercent)/100)
      variablePayArr.push(ob)
    }
    else if(basicDaArr[i]['fin_year']==endDateFinYear && (basicDaArr[i]['month']==(endDate.getMonth() + 1)) ){
   
      let days=endDate.getDate()
      // ob['fin_year']=basicDaArr[i]['fin_year']
      // ob['month']=basicDaArr[i]['month']
      // ob['pay_component_code']='SUSPENSION ARREAR'
      // ob['pay_code']=basicDaArr[i]['pay_component_code']
      // ob['pay_status_code']='ACTIVE'
      // ob['emp_id']=basicDaArr[i]['emp_id']
      ob['pay_component_amt']= ((((basicDaArr[i]['pay_component_amt'] * days)/31)*arrearPercent)/100)
      variablePayArr.push(ob)
    }else{
      // ob['fin_year']=basicDaArr[i]['fin_year']
      // ob['month']=basicDaArr[i]['month']
      // ob['pay_component_code']='SUSPENSION ARREAR'
      // ob['pay_code']=basicDaArr[i]['pay_component_code']
      // ob['pay_status_code']='ACTIVE'
      // ob['emp_id']=basicDaArr[i]['emp_id']
      ob['pay_component_amt']=((basicDaArr[i]['pay_component_amt']*arrearPercent)/100)
      variablePayArr.push(ob)
    }
  }
this.amountObj=new Object
this.amountObj['fin_year']=endDateFinYear
this.amountObj['month']=startDate.getMonth() + 1
this.amountObj['pay_component_code']='SUSPENSION ARREAR'
this.amountObj['pay_code']='PAY'
this.amountObj['pay_status_code']='ACTIVE'
this.amountObj['emp_id']=this.suspensionObj['emp_id']
this.amountObj['pay_component_amt']=0

  for(let i=0;i<variablePayArr.length;i++){
    this.amountObj['pay_component_amt']= this.amountObj['pay_component_amt']+variablePayArr[i]['pay_component_amt']
  }
  this.amountObj['pay_component_amt']=this.amountObj['pay_component_amt'].toFixed(2)
//   var ob1=new Object
//   ob1['b_acct_id']=this.b_acct_id
//   ob1['emp_id']=this.suspensionObj['emp_id']
//   ob1['data']= variablePayArr
//   ob1['create_user_id'] = this.erpUser.user_id;
 
//    var resp1 = await this.establishmentService.addarrayVariablePay(ob1);
//   if (resp1['error'] == false) {
    
//   } else {
//     this.snackBar.open("Error while Adding Arrear of Employee", 'Error', {
//       duration: 5000
//     });
//   }
 }

 if( this.suspensionObj['arrear']=='NO'){
  this.amountObj['pay_component_amt']=0
 }
 this.spinner.hide()

 }
async withdraw(element){

  var obj=new Object;
  obj['b_acct_id']=this.b_acct_id
  obj['update_user_id'] = this.erpUser.user_id;
  obj['emp_status_code'] = 'ACTIVE';
  obj['employee_current_type_code'] = ''
  obj['suspension_status'] = 'WITHDRAW'
  obj['id'] = element['id']
  obj['emp_id'] = element['emp_id']
this.spinner.show()


  var resp = await this.establishmentService.suspensionWithdraw(obj);
  if (resp['error'] == false) {
    await this.getAllSuspended();
    this.spinner.hide();
    this.snackBar.open("Suspension Withdraw Successfully!", 'Success', {
      duration: 5000
    });
  } else {
    this.spinner.hide();
    this.snackBar.open("Some error Occured", 'Error', {
      duration: 5000
    });
  }
 }


}
