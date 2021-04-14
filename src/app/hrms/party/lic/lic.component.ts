import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { AllEmpService } from '../../service/all-emp.service';
import {HrmsReportService} from '../../service/hrms-report.service';
import {MainService} from '../../service/main.service'
import swal from 'sweetalert2';
declare var $: any
@Component({
  selector: 'app-lic',
  templateUrl: './lic.component.html',
  styleUrls: ['./lic.component.css']
})
export class LicComponent implements OnInit {

  
  constructor(private mainService:MainService,private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private allEmpService: AllEmpService,private hrmsReportService:HrmsReportService) { }
  personalInfoObj = {};
  errorMsg = ''

  erpUser;
  user_id;
  b_acct_id;
  allEmployees = [];
  selectEmpObj = {};
  AllLICInfo=[];
  selectedLICInfo = [];
  Obj = {};
  allEmplyees_new =[]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'company_name', 'lic_no', 'acct_no', 'tensure_of_deduction', 'ifsc_code', 'deduction_from', 'deduction_to', 'amount', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllEmployees();
    await this.getAllLicReportInfo();
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }

  async getAllLicReportInfo(){
    var resp = await this.allEmpService.getLicInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.AllLICInfo = resp.data;
    } else {
      this.snackBar.open("Error while getting lic info list", 'Error', {
        duration: 5000
      });
    }
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
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  async changeEmployee() {
    this.spinner.show();
    this.selectedLICInfo = [];

    for(let i=0;i<this.AllLICInfo.length;i++){
      if(this.selectEmpObj['emp_id']==this.AllLICInfo[i]['emp_id']){
        this.selectedLICInfo.push(this.AllLICInfo[i]);
      }
    }
   
    this.datasource = new MatTableDataSource(this.selectedLICInfo)
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;

    this.spinner.hide();

  }

  openUpdate(element) {
    this.errorMsg = ''
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.Obj = Object.assign({}, element);

  }
  
  
  
  async submitLICInfo() {
    this.Obj['b_acct_id'] = this.b_acct_id;
    this.Obj['emp_id'] = this.selectEmpObj['emp_id'];
    this.Obj['create_user_id'] = this.user_id;
    this.spinner.show();
    var resp = await this.allEmpService.addLicInfo(this.Obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllLicReportInfo();
      await this.changeEmployee();
      swal.fire("Yaaay", ".....LIC Info Added",'success');


    } else {
      this.spinner.hide();
      swal.fire("Sorry", ".. Error while Adding LIC Info Of Employee!",'error');

    }
  }


 
 
 
  async updateLICInfo() {

    this.Obj['b_acct_id'] = this.b_acct_id;
    this.Obj['update_user_id'] = this.user_id;
    this.spinner.show();
    var resp = await this.allEmpService.updateLicInfo(this.Obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllLicReportInfo();
      await this.changeEmployee();
      swal.fire("Yaaay", "LIC Info Updated",'success');
    } else {
      this.spinner.hide();
      swal.fire("Sorry", ".. Error while Update LIC Info Of Employee!",'error');

    }
  }

  async deleteLICInfo(element) {
    var obj = new Object();

    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    this.spinner.show();
    var resp = await this.allEmpService.deleteLicInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllLicReportInfo();
      await this.changeEmployee();
      swal.fire("Yaaay", "LIC Info Deleted",'success');
    } else {
      this.spinner.hide();
  
      swal.fire("Sorry", "Error while deleting LIC Info Of Employee",'error');

    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  chamgeTab() {
    this.Obj = {}
  }

}
