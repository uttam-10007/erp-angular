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
  selector: 'app-termination',
  templateUrl: './termination.component.html',
  styleUrls: ['./termination.component.css']
})
export class TerminationComponent implements OnInit {


  constructor(public mainService: MainService, private allEmpService: AllEmpService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private estabService: EstablishmentService) { }
  erpUser;
  b_acct_id;
  user_id;
activeEmpArr = []
  terminatedArr=[]
  allEmployees = [];
  selectEmpObj = {};
  terminationObj = {};
  codeValueTechObj = {};
  allArr=[]
  employeeObj={};
  newallEmplyees = []
  toPay = []
  totalAmtToPay = 0
  lastPaidArr=[]
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id', 'emp_name', 'effective_timestamp','order_id'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
  }


  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    var arr = []
    
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ["ACTIVE", "INACTIVE"];
    var resp = await this.estabService.getArrayAllCurrentEstablishementInfo(obj);
    if (resp['error'] == false) {
      arr = resp.data;
    
      
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
       this.allEmployees.push(obj)
      }
      this.activeEmpArr = []
      this.terminatedArr=[]
      for (let i = 0; i < this.allEmployees.length; i++) {
        if (this.allEmployees[i].employee_current_type_code == "TERMINATED") {
          this.terminatedArr.push(this.allEmployees[i]);

        } else {
          if (this.allEmployees[i].emp_status_code == "ACTIVE") {
            this.activeEmpArr.push(this.allEmployees[i])

          }
        }
      }
      
      this.newallEmplyees = []
      for(let i=0;i<this.activeEmpArr.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.activeEmpArr[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      this.datasource = new MatTableDataSource(this.terminatedArr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }




  // async getAllEmployees() {
  //   var obj = new Object();
  //   obj['b_acct_id'] = this.b_acct_id;
  //   obj['party_status_code'] = ["JOINING", "JOINED", "LEFT"];
  //   var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
  //   if (resp['error'] == false) {
  //     this.allEmployees = resp.data;
  //     for (let i=0; i<this.allEmployees.length ;i++){
  //       this.employeeObj[this.allEmployees[i]['emp_id']]=this.allEmployees[i]['emp_name'];
  //     }
  //   } else {
  //     this.snackBar.open("Error while getting employee list", 'Error', {
  //       duration: 5000
  //     });
  //   }
  // }

  async submitTermination() {
    this.terminationObj['b_acct_id'] = this.b_acct_id;
    this.terminationObj['update_user_id'] = this.erpUser.user_id;
    this.terminationObj['emp_status_code'] = "INACTIVE";
    this.terminationObj['employee_current_type_code']='TERMINATED'

    this.terminationObj['data']=[]
    await this.getBillDetailForTerminaton()
    swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Submit it!'
    }).then((result) => {
      if (result.value) {
        this.finalsubmitTermination()
      }
    })
    
  }

  async finalsubmitTermination() {

this.spinner.show();
    var resp = await this.estabService.terminateEmployee(this.terminationObj);
    if (resp['error'] == false) {
      await this.getAllEmployees();
      this.spinner.hide();
      this.snackBar.open("Termination  Added Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Termination  Of Employee", 'Error', {
        duration: 5000
      });
    }

  }

  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }



  async getBillDetailForTerminaton() {
    this.totalAmtToPay = 0
      this.spinner.show()
      var obj = new Object
      obj['b_acct_id'] = this.b_acct_id
      obj['emp_id'] = this.terminationObj['emp_id']
      var resp = await this.estabService.getBillDetailForTermination(JSON.stringify(obj));
      if (resp['error'] == false) {
        this.lastPaidArr = resp.data



        var tempDate = new Date(resp.data[0]['fin_year'] + "-" + resp.data[0]['month'] + "-01")
        var startDate = this.add_months(tempDate, 1)
        var endDate = new Date(this.terminationObj['termination_date'])
        await this.generateYearMnths(startDate, endDate)

        if (this.totalAmtToPay == 0) {

        } else {
          var endDateFinYear
    if ((endDate.getMonth() + 1) < 4) {
      endDateFinYear = endDate.getFullYear() - 1
    } else {
      endDateFinYear = endDate.getFullYear()
    }
          var obb=new Object;

          obb['pay_component_amt']=this.totalAmtToPay.toFixed(2)
          obb['pay_component_code']='TERMINATION ARREAR'
          obb['fin_year']=endDateFinYear
          obb['month']=endDate.getMonth()
          obb['pay_status_code']='ACTIVE'
          obb['emp_id']=this.terminationObj['emp_id']
          obb['pay_code']='PAY'
          this.terminationObj['data'].push(obb)



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
    // Here January is 1 based
    //Day 0 is the last day in the previous month
    return new Date(year, month, 0).getDate();
    // Here January is 0 based
    // return new Date(year, month+1, 0).getDate();
  };

  refresh(){
    this.terminationObj={}
  }


}
