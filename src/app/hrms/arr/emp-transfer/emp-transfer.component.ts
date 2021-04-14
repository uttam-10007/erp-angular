import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { AllEmpService } from '../../service/all-emp.service';
import { MainService } from '../../service/main.service';
declare var $: any

@Component({
  selector: 'app-emp-transfer',
  templateUrl: './emp-transfer.component.html',
  styleUrls: ['./emp-transfer.component.css']
})
export class EmpTransferComponent implements OnInit {

  constructor(public mainService: MainService, private allEmpService: AllEmpService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private estabService: EstablishmentService) { }
  erpUser;
  b_acct_id;
  user_id;

  allEmployees = [];
  selectEmpObj = {};
  transfernObj = {};
  codeValueTechObj = {};
  transferdArr = [];
  allArr=[]
  employeeObj={};
  newallEmplyees = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id', 'emp_name', 'effective_timestamp','order_id'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getAllCurrentArrangements();
  }

  async getAllCurrentArrangements() {
    this.spinner.show();
    this.transferdArr = [];
    this.allArr =[];
    var transferdArr1 = []
    var arr = []
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    obj['emp_status_code'] = ['INACTIVE']

    var resp = await this.estabService.getAllCurrentArrangements(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allArr = resp.data;
      for (let i = 0; i < this.allArr.length; i++) {
        if (this.allArr[i].employee_current_type_code == "TRANSFERRED") {
          this.transferdArr.push(this.allArr[i]);
        
         }

      }
      arr = this.transferdArr
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
       transferdArr1.push(obj)
      }
      this.spinner.hide();
      for(let i=0;i<transferdArr1.length;i++){
        if(transferdArr1[i]['effective_timestamp']){
          transferdArr1[i]['effective_timestamp']=this.mainService.dateformatchange(transferdArr1[i]['effective_timestamp'].split(' ')[0])
        }
      }
      this.datasource = new MatTableDataSource(transferdArr1)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting All Transfer Employee", 'Error', {
        duration: 5000
      });
    }
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ["JOINING", "JOINED", "LEFT"];
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allEmployees = resp.data;
      
      this.newallEmplyees = []
      for(let i=0;i<this.allEmployees.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.allEmployees[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      for (let i=0; i<this.allEmployees.length ;i++){
        this.employeeObj[this.allEmployees[i]['emp_id']]=this.allEmployees[i]['emp_name'];
      }
      this.spinner.hide()
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }

  async submitTransfer() {
    this.transfernObj['b_acct_id'] = this.b_acct_id;
    this.transfernObj['emp_id'] = this.selectEmpObj;
    this.transfernObj['update_user_id'] = this.erpUser.user_id;
    this.transfernObj['emp_status_code'] = "INACTIVE";
    this.transfernObj['employee_current_type_code'] = "TRANSFERRED";

    //this.transfernObj['calculation_code'] = "NA";
    this.spinner.show();
    var resp = await this.estabService.addEmpTransfer(this.transfernObj);
    if (resp['error'] == false) {
      await this.getAllCurrentArrangements();
      this.spinner.hide();
      this.snackBar.open("Transfer  Added Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Transfer Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
