import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainService } from '../../service/main.service';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { AllEmpService } from '../../service/all-emp.service';
import { SettingService } from '../../service/setting.service';
declare var $: any

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.css']
})
export class LeavesComponent implements OnInit {

  constructor( public mainService: MainService, private settingService: SettingService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private allEmpService: AllEmpService, private payableService: EstablishmentService) { }

  erpUser;
  b_acct_id;
  allEmployees = [];
  selectEmpObj = {};
  leaveObj = {is_leave_carry_fwd:'',renew_ind_on_year_change:'',leave_rate:''};
  llObj = {};
  codeValueTechObj = {};
  leave_status = 0;
  create_user_id;
  update_user_id;
  newallEmplyees = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['leave_code', 'num_of_leaves', 'year', 'month', 'leaves_remaining', 'action'];
  datasource;
  allLeaveRuleInfo = [];
  allLeaveInfo=[];
  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllLeaveRuleDetails();
    await this.getAllEmployees();
    await this.getAllLeaveInfo();
  }
 async getAllLeaveInfo(){
   this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.payableService.getLeaveInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allLeaveInfo=resp.data;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all leave info list", 'Error', {
        duration: 5000
      });
    }
  }

  async getAllLeaveRuleDetails() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getAllRules(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allLeaveRuleInfo = resp.data;
      for (let i = 0; i < this.allLeaveRuleInfo.length; i++) {
        this.allLeaveRuleInfo[i]['leave_value'] = this.mainService.codeValueShowObj['HR0026'][this.allLeaveRuleInfo[i]['leave_code']];
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all Leave Rule list", 'Error', {
        duration: 5000
      });
    }
  }

  leaveType;

  changeLeaveType() {
    for (let i = 0; i < this.allLeaveRuleInfo.length; i++) {
      if (this.allLeaveRuleInfo[i]['leave_code'] == this.leaveObj['leave_code']) {
        this.leaveType = this.allLeaveRuleInfo[i];
        this.leaveObj['is_leave_carry_fwd']=this.allLeaveRuleInfo[i]['is_leave_carry_fwd'];
        this.leaveObj['renew_ind_on_year_change']=this.allLeaveRuleInfo[i]['renew_ind_on_year_change'];
        this.leaveObj['leave_rate']=this.allLeaveRuleInfo[i]['leave_rate'];
        this.leaveObj['num_of_leaves']=this.allLeaveRuleInfo[i]['num_of_leaves'];

      }
    }

  }

  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allEmployees = resp.data;

      this.newallEmplyees = []
      for (let i = 0; i < this.allEmployees.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, this.allEmployees[i]);
        obj['emp_name'] = this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id']) + "-" + obj['emp_name']
        this.newallEmplyees.push(obj)
      }
    } else {
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }


  async changeEmployee() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    var resp = await this.payableService.getLeaveInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all leave info list", 'Error', {
        duration: 5000
      });
    }
  }
  async submitLeave() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    this.leaveObj['b_acct_id'] = this.b_acct_id;
    this.leaveObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.leaveObj['create_user_id'] = this.erpUser.user_id;
    this.leaveObj['leaves_remaining'] = this.leaveObj['num_of_leaves'];
    this.leaveObj['carry_forward_leaves'] = 0;
    this.leaveObj['adjust_remaining_leaves'] = 0;
    var sp = this.leaveObj['eff_dt'].split("-");
    this.leaveObj['year'] = sp[0];
    this.leaveObj['month'] = parseInt(sp[1])
    obj['leave_data'] = [this.leaveObj];

    this.spinner.show();
    var resp = await this.payableService.addLeaveInfo(obj);
    if (resp['error'] == false) {
      await this.changeEmployee();
      await this.getAllLeaveInfo();
      this.spinner.hide();
      this.snackBar.open("Employee Leave Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Leave Of Employee", 'Error', {
        duration: 5000
      });
    }
  }

  openUpdate(element) {
    this.leaveObj = Object.assign({}, element);

    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.leaveObj['year'] = this.leaveObj['year'].toString();
    this.leaveObj['is_leave_carry_fwd'] = this.leaveObj['is_leave_carry_fwd'].toString();
  }
  refresh() {
    this.leaveObj = {is_leave_carry_fwd:'',renew_ind_on_year_change:'',leave_rate:''};

  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  async updateLeave() {
    this.leaveObj['b_acct_id'] = this.b_acct_id;
    this.leaveObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.leaveObj['update_user_id'] = this.erpUser.user_id;
    this.spinner.show();
    var resp = await this.payableService.updateLeaveInfo(this.leaveObj);
    if (resp['error'] == false) {
      await this.changeEmployee();
      this.spinner.hide();
      this.snackBar.open("Employee Leave Update Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while updating Leave Info Of Employee", 'Error', {
        duration: 5000
      });
    }
  }

  async carrForward() {
    this.leaveObj['b_acct_id'] = this.b_acct_id;
    this.leaveObj['create_user_id'] = this.b_acct_id;
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    obj['leave_data']= this.createLeave(parseInt(this.leaveObj['year']),parseInt(this.leaveObj['month']),this.allLeaveInfo,this.allLeaveRuleInfo);

   
    this.spinner.show();
    var resp = await this.payableService.addLeaveInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.getAllLeaveInfo();
      this.snackBar.open("Carry Forward Operation Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Operation Failed", 'Error', {
        duration: 5000
      });
    }
  }

  async deleteLeave(element) {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id
    this.spinner.show();
    var resp = await this.payableService.deleteLeaveInfo(obj);
    if (resp['error'] == false) {
      await this.changeEmployee();
      this.spinner.hide();
      this.snackBar.open("Employee Leave Delete Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while deleteing Leave Info Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  async adjustLeave() {
    this.leaveObj['b_acct_id'] = this.b_acct_id;
    this.leaveObj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.payableService.adjustLeave(this.leaveObj);
    if (resp['error'] == false) {
      this.snackBar.open("Adjust Leave Operation Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Operation Failed", 'Error', {
        duration: 5000
      });
    }
  }






/***************************************Kunal Code********************************************** */
createLeave(year, month, allLeaveInfo, allLeaveRule) {
  var returnArr = []
  let carryYear = 0
  let carryMonth = 0
  if (month == 12) {
      carryMonth = 1
      carryYear = year + 1
  } else {
      carryMonth = month + 1
      carryYear = year
  }

  //LeaveInfo Filter start//

  var temp=[];
  for(let i=0;i<allLeaveInfo.length;i++){
    if(allLeaveInfo[i]['month']==month && allLeaveInfo[i]['year']==year){
      temp.push(allLeaveInfo[i]);
    }
  }

  allLeaveInfo=temp;
//LeaveInfo Filter end //
  var ruleObj = new Object;
  for (let i = 0; i < allLeaveRule.length; i++) {
      ruleObj[allLeaveRule[i]['leave_code']] = Object.assign({}, allLeaveRule[i])
  }

  for (let j = 0; j < allLeaveInfo.length; j++) {
      let obj = new Object
      obj['month'] = carryMonth
      obj['year'] = carryYear;
      obj['create_user_id']=this.erpUser.user_id;
      obj['emp_id'] = allLeaveInfo[j]['emp_id']
      obj['leave_code'] = allLeaveInfo[j]['leave_code']
      let leaveRuleObj = Object.assign({}, ruleObj[allLeaveInfo[j]['leave_code']])

      ////************************************************************LIFETIME*********************************** */
      if (leaveRuleObj['leave_rate'] == 'LIFETIME') {
          obj['num_of_leaves'] = allLeaveInfo[j]['num_of_leaves']
          obj['leaves_remaining'] = allLeaveInfo[j]['leaves_remaining']
          returnArr.push(obj)
      }
      ////************************************************************MONTHLY*********************************** */

      if (leaveRuleObj['leave_rate'] == 'MONTHLY') {
          if (month < 12) {
              if (leaveRuleObj['is_leave_carry_fwd'] == 1) {
                  obj['num_of_leaves'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                  obj['leaves_remaining'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                  returnArr.push(obj)
              } else {
                  obj['num_of_leaves'] = leaveRuleObj['num_of_leaves']
                  obj['leaves_remaining'] = leaveRuleObj['num_of_leaves']
                  returnArr.push(obj)

              }

          }
          if (month == 12) {
              if (leaveRuleObj['is_leave_carry_fwd'] == 1 && leaveRuleObj['renew_ind_on_year_change'] == 0) {
                  obj['num_of_leaves'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                  obj['leaves_remaining'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                  returnArr.push(obj)
              } else {
                  obj['num_of_leaves'] = leaveRuleObj['num_of_leaves']
                  obj['leaves_remaining'] = leaveRuleObj['num_of_leaves']
                  returnArr.push(obj)

              }
          }

      }

      ////************************************************************QUATERLY*********************************** */

      if (leaveRuleObj['leave_rate'] == 'QUATERLY') {
          let quaterArr = [3, 6, 9, 12]
          if (quaterArr.includes(month)) {
              if (month < 12) {
                  if (leaveRuleObj['is_leave_carry_fwd'] == 1) {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      returnArr.push(obj)
                  } else {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves']
                      returnArr.push(obj)

                  }

              }
              if (month == 12) {
                  if (leaveRuleObj['is_leave_carry_fwd'] == 1 && leaveRuleObj['renew_ind_on_year_change'] == 0) {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      returnArr.push(obj)
                  } else {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves']
                      returnArr.push(obj)

                  }
              }
          }
          else {
              obj['num_of_leaves'] = allLeaveInfo[j]['num_of_leaves']
              obj['leaves_remaining'] = allLeaveInfo[j]['leaves_remaining']
              returnArr.push(obj)
          }


      }


      ////************************************************************HALFYEARLY*********************************** */

      if (leaveRuleObj['leave_rate'] == 'HALFYEARLY') {
          let halfYearlyArr = [6, 12]
          if (halfYearlyArr.includes(month)) {
              if (month < 12) {
                  if (leaveRuleObj['is_leave_carry_fwd'] == 1) {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      returnArr.push(obj)
                  } else {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves']
                      returnArr.push(obj)

                  }

              }
              if (month == 12) {
                  if (leaveRuleObj['is_leave_carry_fwd'] == 1 && leaveRuleObj['renew_ind_on_year_change'] == 0) {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                      returnArr.push(obj)
                  } else {
                      obj['num_of_leaves'] = leaveRuleObj['num_of_leaves']
                      obj['leaves_remaining'] = leaveRuleObj['num_of_leaves']
                      returnArr.push(obj)

                  }
              }
          }
          else {
              obj['num_of_leaves'] = allLeaveInfo[j]['num_of_leaves']
              obj['leaves_remaining'] = allLeaveInfo[j]['leaves_remaining']
              returnArr.push(obj)
          }


      }




      ////************************************************************YEARLY*********************************** */

      if (leaveRuleObj['leave_rate'] == 'YEARLY') {


          if (month == 12) {
              if (leaveRuleObj['is_leave_carry_fwd'] == 1 && leaveRuleObj['renew_ind_on_year_change'] == 0) {
                  obj['num_of_leaves'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                  obj['leaves_remaining'] = leaveRuleObj['num_of_leaves'] + allLeaveInfo[j]['leaves_remaining']
                  returnArr.push(obj)
              } else {
                  obj['num_of_leaves'] = leaveRuleObj['num_of_leaves']
                  obj['leaves_remaining'] = leaveRuleObj['num_of_leaves']
                  returnArr.push(obj)

              }
          }

          else {
              obj['num_of_leaves'] = allLeaveInfo[j]['num_of_leaves']
              obj['leaves_remaining'] = allLeaveInfo[j]['leaves_remaining']
              returnArr.push(obj)
          }


      }
  }
return returnArr;
}






}
