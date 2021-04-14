import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ScriptLoaderService } from '../../_services/script-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MainService } from '../service/main.service';
import { ProfileService } from '../service/profile.service';
import { AuthenticationService } from '../../authentication.service';
import { TaskService } from '../service/task.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-portal-dash',
  templateUrl: './portal-dash.component.html',
  styleUrls: ['./portal-dash.component.css']
})
export class PortalDashComponent implements OnInit {

  constructor(private auth: AuthenticationService, private taskService: TaskService, private profileService: ProfileService, private router: Router, private mainService: MainService, private snackBar: MatSnackBar, private _script: ScriptLoaderService) { }
  erpUser;
  url = { 'HR': 'hrms', 'FPEM': 'fpem', ACCOUNT: 'accounts', PROPERTY: 'property', LAW: 'law', MDR: 'mdr', 'ENG': 'eng' };
  imgUrl = { 'HR': 'hrms.png', 'FPEM': 'fin.png', ACCOUNT: 'ap.png', PROPERTY: 'property.png', LAW: 'law', MDR: 'md.png', 'ENG': 'eng.png' };
  assignedProducts = [];
  activeProducts = {};
  col1 = [];
  col2 = [];
  col3 = [];
  empObj = {};
  personalInfoObj = {};
  allPosting = [];
  allApproval = [];
  allDocument = [];
  postingObj = {};
  approvalObj = {};
  allApprovalStatus = [];
  hr_flag = false;
  account_flag = false;
  is_admin = 0
  pr=[];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.is_admin = this.erpUser['is_admin'];
    this.assignedProducts = this.erpUser.assigned_product_cd;
    for (var i = 0; i < this.assignedProducts.length; i++) {
      if (this.assignedProducts[i] == 'NA') {
        continue;
      }
      // if(i%3 == 0){
      //   this.col1.push(this.assignedProducts[i]);
      // }else if(i%3==1){
      //   this.col2.push(this.assignedProducts[i]);
      // }else{
      //   this.col3.push(this.assignedProducts[i]);
      // }

      // if (this.assignedProducts[i] == 'ACCOUNT') {
      //   this.account_flag = true

      //   this.col1.push(this.assignedProducts[i]);
      // }
      // if (this.assignedProducts[i] == 'HR') {
      //   this.hr_flag = true
      //   this.col3.push(this.assignedProducts[i]);
      // }
      this.pr.push(this.assignedProducts[i]);
      console.log(this.pr);
    }
    console.log(this.col3, this.col1)
    //this.activeProducts = this.erpUser.active_product_cd;
    for (var i = 0; i < this.erpUser.active_product_cd.length; i++) {
      this.activeProducts[this.erpUser.active_product_cd[i].prod_cd] = this.erpUser.active_product_cd[i]
    }

    await this.getEmpInfo();
    await this.getEstablishmentInfo();
    //this.personalInfoObj = this.mainService.personalInfoObj;
    // await this.getAllPosting();
    // await this.getAllApproval();
    await this.getAllRule();
    await this.getAllApprovalStatus();
    //await this.getAllTasks();

  }
  ngAfterViewInit() {
    this._script.load('./assets/js/scripts/dashboard_1_demo.js');
  }
  route(i) {

    this.router.navigate(['/' + this.url[i] + "/index"])
  }
  portal(params) {

    this.router.navigate(['/' + params])


  }
  async getEmpInfo() {
    var resp = await this.profileService.getUserProfileInfo(this.erpUser.user_id);
    console.log(resp);
    if (resp['error'] == false) {
      this.empObj = resp['data'][0];
      console.log(this.empObj )
      var erp=this.erpUser;
      erp['User_name']=this.empObj['first_name']+" "+this.empObj['last_name'];
      localStorage.setItem('erpUser', JSON.stringify(erp));
    } else {
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000,
      });
    }

  }
  async getEstablishmentInfo() {
    var obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['email'] = this.empObj['email'];
    obj['phone_no'] = this.empObj['work_phone_no'];
    var resp = await this.profileService.getEstablishmentInfo(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      if (resp['data'].length > 0) {
        this.personalInfoObj = resp['data'][0];
        this.mainService.emp_id = this.personalInfoObj['emp_id'];
        console.log(this.mainService.emp_id);

      }

    } else {

    }
  }

  // async getAllPosting() {
  //   var obj = new Object();
  //   obj['b_acct_id'] = this.erpUser.b_acct_id;
  //   obj['emp_id'] = this.personalInfoObj['emp_id'];
  //   console.log(obj);
  //   console.log(this.personalInfoObj);
  //   var resp = await this.profileService.getPostingInfo(obj);
  //   console.log(resp);
  //   if (resp['error'] == false) {
  //     var dt = resp['data'];
  //     for (var i = 0; i < dt.length; i++) {
  //       if (dt[i]['posting_end_date'] == '2090-10-10') {
  //         this.allPosting.push(dt[i]);
  //         this.postingObj[dt[i]['section_code'] + dt[i]['designation_code']] = 1;
  //       }
  //     }
  //     console.log(this.postingObj);
  //   } else {
  //     // this.snackBar.open('Error','Error while getting all posting');
  //   }
  // }
  // async getAllApproval() {
  //   var resp = await this.profileService.getAllApproval(this.erpUser.b_acct_id);
  //   console.log(resp);
  //   if (resp['error'] == false) {
  //     this.allApproval = resp['data'];


  //     if(Object.keys(this.postingObj).length>0){


  //       for (var i = 0; i < this.allApproval.length; i++) {
  //         if (this.postingObj[this.allApproval[i]['section_code'] + this.allApproval[i]['designation_code']] == 1 ) {
  //           if (this.approvalObj[this.allApproval[i]['doc_type']] == undefined) {
  //             this.approvalObj[this.allApproval[i]['doc_type']] = []
  //           }
  //           this.approvalObj[this.allApproval[i]['doc_type']].push(this.allApproval[i]['level_of_approval']);
  //         }
  //       }


  //     }


  //     console.log(this.approvalObj);
  //   } else {
  //     this.snackBar.open('Error', 'Error while getting all Approval');
  //   }
  // }
  // async getAllApprovalStatus() {
  //   var obj1 = new Object();
  //   obj1['b_acct_id'] = this.erpUser.b_acct_id;
  //   var resp = await this.profileService.getAllApprovalStatus(obj1);
  //   console.log(resp);
  //   var count = 0;
  //   if (resp['error'] == false) {
  //     this.allApprovalStatus = resp['data'];
  //     var obj = {};


  //     if(Object.keys(this.approvalObj).length>0){


  //       for (var i = 0; i < this.allApprovalStatus.length; i++) {
  //         if (this.allApprovalStatus[i]['status'] == 'PENDING' && this.approvalObj[this.allApprovalStatus[i]['doc_type']].indexOf(this.allApprovalStatus[i]['level_of_approval']) > -1) {
  //           var lvl = this.approvalObj[this.allApprovalStatus[i]['doc_type']];
  //           if (lvl == '1') {
  //             count++;
  //           } else if (obj[this.allApprovalStatus[i]['doc_local_no'] + "" + (parseInt(this.allApprovalStatus[i]['level_of_approval']) - 1)] == 'APPROVED') {
  //             count++;
  //           }
  //         }
  //         obj[this.allApprovalStatus[i]['doc_local_no'] + this.allApprovalStatus[i]['level_of_approval']] = this.allApprovalStatus[i]['status'];
  //       }


  //     }

  //     console.log(count);
  //     this.mainService.tasks = count;
  //     this.taskService.approvalObj = this.approvalObj;
  //   } else {
  //     this.snackBar.open(resp['data'], 'Error', {
  //       duration: 5000,
  //     });
  //   }
  // }



  //************************************************************************************* */
  allTaskArr = []
  lastLevelOfApprovel = {};
  async getAllRule() {
    var resp = await this.profileService.getAllApproval(this.erpUser.b_acct_id);
    if (resp['error'] == false) {
      this.allApproval = resp['data'];
      for (var i = 0; i < this.allApproval.length; i++) {
        this.lastLevelOfApprovel[this.allApproval[i]['doc_type']] = this.allApproval[i]['level_of_approval']
      }
    } else {

    }

    console.log(this.lastLevelOfApprovel)
  }

  stepStatus = {};
  async getAllApprovalStatus() {

    this.mainService.tasks = 0;
    this.stepStatus = {};
    this.allTaskArr = [];
    var ob = new Object();
    ob['b_acct_id'] = this.erpUser.b_acct_id;
    var resp = await this.profileService.getAllApprovalStatus(ob);
    console.log(resp);
    var unique_local_no = [];

    if (resp['error'] == false) {
      this.allApprovalStatus = resp['data'];

      var temp = [];
      for (let i = 0; i < this.allApprovalStatus.length; i++) {
        this.stepStatus[this.allApprovalStatus[i]['doc_local_no'] + this.allApprovalStatus[i]['level_of_approval']]
          = this.allApprovalStatus[i]['status']
        if (this.allApprovalStatus[i]['user_id'] == this.erpUser['user_id']) {
          temp.push(this.allApprovalStatus[i]);
          unique_local_no.push(this.allApprovalStatus[i]['doc_local_no']);
        }
      }

      this.allApprovalStatus = [];
      this.allApprovalStatus = temp;
      let unique = unique_local_no.filter((item, i, ar) => ar.indexOf(item) === i);

      var tableObj = {}
      for (let j = 0; j < unique.length; j++) {
        for (var i = 0; i < this.allApprovalStatus.length; i++) {
          if (this.allApprovalStatus[i]['status'] == 'APPROVED' || this.allApprovalStatus[i]['status'] == 'REJECTED') {
            var obj1 = Object.assign({}, this.allApprovalStatus[i]);
            obj1['action'] = 0;
            obj1['last_approval_level'] = this.lastLevelOfApprovel[this.allApprovalStatus[i]['doc_type']];
            tableObj[this.allApprovalStatus[i]['doc_local_no'] + this.allApprovalStatus[i]['level_of_approval']] = obj1;
          } else {
            var obj1 = Object.assign({}, this.allApprovalStatus[i]);
            if (this.allApprovalStatus[i]['level_of_approval'] == 1) {
              obj1['action'] = 1;
              obj1['last_approval_level'] = this.lastLevelOfApprovel[this.allApprovalStatus[i]['doc_type']];
              tableObj[this.allApprovalStatus[i]['doc_local_no'] + this.allApprovalStatus[i]['level_of_approval']] = obj1;
            }
            else if (this.stepStatus[this.allApprovalStatus[i]['doc_local_no'] + ((this.allApprovalStatus[i]['level_of_approval']) - 1)] == 'PENDING') {
              obj1['action'] = 0;
              obj1['last_approval_level'] = this.lastLevelOfApprovel[this.allApprovalStatus[i]['doc_type']];
              tableObj[this.allApprovalStatus[i]['doc_local_no'] + this.allApprovalStatus[i]['level_of_approval']] = obj1;
            } else {
              obj1['action'] = 1;
              obj1['last_approval_level'] = this.lastLevelOfApprovel[this.allApprovalStatus[i]['doc_type']];
              tableObj[this.allApprovalStatus[i]['doc_local_no'] + this.allApprovalStatus[i]['level_of_approval']] = obj1;
            }
          }
        }
      }



      var keys = Object.keys(tableObj);
      var tt = [];
      for (let i = 0; i < keys.length; i++) {
        tt.push(tableObj[keys[i]])
      }

      for (let j = 0; j < unique.length; j++) {
        var tt1;
        for (let i = 0; i < tt.length; i++) {
          if (tt[i]['doc_local_no'] == unique[j]) {
            if (tt[i]['action'] == 1) {
              tt1 = tt[i];
              this.allTaskArr.push(tt1)
              break;
            } else {
            }

          }
        }
      }

      console.log(this.allTaskArr)

      this.mainService.tasks = this.allTaskArr.length;
      console.log(this.mainService.tasks);
    } else {
    }
  }


}
