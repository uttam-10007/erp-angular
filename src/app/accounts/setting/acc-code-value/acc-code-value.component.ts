import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import {MainService} from '../../service/main.service'
declare var $: any

@Component({
  selector: 'app-acc-code-value',
  templateUrl: './acc-code-value.component.html',
  styleUrls: ['./acc-code-value.component.css']
})
export class AccCodeValueComponent implements OnInit {

  constructor(private mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService) { }
  erpUser;
  b_acct_id;


  allFields = [];
  obj = {};
  selectField;
  allCodeValue=[];
  selectedCodeValue=[]
  codeValueObj={};
  codeValueShowObj ={};

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'code', 'value', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllFields();
    await this.getCodeValue();

  }
  async getCodeValue(){
    this.spinner.show()
    var resp = await this.settingService.getCodeValue(this.b_acct_id);
    if (resp['error'] == false) {
      this.allCodeValue = resp.data;
      this.changeField();
      
      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all values!",'error');

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
    this.selectedCodeValue =[];
    for(var i=0;i<this.allCodeValue.length;i++){
      if(this.selectField == this.allCodeValue[i].field_code){
        this.selectedCodeValue.push(this.allCodeValue[i])
      }
    }
    this.datasource = new MatTableDataSource(this.selectedCodeValue)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  async getAllFields() {
    this.spinner.show()
    var obj= new Object();
    obj['domain_code'] = 'ACCOUNT';
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getFields(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      this.allFields = resp.data;
    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all fields!",'error');

    }
  }

  async save() {
    this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['field_code'] = this.selectField;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.insertCodeValue(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getCodeValue();
      await this.getCodeValueForService();

      swal.fire("Yaaay", "...code value added!",'success');


    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while adding code value!",'error');

    }
  }

  async update() {
    this.spinner.show();
    this.obj['update_user_id'] = this.erpUser.user_id;
    this.obj['field_code'] = this.selectField;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateCodeValues(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getCodeValue();
      await this.getCodeValueForService();
      swal.fire("Yaaay", "...code value updated!",'success');

    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while updating code value!",'error');

    }
  }
  async getCodeValueForService(){
   
    var resp = await this.settingService.getCodeValue(this.b_acct_id);
    var codeValueTempObj={}
    var codeValueShowTempObj={};
    if(resp['error']==false){
      for(var i=0;i<resp.data.length;i++){
        if(codeValueTempObj[resp.data[i]['field_code']]== undefined){
          codeValueTempObj[resp.data[i]['field_code']] = [];
          codeValueShowTempObj[resp.data[i]['field_code']] ={}
        }
        codeValueShowTempObj[resp.data[i]['field_code']][resp.data[i].code] = resp.data[i].value;
        codeValueTempObj[resp.data[i]['field_code']].push(resp.data[i])
      }
      this.codeValueObj = codeValueTempObj;
      this.codeValueShowObj = codeValueShowTempObj;
      this.mainService.codeValueTechObj = this.codeValueObj;
      this.mainService.codeValueShowObj = this.codeValueShowObj;
   
    }else{

    }

  }
  async delete(element){
   
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id;

    this.spinner.show();
    var resp = await this.settingService.deleteCodeValue(JSON.stringify(obj));
   
    if(resp['error']==false){
      await this.getCodeValue();
      await this.getCodeValueForService();
      this.spinner.hide();
      swal.fire("Yaaay", "...code value Deleted!",'success');
    }else{
      this.spinner.hide();
      swal.fire("Oops", "...code value not deleted!",'info');
    }
  }
   

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
