import {MainService} from '../service/main.service'
import {PropertyInfoService} from '../service/property-info.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AllotmentService } from '../service/allotment.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchemeService } from '../service/scheme.service';
import { AuctionService } from '../service/auction.service';

import { SubSchemeService } from '../service/sub-scheme.service';
import { RegistryService } from '../service/registry.service'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { PropertyDefinitionService } from '../service/property-definition.service';

import { ExcelService } from '../service/file-export.service';
import Swal from 'sweetalert2';
import { ApplicationService } from '../service/application.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;

@Component({
  selector: 'app-auction-application',
  templateUrl: './auction-application.component.html',
  styleUrls: ['./auction-application.component.css']
})
export class AuctionApplicationComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource;
  displayedColumns = ['app_id','purpose','app_name','app_mobile','app_user_name','nationality','action'];

  constructor(private mainService:MainService,private applicationService:ApplicationService ,private auctionService:AuctionService ,private PropertyDefinitionService :PropertyDefinitionService,private propInfoService:PropertyInfoService,private spinner:NgxSpinnerService,private SchemeService:SchemeService,private SubSchemeService:SubSchemeService ) { }
 
  erpUser;
  b_acct_id;
  user_id;
 async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
  
    await this.getAllSchemes();
  }
obj={}
  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
showData={}
  async view(element) {
this.showData={}
    console.log(this.data);
console.log(element);
    this.showData=Object.assign({},element)
for(let i=0;i<this.data.length;i++){
  if(element['sub_scheme_code']==this.data[i]['sub_scheme_code']){
    this.showData['subsidised_or_non_subsidised']=this.data[i]['subsidised_or_non_subsidised']

    this.showData['residential_or_commercial']=this.data[i]['residential_or_commercial']

    this.showData['no_of_property']=this.data[i]['no_of_property']

    this.showData['property_type_code']=this.data[i]['property_type_code']

    this.showData['length']=this.data[i]['length']

    this.showData['width']=this.data[i]['width']

  }
}
console.log(this.subschemeArr);
console.log(this.schemeArr);

for(let i=0;i<this.subschemeArr.length;i++){
  if(element['sub_scheme_code']==this.subschemeArr[i]['sub_scheme_code']){
    this.showData['sub_scheme_name']=this.subschemeArr[i]['sub_scheme_name']
    this.showData['locality']=this.subschemeArr[i]['locality']
    this.showData['state']=this.subschemeArr[i]['state']

  }
}
for(let i=0;i<this.schemeArr.length;i++){
  if(element['scheme_code']==this.schemeArr[i]['scheme_code']){
    this.showData['scheme_name']=this.schemeArr[i]['scheme_name']
  }
}
      $('.nav-tabs a[href="#tab-2"]').tab('show')
      
    }
    async approve(element) {
      var obj = new Object;
      obj['b_acct_id'] = this.b_acct_id
      obj['id'] = element.arr_id
      obj['arr_status_code'] = 'APPLICATION_APPROVED'
      this.spinner.show()
      var resp = await this.applicationService.changeApplicationStatus(obj);
      if (resp['error'] == false) {
await this.show()
Swal.fire('Success','Successfully Approved','success')
        this.spinner.hide();
          
      } else {
        this.spinner.hide();
        Swal.fire('Error','Some Error Occured','error')
     
      }
    }
  
  
    
  async show() {
    this.spinner.show();
    console.log(this.data);
    
    
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.auctionService.getAllAuctionApplication(JSON.stringify(this.obj));
    console.log(resp);
    
     if (resp['error'] == false) {
      console.log(resp['data']);
      
    
      this.dataSource = new MatTableDataSource(resp['data']);
      this.dataSource.sort = this.sort;

      this.dataSource.paginator = this.paginator; 
      this.spinner.hide();


    } else {
      this.spinner.hide();
Swal.fire('Error','Error While getting list','error')
    } 
  }
  schemeArr=[]
  async getAllSchemes() {
    this.spinner.show();

    var resp = await this.SchemeService.getScheme(this.b_acct_id);
    console.log(resp);
    if (resp['error'] == false) {
     
      
      this.schemeArr = resp.data;
      /* for (let i = 0; i < this.schemeArr.length; i++) {
        this.schemeObject[this.schemeArr[i]['scheme_code']] = this.schemeArr[i]['scheme_name']
      } */
      this.spinner.hide();
    } else {
      this.spinner.hide();
     /*  this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      }); */
    }
  }
  data=[]
  async getAllPropertyInfos() {
    this.data=[]
    this.obj['b_acct_id'] = this.b_acct_id
    this.spinner.show();
    var resp = await this.propInfoService.getAllPropertyType(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.data = resp.data;
      console.log(this.data);
     /*  this.obj['property_type_id']=[]
      for(let i=0;i<this.data.length;i++){
        this.obj['property_type_id'].push(this.data[i]['property_type_id'])
      } */
      
  /*     this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator; */
    } else {
      this.spinner.hide();
      /* this.snackBar.open("Error occured while getting Property Informations", 'Error', {
        duration: 5000,
      }); */
    }
  }
  subschemeArr=[]
  async getAllSubschemes() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code'];
    var resp = await this.SubSchemeService.getsubScheme(obj);
    console.log(resp);
    
    if (resp['error'] == false) {
      this.subschemeArr = resp.data;

    
      this.spinner.hide();

    } else {

      this.spinner.hide();
      
    }
  } 
}
