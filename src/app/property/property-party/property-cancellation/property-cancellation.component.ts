import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import { CancellationService } from '../../service/cancellation.service';

import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar'
import { MetadataService } from '../../service/metadata.service';
declare var $: any;
@Component({
  selector: 'app-property-cancellation',
  templateUrl: './property-cancellation.component.html',
  styleUrls: ['./property-cancellation.component.css']
})
export class PropertyCancellationComponent implements OnInit {

  displayedColumns = ['arr_id','party_name','payment_status','party_bank_name','party_branch_name','party_account_no',  'action'];
  obj={data:[]}
  obj1={data:[]}
  obj2={data:[]}
  erpUser;
  b_acct_id
  data;
  schemeArr;
  selectedSchemeCode=''
  dataSource
  schemeObject={}
  arr_id=''
  costCodeArr=[]
scheduleArr=[];
user_id
subschemeArr;
subschemeObject={}
subselectedSchemeCode;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private cancellationservice: CancellationService,private service: PartyService,private snackBar: MatSnackBar, private spinner: NgxSpinnerService,private settingService:MetadataService) { }

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id =this.erpUser.b_acct_id;
    this.user_id =this.erpUser.user_id;
    await this.getAllSchemes()
   
  }
  async getAllSchemes(){
    this.spinner.show()
    var resp = await this.settingService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.schemeArr = resp.data;
      
      for(let i=0;i<this.schemeArr.length;i++){
this.schemeObject[this.schemeArr[i]['scheme_code']]=this.schemeArr[i]['scheme_name']
      }
     
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllSubschemes(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code']=this.selectedSchemeCode;
        var resp = await this.settingService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.subschemeArr = resp.data;
      
      for(let i=0;i<this.subschemeArr.length;i++){
this.subschemeObject[this.subschemeArr[i]['sub_scheme_code']]=this.subschemeArr[i]['sub_scheme_name']
      }
     
    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getcancellations(){
    var obj=new Object;
    obj['b_acct_id']=this.b_acct_id
    obj['scheme_code']=this.selectedSchemeCode
    obj['sub_scheme_code']=this.subselectedSchemeCode;
    var resp = await this.cancellationservice.getcancellations(obj);
    if (resp['error'] == false) {
      this.data = resp.data;
      
  
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      
      this.dataSource.paginator = this.paginator;
    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Nominees", 'Error', {
        duration: 5000,
      });
    }
  }

  async changeCost(){
     
    for(let i=0;i<this.scheduleArr.length;i++){
      if(this.obj['cost_code']==this.scheduleArr[i]['cost_code']){
         var amtArr=this.scheduleArr[i]['amount'].split(",")
         var emiArr=this.scheduleArr[i]['emi_code'].split(",")
        var arr=[]
          
    for(let j=0;j<emiArr.length;j++){
      arr.push(Object.assign({},{"emi_code":emiArr[j],"amount":amtArr[j],"schedule_date":""}))
    }
    this.obj['data']=arr;
      }
     
    }


  }
 async  fetch(){
if(this.arr_id!=''){
this.obj=Object.assign({},{data:[]})

this.costCodeArr=[]
var obj=new Object;
obj['b_acct_id']=this.b_acct_id
obj['arr_id']=this.arr_id
this.spinner.show();

    var resp = await this.cancellationservice.getdataforcancellation(obj);
    if (resp['error'] == false) {
      if(resp.data.length>0){
      this.spinner.hide();

      this.scheduleArr = resp.data;
      
      this.obj['scheme_code']= this.scheduleArr[0]['scheme_code']
      this.obj['sub_scheme_code']= this.scheduleArr[0]['sub_scheme_code']
      var amt1 =this.scheduleArr[0]['txn_amt']
      var amt2 =this.scheduleArr[0]['cancellation_amount']
      var amt3 = amt1 * (amt2/100)
      var amt4 = amt1 - amt3
      this.obj['cancellation_refund_amt']= amt4 
      this.obj['arr_id']= this.scheduleArr[0]['arr_id']
      this.obj['party_name']= this.scheduleArr[0]['party_name']
      this.obj['txn_amt']= this.scheduleArr[0]['txn_amt']
      this.obj['cancellation_amount']= amt3
      this.obj['party_bank_name']= this.scheduleArr[0]['party_bank_name']
      this.obj['party_branch_name']= this.scheduleArr[0]['party_branch_name']
      this.obj['party_ifsc_code']= this.scheduleArr[0]['party_ifsc_code']
      this.obj['party_account_no']= this.scheduleArr[0]['party_account_no']
      this.obj['party_id']= this.scheduleArr[0]['party_id']
      this.obj['b_acct_id']= this.b_acct_id
      this.obj['create_user_id']=this.user_id
      
      for(let i=0;i<this.scheduleArr.length;i++){
        this.costCodeArr.push(this.scheduleArr[i]['cost_code'])
      }
    }
    else{
      this.spinner.hide();
      this.snackBar.open("Information Not Found", 'Error', {
        duration: 5000,
      });
    }
     
    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Information", 'Error', {
        duration: 5000,
      });
    }

  }
  }

async addNew(){
this.spinner.show();
var partyArrObj={};
var oo=new Object;
oo['b_acct_id']=this.b_acct_id
oo['arr_id']=this.obj['arr_id']
oo['arr_type_code']='ALLOTED'
oo['create_user_id']=this.user_id



this.spinner.show();

var resp = await this.cancellationservice.insertdataforCancellation(this.obj);
if (resp['error'] == false) {

  this.spinner.hide();
  this.snackBar.open("Scheduled Successfully", 'Success!', {
    duration: 5000,
  });
} else {
  this.spinner.hide();
  this.snackBar.open("Request Failed", 'Error', {
    duration: 5000,
  });
}
}











async view(element, i) {
this.obj2['cancellation_refund_amt']= element['cancellation_refund_amt']
this.obj2['payment_status']= element['payment_status']
this.obj2['update_user_id']= element['update_user_id']
this.obj2['party_name']= element['party_name']
this.obj2['party_bank_name']= element['party_bank_name']
this.obj2['party_branch_name']= element['party_branch_name']
this.obj2['party_ifsc_code']= element['party_ifsc_code']
this.obj2['party_account_no']= element['party_account_no']
this.obj2['cancellation_id']= element['cancellation_id']
this.obj2['arr_id']= element['arr_id']
this.obj2['b_acct_id']= this.b_acct_id
this.obj2['id']= element['id']
this.obj2['cost_code']= element['cost_code']



$('.nav-tabs a[href="#tab-4"]').tab('show')

}
  async edit(element, i) {
  

    
    this.obj1['cancellation_refund_amt']= element['cancellation_refund_amt']
    this.obj1['payment_status']= element['payment_status']
   
    this.obj1['update_user_id']= element['update_user_id']
    this.obj1['party_name']= element['party_name']
    this.obj1['party_bank_name']= element['party_bank_name']
    this.obj1['party_branch_name']= element['party_branch_name']
    this.obj1['party_ifsc_code']= element['party_ifsc_code']
    this.obj1['party_account_no']= element['party_account_no']
    this.obj1['cancellation_id']= element['cancellation_id']
      this.obj1['arr_id']= element['arr_id']
      this.obj1['b_acct_id']= this.b_acct_id
      this.obj1['update_user_id']=this.user_id
      this.obj1['id']= element['id']

     
    
 
 
  $('.nav-tabs a[href="#tab-3"]').tab('show')

  }
  async update(){  
    this.spinner.show();
   
    var resp = await this.cancellationservice.updatecancellation(this.obj1);
    if (resp['error'] == false) {

    // await this.changeScheme()
      this.spinner.hide();
     $('.nav-tabs a[href="#tab-1"]').tab('show')
     this.snackBar.open("Updated Successfully", 'Success!', {
      duration: 5000,
    });
      //this.toastr.successToastr('Updated Successfully')
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
      //this.toastr.errorToastr(resp['data']);
    }
  }
  refressadd(){
    this.obj=Object.assign({},{data:[]})
    this.obj1=Object.assign({},{data:[]})
    this.obj2=Object.assign({},{data:[]})


  }
  async paymentDone(element,i){
    var obj=new Object;
    obj['b_acct_id']=this.b_acct_id
    obj['update_user_id']=this.user_id

    obj['cancellation_id']=[]
    obj['cancellation_id'].push(element['cancellation_id'])
    this.spinner.show()
    var resp = await this.cancellationservice.updatepaymentstatus(obj);
    if (resp['error'] == false) {
     
      this.spinner.hide();
      this.snackBar.open("Approved Successfully", 'Error', {
        duration: 5000,
      });

    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }
  }
  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}





