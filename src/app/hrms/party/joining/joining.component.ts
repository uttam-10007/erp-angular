import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { JoiningService } from '../../service/joining.service';
import { from, empty } from 'rxjs';
import swal from 'sweetalert2';
import { MainService } from '../../service/main.service';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var $: any;

@Component({
  selector: 'app-joining',
  templateUrl: './joining.component.html',
  styleUrls: ['./joining.component.css']
})
export class JoiningComponent implements OnInit {

  constructor(public mainService: MainService, private joiningservice: JoiningService,private snackBar: MatSnackBar, private router: Router, private spinner: NgxSpinnerService) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  joiningObj = {};
  probation = false;
  datasource;
  b_acct_id;
  erpUser;
  user_id
  emp_id = ''
  obj = [{ code: 'CENTRALISED', 'value': 'Centralised Services' }, { code: 'NONCENTRALISED', 'value': 'Non Centralised Services' }];
  ts = [{code:"MORNING",value:"MORNING"},{code:"AFTERNOON",value:"AFTERNOON"}];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getEmployeeid()
  }

  errorMsg = ""
  underAgeValidate(j, d) {
    var dob = d.split('-');
    var year = parseInt(dob[0]);
    var month = parseInt(dob[1]) - 1;
    var day = parseInt(dob[2]);
    var today = new Date(j);
    var age = today.getFullYear() - year;
    if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
      age--;
    }
    return age;
  }
  async addJoining() {
    this.errorMsg = ''
    if (  this.joiningObj['emp_phone_no'] == null || this.joiningObj['emp_phone_no'] == undefined||
    this.joiningObj['joining_order_id'] == "" ||this.joiningObj['joining_order_id'] == undefined || this.joiningObj['joining_date'] == undefined
      || this.joiningObj['joining_service_date'] == undefined || this.joiningObj['joining_type_code'] == undefined
      || this.joiningObj['emp_father_name'] == undefined || this.joiningObj['emp_father_name'] == ""|| this.joiningObj['emp_dob'] == undefined
      || this.joiningObj['emp_name'] == undefined || this.joiningObj['emp_name'] == "" 
      || this.joiningObj['emp_email'] == undefined || this.joiningObj['emp_email'] == ""
      || this.joiningObj['joining_time'] == undefined || this.joiningObj['joining_time'] == "") {
        
      this.errorMsg = "* fields required."

        
    }
else if(this.joiningObj['emp_phone_no'].toString().length != 10){
  this.errorMsg = "Incorrect Phone Number."
}
    else {
      this.joiningObj['emp_id'] =parseInt(this.joiningObj['emp_id'].replace(/\D/g,''));
      swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Add it!'
      }).then((result) => {
        if (result.value) {
         this.finalAdd()
        }
      })


    }
  }
  getNumberFormat(num){
   
    if(num!=undefined){
      return num.toString().padStart(3, "0")

    }else{
      return '000';
    }
  }
  async getEmployeeid() {
    var arr = []
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.joiningservice.getMaxEmployee(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
     this.joiningObj['emp_id'] =this.mainService.accInfo['account_short_name']+this.getNumberFormat(resp.data[0]['emp_id'] +1);
     this.emp_id = this.joiningObj['emp_id']
     this.emp_id.toString
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list" ,'Error',{
        duration:5000
      });
    }
  }

  async finalAdd() {
    var obj = Object.assign({}, this.joiningObj);
    obj['b_acct_id'] = this.b_acct_id;
    obj['create_user_id'] = this.user_id;
    obj['emp_status_code'] = 'JOINING';
    var jdt = this.joiningObj['joining_date'];
    var ddt = this.joiningObj['emp_dob'];
    var yr = this.underAgeValidate(jdt, ddt);
    if (yr >= 18) {
      this.spinner.show()
      var resp = await this.joiningservice.insertEmployeeMasterData(obj);
      if (resp['error'] == false) {
        this.spinner.hide();

        this.joiningObj = {}
        await this.getEmployeeid();
        swal.fire("Yaaay", "...and Joining Completed!",'success');



      } else {
        this.spinner.hide();
        swal.fire("Sorry", "...There looks some error, it  will be rectify soon!",'warning');
      }
    } else {
      swal.fire("Sorry", "...You are below 18 years!",'warning');
    }
  }

}
