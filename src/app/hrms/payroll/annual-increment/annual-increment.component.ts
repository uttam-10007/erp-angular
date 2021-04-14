import { Component, OnInit,ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service';
import Swal from 'sweetalert2';
import { ExcelService } from '../../service/file-export.service';

declare var $: any
@Component({
  selector: 'app-annual-increment',
  templateUrl: './annual-increment.component.html',
  styleUrls: ['./annual-increment.component.css']
})
export class AnnualIncrementComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private excl: ExcelService,private settingService: SettingService,public mainService: MainService,  private router: Router, private spinner: NgxSpinnerService) { }
  displayedColumns = ['emp_id','emp_name','designation_code', 'pay_component_code', 'pay_component_amt', 'pay_code', 'action'];
  datasource;
  erpUser;
  b_acct_id;
  no_of_inc=0;
  allSCD = [];
  
  allPay =[];

  employement_info={};
  newPayArr=[];
  allBasicPay={};

  matrixObj={};
  allEmp=[];
  salArr =[];
  inc={};
  personalInfo={};
  dateToday="";
  allMatrix=[];
  allPayArr=[];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getDate();
    await this.getAllSalaryComponentDefination()
    await this.getAllMatrix()
 
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  async getAllMatrix() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    
    var resp = await this.settingService.getMatrix(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allMatrix = resp.data;
      for(var i=0;i<this.allMatrix.length;i++){
        if(this.matrixObj[this.allMatrix[i].grade_pay_code] == undefined){
          this.matrixObj[this.allMatrix[i].grade_pay_code] =[];
        }
        this.matrixObj[this.allMatrix[i].grade_pay_code].push(this.allMatrix[i].basic_pay)
      }

    } else {
      Swal.fire('Error','Error while getting matrix','error');
    }
  }
  async getDate(){
    var resp = await this.settingService.getDate();
    if(resp['error'] == false){
      this.dateToday = resp.data;
    }else{

    }
  }
  async getFixedPay(element){
  
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = this.dateToday.split(' ')[0];
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
      Swal.fire('Error','Error while getting employee salary','error')
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
      Swal.fire('Error','Error while getting employee salary','error')

    }
  }
  async annualIncrement(){
    var month = this.inc['inc_month'];
    month = parseInt(month);
    await this.getFixedPay(this.dateToday);
    await this.getAllActiveEmployees();
    this.salArr=[]
    this.allPayArr=[]
    var obj ={};
    var partyObj=new Object();
    for(var i=0;i<this.allPay.length;i++){
      if(partyObj[this.allPay[i].emp_id] == undefined){
        partyObj[this.allPay[i].emp_id]={};
      }
      partyObj[this.allPay[i].emp_id][this.allPay[i].pay_component_code] = this.allPay[i].pay_component_amt;
    }
   
    for(var i=0;i<this.allEmp.length;i++){
      var basic_pay= this.allBasicPay[this.allEmp[i].emp_id];

      if(month == this.allEmp[i].inc_month && this.allEmp[i].establishment_type_code == 'REGULAR' && basic_pay!=undefined){
        obj[this.allEmp[i]['emp_id']] = basic_pay;
        var key = this.allEmp[i].grade_pay_code;
        var arr = this.matrixObj[key];
        if(arr == undefined){
          arr=[]
        }
        var temp = basic_pay;
       
        for(var j=0;j<arr.length;j++){
          if(arr[j]==temp && j+1<arr.length){
            temp = arr[j+1];
            break;
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
          
          if(partyObj[keys[i]][this.allSCD[j].component_code]!=undefined){
            amt2 = parseFloat((amt2* this.allSCD[j].amount/100).toFixed(2));

            if(partyObj[keys[i]][this.allSCD[j].component_code]>amt2){

              amt2 = partyObj[keys[i]][this.allSCD[j].component_code];
            }
            tempObj[this.allSCD[j].component_code] = {pay_component_amt : amt2,pay_code: this.allSCD[j].pay_code}
          }
          
          
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
         partyObj[keys[i]][arr1[j]] = ob1['pay_component_amt'];
  
        }
      }
      

    }
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['fixed_pay_info'] = this.salArr;
    obj1['end_dt'] = '2090-10-10';
    if(obj1['fixed_pay_info'].length>0){
      var oldObj= new Object();
      for(var i=0;i<this.salArr.length;i++){
        this.salArr[i]['temp'] =this.mainService.accInfo['account_short_name']+this.getNumberFormat(this.salArr[i]['emp_id'])
        this.salArr[i]['designation_code'] = this.employement_info[this.salArr[i]['emp_id']]['designation_code']
        this.salArr[i]['emp_name'] = this.employement_info[this.salArr[i]['emp_id']]['emp_name']
        if(oldObj[this.salArr[i]['emp_id']] == undefined){
          oldObj[this.salArr[i]['emp_id']]={};
        }
        oldObj[this.salArr[i]['emp_id']][this.salArr[i]['pay_component_code']] = this.salArr[i];
      }
      for(var i=0;i<this.allPay.length;i++){
       
        
        if(oldObj[this.allPay[i]['emp_id']] == undefined || oldObj[this.allPay[i]['emp_id']][this.allPay[i]['pay_component_code']] == undefined){
          
          this.allPayArr.push({tempid:this.mainService.accInfo['account_short_name']+this.getNumberFormat(this.allPay[i]['emp_id']),emp_name:this.employement_info[this.allPay[i]['emp_id']]['emp_name'],designation_code:this.employement_info[this.allPay[i]['emp_id']]['designation_code'],pay_component_code:this.allPay[i]['pay_component_code'],pay_code:this.allPay[i]['pay_code'],amount:this.allPay[i]['pay_component_amt'],start_dt:this.allPay[i]['effective_start_dt']});

        }else{
          var x=oldObj[this.allPay[i]['emp_id']][this.allPay[i]['pay_component_code']];
          this.allPayArr.push({tempid:this.mainService.accInfo['account_short_name']+this.getNumberFormat(x['emp_id']),emp_name:this.employement_info[x['emp_id']]['emp_name'],designation_code:this.employement_info[x['emp_id']]['designation_code'],pay_component_code:x['pay_component_code'],pay_code:x['pay_code'],amount:x['pay_component_amt'],start_dt:x['effective_start_dt']});

          //this.allPayArr.push();
        }
      }
      this.datasource = new MatTableDataSource(this.salArr);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      
    }else{
      
      Swal.fire("Info","No Increment found",'info')
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
      Swal.fire('Success','Successfully Increased','success');
      
      
    } else {
      
      this.spinner.hide();
      Swal.fire("Error","Error occurred while increment",'error')
      
      
    }
  }
  deleteRow(element){
    console.log(element);
    var index=-1;
    for(var i=0;i<this.salArr.length;i++){
      if(this.salArr[i]['emp_id'] == element['emp_id'] && this.salArr[i]['pay_component_code'] == element['pay_component_code']){
        index = i;
      }
    }
    this.salArr.splice(index,1);

    this.datasource = new MatTableDataSource(this.salArr);
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;

  }
  async getAllSalaryComponentDefination() {
  this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = '2090-10-10';
    obj['status'] = ['ACTIVE'];
     var resp = await this.settingService.getAllSalaryCD(obj);
     if (resp['error'] == false) {
      this.spinner.hide()
       this.allSCD = resp.data;
       
     } else {
      this.spinner.hide()
     }
   }
   applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  export() {
    this.excl.exportAsExcelFile(this.allPayArr, 'down')
  }
  print() {
    let printContents, popupWin;
    printContents = document.getElementById('p').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      </head>
      <style>
      #tbl {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        max-width: 2480px;
        page-break-after:auto 
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        word-wrap: break-word;
        page-break-inside:avoid; page-break-after:auto 
    }

    
    
    #tbl th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #d9edf7;
      color: black;
  }
      </style>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
    );
    popupWin.document.close();


  }
}
