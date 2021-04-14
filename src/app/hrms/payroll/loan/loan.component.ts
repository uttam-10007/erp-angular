import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { MainService } from '../../service/main.service';

declare var $: any

@Component({
  selector: 'app-loan',
  templateUrl: './loan.component.html',
  styleUrls: ['./loan.component.css']
})
export class LoanComponent implements OnInit {


  constructor(public mainService: MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  erpUser;
  b_acct_id;

  allEmplyees = [];
  selectEmpObj = {};
  loanObj = {};
  EMIDetails = [];
  seeEMIDetails=[];
  disburseArr=[];
  selected_loan_detail={}

  total_loan_Amount = 0;

  codeValueTechObj={};

  arr_id;

emp_id = []
  headerEMI = [{ full_name: 'Year' }, { full_name: 'Month' }, { full_name: 'Amount' }]

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id','emp_name', 'loan_type_code', 'loan_amount', 'loan_status_code', 'application_date', 'action'];
  datasource;

  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getAllLoan();
  }


  async changeEmployee() {

    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['party_id'] = this.selectEmpObj['party_id'];



    
    var resp1 = await this.payableService.getCurrentArrangement(obj);
    if (resp1['error'] == false) {
    
      this.arr_id = resp1.data[0]['arr_id'];
      this.spinner.hide();

    } else {
      this.spinner.hide();

      this.snackBar.open("Error while getting current arrangment ", 'Error', {
        duration: 5000
      });
    }

  }

  async getAllLoan() {
    this.spinner.show();
    var resp = await this.payableService.getAllLoanInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide();
      var arr = []
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        arr.push(obj)
      }
     
      this.datasource = new MatTableDataSource(arr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while getting all loan list", 'Error', {
        duration: 5000
      });
    }
  }



  allEmplyees_new=[];
  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    var resp = await this.payableService.getEmployeeMasterData(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        var obj1=new Object();
        obj=Object.assign({},arr[i]);
        this.emp_id[obj['emp_id']] = obj['emp_name']
      
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        this.allEmplyees.push(obj)
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

  async submitLoan() {
    this.loanObj['b_acct_id'] = this.b_acct_id;
    this.loanObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.loanObj['loan_status_code']='APPLIED'
    this.spinner.show();
    var resp = await this.payableService.addLoan(this.loanObj);
    if (resp['error'] == false) {
      await this.getAllLoan();
      this.spinner.hide();
      this.snackBar.open("Loan Application  Added Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Loan Appliction  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  async approve(element,status){
    var obj = new Object();  
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    obj['loan_status_code']=status;
    obj['approval_user_id'] = this.erpUser.user_id;
    
    var resp = await this.payableService.changeStatusOfLoan(obj);
    if (resp['error'] == false) {
      await this.getAllLoan();
      this.spinner.hide();
      this.snackBar.open("Loan Application  "+status+" Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while changing Loan Appliction  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  async approveLoan(element,status) {
    this.disburseArr =[]
    element['emp_name'] = this.emp_id[element['emp_id']]
    this.selected_loan_detail = element;
    $('.nav-tabs a[href="#tab-3"]').tab('show');
  }

  async submitLoanDisburse(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = this.selected_loan_detail['id'];
    obj['approval_user_id'] = this.erpUser.user_id;
    obj['loan_status_code'] = "SCHEDULED";
    var month =parseInt(this.selected_loan_detail['month']) + parseInt(this.selected_loan_detail['no_of_emi'])
    var year
  if(month > 12){
    month = month - 12
    year = parseInt(this.selected_loan_detail['year']) +1

  }
  else{
    year = this.selected_loan_detail['year']
  }
 

      var ob = new Object();
      obj['pay_component_code'] = this.selected_loan_detail['loan_type_code'];
      obj['pay_component_amt'] = this.selected_loan_detail['Emi_amount'] 
      obj['emp_id'] = this.selected_loan_detail['emp_id']
      obj['effective_end_dt'] = year+"-"+month+"-"+new Date(year, month, 0).getDate()
      obj['effective_start_dt'] = this.selected_loan_detail['year']+"-"+this.selected_loan_detail['month']+"-01" 
      obj['pay_status_code'] = "ACTIVE"
      obj['pay_code'] = "DED"
      obj['create_user_id']=this.erpUser.user_id;
        var resp = await this.payableService.addFixedPayonly(obj);
    if (resp['error'] == false) {
      await this.getAllLoan();
      await this.approve(this.selected_loan_detail,'APPROVED')
      this.spinner.hide();
      this.snackBar.open("Advance  Scheduled Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Scheduling Advance Appliction  Of Employee", 'Error', {
        duration: 5000
      });
    }


  }
  
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async delete(element){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    this.spinner.show();
    var resp = await this.payableService.deleteloan(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllLoan();
      this.spinner.hide();
      this.snackBar.open("Loan Application  Deleted Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Deleting Loan Appliction  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
}
