import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SchemeService } from '../../service/scheme.service';
import { SubSchemeService } from '../../service/sub-scheme.service';
import { PropertyDefinitionService } from '../../service/property-definition.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainService } from '../../service/main.service';
import {PropertyInfoService} from '../../service/property-info.service';

declare var $: any;
@Component({
  selector: 'app-property-definition',
  templateUrl: './property-definition.component.html',
  styleUrls: ['./property-definition.component.css']
})
export class PropertyDefinitionComponent implements OnInit {

 

  displayedColumns = ['property_id', 'property_no', 'property_type_id', 'property_status','action'];
  obj = {}
  erpUser;
  b_acct_id
  data;
  dataSource
  costArr;
  schemeObject = {};
  subschemeObject = {};
  costObject = {}
  statusSchemeArr=[]
  property_type_id

  PropInfoArr = [];
  subschemeArr = [];
  AllsubschemeArr = [];
  schemeArr = [];

  user_id
  scheme_code

  statusObj={}
  costObj = { cost_code: "" }
  property_type_flag="Plot";
  propShow={};
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private propInfoService:PropertyInfoService,public mainService: MainService,private SubSchemeService: SubSchemeService,private SchemeService : SchemeService,private PropertyDefinitionService :PropertyDefinitionService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }


  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllPropert();
    await this.getAllSchemes();
    await this.getAllSubScheme();
    await this.getAllPropertyInfos();


  }
  async getAllPropertyInfos() {
    var obj = new Object()
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code'];
    obj['sub_scheme_code'] = this.obj['sub_scheme_code'];

    this.spinner.show();
    var resp = await this.propInfoService.getAllPropertyType(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      var dt = resp.data;
      this.propShow={};
      for(var i=0;i<dt.length;i++){
        this.propShow[dt[i]['property_type_id']] = dt[i]['property_type_code'] +" - "+dt[i]['length']+" X "+dt[i]['width']
      }
      // this.dataSource = new MatTableDataSource(this.data);
      // this.dataSource.sort = this.sort;
      // this.dataSource.paginator = this.paginator;
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Property Informations", 'Error', {
        duration: 5000,
      });
    }
  }
  async  getAllSubScheme() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    this.spinner.show();
    var resp = await this.SubSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.AllsubschemeArr = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub-Schemes", 'Error', {
        duration: 5000,
      });
    }
  }

  async changeScheme(scheme_code) {

    this.subschemeArr = [];
    this.scheme_code =scheme_code
    for (let i = 0; i < this.AllsubschemeArr.length; i++) {
      if (scheme_code == this.AllsubschemeArr[i].scheme_code) {
        this.subschemeArr.push(this.AllsubschemeArr[i]);
      }
    }
  }

  async changeScheme1() {

    this.statusSchemeArr = [];
    for (let i = 0; i < this.AllsubschemeArr.length; i++) {
      if (this.statusObj['scheme_code'] == this.AllsubschemeArr[i].scheme_code) {
        this.statusSchemeArr.push(this.AllsubschemeArr[i]);
      }
    }
  }

  
    
  async gettypeofproperty() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code'];
    obj['sub_scheme_code'] = this.obj['sub_scheme_code'];
    this.spinner.show();

    var resp = await this.PropertyDefinitionService.gettypeofproperty(obj);
    if (resp['error'] == false) {
      this.PropInfoArr = resp.data;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Property Informations", 'Error', {
        duration: 5000,
      });
    }
  }

  async getAllSchemes() {
    this.spinner.show();

    var resp = await this.SchemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.schemeArr = resp.data;
      for (let i = 0; i < this.schemeArr.length; i++) {
        this.schemeObject[this.schemeArr[i]['scheme_code']] = this.schemeArr[i]['scheme_name']
      }
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }



  async getAllPropert() {
    await this.getAllPropertyInfos()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code'];
    obj['sub_scheme_code'] = this.obj['sub_scheme_code'];
    obj['property_status'] = this.obj['property_status'];
    this.spinner.show();
    var resp = await this.PropertyDefinitionService.getproperty(obj);
    if (resp['error'] == false) {
      this.data = resp.data;
      for(var i=0;i<this.data.length;i++){
        this.data[i]['prop_desc'] = this.propShow[this.data[i]['property_type_id']]
      }
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Property", 'Error', {
        duration: 5000,
      });
    }
  } 

  async addNewRow() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.user_id
    this.spinner.show();    
    var resp = await this.PropertyDefinitionService.createProperty(obj);
    if (resp['error'] == false) {
      //await this.getAllPropert();
      this.spinner.hide();
      this.snackBar.open("Property Added Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open(resp.data, 'Error', {
        duration: 5000,
      });
    }


  } 

   async edit(element, i) {
    this.obj = element;
    await this.changeScheme(this.obj['scheme_code']);
    await this.gettypeofproperty();
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  } 
  async delete(element, i) {
    this.obj = element;
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    this.spinner.show();

    var resp = await this.PropertyDefinitionService.deleteproperty(obj);
    if (resp['error'] == false) {
      this.snackBar.open(" deleted successfully", 'Success', {
        duration: 5000,
      });
      await this.getAllPropert();
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Property Informations", 'Error', {
        duration: 5000,
      });
    }
  } 

  async update() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id'] = this.user_id
    this.spinner.show();
    var resp = await this.PropertyDefinitionService.updateProperty(obj);
    if (resp['error'] == false) {

      await this.getAllPropert();

      this.spinner.hide();
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.snackBar.open("Property Updated Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open(resp.data, 'Error', {
        duration: 5000,
      });
    }
  } 


  refressadd() {
    this.obj = Object.assign({}, {})
  }


 
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  

}
