import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
declare var $: any
import swal from 'sweetalert2';

@Component({
  selector: 'app-pay-matrix',
  templateUrl: './pay-matrix.component.html',
  styleUrls: ['./pay-matrix.component.css']
})
export class PayMatrixComponent implements OnInit {

  constructor(private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  errorMsg = ''

  allMatrix = [];
  payMatrix = {};


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'pay_band','grade_pay_code','level_code','basic_pay', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllMatrix();
  }

  open_update(element) {
    this.errorMsg = ''
    this.payMatrix = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.payMatrix = {};
    this.errorMsg = ''
  }

  async getAllMatrix() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    
    var resp = await this.settingService.getMatrix(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allMatrix = resp.data;
      this.datasource = new MatTableDataSource(this.allMatrix)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all fields list", 'Error', {
        duration: 5000
      });
    }
  }
  async save() {
    this.errorMsg = ''
    if (
      this.payMatrix['pay_band'] == "" || this.payMatrix['pay_band'] == undefined
      || this.payMatrix['grade_pay_code'] == "" || this.payMatrix['grade_pay_code'] == undefined
      || this.payMatrix['level_code'] == "" || this.payMatrix['level_code'] == undefined
      || this.payMatrix['basic_pay'] == "" || this.payMatrix['basic_pay'] == undefined
      
    ) {

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
          this.finalsave()
        }
      })


    }
  }
  async finalsave() {
    this.spinner.show();
    var obj=new Object();
    obj['b_acct_id'] = this.b_acct_id;
    
    this.payMatrix['create_user_id'] = this.erpUser.user_id;
    this.payMatrix['b_acct_id'] = this.b_acct_id;
    obj['matrix_data'] = [this.payMatrix];
    var resp = await this.settingService.addMatrix(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllMatrix();
      // this.snackBar.open("Matrix Added Successfully!", 'Success', {
      //   duration: 5000
      // });
      swal.fire("Yaaay", "Matrix Added Successfully!",'success');


    } else {
      this.spinner.hide();
    
      swal.fire("Sorry", "..Error while Adding Matrix!",'error');
      
    }
  }

async update(){
  this.errorMsg = ''
  if (
    this.payMatrix['pay_band'] == "" || this.payMatrix['pay_band'] == undefined
    || this.payMatrix['grade_pay_code'] == "" || this.payMatrix['grade_pay_code'] == undefined
    || this.payMatrix['level_code'] == "" || this.payMatrix['level_code'] == undefined
    || this.payMatrix['basic_pay'] == "" || this.payMatrix['basic_pay'] == undefined
    
  ) {

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
        this.finalupdate()
      }
    })


  }
}


  async finalupdate() {
    this.spinner.show();
    this.payMatrix['update_user_id'] = this.erpUser.user_id;
    this.payMatrix['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateMatrix(this.payMatrix);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllMatrix();
      // this.snackBar.open("Matrix Update Successfully!", 'Success', {
      //   duration: 5000
      // });
      swal.fire("Yaaay", "Matrix Update Successfully!",'success');


    } else {
      this.spinner.hide();
      swal.fire("Sorry", "..Error while Updating Matrix!",'error');

    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
