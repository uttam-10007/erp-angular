import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { MainService } from '../../service/main.service';
import { SalaryHoldAndStartService } from '../../service/salary-hold-and-start.service';
import { Router } from '@angular/router';
declare var $: any;
import swal from 'sweetalert2';
@Component({
  selector: 'app-salary-hold-and-start',
  templateUrl: './salary-hold-and-start.component.html',
  styleUrls: ['./salary-hold-and-start.component.css']
})
export class SalaryHoldAndStartComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  status = [{ id: 'Currently Stopped' }, { id: 'Previously Stopped' }]
  displayedColumns = ['id', 'emp_id', 'emp_name', 'fin_year', 'fin_year2', 'month', 'month2', 'status', 'action'];
  datasource;
  b_acct_id
  erpUser
  status_s;
  allStop = []
  allEmplyees = [];
  allEmplyees_new = [];
  selectEmpObj = {};
  codeValueTechObj = {}
  Obj = {}
  project_short_name;
  constructor(public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private SalaryHoldAndStartService: SalaryHoldAndStartService) { }

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.project_short_name = this.mainService.accInfo['account_short_name'];
    await this.getAllEmployees();
    await this.getsalarystatus();
    this.status_s='Currently Stopped'
    this.changeTable()

  }


  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }

  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ['JOINING', 'JOINED', 'LEFT']
    var resp = await this.SalaryHoldAndStartService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
      for (let i = 0; i < arr.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, arr[i]);
        obj['tempid'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id'])
        this.allEmplyees.push(obj)
      }
      this.allEmplyees_new = [];
      for (let i = 0; i < resp.data.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, resp.data[i]);
        obj['emp_name'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id']) + "-" + obj['emp_name']
        this.allEmplyees_new.push(obj)
      }

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  async changeEmployee() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];

  }
  data = []
  async getsalarystatus() {
    this.data=[]
    this.spinner.show()
    var arr = []
    var holdsalary = []
    this.allStop = [];
    var resp = await this.SalaryHoldAndStartService.getsalarystatus(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      var dt = resp.data;
      // for (var i = 0; i < dt.length; i++){
      //   if (dt[i]['status'] == 'STOP'){
      //     this.allStop.push(dt[i]);
      //   }
      // }
      arr = dt;
      for (let i = 0; i < arr.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, arr[i]);
        obj['tempid'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id'])
        holdsalary.push(obj)
      }
      this.data = holdsalary

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all  list", 'Error', {
        duration: 5000
      });
    }
  }
 async changeTable() {
    await this.getsalarystatus();
    let dummy = []
    this.datasource=[]
    // only status stop is going to add in the array

    if (this.status_s == 'Currently Stopped') {
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i]['status'] == 'STOP') {
          this.data[i]['start_month'] = 'Not Started'
          this.data[i]['start_fin_year'] = 'Not Started'
          this.data[i]['stop_month'] = this.mainService.codeValueShowObj['HR0024'][this.data[i]['stop_month']]
          this.data[i]['stop_fin_year'] = this.mainService.codeValueShowObj['HR0023'][this.data[i]['stop_fin_year']]
          dummy.push(this.data[i])
        }
      }
    }
    if (this.status_s == 'Previously Stopped') {
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i]['status'] == 'START') {
          this.data[i]['start_month'] = this.mainService.codeValueShowObj['HR0024'][this.data[i]['start_month']]
          this.data[i]['start_fin_year'] = this.mainService.codeValueShowObj['HR0023'][this.data[i]['start_fin_year']]
          this.data[i]['stop_month'] = this.mainService.codeValueShowObj['HR0024'][this.data[i]['stop_month']]
          this.data[i]['stop_fin_year'] = this.mainService.codeValueShowObj['HR0023'][this.data[i]['stop_fin_year']]
          dummy.push(this.data[i])
        }
      }
    }
    this.datasource = new MatTableDataSource(dummy)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }
  view_data = []
  view_data_header={}
  viewPaidStatus(data) {
    this.view_data_header=data
    this.view_data = JSON.parse(data['paid'])
    $('#myModal2').modal('show');

  }
  async submit() {
    this.Obj['b_acct_id'] = this.b_acct_id;
    this.Obj['emp_id'] = this.selectEmpObj['emp_id'];
    for (let i = 0; i < this.allEmplyees.length; i++) {
      if (this.Obj['emp_id'] == this.allEmplyees[i]['emp_id'])
        this.Obj['emp_name'] = this.allEmplyees[i]['emp_name']
    }
    this.Obj['status'] = 'STOP';
    this.Obj['paid'] = JSON.stringify([])
    this.Obj['create_user_id'] = this.erpUser.user_id;
    this.spinner.show();
    var resp = await this.SalaryHoldAndStartService.holdsalary(this.Obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getsalarystatus();
      this.changeTable()
      this.snackBar.open(" Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Holding  Of Employee Salary", 'Error', {
        duration: 5000
      });
    }
  }
  async changeStatus(element) {
    this.Obj = []
    /* var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['start_fin_year'] = this.Obj['start_fin_year']
    obj['start_month'] = this.Obj['start_month'] */

    this.spinner.show();
    this.Obj['id'] = element['id'];
    $('#myModal').modal('show');
    this.spinner.hide();
    //
  }
  async changeStatusstart() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['start_fin_year'] = this.Obj['start_fin_year']
    obj['start_month'] = this.Obj['start_month']
    obj['id'] = this.Obj['id']
    this.spinner.show();
    var resp = await this.SalaryHoldAndStartService.changeStatusOfsalary(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      swal.fire('Success',' Status Changed Successfully','success')
      await this.getsalarystatus();
      this.changeTable()
      $('#myModal').modal('close');
    
    } else {
      this.spinner.hide();
      swal.fire('Error','Error Occured','error')
     
    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}
