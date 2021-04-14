import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MetadataService } from '../../service/metadata.service';
import { MainService } from '../../service/main.service';
import {SchemeService} from '../../service/scheme.service';
import {SubSchemeService} from '../../service/sub-scheme.service';
import {PropertyInfoService} from '../../service/property-info.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
declare var $: any;

@Component({
  selector: 'app-property-info',
  templateUrl: './property-info.component.html',
  styleUrls: ['./property-info.component.css']
})
export class PropertyInfoComponent implements OnInit {

 
  displayedColumns = ['property_type_id', 'property_type_code', 'residential_or_commercial', 'subsidised_or_non_subsidised', 'quota_code', 'sub_quota_code', 'no_of_property','length','width','measurement_unit','estimated_cost','additional_cost','premium_amount','final_amount','amount_per','cancellation_amount_per','action'];
  obj = {}
  erpUser;
  b_acct_id
  data;
  dataSource;
  selectedCost = [];
  costObj_temp = { cost_code: '', cost_desc: '', no_of_installment: '', emi: [] };
  allScheme=[];
  allSubScheme=[];
  selectedtSubScheme=[];
  getObj={};
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private schemeService: SchemeService,private propInfoService: PropertyInfoService, private subSchemeService: SubSchemeService,public mainService: MainService, private metadataService: MetadataService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }


  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.selectedCost.push(Object.assign({}, this.costObj_temp));
    //await this.getAllPropertyInfos();
    await this.getAllSchemes();
    await this.getAllsubSchemes();

  }

  async getAllSchemes() {
    this.spinner.show();
    
    var resp = await this.schemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.allScheme = resp['data'];
      this.spinner.hide();

    } else {
      this.spinner.hide();
     
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllsubSchemes(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    this.spinner.show();

    var resp = await this.subSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.allSubScheme = resp['data'];
      this.spinner.hide();

    } else {
      this.spinner.hide();
      
      this.snackBar.open("Error occured while getting Sub-Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  changeSchemeToShow(){
    var temp=[];
    for(var i=0;i<this.allSubScheme.length;i++){
      if(this.allSubScheme[i]['scheme_code'] == this.getObj['scheme_code']){
        temp.push(this.allSubScheme[i]);
      }
    }
    this.selectedtSubScheme=temp;
  }
  changeScheme(){
    var temp=[];
    for(var i=0;i<this.allSubScheme.length;i++){
      if(this.allSubScheme[i]['scheme_code'] == this.obj['scheme_code']){
        temp.push(this.allSubScheme[i]);
      }
    }
    this.selectedtSubScheme=temp;
  }
  ChangeCost(i) {

    var no_of_installment = parseInt(this.selectedCost[i]['no_of_installment']);
    this.selectedCost[i]['emi'] = [];
    for (let j = 0; j < no_of_installment; j++) {
      this.selectedCost[i]['emi'].push({id: j, payment_type: no_of_installment, payment_amount: 0 })
    }
  }

  async getAllPropertyInfos() {
    this.getObj['b_acct_id'] = this.b_acct_id
    this.spinner.show();
    var resp = await this.propInfoService.getAllPropertyType(this.getObj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.data = resp.data;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Property Informations", 'Error', {
        duration: 5000,
      });
    }
  }

  check() {
    for (let i = 0; i < this.selectedCost.length; i++) {
      var cost_amount = 0;
      for (let j = 0; j < this.selectedCost[i]['emi'].length; j++) {
        cost_amount = cost_amount + parseInt(this.selectedCost[i]['emi'][j]['amount']);
      }
      this.selectedCost[i]['cost_amount'] = cost_amount;
    }
  }

  async save() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id;
    obj['create_user_id'] = this.erpUser.user_id;
    var cost = [];
    for (let i = 0; i < this.selectedCost.length; i++) {
      var emi = this.selectedCost[i]['emi'];
      for(var j=0;j<emi.length;j++){
        cost.push(this.selectedCost[i]['emi'][j]);
      }      
    }
    obj['data'] = cost;
    this.spinner.show();
    var resp = await this.propInfoService.createPropertyType(obj);
    if (resp['error'] == false) {
      await this.getAllPropertyInfos();
      this.spinner.hide();
      this.snackBar.open("Property Type Added Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }


  }

  async open_update(element) {
    this.obj = element;
    this.selectedCost = [];
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['property_type_id'] = element.property_type_id;

    var resp = await this.propInfoService.getPropertyTypeCost(obj);
    if (resp['error'] == false) {
      var costObj={}
      for(var i=0;i<resp.data.length;i++){
        if(costObj[resp['data'][i]['payment_type']]==undefined){
          costObj[resp['data'][i]['payment_type']] =[];
        }
        costObj[resp['data'][i]['payment_type']].push(resp['data'][i]);
      }
      var keys = Object.keys(costObj);
      for(var i=0;i<keys.length;i++){
        this.selectedCost.push({emi:[] });
        var emis = costObj[keys[i]];
        for(var j=0;j<emis.length;j++){
          this.selectedCost[i]['emi'].push({id: j, payment_type: emis[j]['payment_type'], payment_amount: emis[j]['payment_amount'] })
          this.selectedCost[i]['no_of_installment'] = emis[j]['payment_type']
        }
      }
      

      
      this.spinner.hide();
     
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }



    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
  async update() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id;
    obj['update_user_id'] = this.erpUser.user_id;
    
    var cost = [];
    for (let i = 0; i < this.selectedCost.length; i++) {
      var emi = this.selectedCost[i]['emi'];
      for(var j=0;j<emi.length;j++){
        cost.push(this.selectedCost[i]['emi'][j]);
      }
      
    }
    obj['data'] = cost;
    this.spinner.show();
    var resp = await this.propInfoService.updatePropertyType(obj);
    if (resp['error'] == false) {
      await this.getAllPropertyInfos();
      this.spinner.hide();
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.snackBar.open("Property Info Updated Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open(resp.data, 'Error', {
        duration: 5000,
      });
    }
  }

  

  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addNewCost() {
    this.selectedCost.push(Object.assign({}, this.costObj_temp))
  }
  deleteCost(i) {
    this.selectedCost.splice(i, 1)
  }

}
