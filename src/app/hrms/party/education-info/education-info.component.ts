import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import {AllEmpService} from '../../service/all-emp.service';
import {MainService} from '../../service/main.service'
declare var $: any
import swal from 'sweetalert2';

@Component({
  selector: 'app-education-info',
  templateUrl: './education-info.component.html',
  styleUrls: ['./education-info.component.css']
})
export class EducationInfoComponent implements OnInit {

  constructor(public mainService: MainService,private spinner: NgxSpinnerService,private snackBar: MatSnackBar,private allEmpService : AllEmpService) { }
  personalInfoObj={};
  erpUser;
  user_id;
  b_acct_id;
  allEmployees=[];
  selectEmpObj={};
  selectedEmpEducation=[];
  eductionObj={};
  codeValueTechObj={};
  errorMsg = ''
  allEmplyees_new = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
 
  displayedColumns = ['education_name','education_type_code', 'pass_year', 'action'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj= this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id=this.erpUser.user_id;
    await this.getAllEmployees();
    //await this.getQualifications();
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
   
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        this.allEmployees.push(obj)
      } 
      this.allEmplyees_new=[];
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.allEmplyees_new.push(obj)
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list" ,'Error',{
        duration:5000
      });
    }
  }

  async changeEmployee(){
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    
    this.spinner.show();
    var resp = await this.allEmpService.getQualifications(obj);
    if(resp['error']==false){
      this.spinner.hide();
        this.selectedEmpEducation = resp.data;
        this.datasource = new MatTableDataSource(this.selectedEmpEducation)
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort
    }else{
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list" ,'Error',{
        duration:5000
      });
    }
    
   
  }

  openUpdate(element){
    this.errorMsg = ''
    $('.nav-tabs a[href="#tab-3"]').tab('show');
  this.eductionObj=Object.assign({},element);

  }
  async submitEductionInfo(){
    

    this.errorMsg = ''
    if (  
    this.eductionObj['education_name'] == "" ||this.eductionObj['education_name'] == undefined 
          || this.eductionObj['education_type_code'] == "" || this.eductionObj['education_type_code'] == undefined
      || this.eductionObj['pass_year_code'] == null || this.eductionObj['pass_year_code'] ==undefined ) {
      
      this.errorMsg = "* fields required."

        
    }
 else {

      swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        if (result.value) {
          this.finalsubmitEductionInfo()
        }
      })


    }
  }
  async finalsubmitEductionInfo(){
    this.eductionObj['b_acct_id']=this.b_acct_id;
    this.eductionObj['emp_id']=this.selectEmpObj['emp_id'];
    this.eductionObj['create_user_id']=this.user_id;
    this.spinner.show();
    var resp = await this.allEmpService.addQualification(this.eductionObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
      // this.snackBar.open("Education Info Added" ,'Success',{
      //   duration:5000
      // });
      swal.fire("Yaaay", "Education Info Added",'success');

      
    } else {
      this.spinner.hide();
    
      swal.fire("Sorry", "...Some Error Occured!",'error');

    }
  }


  async updateEductionInfo(){
    this.errorMsg = ''
    if (  
    this.eductionObj['education_name'] == "" ||this.eductionObj['education_name'] == undefined 
          || this.eductionObj['education_type_code'] == "" || this.eductionObj['education_type_code'] == undefined
      || this.eductionObj['pass_year_code'] == null || this.eductionObj['pass_year_code'] ==undefined ) {
      
      this.errorMsg = "* fields required."

        
    }
 else {

      swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Update it!'
      }).then((result) => {
        if (result.value) {
          this.finalupdateEductionInfo()
        }
      })


    }
  }
  async finalupdateEductionInfo(){

    this.eductionObj['b_acct_id']=this.b_acct_id;
    this.eductionObj['update_user_id']=this.user_id;
    this.spinner.show();
    var resp = await this.allEmpService.updateQualifications(this.eductionObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
     
      swal.fire("Yaaay", "Education Info Updated",'success');
      
    } else {
      this.spinner.hide();
      swal.fire("Sorry", "...Some Error Occured!",'error');

    }
  }

  async deleteEducation(element){
    var obj=new Object();

    obj['b_acct_id']=this.b_acct_id;
    obj['id']=element['id'];
    this.spinner.show();
    var resp = await this.allEmpService.deleteQualification((obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();
      this.snackBar.open(resp.data ,'Success',{
        duration:5000
      });
      
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while deleting Eduction Info Of Employee" ,'Error',{
        duration:5000
      });
    }
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  chamgeTab(){
    this.errorMsg=''
  }

}
