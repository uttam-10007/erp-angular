import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import {AllEmpService} from '../../service/all-emp.service';
import {MainService} from '../../service/main.service';
import swal from 'sweetalert2';

declare var $: any

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {

  constructor(public mainService: MainService,private spinner: NgxSpinnerService,private snackBar: MatSnackBar,private allEmpService : AllEmpService) { }
  personalInfoObj={};
  erpUser;
  user_id;
  b_acct_id;
  errorMsg=""
  allEmployees=[];
  selectEmpObj={};
  allEmplyees_new = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id=this.erpUser.user_id;
    await this.getAllEmployees();
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmployees = resp.data;
      this.allEmplyees_new=[];
      for(let i=0;i<this.allEmployees.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.allEmployees[i]);
        obj['emp_name']=obj['emp_name']+"-"+this.getNumberFormat(obj['emp_id'])
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
    var resp = await this.allEmpService.getPersonalInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      if(resp.data.length>0)
      this.personalInfoObj = resp.data[0];
      else{
        this.personalInfoObj = {};
      }
      
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list" ,'Error',{
        duration:5000
      });
    }
  }

  async updatePersonalInfo(){

    this.errorMsg = ''
    if (  this.personalInfoObj['emp_pan_no'] == "" || this.personalInfoObj['emp_pan_no'] == undefined||
    this.personalInfoObj['emp_sex'] == "" ||this.personalInfoObj['emp_sex'] == undefined || this.personalInfoObj['emp_permanent_addr_line1'] == undefined
      || this.personalInfoObj['emp_permanent_addr_line1'] == "" || this.personalInfoObj['emp_permanent_addr_city'] == undefined
      || this.personalInfoObj['emp_permanent_addr_city'] == "" || this.personalInfoObj['emp_permanent_addr_state'] == ""|| this.personalInfoObj['emp_permanent_addr_state'] == undefined
      || this.personalInfoObj['emp_permanent_addr_dist'] == undefined || this.personalInfoObj['emp_permanent_addr_dist'] == "" 
      || this.personalInfoObj['emp_permanent_addr_pin_code'] == undefined || this.personalInfoObj['emp_permanent_addr_pin_code'] == ""
      || this.personalInfoObj['emp_local_addr_line1'] == "" || this.personalInfoObj['emp_local_addr_line1'] == undefined||this.personalInfoObj['emp_local_addr_city'] == undefined
      || this.personalInfoObj['emp_local_addr_city'] == "" || this.personalInfoObj['emp_local_addr_state'] == ""|| this.personalInfoObj['emp_local_addr_state'] == undefined
      || this.personalInfoObj['emp_local_addr_dist'] == undefined || this.personalInfoObj['emp_local_addr_dist'] == "" 
      || this.personalInfoObj['emp_local_addr_pin_code'] == undefined || this.personalInfoObj['emp_local_addr_pin_code'] == "") {
        
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
          this.finalupdatePersonalInfo()
        }
      })


    }
  }
  async finalupdatePersonalInfo(){
    this.personalInfoObj['b_acct_id']=this.b_acct_id;
    this.personalInfoObj['party_id']=this.selectEmpObj['party_id'];
    this.personalInfoObj['update_user_id']=this.user_id;
    this.personalInfoObj['emp_gst_no'] = '123'
    this.spinner.show();
    var resp = await this.allEmpService.updatePersonalInfo(this.personalInfoObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      swal.fire("Yaaay", "...and Personal Info Updated!",'success');

      
    } else {
      this.spinner.hide();
      swal.fire("Sorry", "...Some Error Occured!",'error');

    }
  }



}
