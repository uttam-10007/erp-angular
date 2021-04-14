import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { BudgetService } from '../../service/budget.service';
import { ProjectBankAccService } from '../../../accounts/service/project-bank-acc.service'
import { MainService } from '../../service/main.service';
import swal from 'sweetalert2';

declare var $: any

@Component({
  selector: 'app-project-bank-acc',
  templateUrl: './project-bank-acc.component.html',
  styleUrls: ['./project-bank-acc.component.css']
})
export class ProjectBankAccComponent implements OnInit {

  constructor(private budgetService: BudgetService, private project_bank_acc: ProjectBankAccService, public mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  hierCodeValue;
  table_data;
  datasource;
  allProjectHier = [];
  b_acct_id;
  allBankAccounts;
  erpUser;
  projectObject;
  bankDetailsObject;
  displayedColumns = ['SR No', 'Project_Code', 'Project_Description', 'Bank_Account_No', 'IFSC_Code', 'Branch_Name',
    'Bank_Name', 'Bank_Description', 'action'];
  bankObj = {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getBankAccount();
    await this.getProjectHier();
    await this.getProjectBAnk();
  }
  refresh() {

  }
  async getProjectHier() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name'] = 'proj_hier';
    var resp = await this.budgetService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProjectHier = resp.data;
      this.projectObject = new Object;
      for (let i = 0; i < this.allProjectHier.length; i++) {
        this.projectObject[this.allProjectHier[i]['leaf_cd']] = this.allProjectHier[i]['leaf_value']
      }
      // await this.createUniqeProjectHierCodeValue()
      this.spinner.hide();

    } else {
      this.spinner.hide();

      swal.fire("Error", "...Error while getting hierchy list",'error');
    }
  }

  async getProjectBAnk() {
    this.spinner.show();
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.project_bank_acc.getProjectBank(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();

      this.table_data = resp['data']
      this.datasource = new MatTableDataSource(this.table_data);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
    }
    else {
      this.spinner.hide();

      swal.fire('error occured')
    }

  }
  async getBankAccount() {
    this.spinner.show()
    var resp = await this.settingService.getBankAccounts(this.b_acct_id);
    if (resp['error'] == false) {
      this.allBankAccounts = resp.data;
      this.bankDetailsObject = new Object;
      for (let i = 0; i < this.allBankAccounts.length; i++) {
        this.bankDetailsObject[this.allBankAccounts[i]['bank_acct_no']] = this.allBankAccounts[i]
        this.allBankAccounts[i]['bank_acct_desc']=resp['data'][i]['bank_acct_desc']+' - '+resp['data'][i]['branch_code']+' - '+resp['data'][i]['bank_acct_no']+' - '+resp['data'][i]['ifsc_code']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting list!",'error');
    }
  }

  async submit() {
    this.spinner.show()
    let obj = this.bankObj
    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.erpUser.user_id
    var resp = await this.project_bank_acc.create(obj)
    if (resp['error'] == false) {
      this.spinner.hide();

      this.getProjectBAnk()
      swal.fire('Successfully created','','success')

    }
    else {
      this.spinner.hide();

      swal.fire('error occured','','error')
    }

  }
  async delete(e) {
    this.spinner.show();
    let obj = {}
    obj['id'] = e['id']
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.project_bank_acc.delete(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      this.getProjectBAnk()
      swal.fire('Deleted Successfully','','success')
    }
    else {
      this.spinner.hide();

      swal.fire('some error occured','','error')
    }

  }
  open_update(e) {
    this.bankObj = e
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');
  }
  async update() {
    let obj = this.bankObj
    obj['update_user_id'] = this.erpUser.user_id
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.project_bank_acc.update(obj);
    if (resp['error'] == false) {
      swal.fire('Success','Successfully Updated','success')
    }
    else {
      swal.fire('some error occured','','error')
    }

  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}

