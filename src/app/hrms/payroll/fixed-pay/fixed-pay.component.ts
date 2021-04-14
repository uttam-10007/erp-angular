import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service';
declare var $: any;
@Component({
  selector: 'app-fixed-pay',
  templateUrl: './fixed-pay.component.html',
  styleUrls: ['./fixed-pay.component.css']
})
export class FixedPayComponent implements OnInit {


  constructor(private settingService: SettingService, public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  erpUser;
  b_acct_id;
  arr_id;
  fixedpay = []
  allEmplyees = [];
  selected
  selectedendate = 'ALL PERIOD'
  status = [{ value: 'Current' }, { value: 'History' }]
  enddate = [{ value: 'CUSTOM' }, { value: 'ALL PERIOD' }]
  selectEmpObj = {};
  fixedpayObj = {};
  codeValueTechObj = {};
  allEmplyees_new = []
  systemDate
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['pay_component_code', 'pay_component_amt', 'pay_code', 'effective_start_dt', 'effective_end_dt', 'action'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.payableService.getSystemDate();
    this.systemDate = resp.data
    await this.getAllEmployees();

  }
 
  async DependentCompFunction(data_obj) {
    //****************All Component********************* */
    var return_arr = []
    var allComp = this.mainService.codeValueTechObj['HR0021']
    var ComponentObj = {};

    for (let i = 0; i < allComp.length; i++) {
      ComponentObj[allComp[i]['code']] = [];
    }
    var GRADEPAY_Rule = [];


    //*****************All Dependent Component******************** */
    var allSCD = []
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['effective_dt'] = '2090-10-10';
    obj['status'] = ['ACTIVE', 'INACTIVE'];
    var resp = await this.settingService.getAllSalaryCD(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      allSCD = resp.data;
      for (let i = 0; i < allSCD.length; i++) {
        if (allSCD[i]['dependent_component'] != 'GRADEPAY') {
          ComponentObj[allSCD[i]['dependent_component']].push(allSCD[i])
        } else {
          GRADEPAY_Rule.push(allSCD[i])
        }
      }
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while getting  all salary component list", 'Error', {
        duration: 5000
      });
    }
    console.log(ComponentObj);
    console.log(data_obj)
    console.log(data_obj['pay_component_code'])
    var rules = ComponentObj[data_obj['pay_component_code']];
    console.log(rules)

    for (let i = 0; i < rules.length; i++) {
      var obj1 = new Object();
      obj1['pay_component_code'] = rules[i]['component_code'];
      obj1['effective_start_dt'] = data_obj['effective_start_dt'];
      obj1['effective_end_dt'] = data_obj['effective_end_dt'];
      obj1['b_acct_id'] = data_obj['b_acct_id'];
      obj1['emp_id'] = data_obj['emp_id'];
      obj1['pay_code'] = rules[i]['pay_code']
      obj1['create_user_id'] = this.erpUser.user_id;

      if (rules[i]['rate_type'] == "PERCENTAGE") {
        obj1['pay_component_amt'] = (data_obj['pay_component_amt'] * rules[i]['amount']) / 100;
      } else {
        obj1['pay_component_amt'] = rules[i]['amount'];
      }


      return_arr.push(obj1)
    }

    //******************* All Grade Pay Matrix****************** */
    var allMatrix = []
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    var resp = await this.settingService.getMatrix(JSON.stringify(obj));
    if (resp['error'] == false) {
      allMatrix = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all matrix list", 'Error', {
        duration: 5000
      });
    }
    //******************* Get Grade Pay on the BASIC PAY****************** */

    var greade_pay;
    if (data_obj['pay_component_code'] == 'BASIC') {

      for (let i = 0; i < allMatrix.length; i++) {
        if (allMatrix[i]['basic_pay'] <= data_obj['pay_component_amt']) {
          greade_pay = allMatrix[i]['grade_pay_code']
        }
      }

      for (let i = 0; i < GRADEPAY_Rule.length; i++) {
        if (GRADEPAY_Rule[i]['lower_limit'] <= greade_pay && greade_pay <= GRADEPAY_Rule[i]['upper_limit']) {
          var obj1 = new Object();
          obj1['pay_component_code'] = GRADEPAY_Rule[i]['component_code'];
          obj1['effective_start_dt'] = data_obj['effective_start_dt'];
          obj1['effective_end_dt'] = data_obj['effective_end_dt'];
          obj1['b_acct_id'] = data_obj['b_acct_id'];
          obj1['emp_id'] = data_obj['emp_id'];
          obj1['pay_code'] = GRADEPAY_Rule[i]['pay_code'];
          obj1['create_user_id'] = this.erpUser.user_id;

          if (GRADEPAY_Rule[i]['rate_type'] == "PERCENTAGE") {
            obj1['pay_component_amt'] = (data_obj['pay_component_amt'] * GRADEPAY_Rule[i]['amount']) / 100;
          } else {
            obj1['pay_component_amt'] = GRADEPAY_Rule[i]['amount'];
          }

          return_arr.push(obj1);
        }
      }
    }

    return_arr.push(data_obj);
    console.log(return_arr);
    return return_arr;

  }
  Arr = [];

  async submitFixedPay() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    obj['pay_component_amt'] = this.fixedpayObj['pay_component_amt']
    obj['pay_code'] = this.fixedpayObj['pay_code']
    obj['pay_component_code'] = this.fixedpayObj['pay_component_code']
    obj['effective_start_dt'] = this.fixedpayObj['effective_start_dt']
    obj['create_user_id'] = this.erpUser.user_id;
    if (this.selectedendate == 'CUSTOM') {
      obj['effective_end_dt'] = this.fixedpayObj['effective_end_dt']
    }
    else {
      obj['effective_end_dt'] = '2090-10-10'
    }
    console.log(obj)
    this.Arr = await this.DependentCompFunction(obj)
    console.log(this.Arr)
    $('#myModal').modal('show');
  }
  deleteArr(i){
    this.Arr.splice(i,1);
  }

  async addEmpFixPay() {
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['fixed_pay_info'] = this.Arr;
    obj1['end_dt'] = '2090-10-10';
    console.log(obj1)
    var resp = await this.settingService.addFixedPay(obj1);
    if (resp['error'] == false) {
      $('#myModal').modal('hide');
      await this.changeEmployeeempid();
      this.snackBar.open("Fixed Pay Added Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      $('#myModal').modal('hide')
      this.spinner.hide();
      this.snackBar.open("Error while Adding Fixed Pay  Of Employee", 'Error', {
        duration: 5000
      });
    }

  }

  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  empObj={};
  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    var resp = await this.payableService.getEmployeeMasterData(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
      for (let i = 0; i < arr.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, arr[i]);
        obj['tempid'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id'])
        this.allEmplyees.push(obj)
      }
      this.allEmplyees_new = [];
      for (let i = 0; i < resp.data.length; i++) {
        var obj = new Object();
        obj = Object.assign(resp.data[i]);
        obj['emp_name'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id']) + "-" + obj['emp_name']
        this.empObj[obj['emp_id']] = obj['emp_name'];

        this.allEmplyees_new.push(obj)
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  async changeEmployeeempid() {

    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    this.selected = 'Current'
    var resp = await this.payableService.getAllFixedPay(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.fixedpay = resp.data

      var arr = []
      for (let i = 0; i < this.fixedpay.length; i++) {
        this.fixedpay[i]['tempeffective_start_dt'] = this.mainService.dateformatchange(this.fixedpay[i]['effective_start_dt'])
        this.fixedpay[i]['tempeffective_end_dt'] = this.mainService.dateformatchange(this.fixedpay[i]['effective_end_dt'])

        var obj = new Object();
        obj = Object.assign(this.fixedpay[i]);

        if (obj['effective_end_dt'] >= this.systemDate) {
          arr.push(obj)
        }

      }
      this.datasource = new MatTableDataSource(arr)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;


    } else {


      this.spinner.hide();
      this.snackBar.open("Error while getting employee all Fixed Pay list", 'Error', {
        duration: 5000
      });
    }
  }

  async changeEmployee() {

    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    var resp = await this.payableService.getAllFixedPay(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.fixedpay = resp.data
      if (this.selected == 'Current') {
        var arr = []
        for (let i = 0; i < this.fixedpay.length; i++) {
          this.fixedpay[i]['tempeffective_start_dt'] = this.mainService.dateformatchange(this.fixedpay[i]['effective_start_dt'])
          this.fixedpay[i]['tempeffective_end_dt'] = this.mainService.dateformatchange(this.fixedpay[i]['effective_end_dt'])
  
          var obj = new Object();
          obj = Object.assign(this.fixedpay[i]);
          if (obj['effective_end_dt'] >= this.systemDate) {
            arr.push(obj)
          }

        }
        this.datasource = new MatTableDataSource(arr)
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;

      }
      else if (this.selected == 'History') {
        for (let i = 0; i < this.fixedpay.length; i++) {
          this.fixedpay[i]['tempeffective_start_dt'] = this.mainService.dateformatchange(this.fixedpay[i]['effective_start_dt'])
          this.fixedpay[i]['tempeffective_end_dt'] = this.mainService.dateformatchange(this.fixedpay[i]['effective_end_dt'])
  
          
        }
        this.datasource = new MatTableDataSource(this.fixedpay)
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
      }
    } else {


      this.spinner.hide();
      this.snackBar.open("Error while getting employee all Fixed Pay list", 'Error', {
        duration: 5000
      });
    }
  }


  async deletefixedpay(element) {

    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    var resp = await this.payableService.deletefixedpay(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.changeEmployeeempid()

      this.snackBar.open("Deleted Successfully", 'Success', {
        duration: 5000
      });

    } else {


      this.spinner.hide();
      this.snackBar.open("Error while getting employee all Fixed Pay list", 'Error', {
        duration: 5000
      });
    }
  }

  async updateFixPay() {
    var obj = Object.assign({}, this.fixedpayObj);
    obj['update_user_id'] = this.erpUser.user_id;
    obj['b_acct_id'] = this.b_acct_id;

    this.spinner.show();
    var resp = await this.payableService.updateFixedPayonly(obj);
    if (resp['error'] == false) {
      await this.changeEmployeeempid()
      this.spinner.hide();
      this.snackBar.open("Updated Fixed Pay  Of Employee", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Updating Fixed Pay  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }

  openUpdate(element) {
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.fixedpayObj = Object.assign({}, element);
    if(this.fixedpayObj['effective_end_dt'] == '2090-10-10'){
      this.selectedendate = 'ALL PERIOD';
    }else{
      this.selectedendate = 'CUSTOM';
    }

  }


  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}
