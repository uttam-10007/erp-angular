import { Component, OnInit, ViewChild, KeyValueDiffers } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { ProfileService } from '../service/profile.service'
import { Router } from '@angular/router';
import { MainService } from '../service/main.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TaskService } from '../service/task.service';
import { UserAddService } from '../service/user-add.service';
import { EstablishmentService } from '../../hrms/service/establishment.service';
import { AllEmpService } from '../../hrms/service/all-emp.service';
import { DomSanitizer } from '@angular/platform-browser';

import Swal from 'sweetalert2';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare var $: any
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  constructor(private allEmpService:AllEmpService,  private sanitizer: DomSanitizer, private payableService:EstablishmentService,private userAdd: UserAddService, private spinner: NgxSpinnerService, private router: Router, private profileService: ProfileService, public mainService: MainService, private taskService: TaskService) { }
  erpUser;
  b_acct_id;
  allEmplyees = []
  allCurrentArrangements = []
  currentBillObj = { header: {}, allEmployees: [], data: {}, sums: {} };
  monthObj = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' }
  monthEnd = { '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30, '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31 }
  salaryObj = { accrual_date: '', b_acct_id: '', fin_year: '', month: '', section_code: '', post_info: {}, emp_info: {}, employement_info: {}, bank_info: {}, att_info: {}, fixed_pay_info: {}, variable_pay_info: {}, total_pay: {} }
  allBillData = []
  allApprovalStatus = [];
  allApproval = []
  approvalObj = {};
  allTask = {};
  allTaskArr = [];
  taskStatus = [];
  mxApprovl = {};
  payArr = []
  dedArr = [];
  gross = 0;
  net = 0;
  netded = 0;
  codeVal = { 'SALBILL': 'Salary Bill' }

  statusArr = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.approvalObj = this.taskService.approvalObj;
    await this.getAllUsersInfo();
    await this.getAllRule();
    await this.allEmployeeLeaveLadger();
    await this.getAllApprovalStatus();

  }

  allUser = [];
  UserObj = {};
  async getAllUsersInfo() {
    var obj = { b_acct_id: this.b_acct_id };
    var resp = await this.userAdd.getAllUsersInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allUser = resp['data'];
      for (let i = 0; i < this.allUser.length; i++) {
        this.UserObj[this.allUser[i]['user_id']] = this.allUser[i]['first_name'] + " " + this.allUser[i]['last_name']
        this.allUser[i]['name'] = this.allUser[i]['first_name'] + " " + this.allUser[i]['last_name']
      }
    } else {

    }
  }

  lastLevelOfApprovel = {};
  async getAllRule() {
    var resp = await this.profileService.getAllApproval(this.b_acct_id);
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
    this.allTask = {};
    this.allTaskArr = [];
    var ob = new Object();
    ob['b_acct_id'] = this.b_acct_id;
    var resp = await this.profileService.getAllApprovalStatus(ob);
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
              // tt1=tt[i]
            }

          }
        }
        // this.allTaskArr.push(tt1)
      }
      console.log(this.allTaskArr)
      console.log(this.allTaskArr);
      this.mainService.tasks = this.allTaskArr.length;

    } else {
      swal.fire("Error", "Error while getting Tasks");
    }
  }

  async ViewLeave(obj) {
    console.log(obj);
    for(let i=0;i<this.allLeaves.length;i++){
      if(this.allLeaves[i]['id']==obj['doc_local_no']){
        console.log(this.allLeaves[i])
        await this.view(this.allLeaves[i]['document_id'],this.allLeaves[i]['document_name'])
      }
    }
  }
  imgURL;
  filename
  async view(document_id,document_name) {
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['upload_id'] = document_id
    obj['filename'] = document_name;
    this.filename = document_name;
    this.spinner.show()
    const res = await this.allEmpService.getUploadedFileData(obj);
    if (res) {

      var docname = document_name;
      var ext = docname.split('.');

      if (ext[1] == 'png' || ext[1] == 'jpeg' || ext[1] == 'jpg') {
        const unsafeImageUrl = window.URL.createObjectURL(res);
        this.imgURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeImageUrl);
      } else {
        let file = new Blob([res], { type: 'application/pdf' });
        var fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      }
      this.spinner.hide()
    }
  }

  allLeaves=[];
  async allEmployeeLeaveLadger() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.payableService.getAllLeaveLedger(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      this.allLeaves = resp.data;
    } else {
      this.spinner.hide()
      swal.fire("Error", "Error while getting Leaves",'error');
    }
  }
  async taskStatusChange(s) {
    this.taskStatus = s;
    this.taskStatus['status'] = 'APPROVED';
    this.taskStatus['level_of_approval'] = s['level_of_approval'];
    this.taskStatus['user_id'] = this.erpUser.user_id;
    this.taskStatus['b_acct_id'] = this.erpUser.b_acct_id;
    this.taskStatus['update_user_id'] = this.erpUser.user_id;
    console.log(this.taskStatus);
    this.spinner.show();
    var resp = await this.taskService.changeStatus(this.taskStatus);
    console.log(resp);
    if (resp['error'] == false) {
      if (s['last_approval_level'] == s['level_of_approval']) {
        if (s['doc_type'] == 'SALBILL') {
          await this.statusChangeForSALBILL(s, 'APPROVED');
        }
        if (s['doc_type'] == 'BILL') {
          await this.changeCBStatus(s['doc_local_no'], 'APPROVED');
        }
        if (s['doc_type'] == 'CONTRA') {
          await this.changeContraStatus(s['doc_local_no'], 'APPROVED');
        }
        if (s['doc_type'] == 'BP') {
          await this.changeBPStatus(s['doc_local_no'], 'APPROVED');
        }
        if (s['doc_type'] == 'MJ') {
          await this.changeMJStatus(s['doc_local_no'], 'APPROVED');
        }
        if (s['doc_type'] == 'LEAVE') {
          await this.changeLeaveStatus(s['doc_local_no'], 'APPROVED');
        }
      }
      await this.getAllApprovalStatus();
      this.spinner.hide();
      swal.fire('Success', 'Task APPROVED Successfully', 'success');

    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Approving Bill')
    }

  }

  async taskStatusChange_Reject(s) {
    this.taskStatus = s;
    this.taskStatus['status'] = 'REJECTED';
    this.taskStatus['b_acct_id'] = this.erpUser.b_acct_id;
    this.taskStatus['level_of_approval'] = s['level_of_approval'];
    this.taskStatus['user_id'] = this.erpUser.user_id;
    this.taskStatus['update_user_id'] = this.erpUser.user_id;
    console.log(this.taskStatus);
    this.spinner.show();
    var resp = await this.taskService.changeStatus(this.taskStatus);
    if (resp['error'] == false) {
      if (s['doc_type'] == 'SALBILL') {
        await this.statusChangeForSALBILL(s, 'REJECTED');
      }
      if (s['doc_type'] == 'BILL') {
        await this.changeCBStatus(s['doc_local_no'], 'REJECTED');
      }
      if (s['doc_type'] == 'CONTRA') {
        await this.changeContraStatus(s['doc_local_no'], 'REJECTED');
      }
      if (s['doc_type'] == 'BP') {
        await this.changeBPStatus(s['doc_local_no'], 'REJECTED');
      }
      if (s['doc_type'] == 'MJ') {
        await this.changeMJStatus(s['doc_local_no'], 'REJECTED');
      }
      if (s['doc_type'] == 'LEAVE') {
        await this.changeLeaveStatus(s['doc_local_no'], 'REJECTED');
      }
      await this.getAllApprovalStatus();
      this.spinner.hide();
      swal.fire('Success', 'Task REJECTED Successfully', 'success');

    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while rejecting Bill')
    }

  }
  async changeLeaveStatus(id, status) {
    var dd;
    for(let i=0;i<this.allLeaves.length;i++){
      if(this.allLeaves[i]['id']==id){
        console.log(this.allLeaves[i]);
        dd=this.allLeaves[i]
      }
    }
    this.spinner.show();
    let obj = Object.assign({},dd);
    obj['b_acct_id'] = this.b_acct_id
    obj['emp_id'] = dd['emp_id']
    obj['leave_status_code'] =status;
    obj['update_user_id'] = this.erpUser.user_id;
    obj['approval_user_id'] = this.erpUser.user_id;
    console.log(obj);
    var resp = await this.payableService.approveLeave(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      // swal.fire('Success', 'Leave Approved','success')
    }
    else {
      this.spinner.hide();
      // swal.fire('Error', 'Error while changing the status of leave','error');
    }
   
    // var resp = await this.taskService.updateUnpostedJournalStatus(obj);
    // if (resp['error'] == false) {
    //   this.spinner.hide();
    //   // swal.fire("Success", "Update Successfully!", 'success');
    // } else {
    //   this.spinner.hide();
    //   // swal.fire("Error", "...Error while updating bp !", 'error');
    // }
  }
  async changeMJStatus(id, status) {
    this.spinner.show();
    let obj = new Object();
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = id
    obj['status'] = status
    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.taskService.updateUnpostedJournalStatus(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      // swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      // swal.fire("Error", "...Error while updating bp !", 'error');
    }
  }

  async changeBPStatus(id, status) {
    this.spinner.show();
    let obj = new Object();
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = id
    obj['status'] = status
    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.taskService.updateStatus(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      // swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      // swal.fire("Error", "...Error while updating bp !", 'error');
    }
  }


  async changeContraStatus(id, status) {
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['voucher_no'] = id;
    obj1['status'] = status;
    obj1['update_user_id'] = this.erpUser.user_id;

    console.log(obj1)
    var resp = await this.taskService.UpdateStatusContra(obj1);
    if (resp['error'] == false) {
      this.spinner.hide();
      // swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      // swal.fire("Error", "...Error while updating bill !", 'error');
    }
  }

  async changeCBStatus(cb_id, status) {
    var obj1 = new Object();
    obj1['b_acct_id'] = this.b_acct_id;
    obj1['cb_id'] = [cb_id];
    obj1['status'] = status;
    obj1['update_user_id'] = this.erpUser.user_id;

    console.log(obj1)
    var resp = await this.taskService.changeCbStatus(obj1);
    if (resp['error'] == false) {
      this.spinner.hide();
      // swal.fire("Success", "Update Successfully!", 'success');
    } else {
      this.spinner.hide();
      // swal.fire("Error", "...Error while updating bill !", 'error');
    }
  }
  async status(element) {
    var obj = new Object();
    obj["b_acct_id"] = this.b_acct_id;
    obj["bill_id"] = element.doc_local_no;
    this.spinner.show();
    var resp = await this.profileService.getAllApprovalStatus(obj);
    console.log(resp)
    if (resp['error'] == false) {
      this.statusArr = resp['data'];
      $('#myModal').modal('show');
      this.spinner.hide()
    } else {
      this.spinner.hide();
      swal.fire("Error", "Error while getting status");
    }
  }


  ////****************************************************************************************** */
  back() {
    this.router.navigate(['/index'])
  }
  async getAllEmployees() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.taskService.getEmployeeMasterData(obj);
    if (resp['error'] == false) {
      this.allEmplyees = resp.data;
      for (var i = 0; i < this.allEmplyees.length; i++) {
        this.salaryObj.emp_info[this.allEmplyees[i].emp_id] = this.allEmplyees[i];
      }
    } else {
      Swal.fire('Error', "Error while getting Employee Info")
    }
  }

  async getAllActiveEmployees() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.taskService.getArrayAllCurrentEstablishementInfo(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      this.allCurrentArrangements = resp['data'];
      for (var i = 0; i < this.allCurrentArrangements.length; i++) {
        this.salaryObj.employement_info[this.allCurrentArrangements[i].emp_id] = this.allCurrentArrangements[i];

      }

    } else {
      Swal.fire('Error', "Error while getting Employement Info")

    }
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllBill(ob, type) {
    this.spinner.show()
    console.log(ob);
    await this.getAllEmployees();
    await this.getAllActiveEmployees();
    this.currentBillObj = { header: {}, allEmployees: [], data: {}, sums: {} };

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['bill_id'] = ob['doc_local_no'];
    var resp = await this.taskService.getAllBill(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      var billObj = {};
      var header = "";
      var dt = resp['data'];
      if (dt.length > 0) {
        header = dt[0];
      }
      var grand = undefined;
      var month = "";
      var fin_year = "";
      for (var i = 0; i < dt.length; i++) {
        //header = dt[0];
        if (billObj[dt[i]['section_code']] == undefined) {
          month = dt[i]['month'];
          fin_year = dt[i]['fin_year'];
          billObj[dt[i]['section_code']] = {};
          billObj[dt[i]['section_code']]['data'] = {};//{'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[]};
          billObj[dt[i]['section_code']]['total'] = { 'BASIC': 0.00, 'DA': 0.00, 'DEP': 0.00, 'HRA': 0.00, 'MA': 0.00, 'VA': 0.00, 'WA': 0.00, 'miscpay': [], 'LIC1': 0.00, LIC2: 0.00, LIC3: 0.00, LIC4: 0.00, LIC5: 0.00, LIC6: 0.00, LIC7: 0.00, PF: 0.00, NPS: 0.00, GIS: 0.00, IT: 0.00, HRR: 0.00, VD: 0.00, VADV: 0.00, BLDADV1: 0.00, BLDADV2: 0.00, BLDADV3: 0.00, PFADV: 0.00, PFADV1: 0.00, PFADV2: 0.00, BADV: 0.00, EWF: 0.00, miscded: [], total: 0.00, net: 0.00 };
          if (grand == undefined) {
            grand = { 'BASIC': 0.00, 'DA': 0.00, 'DEP': 0.00, 'HRA': 0.00, 'MA': 0.00, 'VA': 0.00, 'WA': 0.00, 'miscpay': [], 'LIC1': 0.00, LIC2: 0.00, LIC3: 0.00, LIC4: 0.00, LIC5: 0.00, LIC6: 0.00, LIC7: 0.00, PF: 0.00, GIS: 0.00, NPS: 0.00, IT: 0.00, HRR: 0.00, VD: 0.00, VADV: 0.00, BLDADV1: 0.00, BLDADV2: 0.00, BLDADV3: 0.00, PFADV: 0.00, PFADV1: 0.00, PFADV2: 0.00, BADV: 0.00, EWF: 0.00, miscded: [], total: 0.00, net: 0.00 };
          }
        }
        if (billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']] == undefined) {
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']] = { emp_id: '', emp_name: '', designation_code: '', grade_pay_code: '', pay_band: '', sal_acc: '', pf: '', pf_ifsc: '', 'BASIC': 0.00, 'DA': 0.00, 'DEP': 0.00, 'HRA': 0.00, 'MA': 0.00, 'VA': 0.00, 'WA': 0.00, 'miscpay': [], 'LIC1': 0.00, LIC2: 0.00, LIC3: 0.00, LIC4: 0.00, LIC5: 0.00, LIC6: 0.00, LIC7: 0.00, PF: 0.00, NPS: 0.00, GIS: 0.00, IT: 0.00, HRR: 0.00, VD: 0.00, VADV: 0.00, BLDADV1: 0.00, BLDADV2: 0.00, BLDADV3: 0.00, PFADV: 0.00, PFADV1: 0.00, PFADV2: 0.00, BADV: 0.00, EWF: 0.00, miscded: [], total: 0.00, net: 0.00 };
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['emp_id'] = "VDA" + this.getNumberFormat(dt[i]['emp_id']);
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['emp_name'] = this.salaryObj.emp_info[dt[i].emp_id]['emp_name'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['designation_code'] = this.salaryObj.employement_info[dt[i].emp_id]['designation_code'];;
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['grade_pay_code'] = "GP " + this.salaryObj.employement_info[dt[i].emp_id]['grade_pay_code'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pay_band'] = 'PB ' + '(' + this.salaryObj.employement_info[dt[i].emp_id]['pay_scale_code'] + ')';
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['sal_acc'] = this.salaryObj.emp_info[dt[i].emp_id]['acct_no'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pf'] = this.salaryObj.emp_info[dt[i].emp_id]['pf_acct_no'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pf_ifsc'] = this.salaryObj.emp_info[dt[i].emp_id]['pf_ifsc_code'];
        }
        if (dt[i]['pay_code'] == 'PAY') {
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['total'] += dt[i]['pay_component_amt'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] += dt[i]['pay_component_amt'];
          billObj[dt[i]['section_code']]['total']['total'] += dt[i]['pay_component_amt'];
          billObj[dt[i]['section_code']]['total']['net'] += dt[i]['pay_component_amt'];
          grand['total'] += dt[i]['pay_component_amt'];
          grand['net'] += dt[i]['pay_component_amt'];

          if (billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']] != undefined) {
            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']] += dt[i]['pay_component_amt'];
            grand[dt[i]['pay_component_code']] += dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']] += dt[i]['pay_component_amt'];
          } else {
            billObj[dt[i]['section_code']]['total']['miscpay'].push({ code: dt[i]['pay_component_code'], amount: dt[i]['pay_component_amt'] });
            grand['miscpay'].push({ code: dt[i]['pay_component_code'], amount: dt[i]['pay_component_amt'] });

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['miscpay'].push({ code: dt[i]['pay_component_code'], amount: dt[i]['pay_component_amt'] });
          }

        } else {
          billObj[dt[i]['section_code']]['total']['net'] -= dt[i]['pay_component_amt'];
          grand['net'] -= dt[i]['pay_component_amt'];

          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] -= dt[i]['pay_component_amt'];
          if (billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']] != undefined) {
            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']] += dt[i]['pay_component_amt'];
            grand[dt[i]['pay_component_code']] += dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']] += dt[i]['pay_component_amt'];
          } else {
            billObj[dt[i]['section_code']]['total']['miscded'].push({ code: dt[i]['pay_component_code'], amount: dt[i]['pay_component_amt'] });
            grand['miscded'].push({ code: dt[i]['pay_component_code'], amount: dt[i]['pay_component_amt'] });

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['miscded'].push({ code: dt[i]['pay_component_code'], amount: dt[i]['pay_component_amt'] });
          }

        }
      }
      if (type == 'bill') {
        this.print(billObj, header, grand, month, fin_year);

      }
      else {
        this.print1(billObj, header, grand, month, fin_year);
      }
      this.spinner.hide()
    } else {
      this.spinner.hide();
      swal.fire("Error", "Error while printing pay bill")
    }
  }
  async statusChangeForSALBILL(element, bill_status_code) {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['update_user_id'] = this.erpUser.user_id;
    obj['bill_id'] = element.doc_local_no;
    obj['bill_status_code'] = bill_status_code;
    console.log(obj);
    this.spinner.show();
    var resp = await this.taskService.changeStatusOfBill(obj);
    console.log(resp);
    if (resp['error'] == false) {
      //await this.sendToApproval(resp['data']);
      //await this.getAllBillID();
      //await this.insertIntoAccount(1);
      this.spinner.hide();
      //swal.fire('Success','Bill Generated Successfully');


    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error in Bill Generation');
    }

  }

  async sendBillToAccount() {
    var billObj = new Object();
    billObj["b_acct_id"] = this.b_acct_id;
    billObj['data'] = [];
    var amt = 0;
    var cb_description = '';
    var cb_date = "";
    console.log(this.allBillData);
    for (var i = 0; i < this.allBillData.length; i++) {
      amt += this.allBillData[i].pay_component_amt;
      cb_date = this.allBillData[i]['bill_date'];
      cb_description = this.allBillData[i]['bill_desc'];
      var ob = new Object();
      ob['account_amount'] = this.allBillData[i].pay_component_amt
      ob['account_code'] = this.allBillData[i].pay_component_code
      ob['party_id'] = "HR" + this.allBillData[i]['emp_id'];
      ob['cb_description'] = cb_description;
      ob['cb_date'] = cb_date;
      ob['source_code'] = "HR";
      billObj['source_local_no'] = "HR" + this.allBillData[i]['bill_id'];

      ob['source_local_no'] = "HR" + this.allBillData[i]['bill_id'];

      billObj['data'].push(JSON.stringify(ob));
    }

    billObj["cb_description"] = cb_description;
    billObj['cb_amount'] = amt;
    billObj['cb_date'] = cb_date;
    billObj['cb_status'] = "PENDING"
    billObj['source_code'] = "HR"

    billObj['create_user_id'] = this.erpUser.user_id;
    console.log(billObj);
    var resp = await this.taskService.createContingentBill(billObj);
    console.log(resp);
    if (resp['error'] == false) {

    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while sending the bill to accounts');
    }
  }
  print(billObj, header, grand, month, fin_year) {
    //var txt = "VARANASASI DEVELOPMENT AUTHORITY(VDA)   Officers/THIRD/FOURTH Category EMPLOYEES STATEMENT FOR THE MONTH OF June,2020   PIRNT DATE: 2020-10-10"
    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + "   " + header['bill_desc'] + "   Date: " + header['accrual_date'];
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },

      //footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; },

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [40, 60, 40, 60],
      //pageMargins: [ 40, 20, 20, 20 ],
      content: [

      ]
    };
    var sections = Object.keys(billObj);
    var count = 0;
    for (var i = 0; i < sections.length; i++) {
      var data = billObj[sections[i]];
      console.log(data);

      var sectionText = { text: 'Section : ' + sections[i], fontSize: 8 };
      if (i != 0) {
        sectionText['pageBreak'] = 'before'
      }
      dd.content.push(sectionText);
      var tbl = {

        layout: 'lightHorizontalLines',
        fontSize: 10,
        table: {

          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],

          body: [
            ['Emp\nDetail', 'Basic\nPay', 'Dep.\nAllow', 'DA/Relief', 'Med\nAllow', 'Veh\nAllow', 'HRA', 'WA', 'Misc\nAllow', 'Total', 'LIC', 'PF\nDed', 'NPS', 'Group\nIns.', 'IT', 'House\nRent', 'Veh\nDed', 'Veh\nAdv.', 'Bld\nAdv.', 'PF\nAdv.', 'Bank\nAdv.', 'EWF', 'Misc\nDed', 'Net.\nSal.']



          ]
        }
      };
      dd.content.push(tbl);
      var emps = Object.keys(data['data']);
      count = count + emps.length;
      for (var j = 0; j < emps.length; j++) {
        var obj = data['data'][emps[j]];
        var arr = [];
        var str = obj['emp_id'] + "\n" + obj['emp_name'] + "\n" + obj['designation_code'] + "\n" + obj['grade_pay_code'] + "\n" + obj['pay_band'] + "\n" + "SAL A/C - " + obj['sal_acc'];
        if (obj['pf'] != undefined && obj['pf'] != null && obj['pf'] != 0) {
          str += "\n" + "PF A/C - " + obj['pf']
        }
        if (obj['pf_ifsc'] != undefined && obj['pf_ifsc'] != null && obj['pf_ifsc'] != 0) {
          str += "\n" + "PF Ifsc - " + obj['pf_ifsc']
        }
        arr.push(str);
        arr.push(obj['BASIC']);
        arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']);
        arr.push(obj['VA']);
        arr.push(obj['HRA']);
        arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var str1 = "";
        for (var k = 0; k < miscpay.length; k++) {
          if (k == 0) {
            str1 += miscpay[k]['code'] + " - " + miscpay[k]['amount'];
          } else {
            str1 += "\n" + miscpay[k]['code'] + " - " + miscpay[k]['amount'];
          }

        }
        if (str1 != "") {
          arr.push(str1);
        }
        else {
          arr.push(0.00);
        }
        arr.push(obj['total']);
        var licstr = obj['LIC1'] + "\n" + obj['LIC2'] + "\n" + obj['LIC3'] + "\n" + obj['LIC4'] + "\n" + obj['LIC5'] + "\n" + obj['LIC6'] + "\n" + obj['LIC7'];

        arr.push(licstr);
        arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']);
        var bldstr = obj['BLDADV1'] + "\n" + obj['BLDADV2'] + "\n" + obj['BLDADV3']
        arr.push(bldstr);
        var pfstr = obj['PFADV'] + "\n" + obj['PFADV1'] + "\n" + obj['PFADV2']
        arr.push(pfstr);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var str2 = "";
        for (var k = 0; k < miscded.length; k++) {
          if (k == 0) {
            str2 += miscded[k]['code'] + " - " + miscded[k]['amount'];
          } else {
            str2 += "\n" + miscded[k]['code'] + " - " + miscded[k]['amount'];
          }

        }
        if (str2 != "") {
          arr.push({ text: str2, fontSize: 8 });
        }
        else {
          arr.push(0.00);
        }
        //console.log(arr)

        arr.push(obj['net']);

        dd.content[dd.content.length - 1].table.body.push(arr);
      }
      var obj = data['total'];
      var arr = [];
      var str = "Section : " + sections[i] + "\n";
      str += "Total Employees : " + emps.length;

      arr.push(str);
      arr.push(obj['BASIC']);
      arr.push(obj['DEP']);
      arr.push(obj['DA']);
      arr.push(obj['MA']);
      arr.push(obj['VA']);
      arr.push(obj['HRA']);
      arr.push(obj['WA']);
      var miscpay = obj['miscpay'];
      var miscpayObj = {};
      for (var k = 0; k < miscpay.length; k++) {
        if (miscpayObj[miscpay[k]['code']] == undefined) {
          miscpayObj[miscpay[k]['code']] = 0;
        }
        miscpayObj[miscpay[k]['code']] += miscpay[k]['amount'];
      }
      var str2 = "";
      var keys = Object.keys(miscpayObj);
      for (var k = 0; k < keys.length; k++) {
        if (k == 0) {
          str2 += keys[k] + " - " + miscpayObj[keys[k]];
        } else {
          str2 += "\n" + keys[k] + " - " + miscpayObj[keys[k]];;
        }

      }
      if (str2 != "") {
        arr.push({ text: str2, fontSize: 8 });
      }
      else {
        arr.push(0.00);
      }
      arr.push(obj['total']);
      var licstr = obj['LIC1'] + "\n" + obj['LIC2'] + "\n" + obj['LIC3'] + "\n" + obj['LIC4'] + "\n" + obj['LIC5'] + "\n" + obj['LIC6'] + "\n" + obj['LIC7'];

      arr.push(licstr);
      arr.push(obj['PF']);
      arr.push(obj['NPS']);
      arr.push(obj['GIS']);
      arr.push(obj['IT']);
      arr.push(obj['HRR']);
      arr.push(obj['VD']);
      arr.push(obj['VADV']);
      var bldstr = obj['BLDADV1'] + "\n" + obj['BLDADV2'] + "\n" + obj['BLDADV3']
      arr.push(bldstr);
      var pfstr = obj['PFADV'] + "\n" + obj['PFADV1'] + "\n" + obj['PFADV2']
      arr.push(pfstr);
      arr.push(obj['BADV']);
      arr.push(obj['EWF']);
      var miscded = obj['miscded'];
      var miscdedObj = {};
      for (var k = 0; k < miscded.length; k++) {
        if (miscdedObj[miscded[k]['code']] == undefined) {
          miscdedObj[miscded[k]['code']] = 0;
        }
        miscdedObj[miscded[k]['code']] += miscded[k]['amount'];
      }
      var str2 = "";
      var keys = Object.keys(miscdedObj);
      for (var k = 0; k < keys.length; k++) {
        if (k == 0) {
          str2 += keys[k] + " - " + miscdedObj[keys[k]];
        } else {
          str2 += "\n" + keys[k] + " - " + miscdedObj[keys[k]];;
        }

      }
      if (str2 != "") {
        arr.push({ text: str2, fontSize: 8 });
      }
      else {
        arr.push(0.00);
      }
      //console.log(arr)

      arr.push(obj['net']);

      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    var totalText = { text: 'Grand Total' + "\nTotal Employees : " + count, fontSize: 10, bold: true };

    var obj = grand;
    var arr = []
    arr.push(totalText);
    arr.push(obj['BASIC']);
    arr.push(obj['DEP']);
    arr.push(obj['DA']);
    arr.push(obj['MA']);
    arr.push(obj['VA']);
    arr.push(obj['HRA']);
    arr.push(obj['WA']);
    var miscpay = obj['miscpay'];
    var miscpayObj = {};
    for (var k = 0; k < miscpay.length; k++) {
      if (miscpayObj[miscpay[k]['code']] == undefined) {
        miscpayObj[miscpay[k]['code']] = 0;
      }
      miscpayObj[miscpay[k]['code']] += miscpay[k]['amount'];
    }
    var str2 = "";
    var keys = Object.keys(miscpayObj);
    for (var k = 0; k < keys.length; k++) {
      if (k == 0) {
        str2 += keys[k] + " - " + miscpayObj[keys[k]];
      } else {
        str2 += "\n" + keys[k] + " - " + miscpayObj[keys[k]];;
      }

    }
    if (str2 != "") {
      arr.push({ text: str2, fontSize: 8 });
    }
    else {
      arr.push(0.00);
    }
    arr.push({ text: obj['total'], bold: true });
    var amt = obj['LIC1'] + obj['LIC2'] + obj['LIC3'] + obj['LIC4'] + obj['LIC5'] + obj['LIC6'] + obj['LIC7']
    //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
    //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
    arr.push(amt);
    arr.push(obj['PF']);
    arr.push(obj['NPS']);
    arr.push(obj['GIS']);
    arr.push(obj['IT']);
    arr.push(obj['HRR']);
    arr.push(obj['VD']);
    arr.push(obj['VADV']);
    amt = obj['BLDADV1'] + obj['BLDADV2'] + obj['BLDADV3'];
    //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
    arr.push(amt);
    amt = obj['PFADV'] + obj['PFADV1'] + obj['PFADV2'];
    //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
    arr.push(amt);
    arr.push(obj['BADV']);
    arr.push(obj['EWF']);
    var miscded = obj['miscded'];
    var miscdedObj = {};
    for (var k = 0; k < miscded.length; k++) {
      if (miscdedObj[miscded[k]['code']] == undefined) {
        miscdedObj[miscded[k]['code']] = 0;
      }
      miscdedObj[miscded[k]['code']] += miscded[k]['amount'];
    }
    var str2 = "";
    var keys = Object.keys(miscdedObj);
    for (var k = 0; k < keys.length; k++) {
      if (k == 0) {
        str2 += keys[k] + " - " + miscdedObj[keys[k]];
      } else {
        str2 += "\n" + keys[k] + " - " + miscdedObj[keys[k]];;
      }

    }
    if (str2 != "") {
      arr.push({ text: str2, fontSize: 8 });
    }
    else {
      arr.push(0.00);
    }
    //console.log(arr)

    arr.push({ text: obj['net'], bold: true });

    dd.content[dd.content.length - 1].table.body.push(arr);
    dd.content.push("\n\n");
    var sign = {
      columns: [
        {
          // auto-sized columns have their widths based on their content
          width: 'auto',
          text: 'PREPARED BY:',
          bold: true,
          fontSize: 10
        },
        {
          // auto-sized columns have their widths based on their content
          width: 'auto',
          text: 'CHECKED BY:',
          bold: true,
          fontSize: 10
        },
        {
          // auto-sized columns have their widths based on their content
          width: 'auto',
          text: 'SIGNED BY:',
          bold: true,
          fontSize: 10
        },


      ]
    }
    dd.content.push("\n\n\n");
    dd.content.push("PREPARED BY:                               CHECKED BY:                           SIGNED BY:                         ");
    dd.content.push("\n\n");
    dd.content.push("CERTIFIED:")
    dd.content.push("\n\n");
    dd.content.push({ text: "1. That I have satisfied myself that all the salaries included in the bills drawn in the month of " + this.monthObj[month] + "/" + fin_year + " [the last preceding month] with the exception of those detailed below of which total has been refunded by deduction from the bill has been distributed to the proper persons and their receipts have been taken in acquittance rolls field in my office with reciept-stamp dully cancelled for every payment in access of Rs. 20 and that all leaves and promotions etc have been in the service book of the official concerned." })
    dd.content.push("\n");
    dd.content.push({ text: "2. That all persons for whom pay has been drawn in this bill have actually been entertained during the month." })
    dd.content.push("\n");

    dd.content.push({ text: "3. That all the persons for whom house-rent allowance has been shown in this bill actually occupied a rented house for which they paid rent as shown in this bill and are entitled to the allowance under the standing instructions." })
    dd.content.push("\n");

    dd.content.push({ text: "4. That all the persons in respect of whom conveyance allowance has been drawn in the bill have satisfied me that they have actually maintained the conveyance in a workable condition and have been using them." })
    dd.content.push("\n");

    dd.content.push({ text: "5. That the bill has been checked with the sanctioned in the scale register." })
    dd.content.push("\n");

    dd.content.push({ text: "Date :                                                    Signature Of Drawing Officer:" })
    dd.content.push("\n");

    dd.content.push({ text: "Pay Rs. ....................................." })




    pdfMake.createPdf(dd).download();
  }

  print1(billObj, header, grand, month, fin_year) {
    if (month == 1 || month == 2 || month == 3) {
      fin_year = fin_year + 1;
    }
    console.log(month);
    console.log(fin_year);
    //var txt = "VARANASASI DEVELOPMENT AUTHORITY(VDA)   Officers/THIRD/FOURTH Category EMPLOYEES STATEMENT FOR THE MONTH OF June,2020   PIRNT DATE: 2020-10-10"
    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + "   " + header['bill_desc'] + "   Date: " + header['accrual_date'];
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },

      //footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; },

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [40, 60, 40, 60],
      //pageMargins: [ 40, 20, 20, 20 ],
      content: [

      ]
    };
    var sections = Object.keys(billObj);
    var count = 0;
    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],

        body: [
          ['Section\nDetail', 'Basic\nPay', 'Dep.\nAllow', 'DA/Relief', 'Med\nAllow', 'Veh\nAllow', 'HRA', 'WA', 'Misc\nAllow', 'Total', 'LIC', 'PF\nDed', 'NPS', 'Group\nIns.', 'IT', 'House\n Rent', 'Veh\nDed', 'Veh\nAdv.', 'Bld\nAdv.', 'PF\nAdv.', 'Bank\nAdv.', 'EWF', 'Misc\nDed', 'Net.\nSal.']

          //[ 'Section Detail', 'Basic\nPay', 'Dep. \nAllow', 'DA/Relief','Medical \nAllow','Vehicle\nAllow','HRA','Wash\nAllow','Misc\nAllow','Total','LIC\n(1,2,3,4,5,6,7)','PF\nDed','Group\nIns.','IT','House\n Rent','Vehicle\n Ded','Vehicle\n Adv.','Bld Adv.\n(1,2,3)','PF Adv.\n(1,2,3)','Bank\n Adv.','EWF','Misc\nDed','Net. Sal.' ]



        ]
      }
    };
    dd.content.push(tbl);
    for (var i = 0; i < sections.length; i++) {
      var data = billObj[sections[i]];
      console.log(data);
      var emps = Object.keys(data['data']);
      count += emps.length;
      var obj = data['total'];
      var arr = [];
      var sectionText = { text: 'Section : ' + sections[i] + "\nTotal Employees : " + emps.length, fontSize: 10, bold: true };



      arr.push(sectionText);
      arr.push(obj['BASIC']);
      arr.push(obj['DEP']);
      arr.push(obj['DA']);
      arr.push(obj['MA']);
      arr.push(obj['VA']);
      arr.push(obj['HRA']);
      arr.push(obj['WA']);
      var miscpay = obj['miscpay'];
      var miscpayObj = {};
      for (var k = 0; k < miscpay.length; k++) {
        if (miscpayObj[miscpay[k]['code']] == undefined) {
          miscpayObj[miscpay[k]['code']] = 0;
        }
        miscpayObj[miscpay[k]['code']] += miscpay[k]['amount'];
      }
      var str2 = "";
      var keys = Object.keys(miscpayObj);
      for (var k = 0; k < keys.length; k++) {
        if (k == 0) {
          str2 += keys[k] + " - " + miscpayObj[keys[k]];
        } else {
          str2 += "\n" + keys[k] + " - " + miscpayObj[keys[k]];;
        }

      }
      if (str2 != "") {
        arr.push({ text: str2, fontSize: 8 });
      }
      else {
        arr.push(0.00);
      }
      arr.push({ text: obj['total'], bold: true });
      var amt = obj['LIC1'] + obj['LIC2'] + obj['LIC3'] + obj['LIC4'] + obj['LIC5'] + obj['LIC6'] + obj['LIC7']
      //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
      //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
      arr.push(amt);
      arr.push(obj['PF']);
      arr.push(obj['NPS']);
      arr.push(obj['GIS']);
      arr.push(obj['IT']);
      arr.push(obj['HRR']);
      arr.push(obj['VD']);
      arr.push(obj['VADV']);
      amt = obj['BLDADV1'] + obj['BLDADV2'] + obj['BLDADV3'];
      //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
      arr.push(amt);
      amt = obj['PFADV'] + obj['PFADV1'] + obj['PFADV2'];
      //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
      arr.push(amt);
      arr.push(obj['BADV']);
      arr.push(obj['EWF']);
      var miscded = obj['miscded'];
      var miscdedObj = {};
      for (var k = 0; k < miscded.length; k++) {
        if (miscdedObj[miscded[k]['code']] == undefined) {
          miscdedObj[miscded[k]['code']] = 0;
        }
        miscdedObj[miscded[k]['code']] += miscded[k]['amount'];
      }
      var str2 = "";
      var keys = Object.keys(miscdedObj);
      for (var k = 0; k < keys.length; k++) {
        if (k == 0) {
          str2 += keys[k] + " - " + miscdedObj[keys[k]];
        } else {
          str2 += "\n" + keys[k] + " - " + miscdedObj[keys[k]];;
        }

      }
      if (str2 != "") {
        arr.push({ text: str2, fontSize: 8 });
      }
      else {
        arr.push(0.00);
      }
      //console.log(arr)

      arr.push({ text: obj['net'], bold: true });

      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    var sectionText = { text: 'Grand Total' + "\nTotal Employees : " + count, fontSize: 10, bold: true };

    var obj = grand;
    var arr = []
    arr.push(sectionText);
    arr.push(obj['BASIC']);
    arr.push(obj['DEP']);
    arr.push(obj['DA']);
    arr.push(obj['MA']);
    arr.push(obj['VA']);
    arr.push(obj['HRA']);
    arr.push(obj['WA']);
    var miscpay = obj['miscpay'];
    var miscpayObj = {};
    for (var k = 0; k < miscpay.length; k++) {
      if (miscpayObj[miscpay[k]['code']] == undefined) {
        miscpayObj[miscpay[k]['code']] = 0;
      }
      miscpayObj[miscpay[k]['code']] += miscpay[k]['amount'];
    }
    var str2 = "";
    var keys = Object.keys(miscpayObj);
    for (var k = 0; k < keys.length; k++) {
      if (k == 0) {
        str2 += keys[k] + " - " + miscpayObj[keys[k]];
      } else {
        str2 += "\n" + keys[k] + " - " + miscpayObj[keys[k]];;
      }

    }
    if (str2 != "") {
      arr.push({ text: str2, fontSize: 8 });
    }
    else {
      arr.push(0.00);
    }
    arr.push({ text: obj['total'], bold: true });
    var amt = obj['LIC1'] + obj['LIC2'] + obj['LIC3'] + obj['LIC4'] + obj['LIC5'] + obj['LIC6'] + obj['LIC7']
    //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
    //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
    arr.push(amt);
    arr.push(obj['PF']);
    arr.push(obj['NPS']);
    arr.push(obj['GIS']);
    arr.push(obj['IT']);
    arr.push(obj['HRR']);
    arr.push(obj['VD']);
    arr.push(obj['VADV']);
    amt = obj['BLDADV1'] + obj['BLDADV2'] + obj['BLDADV3'];
    //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
    arr.push(amt);
    amt = obj['PFADV'] + obj['PFADV1'] + obj['PFADV2'];
    //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
    arr.push(amt);
    arr.push(obj['BADV']);
    arr.push(obj['EWF']);
    var miscded = obj['miscded'];
    var miscdedObj = {};
    for (var k = 0; k < miscded.length; k++) {
      if (miscdedObj[miscded[k]['code']] == undefined) {
        miscdedObj[miscded[k]['code']] = 0;
      }
      miscdedObj[miscded[k]['code']] += miscded[k]['amount'];
    }
    var str2 = "";
    var keys = Object.keys(miscdedObj);
    for (var k = 0; k < keys.length; k++) {
      if (k == 0) {
        str2 += keys[k] + " - " + miscdedObj[keys[k]];
      } else {
        str2 += "\n" + keys[k] + " - " + miscdedObj[keys[k]];;
      }

    }
    if (str2 != "") {
      arr.push({ text: str2, fontSize: 8 });
    }
    else {
      arr.push(0.00);
    }
    //console.log(arr)

    arr.push({ text: obj['net'], bold: true });

    dd.content[dd.content.length - 1].table.body.push(arr);
    dd.content.push("\n\n");
    var sign = {
      columns: [
        {
          // auto-sized columns have their widths based on their content
          width: 'auto',
          text: 'PREPARED BY:',
          bold: true,
          fontSize: 10
        },
        {
          // auto-sized columns have their widths based on their content
          width: 'auto',
          text: 'CHECKED BY:',
          bold: true,
          fontSize: 10
        },
        {
          // auto-sized columns have their widths based on their content
          width: 'auto',
          text: 'SIGNED BY:',
          bold: true,
          fontSize: 10
        },


      ]
    }
    dd.content.push("\n\n\n");
    dd.content.push("PREPARED BY:                               CHECKED BY:                           SIGNED BY:                         ");
    dd.content.push("\n\n");
    dd.content.push("CERTIFIED:")
    dd.content.push("\n\n");
    dd.content.push({ text: "1. That I have satisfied myself that all the salaries included in the bills drawn in the month of " + this.monthObj[month] + "/" + fin_year + " [the last preceding month] with the exception of those detailed below of which total has been refunded by deduction from the bill has been distributed to the proper persons and their receipts have been taken in acquittance rolls field in my office with reciept-stamp dully cancelled for every payment in access of Rs. 20 and that all leaves and promotions etc have been in the service book of the official concerned." })
    dd.content.push("\n");
    dd.content.push({ text: "2. That all persons for whom pay has been drawn in this bill have actually been entertained during the month." })
    dd.content.push("\n");

    dd.content.push({ text: "3. That all the persons for whom house-rent allowance has been shown in this bill actually occupied a rented house for which they paid rent as shown in this bill and are entitled to the allowance under the standing instructions." })
    dd.content.push("\n");

    dd.content.push({ text: "4. That all the persons in respect of whom conveyance allowance has been drawn in the bill have satisfied me that they have actually maintained the conveyance in a workable condition and have been using them." })
    dd.content.push("\n");

    dd.content.push({ text: "5. That the bill has been checked with the sanctioned in the scale register." })
    dd.content.push("\n");

    dd.content.push({ text: "Date :                                                    Signature Of Drawing Officer:" })
    dd.content.push("\n");

    dd.content.push({ text: "Pay Rs. ....................................." })


    pdfMake.createPdf(dd).download();
  }

}
