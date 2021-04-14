import { MetadataService } from '../../service/metadata.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var $: any;


@Component({
  selector: 'app-application-report',
  templateUrl: './application-report.component.html',
  styleUrls: ['./application-report.component.css']
})
export class ApplicationReportComponent implements OnInit {
  displayedColumns = ['arr_id','party_name', 'father_name','mob_no','txn_amt', 'eff_date','property_type_code','flat_type_code','area'];
  obj={}
  partyArr;
  partyObj={}
  partyFatherObj={}
  partyMob={};
  erpUser;
  b_acct_id
  data;
  dataSource;
  schemeArr;
  schemeObject={}
  selectedSchemeCode;
  arr_id='';
  propTypeArr;
  flatTypeArr;
  distArr
  areaArr
  statusType=""
  subschemeArr;
subschemeObject={}
subselectedSchemeCode;
selectedSubschemeCode;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private service: PartyService,private snackBar: MatSnackBar, private spinner: NgxSpinnerService,private settingService:MetadataService) { }

  
  async  ngOnInit() {
      this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
      this.b_acct_id =this.erpUser.b_acct_id;
      await this.getAllSchemes()
      await this.getAllParties();

     

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
    async fetch(){
      var obj=new Object;
      obj['b_acct_id']=this.b_acct_id
      obj['scheme_code']=this.selectedSchemeCode
      obj['arr_status_code']=this.statusType

      var resp = await this.service.getapplicationreport(obj);
      if (resp['error'] == false) {
        this.data = resp.data;
        
    
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.sort = this.sort;
        
        this.dataSource.paginator = this.paginator;
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Reports", 'Error', {
          duration: 5000,
        });
      }
    }

    async getAllParties(){
      this.spinner.show()
      var resp = await this.service.getPartyShortdetails(this.b_acct_id);
      if (resp['error'] == false) {
        this.spinner.hide()
        this.partyArr = resp.data;
        for(let i=0;i<this.partyArr.length;i++){
          this.partyObj[this.partyArr[i]['party_id']]=this.partyArr[i]['party_name']
          this.partyFatherObj[this.partyArr[i]['party_id']]=this.partyArr[i]['party_father_name']
          this.partyMob[this.partyArr[i]['party_id']]=this.partyArr[i]['party_phone_no']
        }
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Parties", 'Error', {
          duration: 5000,
        });
      }
    }
    


  
    applyFilter(filterValue: string) {

      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}



