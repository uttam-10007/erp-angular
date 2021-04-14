import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AllotmentService } from '../../service/allotment.service';
import { ScheduleService  } from '../../service/schedule.service';
import { NgxSpinnerService } from "ngx-spinner";
import { PropertyDefinitionService } from '../../service/property-definition.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetadataService } from '../../service/metadata.service';
import {SchemeService} from '../../service/scheme.service';
import {SubSchemeService} from '../../service/sub-scheme.service';
import { PropertyInfoService } from '../../service/property-info.service';

import Swal from 'sweetalert2';
import { ThrowStmt } from '@angular/compiler';
declare var $: any;

@Component({
  selector: 'app-payment-schedule',
  templateUrl: './payment-schedule.component.html',
  styleUrls: ['./payment-schedule.component.css']
})
export class PaymentScheduleComponent implements OnInit {
  erpUser;
  b_acct_id;
  schemeArr=[];
  subSchemeArr=[];
  currSubSchemeArr=[];
  getObj={}
  dataSource;
  allAllotment=[];
  allPaymentSchedule=[];
  emiScheduleObj={};
  availableCost=[];
  propertyType={};
  allCost={};
  selectedAllotment={}
  displayedColumns = ['party_id', 'amount', 'status',  'action'];
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private propertyInfoService : PropertyInfoService,private propService: PropertyDefinitionService,private schemeService: SchemeService,private subSchemeService:SubSchemeService,private scheduleService:ScheduleService,private service: AllotmentService,private snackBar: MatSnackBar, private spinner: NgxSpinnerService,private settingService:MetadataService) { }
  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllSchemes();
    await this.getAllSubschemes();
     
  }
  async getAllSchemes() {
    this.spinner.show();

    var resp = await this.schemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.schemeArr = resp.data;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllSubschemes() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.subSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.subSchemeArr = resp.data;
      this.spinner.hide();

    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async changeScheme(){
      var temp=[];
      for(var i=0;i<this.subSchemeArr.length;i++){
        if(this.getObj['scheme_code'] == this.subSchemeArr[i]['scheme_code']){
          temp.push(this.subSchemeArr[i])
        }
      }
      this.currSubSchemeArr = temp;
  }
  async getPaymentSchedule(){
    this.getObj['b_acct_id'] = this.b_acct_id;
    this.spinner.show();
    var resp = await this.scheduleService.getSchedule(JSON.stringify(this.getObj));
    if(resp['error']==false){
      this.spinner.hide();
      this.allPaymentSchedule = resp['data']
      this.dataSource = new MatTableDataSource(this.allPaymentSchedule);
      this.dataSource.sort = this.sort;

      this.dataSource.paginator = this.paginator;
    }else{
      this.spinner.hide();
      Swal.fire('Error','Error in Getting EMI','error')
    }
  }
  async deletePaymentSchedule(element){
    var obj = new Object()
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id
    this.spinner.show()
    var resp = await this.scheduleService.deletePaymentSchedule(JSON.stringify(obj));
    if(resp['error']==false){
      await this.getPaymentSchedule()
      this.spinner.hide();
      Swal.fire('Success','EMI Deleted','success')
    }else{
      this.spinner.hide();
      Swal.fire('Error','Error in EMI Delete','error')
    }
  }
  async getAllProperty() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.getObj['scheme_code'];
    obj['sub_scheme_code'] = this.getObj['sub_scheme_code'];
    obj['property_status'] = 'ALLOTTED';
    this.spinner.show();

    var resp = await this.propService.getproperty(obj);
    if (resp['error'] == false) {
      var dt = resp['data'];
      for(var i=0;i<dt.length;i++){
        this.propertyType[dt[i]['property_id']] = dt[i]['property_type_id']
      }
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Property", 'Error', {
        duration: 5000,
      });
    }
  } 
  async getAllCost(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.getObj['scheme_code'];
    obj['sub_scheme_code'] = this.getObj['sub_scheme_code'];
    this.spinner.show();

    var resp = await this.propertyInfoService.getAllPropertyTypeCost(obj);
    if(resp['error'] == false){
      var dt = resp['data'];
      for(var i=0;i<dt.length;i++){
        if(this.allCost[dt[i]['property_type_id'] ]== undefined){
          this.allCost[dt[i]['property_type_id']]=[]
        }
        this.allCost[dt[i]['property_type_id']].push(dt[i]);
      }
      this.spinner.hide();

    }else{
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Property Costs", 'Error', {
        duration: 5000,
      });
    }

  }
  async getAllAllotments() {
    await this.getAllProperty();
    await this.getAllCost()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.getObj['scheme_code'];
    obj['sub_scheme_code'] = this.getObj['sub_scheme_code'];
    this.spinner.show();

    var resp = await this.service.getAllAllotment(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allAllotment = resp.data;
      


    } else {
      this.spinner.hide()

      this.snackBar.open("Error occured while getting Allotments", 'Error', {
        duration: 5000,
      });
    }
  }
  changeApplicant(){
    this.availableCost=[]
    for(var i=0;i<this.allAllotment.length;i++){
      if(this.allAllotment[i]['party_id'] == this.getObj['party_id']){
        this.selectedAllotment = this.allAllotment[i];
      }
    }
    var propertyType = this.propertyType[this.selectedAllotment['property_id']]
    var emis = this.allCost[propertyType];
    var ob={}
    var temp=[]
    for(var i=0;i<emis.length;i++){
      if(ob[emis[i]['payment_type']] == undefined){
        ob[emis[i]['payment_type']]=1;
        temp.push({code: emis[i]['payment_type'],value: emis[i]['payment_type']})
      }
    }
    this.availableCost = temp;
  }
  async schedulePayment(){
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['create_user_id'] = this.erpUser['user_id'];
    obj['party_id'] = this.selectedAllotment['party_id']
    obj['scheme_code'] =this.selectedAllotment['scheme_code']
    obj['sub_scheme_code'] = this.selectedAllotment['sub_scheme_code']
    obj['data'] =[]
    var propertyType = this.propertyType[this.selectedAllotment['property_id']]
    var emis = this.allCost[propertyType];
    for(var i=0;i<emis.length;i++){
      if(emis[i]['payment_type'] == this.getObj['payment_type']){
        emis[i]['amount'] = emis[i]['payment_amount'];
        obj['data'].push(emis[i]);

      }
    }
    this.spinner.show();
    var resp =await this.scheduleService.schedulePayment(obj);
    if(resp['error'] == false){
      this.spinner.hide();
      await this.getPaymentSchedule()
      Swal.fire('Success','Payment Scheduled','success')
    }else{
      this.spinner.hide()
      Swal.fire('Error','Error in Payment Schedule','error')
    }
  }


  applyFilter(filterValue: string) {

      this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}


