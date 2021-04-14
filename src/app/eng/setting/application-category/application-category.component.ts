import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import {MainService} from '../../service/main.service'
declare var $: any


@Component({
  selector: 'app-application-category',
  templateUrl: './application-category.component.html',
  styleUrls: ['./application-category.component.css']
})
export class ApplicationCategoryComponent implements OnInit {

  
  constructor(private mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService) { }
  erpUser;
  b_acct_id;


  allFields = [];
  obj = {};
  selectField;
  allCategory=[];
  selectedCodeValue=[]
  codeValueObj={};
  codeValueShowObj ={};

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'application_category_code', 'amount','num_of_years','num_of_months','num_of_days', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getRefApplications();

  }
  async getRefApplications(){
    let obj=new Object
    obj['b_acct_id']=this.b_acct_id
    var resp = await this.settingService.getRefApplications(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allCategory = resp.data;
      this.datasource = new MatTableDataSource(this.allCategory)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      
      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all Categories.!",'error');

    }
  }
  open_update(element) {
    this.obj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.obj = {};
  }




  async save() {
    this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.createRefApplication(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getRefApplications();

      swal.fire("Yaaay", "...Category added!",'success');


    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while adding Category!",'error');

    }
  }

  async update() {
    this.spinner.show();
    this.obj['update_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateRefApplication(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getRefApplications();
      swal.fire("Yaaay", "...Category updated!",'success');

    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while updating Category!",'error');

    }
  }

  async delete(element){
   
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id;

    this.spinner.show();
    var resp = await this.settingService.deleteRefApplication(JSON.stringify(obj));
   
    if(resp['error']==false){
      await this.getRefApplications();
      this.spinner.hide();
      swal.fire("Yaaay", "...Category Deleted!",'success');
    }else{
      this.spinner.hide();
      swal.fire("Oops", "...Category not deleted!",'error');
    }
  }
   

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}