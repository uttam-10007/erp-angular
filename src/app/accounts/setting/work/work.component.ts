import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { MainService } from '../../service/main.service';
import { SettingService } from '../../service/setting.service';
import { SalService } from '../../service/sal.service';
import { WorkService } from '../../service/work.service';

declare var $: any

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css']
})
export class WorkComponent implements OnInit {


  constructor(private salService: SalService, private settingService: SettingService, private workS: WorkService, public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  datasource;
  allParty
  Obj = {}
  displayedColumns = ['id', 'work_no', 'work_desc', 'party_id', 'start_dt', 'end_dt', 'amt','action'];
  erpUser;
  user_id;
  b_acct_id;
  allSal = [];
  techToBusNameObj = {};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllParties()
    await this.getAllSal()
  }
  async getAllParties() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getPartyInfoNew(this.b_acct_id);
    if (resp['error'] == false) {
      this.allParty = resp.data;
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all party list!", 'error');

    }
  }
  setPartyData() {
    for (let i = 0; i < this.allParty.length; i++) {
      if (this.Obj['party_id'] == this.allParty[i]['party_id']) {
        this.Obj['party_name'] = this.allParty[i]['party_name']
        this.Obj['phone_no'] = this.allParty[i]['phone_no']
        this.Obj['email'] = this.allParty[i]['email']
      }
    }
  }
  async getAllSal() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.workS.getWorkList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allSal = resp.data;
      for (let i = 0; i < this.allSal.length; i++) {
        for (let j = 0; j < this.allParty.length; j++) {
          if (this.allParty[j]['party_id'] == this.allSal[i]['party_id']) {
            this.allSal[i]['party_name'] = this.allParty[j]['party_name']
          }
        }
      }
      this.datasource = new MatTableDataSource(this.allSal)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all sal list!", 'error');

    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  async submit() {
    this.spinner.show()
    this.Obj['create_user_id'] = this.user_id
    this.Obj['b_acct_id'] = this.b_acct_id
    this.Obj['runnig_bill_no']=0
    var resp = await this.workS.createWork(this.Obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.getAllSal()
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      swal.fire('Success...', 'Work Created Successfully', 'success')
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error While Creating", 'error');
    }

  }
  async update() {
    this.spinner.show()
    this.Obj['update_user_id'] = this.user_id
    this.Obj['b_acct_id'] = this.b_acct_id
    var resp = await this.workS.updateWork(this.Obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.getAllSal()
      swal.fire('Success...', 'Work Updated Successfully', 'success')
      $('.nav-tabs a[href="#tab-1"]').tab('show')
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error While Updating", 'error');

    }
  }
  refresh() {
    this.Obj = {}
  }
  async delete(data) {
    this.spinner.show()
    this.Obj['id'] = data['id']
    this.Obj['b_acct_id'] = this.b_acct_id
    var resp = await this.workS.deleteWork(JSON.stringify(this.Obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.getAllSal()
      swal.fire('Success...', 'Work Deleted Successfully', 'success')
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error While Deleting", 'error');
    }
  }
  open_update(element) {
    this.Obj = Object.assign({}, element);
    this.setPartyData()
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

}
