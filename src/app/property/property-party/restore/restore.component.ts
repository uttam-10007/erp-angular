import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';

import { SchemeService } from '../../service/scheme.service';
import { MainService } from '../../service/main.service';
import { SubSchemeService } from '../../service/sub-scheme.service';
import { RestoreService } from '../../service/restore.service';

declare var $: any;

@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.css']
})
export class RestoreComponent implements OnInit {
  displayedColumns = ['party_id','party_name','party_phone_no','property_type_code','property_no','arr_effective_date','action'];

  erpUser;
  b_acct_id
  data;
  schemeArr;
  selectedSchemeCode=''
  dataSource
  schemeObject={}
  party_id=''
  costCodeArr=[]
scheduleArr=[];
partyObj={}
partyArr
subschemeArr;
subschemeObject={}
subselectedSchemeCode;
user_id
obj={}
paymentTypeArr;
restoreAt=[{value:"CURRENT RATE"},{value:'NEW RATE'}]



@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
@ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private restoreService: RestoreService,private subSchemeService: SubSchemeService,
     private schemeService: SchemeService,private service: PartyService,private snackBar: MatSnackBar, private mainService:MainService,
      private spinner: NgxSpinnerService) { }


  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id=this.erpUser.b_acct_id;
    this.user_id=this.erpUser.user_id;
   
    await this.getAllSchemes()
    
   

  }

  async getAllSchemes(){
    this.spinner.show()
    var resp = await this.schemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.schemeArr = resp.data;
      
      for(let i=0;i<this.schemeArr.length;i++){
this.schemeObject[this.schemeArr[i]['scheme_code']]=this.schemeArr[i]['scheme_name']
      }
      this.spinner.hide();
     
    } else {
      //this.toastr.errorToastr('Some Error Occurred')
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
    this.spinner.show();
    var resp = await this.subSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.subschemeArr = resp.data;
      
      for(let i=0;i<this.subschemeArr.length;i++){
this.subschemeObject[this.subschemeArr[i]['sub_scheme_code']]=this.subschemeArr[i]['sub_scheme_name']
      }
      this.spinner.hide();
     
    } else {
      
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllcancelled(){
    var obj=new Object;
    obj['b_acct_id']=this.b_acct_id
    obj['scheme_code']=this.selectedSchemeCode
    obj['sub_scheme_code']=this.subselectedSchemeCode
    this.spinner.show();

    var resp = await this.restoreService.getAllcancelled(obj);
    if (resp['error'] == false) {
      this.data = resp.data;
      
  
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Information", 'Error', {
        duration: 5000,
      });
    }
  }
  applyFilter(filterValue: string) {
      
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  
  async openUpdate(element, i) {
    if(element['property_status']=='ALLOTTED'){
      this.snackBar.open("Property Already Allotted!", 'Error', {
        duration: 5000,
      });
    }else{
      this.obj=element
      $('.nav-tabs a[href="#tab-2"]').tab('show')
    }

   

  }
  async changeRate(){
    if(this.obj['rate']=='NEW RATE'){
      var obj=new Object;
      obj['b_acct_id']=this.b_acct_id
     
      obj['property_type_id']=this.obj['property_type_id']
      this.spinner.show();
      var resp = await this.restoreService.getAllPaymentType(obj);
      if (resp['error'] == false) {
        this.paymentTypeArr = resp.data;
    
        this.spinner.hide();
  
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Information", 'Error', {
          duration: 5000,
        });
      }
    }
  }

 async restore(){
    if(this.obj['rate']=='CURRENT RATE'){


      this.spinner.show();
      this.obj['b_acct_id']=this.b_acct_id
      this.obj['update_user_id']=this.user_id
      var resp = await this.restoreService.restoreAtCurrentRate(this.obj);
      if (resp['error'] == false) {
        await this.getAllcancelled()
        this.obj={}
       
        this.spinner.hide();
        this.snackBar.open("Restore Successfully!", 'Success', {
          duration: 5000,
        });
  
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured", 'Error', {
          duration: 5000,
        });
      }

    }

    if(this.obj['rate']=='NEW RATE'){
     this.spinner.show();
      this.obj['b_acct_id']=this.b_acct_id
      this.obj['update_user_id']=this.user_id
      var resp = await this.restoreService.restoreAtNewRate(this.obj);
      if (resp['error'] == false) {
       await this.getAllcancelled()
       this.obj={}
        this.spinner.hide();
        this.snackBar.open("Restore Successfully!", 'Success', {
          duration: 5000,
        });
  
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured", 'Error', {
          duration: 5000,
        });
      }

    }
  }
}
