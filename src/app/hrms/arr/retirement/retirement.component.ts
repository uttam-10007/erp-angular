import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { AllEmpService } from '../../service/all-emp.service';
import { MainService } from '../../service/main.service';
import swal from 'sweetalert2';

declare var $: any
@Component({
  selector: 'app-retirement',
  templateUrl: './retirement.component.html',
  styleUrls: ['./retirement.component.css']
})
export class RetirementComponent implements OnInit {

  constructor(public mainService: MainService, private allEmpService: AllEmpService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private estabService: EstablishmentService) { }
  erpUser;
  b_acct_id;
  user_id;
  retireObj = {}
  allEmployees = [];
  selectEmpObj = {};
  codeValueTechObj = {};
  retirementArr = [];
  allArr = []
  employeeObj = {};
  updateObj = {}
  toPay = []
  totalAmtToPay = 0
  lastPaidArr = []
  @ViewChild('paginator', { static: false }) paginator: MatPaginator;
  @ViewChild('sortCol1', { static: false }) sortCol1: MatSort;
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;
  @ViewChild('paginator2', { static: false }) paginator2: MatPaginator;
  @ViewChild('sortCol3', { static: false }) sortCol3: MatSort;


  displayedColumns = ['emp_id', 'emp_name', 'date_of_retirement', 'reason_of_retirement', 'status', 'application_date', 'approval_date', 'action'];
  datasource;
  datasource2;
  displayedColumns1 = ['emp_id', 'emp_name', 'retirement_date', 'action'];
  displayedColumns2 = ['emp_id', 'emp_name', 'retirement_date'];

  datasource1;
  activeEmpArray = []
  newallEmplyees = []
  retiredEmployees=[]
  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllRetirement();
    await this.getAllCurrentArrangements();
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllCurrentArrangements() {
    this.spinner.show();
    //this.retirementArr = [];
    this.retiredEmployees = [];
    this.allArr = [];
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ["ACTIVE", "INACTIVE"];

    var resp = await this.estabService.getArrayAllCurrentEstablishementInfo(obj);
  
    if (resp['error'] == false) {
      this.allArr = resp.data;
      this.allEmployees = []
      this.activeEmpArray = []

      for (let i = 0; i < this.allArr.length; i++) {

        this.employeeObj[this.allArr[i]['emp_id']] = this.allArr[i]['emp_name'];
        if (this.allArr[i]['emp_status_code'] == 'ACTIVE') {
          this.allEmployees.push(this.allArr[i])
          this.activeEmpArray.push(this.allArr[i])
        }else if(this.allArr[i]['employee_current_type_code'] == 'RETIRED'){
          this.retiredEmployees.push(this.allArr[i]);
        }

      }

      this.newallEmplyees = []
      for (let i = 0; i < this.allEmployees.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, this.allEmployees[i]);
        obj['emp_name'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id']) + "-" + obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      this.datasource1 = new MatTableDataSource(this.activeEmpArray)
      this.datasource1.paginator = this.paginator1;
      this.datasource1.sort = this.sortCol2;
      this.spinner.hide();
      this.datasource2 = new MatTableDataSource(this.retiredEmployees)
      this.datasource2.paginator = this.paginator2;
      this.datasource2.sort = this.sortCol3;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting All employee list", 'Error', {
        duration: 5000
      });
    }
  }


  async getAllRetirement() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.estabService.getAllRetireEmployee(this.b_acct_id);

    if (resp['error'] == false) {
      this.spinner.hide()
      this.retirementArr = resp.data;

      this.datasource = new MatTableDataSource(this.retirementArr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sortCol1;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting retirement list", 'Error', {
        duration: 5000
      });
    }
  }

  async submitRetirement() {
    this.spinner.show()
    this.retireObj['b_acct_id'] = this.b_acct_id;
    this.retireObj['status'] = 'APPLIED';

    var resp_arr = await this.estabService.addretirement(this.retireObj);

    if (resp_arr['error'] == false) {
      this.spinner.hide()
      await this.getAllRetirement();
      this.snackBar.open("Employee Retirement Successfully Added.", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide()
      this.snackBar.open(resp_arr.data, 'Error', {
        duration: 5000
      });
    }
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter1(filterValue: string) {

    this.datasource1.filter = filterValue.trim().toLowerCase();
  }
  applyFilter2(filterValue: string) {

    this.datasource2.filter = filterValue.trim().toLowerCase();
  }
  async approve(element) {
    this.updateObj = element;
    this.updateObj['data'] = [];

    //await this.getBillDetailForRetirement()
    this.updateObj['employee_current_type_code'] = 'RETIRED'
    this.updateObj['emp_status_code'] = 'INACTIVE'
    this.updateObj['create_user_id'] = this.erpUser.user_id;
    this.updateObj['status'] = 'APPROVED';


    swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Submit it!'
    }).then((result) => {
      if (result.value) {
        this.finalapprove()
      }
    })
  }


  async finalapprove() {
    this.spinner.show()
    this.updateObj['b_acct_id'] = this.b_acct_id;
    this.updateObj['retirement_date'] = this.updateObj['date_of_retirement'];
   
    var resp = await this.estabService.retireEmployee(this.updateObj);
  
    if (resp['error'] == false) {
      await this.getAllRetirement();
      await this.getAllCurrentArrangements()
      this.spinner.hide()
      swal.fire("Sucess", "Employee Retirement Approve Successfully!",'success');

    } else {
      this.spinner.hide()

      swal.fire("Sorry", "Error while Approving Retirement Of an Employee",'error');

    }
  }


  async approve1(element) {
    this.updateObj = element;
    this.updateObj['data'] = [];

    //await this.getBillDetailForRetirement1()
    this.updateObj['employee_current_type_code'] = 'RETIRED'
    this.updateObj['emp_status_code'] = 'INACTIVE'
    this.updateObj['create_user_id'] = this.erpUser.user_id;
    this.updateObj['status'] = 'APPROVED';

    swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Submit it!'
    }).then((result) => {
      if (result.value) {
        this.finalapprove1()
      }
    })

  }
  async finalapprove1() {
    this.spinner.show()
    this.updateObj['b_acct_id'] = this.b_acct_id;

    var resp = await this.estabService.onTimeRetireEmployee(this.updateObj);
  
    if (resp['error'] == false) {
      await this.getAllRetirement();
      await this.getAllCurrentArrangements()
      this.spinner.hide()
      swal.fire("Success", "Employee Retirement Approve Successfully!",'success');

    } else {
      this.spinner.hide()

      swal.fire("Sorry", "Error while Approving Retirement Of an Employee",'error');

    }
  }





  async getBillDetailForRetirement1() {
    this.totalAmtToPay = 0
    this.spinner.show()
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['emp_id'] = this.updateObj['emp_id']
    var resp = await this.estabService.getBillDetailForRetirement(JSON.stringify(obj));
   
    if (resp['error'] == false) {
      this.lastPaidArr = resp.data
      var tempDate = new Date(resp.data[0]['fin_year'] + "-" + resp.data[0]['month'] + "-01")
      var startDate = this.add_months(tempDate, 1)
      var endDate = new Date(this.updateObj['retirement_date'])
      await this.generateYearMnths(startDate, endDate)

      if (this.totalAmtToPay == 0) {

      } else {
        var endDateFinYear
        if ((endDate.getMonth() + 1) < 4) {
          endDateFinYear = endDate.getFullYear() - 1
        } else {
          endDateFinYear = endDate.getFullYear()
        }
        var obb = new Object;

        obb['pay_component_amt'] = this.totalAmtToPay.toFixed(2)
        obb['pay_component_code'] = 'RETIREMENT ARREAR'
        obb['fin_year'] = endDateFinYear
        obb['month'] = endDate.getMonth()
        obb['pay_status_code'] = 'ACTIVE'
        obb['emp_id'] = this.updateObj['emp_id']
        obb['pay_code'] = 'PAY'
        this.updateObj['data'].push(obb)



      }
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Getting Salary Details Of Employee", 'Error', {
        duration: 5000
      });
    }

  }
  async getBillDetailForRetirement() {
    this.totalAmtToPay = 0
    this.spinner.show()
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['emp_id'] = this.updateObj['emp_id']
    var resp = await this.estabService.getBillDetailForRetirement(JSON.stringify(obj));
  
    if (resp['error'] == false) {
      this.lastPaidArr = resp.data
      var tempDate = new Date(resp.data[0]['fin_year'] + "-" + resp.data[0]['month'] + "-01")
      var startDate = this.add_months(tempDate, 1)
      var endDate = new Date(this.updateObj['date_of_retirement'])
      await this.generateYearMnths(startDate, endDate)

      if (this.totalAmtToPay == 0) {

      } else {
        var endDateFinYear
        if ((endDate.getMonth() + 1) < 4) {
          endDateFinYear = endDate.getFullYear() - 1
        } else {
          endDateFinYear = endDate.getFullYear()
        }
        var obb = new Object;

        obb['pay_component_amt'] = this.totalAmtToPay.toFixed(2)
        obb['pay_component_code'] = 'RETIREMENT ARREAR'
        obb['fin_year'] = endDateFinYear
        obb['month'] = endDate.getMonth()
        obb['pay_status_code'] = 'ACTIVE'
        obb['emp_id'] = this.updateObj['emp_id']
        obb['pay_code'] = 'PAY'
        this.updateObj['data'].push(obb)



      }
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Getting Salary Details Of Employee", 'Error', {
        duration: 5000
      });
    }

  }

  add_months(dt, n) {

    return new Date(dt.setMonth(dt.getMonth() + n));
  }
  async generateYearMnths(startDate, endDate) {

    var arr = []
    this.toPay = []
    while (startDate <= endDate) {
      var obj = new Object()
      if ((startDate.getMonth() + 1) < 4) {
        obj['year'] = startDate.getFullYear() - 1
        obj['month'] = startDate.getMonth() + 1
      } else {
        obj['year'] = startDate.getFullYear()
        obj['month'] = startDate.getMonth() + 1
      }
      arr.push(obj)
      startDate = new Date(this.add_months(startDate, 1))
    }

    var endDateFinYear
    if ((endDate.getMonth() + 1) < 4) {
      endDateFinYear = endDate.getFullYear() - 1
    } else {
      endDateFinYear = endDate.getFullYear()
    }


    for (let i = 0; i < arr.length; i++) {

      for (let j = 0; j < this.lastPaidArr.length; j++) {
        let obj = Object.assign({}, this.lastPaidArr[j])
        obj['fin_year'] = arr[i]['year']
        obj['month'] = arr[i]['month']


        var month = endDate.getMonth() + 1


        if ((arr[i]['year'] == endDateFinYear) && (obj['month'] == month)) {
          var days = Number(this.getDaysInMonth(month, endDateFinYear))
          if (endDate.getDate() == days) {
            obj['pay_component_amt'] = obj['pay_component_amt']
          } else {
            var amt = obj['pay_component_amt'] / 31
            obj['pay_component_amt'] = amt * endDate.getDate()
          }

          this.toPay.push(obj)
          this.totalAmtToPay = this.totalAmtToPay + obj['pay_component_amt']
         
        } else {
          this.totalAmtToPay = this.totalAmtToPay + obj['pay_component_amt']
          this.toPay.push(obj)
        }
      }
    }


  }
  getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  };

  refresh() {
    this.updateObj = {}
  }
}
