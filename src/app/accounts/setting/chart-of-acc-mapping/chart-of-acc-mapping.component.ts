import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service'

import swal from 'sweetalert2';
import {ChartOfAccountService} from '../../service/chart-of-account.service'
import {ChartAcctMapingServiceService} from '../../service/chart-acct-maping-service.service'

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any

@Component({
  selector: 'app-chart-of-acc-mapping',
  templateUrl: './chart-of-acc-mapping.component.html',
  styleUrls: ['./chart-of-acc-mapping.component.css']
})
export class ChartOfAccMappingComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  list = ['id','chart_acc', 'type', 'relation','action'];
  type=[{id:'GST'},{id:'BANK'},{id:'DEDUCTION'}]
  datasource;
  constructor(
    private router: Router, private spinner: NgxSpinnerService, private chartAccMapingS:ChartAcctMapingServiceService,private ch_acc_S:ChartOfAccountService,private settingService: SettingService) { }

  erpUser;
  b_acct_id;
  obj={}
  chartOfAcc=[]

 async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.allChartOfAccount()
    await this.getList()
  }
  async allChartOfAccount() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ch_acc_S.getchartofaccount(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      
      for(let i=0;i<resp['data'].length;i++){
      resp['data'][i]['leaf_value']=resp['data'][i]['leaf_code']+' - '+ resp['data'][i]['leaf_value']
      }
      this.chartOfAcc = resp['data']
    } else {
      this.spinner.hide()
    }
  }
  async getList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.chartAccMapingS.getRelationList(JSON.stringify(obj));
    if (resp['error'] == false) {
      for(let i=0;i<resp['data'].length;i++){
        for(let j=0;j<this.chartOfAcc.length;j++){
          if(resp['data'][i]['chart_of_account']==this.chartOfAcc[j]['leaf_code']){
            resp['data'][i]['chart_of_account']=this.chartOfAcc[j]['leaf_value']
          }
        }
      }
      this.datasource = new MatTableDataSource(resp['data'])
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();


    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  list!",'error');
    }
  }
async submit(){
  this.spinner.show()
    this.obj['b_acct_id']=this.b_acct_id
    this.obj['create_user_id']=this.erpUser.user_id
    var resp = await this.chartAccMapingS.createRelation(this.obj);
    if (resp['error'] == false) {
     this.spinner.hide()
     await this.getList()
      swal.fire("Success", "Successfully created",'success');
      $('.nav-tabs a[href="#tab-1"]').tab('show')

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while creating relation",'error');

    }
  }
  async open_update(e) {
    this.obj=e
    this.obj['chart_of_account']=e['chart_of_account'].split(' - ')[0]

     $('.nav-tabs a[href="#tab-3"]').tab('show')
   }
   async update(){
    this.spinner.show()
      this.obj['b_acct_id']=this.b_acct_id
      this.obj['update_user_id']=this.erpUser.user_id
      var resp = await this.chartAccMapingS.updateRelation(this.obj);
      if (resp['error'] == false) {
       this.spinner.hide()
       await this.getList()
        swal.fire("Success", "Successfully Updated",'success');
        $('.nav-tabs a[href="#tab-1"]').tab('show')

  
      } else {
        this.spinner.hide();
        swal.fire("Error", "...Error while updating relation",'error');
  
      }
    }
    async delete(e){
      this.spinner.show()
        // this.obj['b_acct_id']=this.b_acct_id
        let ob={}
        ob['b_acct_id']=this.b_acct_id
        ob['id']=e['id']
        var resp = await this.chartAccMapingS.deleteRelation(JSON.stringify(ob));
        if (resp['error'] == false) {
         this.spinner.hide()
         await this.getList()
          swal.fire("Success", "Successfully Deleted",'success');
    
        } else {
          this.spinner.hide();
          swal.fire("Error", "...Error While Deleting Relation",'error');
    
        }
      }
  refresh(){
    this.obj={}

  }


  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}
