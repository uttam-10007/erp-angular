import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { AllEmpService } from '../../service/all-emp.service';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service'
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';

declare var $: any

@Component({
  selector: 'app-leaves-apply',
  templateUrl: './leaves-apply.component.html',
  styleUrls: ['./leaves-apply.component.css']
})
export class LeavesApplyComponent implements OnInit {


  constructor(private settingService: SettingService, public mainService: MainService, 
    private sanitizer: DomSanitizer, private router: Router, private spinner: NgxSpinnerService, 
    private snackBar: MatSnackBar, private payableService: EstablishmentService, private allEmpService: AllEmpService) { }
  leave = false;
  erpUser;
  b_acct_id;
  allEmployees = [];
  selectObj = {};
  applyLeaveObj = {};
  allLeaves = []
  create_user_id;
  remainingLeaves = 0;
  newallEmplyees = []
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_name','emp_id','leave_code', 'num_of_leaves', 'leave_status_code', 'from_date', 'leave_reason', 'action'];
  datasource;

  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;
  allLeaveRuleInfo = [];
  leave_reason
  leaveStatus = [{ code: 'APPLIED', value: 'APPLIED' }, { code: 'APPROVED', value: 'APPROVED' }, { code: 'REJECTED', value: 'REJECTED' }]

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAllEmployees();
    await this.getAllLeaveRuleDetails();
    await this.allEmployeeLeaveLadger();
  }


  view_reason(element){
    this.leave_reason=element.leave_reason;
  }
  submitFilter() {
this.spinner.show()
    var data = [];
    for (let i = 0; i < this.allLeaves.length; i++) {
      if (this.selectObj['year'] == this.allLeaves[i]['year'] && this.selectObj['leave_status_code'] == this.allLeaves[i]['leave_status_code']) {
        data.push(this.allLeaves[i]);
      }
    }
    for(let i=0;i<data.length;i++){
      for(let j=0;j<this.allEmployees.length;j++){
        if(data[i]['emp_id']==this.allEmployees[j]['emp_id']){
          data[i]['emp_name']=this.allEmployees[j]['emp_name']
          // data[i]['empId']=this.mainService.accInfo['account_short_name'] + ''+this.allEmployees['emp_id']
        }
      }
    }
    this.datasource = new MatTableDataSource(data);
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;
    this.spinner.hide()
  }
  onFileUpload(event, files) {
    this.selectedFile = <File>event.target.files[0];

    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
    };

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

  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmployees = resp.data;

      this.newallEmplyees = []
      for (let i = 0; i < this.allEmployees.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, this.allEmployees[i]);
        obj['emp_name'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id']) + "-" + obj['emp_name']
        this.newallEmplyees.push(obj)
      }
    } else {
      this.spinner.hide()
      swal.fire('Error', 'Error while getting employee list','error');
    }
  }
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
  async getRemainingLeaves() {
    this.remainingLeaves = 0;
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.applyLeaveObj['emp_id'];
    var arr = this.applyLeaveObj['from_date'].split('-');
    obj['year'] = arr[0];
    obj['month'] = arr[1];
    var resp = await this.payableService.getLeaveInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      var dt = resp.data;
      for (var i = 0; i < dt.length; i++) {
        if (dt[i]['emp_id'] == this.applyLeaveObj['emp_id'] && dt[i]['leave_code'] == this.applyLeaveObj['leave_code']) {
          this.remainingLeaves = dt[i]['leaves_remaining'];
        }
      }
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting remaining Leaves','error');
    }
  }
  async applyLeave() {
    this.applyLeaveObj['b_acct_id'] = this.b_acct_id;
    this.applyLeaveObj['leave_status_code'] = "APPLIED";
    this.applyLeaveObj['application_date'] = this.applyLeaveObj['from_date'];
    this.applyLeaveObj['leave_status_code'] = "APPLIED";
    var arr = this.applyLeaveObj['from_date'].split('-');
    this.applyLeaveObj['year'] = arr[0];
    this.applyLeaveObj['month'] = arr[1];
    this.applyLeaveObj['create_user_id'] = this.erpUser.user_id;

    this.spinner.show();
    await this.getRemainingLeaves();
    await this.leavevalidation();

    if (this.remainingLeaves >= this.applyLeaveObj['num_of_leaves'] && this.leave == false) {
      if (this.uploader.queue.length > 0) {
        const formData = new FormData();
        formData.append('image', this.selectedFile, this.selectedFile.name);
        this.applyLeaveObj['document_name'] = this.uploader.queue[0].some.name;
        this.applyLeaveObj['document_type_code'] = 'LEAVE';
        const params = JSON.stringify(this.applyLeaveObj);
        this.uploader.queue[0].url = this.httpUrl + '/hr/leaveLedger/applyForLeave' + params;
        this.uploader.queue[0].upload();

        this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
          if (!response.error) {
            this.uploader.queue = [];
            await this.allEmployeeLeaveLadger();
            this.spinner.hide();
            swal.fire('Success', 'Leave Applied Successfully','success')
          } else {
            this.spinner.hide()
            swal.fire('Error', 'Error while Applying Leave','error');
          }
        };
      } else {
        var resp = await this.payableService.applyForLeave(JSON.stringify(this.applyLeaveObj));
        if (resp['error'] == false) {
          await this.allEmployeeLeaveLadger();
          this.spinner.hide()
          swal.fire('Success', 'Leave Applied Successfully','success')
        } else {
          this.spinner.hide()
          swal.fire('Error', 'Error while Applying Leave','error');

        }


      }


    } else if (this.leave == true) {
      this.spinner.hide();
      this.leave = false;
      swal.fire('Sorry', 'You Already Applied or Check Your Leaves ','warning')
    }
    else {
      this.spinner.hide();
      swal.fire('Sorry', 'You have only ' + this.remainingLeaves + ' leaves left','warning')
    }


  }


  async approve(element) {

    var obj1 = Object.assign({}, element);

    obj1['b_acct_id'] = this.b_acct_id;
    obj1['approval_user_id'] = this.erpUser.user_id;
    obj1['leave_status_code'] = "APPROVED";
    this.spinner.show();
    this.applyLeaveObj = Object.assign({}, element);
    await this.getRemainingLeaves();
    if (this.remainingLeaves >= this.applyLeaveObj['num_of_leaves']) {
      var resp = await this.payableService.approveLeave(obj1);
      if (resp['error'] == false) {
        await this.allEmployeeLeaveLadger();
        await this.submitFilter();
        this.spinner.hide();
        swal.fire('Success', 'Leave Approved','success')

      }
      else {
        this.spinner.hide();
        swal.fire('Error', 'Error while changing the status of leave','error');

      }
    } else {
      this.spinner.show();
      swal.fire('Info', 'Can not be approved as the employee has only ' + this.remainingLeaves + ' left','info');
    }

  }
  async reject(element) {

    var obj1 = Object.assign({}, element);

    obj1['b_acct_id'] = this.b_acct_id;
    obj1['approval_user_id'] = this.erpUser.user_id;
    obj1['leave_status_code'] = "REJECTED";
    this.spinner.show()
    var resp = await this.payableService.rejectLeave(obj1);
    if (resp['error'] == false) {
      await this.allEmployeeLeaveLadger();
      await this.submitFilter();


      this.spinner.hide();
      swal.fire('Success', 'Leave Rejected','success')
    }
    else {
      this.spinner.hide();
      swal.fire('Error', 'Error while changing the status of leave','error');
    }
  }
  async leavevalidation() {

    await this.allEmployeeLeaveLadger();
    // this.selectEmpObj['emp_id'] = this.applyLeaveObj['emp_id'];
    var formdate = this.applyLeaveObj['from_date'].split('-');
    for (let i = 0; i < this.allLeaves.length; i++) {

      if (this.allLeaves.length != 0) {

        var form_dt = this.allLeaves[i]['from_date']
        var sArr = form_dt.split('-');
        if (sArr[0] == formdate[0] && (sArr[1] >= formdate[1] || (parseInt(formdate[1]) - 1) == sArr[1]) && (this.allLeaves[i]['leave_status_code'] == 'APPROVED' || this.allLeaves[i]['leave_status_code'] == 'APPLIED')) {

          var day = 0
          for (let j = 0; j < this.allLeaves[i]['num_of_leaves']; j++) {
            var days = parseInt(sArr[2]) + day
            if ((parseInt(sArr[1]) % 2) == 0 && (parseInt(sArr[1])) != 2) {
              if (days > 30) {
                sArr[1] = parseInt(sArr[1]) + 1
                sArr[2] = 1
                days = 1
                day = 0
              }
            }
            else if ((parseInt(sArr[1])) == 2) {
              if ((parseInt(sArr[0]) % 4) == 0) {
                if (days > 29) {
                  sArr[1] = parseInt(sArr[1]) + 1
                  sArr[2] = 1
                  days = 1
                  day = 0
                }
              }
              else {
                if (days > 28) {
                  sArr[1] = parseInt(sArr[1]) + 1
                  sArr[2] = 1
                  day = 0
                }
              }
            } else {
              if (days > 31) {
                sArr[1] = parseInt(sArr[1]) + 1
                sArr[2] = 1
                days = 1
                day = 0
              }
            }
            var date
            if (days < 10) {
              date = "0" + days
            }
            else {
              date = days
            }
            var form_date = sArr[0] + "-" + sArr[1] + "-" + date
            var d = 0
            for (let k = 0; k < this.applyLeaveObj['num_of_leaves']; k++) {
              var fdays = parseInt(formdate[2]) + d
              var fdate
              if ((parseInt(formdate[1]) % 2) == 0 && (parseInt(formdate[1])) != 2) {
                if (fdays > 30) {
                  formdate[1] = parseInt(formdate[1]) + 1
                  formdate[2] = 1
                  fdays = 1
                  d = 0
                }
              }
              else if ((parseInt(formdate[1])) == 2) {
                if ((parseInt(formdate[0]) % 4) == 0) {
                  if (fdays > 29) {
                    formdate[1] = parseInt(formdate[1]) + 1
                    formdate[2] = 1
                    fdays = 1
                    d = 0
                  }
                }
                else {
                  if (fdays > 28) {
                    formdate[1] = parseInt(formdate[1]) + 1
                    formdate[2] = 1
                    fdays = 1
                    d = 0
                  }
                }
              } else {
                if (fdays > 31) {
                  formdate[1] = parseInt(formdate[1]) + 1
                  formdate[2] = 1
                  fdays = 1
                  d = 0
                }
              }
              if (fdays < 10) {
                fdate = "0" + fdays
              }
              else {
                fdate = fdays
              }
              var fordate = formdate[0] + "-" + formdate[1] + "-" + fdate

              if (form_date == fordate && (this.allLeaves[i]['leave_status_code'] == 'APPROVED' || this.allLeaves[i]['leave_status_code'] == 'APPLIED')) {
                this.leave = true;


              }
              d = d + 1
            }
            day = day + 1
          }
        }



      }


    }

  }
  refresh() {
    this.applyLeaveObj = {};
  }
  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  async delete(element) {
    var obj1 = Object.assign({}, element);
    obj1['b_acct_id'] = this.b_acct_id;
    this.spinner.show();

    var resp = await this.payableService.deleteLeaveRecord(JSON.stringify(obj1));
    if (resp['error'] == false) {
      await this.allEmployeeLeaveLadger();
      await this.submitFilter();

      this.spinner.hide();
      swal.fire('Success', 'Leave Delete','success')
    }
    else {
      this.spinner.hide();
      swal.fire('Error', 'Error while delete leave','error');
    }
  }

  filename
  async view(element) {
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['upload_id'] = element.document_id
    obj['filename'] = element.document_name;
    this.filename = element.document_name;
    this.spinner.show()
    const res = await this.allEmpService.getUploadedFileData(obj);
    if (res) {

      var docname = element.document_name;
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

}
