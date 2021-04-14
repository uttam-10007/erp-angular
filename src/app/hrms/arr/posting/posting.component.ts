import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { MainService } from '../../service/main.service';
import swal from 'sweetalert2';

declare var $: any
@Component({
  selector: 'app-posting',
  templateUrl: './posting.component.html',
  styleUrls: ['./posting.component.css']
})
export class PostingComponent implements OnInit {

  constructor(public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private establishmentService: EstablishmentService) { }
  personalInfoObj = {};
  erpUser;
  b_acct_id;
  allEmplyees = [];
  selectEmpObj = {};
  selectedEmpPosting = [];
  postingObj = {};
  is_enforcement = [{ id: 'YES', value: 1 }, { id: 'NO', value: 0 }]

  party_current_arrangment = {};
  party_current_posting = {};
  codeValueTechObj = {};
  errorMsg = ''
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  status = [{ code: 'ACTIVE', value: 'ACTIVE' }, { code: 'INACTIVE', value: 'INACTIVE' }]
  displayedColumns = ['id', 'designation_code', 'section_code', 'is_enforcement', 'zone', 'posting_code', 'posting_type_code', 'posting_date', 'posting_end_date','is_head', 'order_no', 'action'];
  empObj = {}
  datasource;
  datasource1;
  newallEmplyees = []
  isHead=[{code:0,value: 'NO'},{code:1,value: 'YES'}]
  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;

    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
  }
  getNumberFormat(num) {
    if(num == undefined){
      return ""
    }
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.establishmentService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmplyees = resp.data;
      this.empObj = new Object
      for (let i = 0; i < this.allEmplyees.length; i++) {
        this.empObj[this.allEmplyees[i]['emp_id']] = this.allEmplyees[i]['emp_name']
      }
      this.newallEmplyees = []
      for (let i = 0; i < this.allEmplyees.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, this.allEmplyees[i]);
        obj['emp_name'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id']) + "-" + obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      this.spinner.hide()

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
    this.spinner.show();
    var resp2 = await this.establishmentService.getPostingInfo(obj);
    if (resp2['error'] == false) {
      for (let i = 0; i < resp2['data'].length; i++) {
        for (let j = 0; j < this.is_enforcement.length; j++) {
          if (resp2['data'][i]['is_enforcement'] == this.is_enforcement[j]['value']) {
            resp2['data'][i]['is_enforcement'] = this.is_enforcement[j]['id']
          }
        }
      }
      for (let i = 0; i < resp2.data.length; i++) {
        resp2.data[i]['tempposting_date'] = this.mainService.dateformatchange(resp2.data[i]['posting_date'])
        resp2.data[i]['tempposting_end_date'] = this.mainService.dateformatchange(resp2.data[i]['posting_end_date'])

      }
      this.datasource = new MatTableDataSource(resp2.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting Current Posting ", 'Error', {
        duration: 5000
      });
    }
  }
  async submitPostingInfo() {


    swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Add it!'
    }).then((result) => {
      if (result.value) {
        this.finalsubmitPostingInfo()
      }
    })



  }
  async finalsubmitPostingInfo() {
    this.postingObj['b_acct_id'] = this.b_acct_id;
    this.postingObj['create_user_id'] = this.erpUser.user_id;
    this.postingObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.postingObj['posting_status_code'] = 'ACTIVE';
    if (this.postingObj['status'] == 'ACTIVE') {
      this.postingObj['posting_end_date'] = '2090-10-10'
    }
    if(this.postingObj['is_enforcement']==1){
      if(this.postingObj['zone']==null || this.postingObj['zone']==undefined){
        this.postingObj['zone']=""
      }
    }else{
      this.postingObj['zone']=null;
    }

    this.spinner.show();
    var resp = await this.establishmentService.addPostingInfo(this.postingObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();

      swal.fire("Yaaay", "Posting Info Added", 'success');


    } else {
      this.spinner.hide();
      swal.fire("Sorry", "...Some Error Occured!", 'error');

    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }



  async chnageStatus(element) {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];

    var resp2 = await this.establishmentService.deactivatePost(obj);

    if (resp2['error'] == false) {
      this.spinner.hide()
      this.changeEmployee();

      swal.fire("Success", "Post Inactive Successfully!", 'success');


    } else {
      this.spinner.hide()
      swal.fire("Error", "Some Error Occurred!", 'error');

    }
  }

  chamgeTab() {
    this.errorMsg = ''
    this.postingObj = {}
  }
  openUpdate(element) {
    // is_enforcement=[{id:'YES' , value:1},{id:'NO',value:0}]
    this.postingObj = Object.assign({}, element);
    for (let i = 0; i < this.is_enforcement.length; i++) {
      if (this.is_enforcement[i]['id'] == this.postingObj['is_enforcement']) {
        this.postingObj['is_enforcement'] = this.is_enforcement[i]['value']
      }
    }
    $('.nav-tabs a[href="#tab-3"]').tab('show');

  }
  async updatePostingInfo() {
    this.postingObj['b_acct_id'] = this.b_acct_id;
    this.postingObj['update_user_id'] = this.erpUser.user_id;
    if(this.postingObj['is_enforcement']==1){
      if(this.postingObj['zone']==null || this.postingObj['zone']==undefined){
        this.postingObj['zone']=""
      }
    }else{
      this.postingObj['zone']=null;
    }
    this.spinner.show();
    var resp = await this.establishmentService.updatePost(this.postingObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployee();

      this.snackBar.open("Updated Successfully ", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Updating Posting ", 'Error', {
        duration: 5000
      });

    }

  }
}
