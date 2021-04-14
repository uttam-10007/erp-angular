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
  selector: 'app-death',
  templateUrl: './death.component.html',
  styleUrls: ['./death.component.css']
})
export class DeathComponent implements OnInit {

  constructor(public mainService: MainService, private allEmpService: AllEmpService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private estabService: EstablishmentService) { }
  erpUser;
  b_acct_id;
  user_id;
  allNominee=[]
  allEmployees = [];
  selectEmpObj = {};
  deathObj = {};
  codeValueTechObj = {};
  deatArr = [];
  allArr = []
  employeeObj = {};
  previousGeneratedArray = []
  ftechSalaryArr = [{ value: "YES" }, { value: "NO" }]
  toPay = []
  totalAmtToPay = 0
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id', 'emp_name', 'effective_timestamp', 'order_id'];
  datasource;
  lastPaidArr = []
  activeEmpArr = []
  newallEmplyees = []
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
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ["ACTIVE", "INACTIVE"];
    var resp = await this.estabService.getArrayAllCurrentEstablishementInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmployees = resp.data;
      this.activeEmpArr = []
      this.deatArr=[]
      for (let i = 0; i < this.allEmployees.length; i++) {
        this.employeeObj[this.allEmployees[i]['emp_id']] = this.allEmployees[i]['emp_name'];
        if (this.allEmployees[i].employee_current_type_code == "DEATH") {
          var obj1 = Object.assign({},this.allEmployees[i]);
          if(obj1['effective_timestamp']!=null && obj1['effective_timestamp']!=undefined)
          obj1['effective_timestamp'] = obj1['effective_timestamp'].split(" ")[0];
          this.deatArr.push(obj1);


        } else if(this.allEmployees[i].emp_status_code == "ACTIVE") {
          this.activeEmpArr.push(this.allEmployees[i])
        }
      }     
      this.newallEmplyees = []
      for(let i=0;i<this.activeEmpArr.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.activeEmpArr[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
     
      this.datasource = new MatTableDataSource(this.deatArr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }

  async submitDeath() {
  swal.fire({
    title: 'Are you sure?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Submit it!'
  }).then((result) => {
    if (result.value) {
      this.finalsubmitDeath()
    }
  })
}
  async finalsubmitDeath() {
    this.deathObj['b_acct_id'] = this.b_acct_id;
    this.deathObj['emp_id'] = this.selectEmpObj;
    this.deathObj['create_user_id'] = this.erpUser.user_id;
    this.deathObj['emp_status_code'] = "INACTIVE";
    this.deathObj['employee_current_type_code'] = "DEATH";

    this.deathObj['data'] = this.allNominee
    this.spinner.show();
    var resp = await this.estabService.deathOfEmployee(this.deathObj);
    if (resp['error'] == false) {
      await this.getAllEmployees()
      this.spinner.hide();
      // this.snackBar.open("Death  Added Successfully!", 'Success', {
      //   duration: 5000
      // });
      swal.fire("Success", "Death  Added Successfully!",'success');

    } else {
      this.spinner.hide();
      // this.snackBar.open("Error while Adding Death  Of Employee", 'Error', {
      //   duration: 5000
      // });
      swal.fire("Sorry", "Error while Adding Death  Of Employee",'error');

    }
  }


  async getBillDetailForDeath() {
    this.totalAmtToPay = 0
    this.allNominee = []
    if (this.deathObj['fetch_salary'] == 'YES') {
      this.spinner.show()
      var obj = new Object
      obj['b_acct_id'] = this.b_acct_id
      obj['emp_id'] = this.selectEmpObj
      var resp = await this.estabService.getBillDetailForDeath(JSON.stringify(obj));
      if (resp['error'] == false) {
        this.lastPaidArr = resp.data
        var tempDate = new Date(resp.data[0]['fin_year'] + "-" + resp.data[0]['month'] + "-01")
        var startDate = this.add_months(tempDate, 1)
        var endDate = new Date(this.deathObj['date_of_death'])
        await this.generateYearMnths(startDate, endDate)

        if (this.totalAmtToPay == 0) {

        } else {
          var resp2 = await this.allEmpService.getNominee(obj);

          if (resp2['error'] == false) {
            this.allNominee = resp2.data
            for (let i = 0; i < this.allNominee.length; i++) {
              this.allNominee[i]['other_pay_component_amount'] = (this.totalAmtToPay / 100) * this.allNominee[i]['nom_share']
              this.allNominee[i]['other_pay_component_amount']=this.allNominee[i]['other_pay_component_amount'].toFixed(2)
              this.allNominee[i]['other_pay_component_code'] = 'DEATH'
              this.allNominee[i]['pay_status_code'] = 'PAY'


            }
          } else {
            this.snackBar.open("Error while getting Nominee list", 'Error', {
              duration: 5000
            });
          }
        }
        this.spinner.hide();

      } else {
        this.spinner.hide();
        this.snackBar.open("Error while Getting Salary Details Of Employee", 'Error', {
          duration: 5000
        });
      }
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
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }



}
