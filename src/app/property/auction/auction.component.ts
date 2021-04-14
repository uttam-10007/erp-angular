import { MainService } from '../service/main.service'
import { PropertyInfoService } from '../service/property-info.service';
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
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;
@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.css']
})
export class AuctionComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource;
  displayedColumns = ['party_id', 'arr_effective_date', 'property_type_code', 'property_code', 'length', 'measurement_unit', 'property_no', 'action'];
  constructor(private mainService: MainService, private auctionService: AuctionService, private PropertyDefinitionService: PropertyDefinitionService, private propInfoService: PropertyInfoService, private spinner: NgxSpinnerService, private SchemeService: SchemeService, private SubSchemeService: SubSchemeService) { }
  obj = {}
  schemeArr = []
  erpUser;
  b_acct_id;
  user_id;
  subschemeArr = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    
    await this.getAllSchemes();
    
  }
  refresh(){
    this.obj = {}
    this.dataSource = new MatTableDataSource([]);
    this.data = []
    this.data1 = []
  }
  setPropertyData() {
    for (let i = 0; i < this.data.length; i++) {
      if (this.obj['property_type_id'] == this.data[i]['property_type_id']) {
        this.obj = Object.assign({}, this.data[i])
        console.log(this.obj);
      }
    }
    for (let i = 0; i < this.subschemeArr.length; i++) {
      if (this.obj['sub_scheme_code'] == this.subschemeArr[i]['sub_scheme_code']) {
        this.obj['state'] = this.subschemeArr[i]['state']
        this.obj['district'] = this.subschemeArr[i]['district']
        this.obj['locality'] = this.subschemeArr[i]['locality']
        console.log(this.obj);
      }
    }
    this.getAllPropert()
  }
  /*   changeproperty(){
      for(let i=0;i<this.property_info.length;i++){
        if(this.obj['property_id']==this.property_info[i]['property_id']){
this.obj
      console.log(this.obj);
      
        }
      }
    } */

  data1 = []
  property_info = []
  propobj = {}
  async getAllPropert() {

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code'];
    obj['sub_scheme_code'] = this.obj['sub_scheme_code'];
    obj['property_status'] = 'UNALLOTTED'
    this.spinner.show();
    var resp = await this.PropertyDefinitionService.getproperty(obj);
    if (resp['error'] == false) {
      this.data1 = resp.data;
      console.log(this.data1);

      this.property_info = []
      for (var i = 0; i < this.data1.length; i++) {
        if (this.data1[i]['property_type_id'] == this.obj['property_type_id']) {
          this.property_info.push(this.data1[i])
          console.log(this.property_info);

        }
        /*  this.data[i]['prop_desc'] = this.propShow[this.data[i]['property_type_id']] */
      }
      this.propobj = {}
      for(let i=0;i<this.data1.length;i++){
        this.propobj[this.data1[i]['property_id']] = this.data1[i]['property_no']
        //this.obj['property_type_id'].push(this.data[i]['property_type_id'])
      }
      console.log(this.propobj)
      this.spinner.hide();

    } else {
      this.spinner.hide();

    }
  }
  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setData() {
    console.log(this.obj);
    for (let i = 0; i < this.subschemeArr.length; i++) {
      if (this.obj['sub_scheme_code'] == this.subschemeArr[i]['sub_scheme_code']) {
        this.obj = Object.assign({}, this.subschemeArr[i])
        break
      }

    }
    console.log(this.obj, 'obj');

  }
  filtered_Sub_sch = []
  async getAllSubschemes() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code'];
    var resp = await this.SubSchemeService.getsubScheme(obj);
    console.log(resp);

    if (resp['error'] == false) {
      this.subschemeArr = resp.data;
      //this.getAllPropert()

      this.spinner.hide();

    } else {

      this.spinner.hide();

    }
  }
  async openUpdate(element, i) {
    this.obj = Object.assign({}, element)
    for (let i = 0; i < this.data.length; i++) {
      if (this.obj['property_type_id'] == this.data[i]['property_type_id']) {
        /*  this.obj=Object.assign({},this.data[i]) */
        this.obj['width'] = this.data[i]['width']
        this.obj['length'] = this.data[i]['length']
        this.obj['residential_or_commercial'] = this.data[i]['residential_or_commercial']
        this.obj['subsidised_or_non_subsidised'] = this.data[i]['subsidised_or_non_subsidised']
        console.log(this.obj);
      }
    }
    for (let i = 0; i < this.subschemeArr.length; i++) {
      if (this.obj['sub_scheme_code'] == this.subschemeArr[i]['sub_scheme_code']) {
        this.obj['state'] = this.subschemeArr[i]['state']
        this.obj['district'] = this.subschemeArr[i]['district']
        this.obj['locality'] = this.subschemeArr[i]['locality']
        console.log(this.obj);
      }
    }
    this.getAllPropert()
    
        //this.setPropertyData() 
    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }
  async show() {
    this.spinner.show();

    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.auctionService.getAllAuction(JSON.stringify(this.obj));
    if (resp['error'] == false) {
      console.log(resp['data']);
      await this.getAllPropert()
      await this.getAllPropertyInfos() 

      this.dataSource = new MatTableDataSource(resp['data']);
      this.dataSource.sort = this.sort;

      this.dataSource.paginator = this.paginator;
      this.spinner.hide();


    } else {
      this.spinner.hide();
      Swal.fire('Error', 'Error While getting list', 'error')
    }
  }


  async update() {
    this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id
    this.obj['user_id'] = this.user_id
    var resp = await this.auctionService.updateAuction(this.obj)
    if (resp['error'] == false) {
      await this.show()
      Swal.fire('Success', 'Auction Updated successfully', 'success')
      this.spinner.hide()
    } else {
      Swal.fire('Error', 'Some Error Occured', 'error')
      this.spinner.hide()
    }
  }
  async submit() {
    this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id
    this.obj['user_id'] = this.user_id
    var resp = await this.auctionService.createAuction(this.obj)
    if (resp['error'] == false) {
      await this.show()
      Swal.fire('Success', 'Auction Added successfully', 'success')
      this.spinner.hide()
    } else {
      Swal.fire('Error', 'Some Error Occured', 'error')
      this.spinner.hide()
    }
  }
  data = []
  proptypeobj = {}
  async getAllPropertyInfos() {
    this.data = []
    this.obj['b_acct_id'] = this.b_acct_id
    this.spinner.show();
    var resp = await this.propInfoService.getAllPropertyType(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.data = resp.data;
      console.log(this.data);
      this.proptypeobj = {}
      for(let i=0;i<this.data.length;i++){
        this.proptypeobj[this.data[i]['property_type_id']] = this.data[i]['property_type_code']
        //this.obj['property_type_id'].push(this.data[i]['property_type_id'])
      }
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
  async delete(element) {
    this.spinner.show()
    this.obj['b_acct_id'] = this.b_acct_id
    this.obj['id'] = element['id']
    var resp = await this.auctionService.deleteauction(this.obj)
    if (resp['error'] == false) {
      await this.show()
      Swal.fire('Success', 'Auction Deleted successfully', 'success')
      this.spinner.hide()
    } else {
      Swal.fire('Error', 'Some Error Occured', 'error')
      this.spinner.hide()
    }
  }
  
}
