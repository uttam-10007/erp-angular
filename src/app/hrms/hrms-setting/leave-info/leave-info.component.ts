import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service';
declare var $: any;

@Component({
  selector: 'app-leave-info',
  templateUrl: './leave-info.component.html',
  styleUrls: ['./leave-info.component.css']
})
export class LeaveInfoComponent implements OnInit {


  constructor(public mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;

  allLeaveInfo = [];
  obj = {};
  leaveObj={}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'leave_code', 'leave_rate','is_leave_carry_fwd','renew_ind_on_year_change','num_of_leaves', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllLeaveRuleDetails();
  }

  open_update(element) {
    this.obj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.obj = {};
  }

  async getAllLeaveRuleDetails() {
    this.spinner.show()
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    var resp = await this.settingService.getAllRules(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allLeaveInfo = resp.data;
      this.datasource = new MatTableDataSource(this.allLeaveInfo)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all Leave Rule list", 'Error', {
        duration: 5000
      });
    }
  }


  async save() {
    this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.addLeaveRule(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllLeaveRuleDetails();
      this.snackBar.open("Leave Rule Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Leave Rule", 'Error', {
        duration: 5000
      });
    }
  }

  async update() {
    this.spinner.show();
    this.obj['update_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateLeaveRule(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllLeaveRuleDetails();
      this.snackBar.open("Leave Rule Update Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while updating Leave Rule", 'Error', {
        duration: 5000
      });
    }
  }

  async delete(element) {
    this.spinner.show();
    var obj = new Object();
    obj['id'] = element.id;
    obj['b_acct_id']=this.b_acct_id;

    var resp = await this.settingService.deleteLeaveRule(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllLeaveRuleDetails();
      this.snackBar.open("Leave Rule Delete Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while deleting Leave Rule ", 'Error', {
        duration: 5000
      });
    }
  }


  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }



}
