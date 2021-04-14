import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import {MainService} from '../../service/main.service'
declare var $: any

@Component({
  selector: 'app-unit-conversion',
  templateUrl: './unit-conversion.component.html',
  styleUrls: ['./unit-conversion.component.css']
})
export class UnitConversionComponent implements OnInit {

  constructor(public mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService) { }
  erpUser;
  b_acct_id;
  selectedfrom

  allFields = [];
  obj = {};
  selectField;
  allunit=[];
  selectedunit=[]
  codeValueObj={};
  codeValueShowObj ={};

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'from_unit', 'to_unit','amount', 'action'];
  datasource;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
   
    await this.getunit();
  }
  async getunit(){
    this.spinner.show()
    var resp = await this.settingService.getunit(this.b_acct_id);
    if (resp['error'] == false) {
      this.allunit = resp.data;
      this.changeField();
      
      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all Units!",'error');

    }
  }
  open_update(element) {
    this.obj = Object.assign({}, element);
    this.selectField= element.field_code;
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.obj = {};
  }


  async changeField() {
    this.selectedunit =[];
    for(var i=0;i<this.allunit.length;i++){
      if(this.selectedfrom == this.allunit[i].from_unit){
        this.selectedunit.push(this.allunit[i])
      }
    }
    this.datasource = new MatTableDataSource(this.selectedunit)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }
  
 

  async save() {
    this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['from_unit'] = this.selectedfrom;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.insertunit(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getunit();
      /* await this.getCodeValue();
      await this.getCodeValueForService(); */

      swal.fire("Yaaay", "...Unit added!",'success');


    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while adding Unit!",'error');

    }
  }

  async update() {
    this.spinner.show();
    this.obj['update_user_id'] = this.erpUser.user_id;
    this.obj['from_unit'] = this.selectedfrom;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateunit(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getunit();
     // await this.getCodeValueForService();
      swal.fire("Yaaay", "...Unit updated!",'success');

    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while updating Unit!",'error');

    }
  }
 
  async delete(element){
   
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = [element.id];

    this.spinner.show();
    var resp = await this.settingService.deleteunit(JSON.stringify(obj));
   
    if(resp['error']==false){
      await this.getunit();
     
      this.spinner.hide();
      swal.fire("Yaaay", "...unit deleted successfully !",'success');
    }else{
      this.spinner.hide();
      swal.fire("Oops", "...Unit can not be deleted!",'error');
    }
  }
   

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}
