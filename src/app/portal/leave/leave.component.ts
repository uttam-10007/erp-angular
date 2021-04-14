import swal from 'sweetalert2';
import { Component, OnInit, AfterViewInit, ViewChild,ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../_services/script-loader.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MainService } from '../service/main.service';
import {ApplyLeaveService} from '../service/apply-leave.service';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import {Router} from '@angular/router';


@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {

  constructor(public mainService:MainService,private router:Router,private applyLeaveService:ApplyLeaveService,private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }

  obj={emp_id:'',emp_name:'',office:'',section:'',designation:'',application_date:'',leave_type:'',from_date:'',to_date:'',num_of_days:'',reason:''};
  empDetails={};
  todaysDate ;
  leaveTypes=[];


  /////////////////////////////////////////
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
  displayedColumns = ['leave_code', 'num_of_leaves', 'leave_status_code', 'from_date', 'leave_reason', 'action'];
  datasource;
  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;
  allLeaveRuleInfo = [];
  leave_reason;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAllLeaveRuleDetails();
    await this.allEmployeeLeaveLadger();
    //console.log(this.getDatesBetweenDates(today, threedaysFromNow))
  }
 /*   getDatesBetweenDates(startDate, endDate){
    let dates = []
    //to avoid modifying the original date
    const theDate = new Date(startDate)
    while (theDate < endDate) {
      
      dates.push(Final_Result)
      theDate.setDate(theDate.getDate() + 1)
    }
    return dates
  } */
  view_reason(element){
    this.leave_reason=element.leave_reason;
  }
  back(){
    this.router.navigate(['/index'])
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

  async getRemainingLeaves() {
    this.remainingLeaves = 0;
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.mainService.emp_id;
    var arr = this.applyLeaveObj['from_date'].split('-');
    obj['year'] = arr[0];
    obj['month'] = arr[1];
    console.log(obj);
    var resp = await this.applyLeaveService.getLeaveInfo(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      var dt = resp.data;
      console.log(this.remainingLeaves);

      for (var i = 0; i < dt.length; i++) {
        if (dt[i]['emp_id'] == this.applyLeaveObj['emp_id'] && dt[i]['leave_code'] == this.applyLeaveObj['leave_code']) {
          this.remainingLeaves = dt[i]['leaves_remaining'];
        }
      }
      console.log(this.remainingLeaves);
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting remaining Leaves');
    }
  }

  async applyLeave() {
    this.spinner.show();

    this.applyLeaveObj['b_acct_id'] = this.b_acct_id;
    this.applyLeaveObj['emp_id']=this.mainService.emp_id;
    this.applyLeaveObj['leave_status_code'] = "APPLIED";
    this.applyLeaveObj['application_date'] = this.applyLeaveObj['from_date'];
    this.applyLeaveObj['leave_status_code'] = "APPLIED";
    var arr = this.applyLeaveObj['from_date'].split('-');
    this.applyLeaveObj['year'] = arr[0];
    this.applyLeaveObj['month'] = arr[1];
    this.applyLeaveObj['create_user_id'] = this.erpUser.user_id;
    var one_day = 1000 * 60 * 60 * 24 
    var Result = Math.round(new Date(this.applyLeaveObj['to_date']).getTime() - new Date(this.applyLeaveObj['from_date']).getTime()) / (one_day); 
  
// To remove the decimals from the (Result) resulting days value 
var Final_Result = Result.toFixed(0); 
this.applyLeaveObj['num_of_leaves'] =Number(Final_Result) + 1
console.log(this.applyLeaveObj)
    await this.getRemainingLeaves();
    await this.leavevalidation();

    if (this.remainingLeaves >= this.applyLeaveObj['num_of_leaves'] && this.leave == false) {
      if (this.uploader.queue.length > 0) {
        const formData = new FormData();
        formData.append('image', this.selectedFile, this.selectedFile.name);
        this.applyLeaveObj['document_name'] = this.uploader.queue[0].some.name;
        this.applyLeaveObj['document_type_code'] = 'LEAVE';
        console.log(this.applyLeaveObj);
        const params = JSON.stringify(this.applyLeaveObj);
        this.uploader.queue[0].url = this.httpUrl + '/hr/leaveLedger/applyForLeave' + params;
        this.uploader.queue[0].upload();

        this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
          console.log(response);
          if (!response.error) {
            this.uploader.queue = [];
            await this.allEmployeeLeaveLadger();
            this.spinner.hide();
            swal.fire('Success', 'Leave Applied Successfully');
            console.log('Success', 'Leave Applied Successfully');
            
          } else {
            this.spinner.hide()
            swal.fire('Error', 'Error while Applying Leave');
          }
        };
      } else {
        var resp = await this.applyLeaveService.applyForLeave(JSON.stringify(this.applyLeaveObj));
        if (resp['error'] == false) {
          await this.allEmployeeLeaveLadger();
          this.spinner.hide()
          swal.fire('Success', 'Leave Applied Successfully')
          console.log('Success', 'Leave Applied Successfully');
          
        } else {
          this.spinner.hide()
         swal.fire('Error', 'Error while Applying Leave');
         console.log('Error', 'Error while Applying Leave');
         

        }


      }


    } else if (this.leave == true) {
      this.spinner.hide();
      this.leave = false;
      swal.fire('Sorry', 'You Already Applied or Check Your Leaves ')
      console.log('Sorry', 'You Already Applied or Check Your Leaves ');
      
    }
    else {
      this.spinner.hide();
     swal.fire('Sorry', 'You have only ' + this.remainingLeaves + ' leaves left')
     console.log('Sorry', 'You have only ' + this.remainingLeaves + ' leaves left');
     
    } 


  }
  async leavevalidation() {

    await this.allEmployeeLeaveLadger();
    var formdate = this.applyLeaveObj['from_date'].split('-');
    for (let i = 0; i < this.allLeaves.length; i++) {

      if (this.allLeaves.length != 0) {

        var form_dt = this.allLeaves[i]['from_date']
        var sArr = form_dt.split('-');
        if (sArr[0] == formdate[0] && (sArr[1] >= formdate[1] || (parseInt(formdate[1]) - 1) == sArr[1]) && (this.allLeaves[i]['leave_status_code'] == 'APPROVED' || this.allLeaves[i]['leave_status_code'] == 'APPLIED')) {

          console.log(this.allLeaves[i]['from_date'])
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
            console.log(form_date)
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
  async allEmployeeLeaveLadger() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id']=this.mainService.emp_id;
    console.log(obj)
    var resp = await this.applyLeaveService.getAllLeaveLedger(obj);
    console.log(resp)
    if (resp['error'] == false) {
      this.allLeaves = resp.data;
      this.datasource = new MatTableDataSource(this.allLeaves);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
    } else {
     swal.fire("Error", "Error while getting Leaves");
    }
  }


  async getAllLeaveRuleDetails() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.applyLeaveService.getAllRules(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      this.allLeaveRuleInfo = resp.data;
      for (let i = 0; i < this.allLeaveRuleInfo.length; i++) {
        this.allLeaveRuleInfo[i]['leave_value'] = this.mainService.codeValueShowObj['HR0026'][this.allLeaveRuleInfo[i]['leave_code']];
      }
    } else {
      this.snackBar.open("Error while getting  all Leave Rule list", 'Error', {
        duration: 5000
      });
    }
  }


/*   getTodaysDate(){
    this.todaysDate = '2019-12-12';
  }
  getEmpDetails(){
    this.empDetails['emp_id']="E101";
    this.empDetails['designation']="Accountant";
    this.empDetails['emp_name']="Ram Prasad";
    this.empDetails['office']="LDA Head Office";
    this.empDetails['section']="Accountant";
  }
  async getAllLeaves(){
    this.allLeaves.push({leave_type:'AK',from_date:'2020-10-10',to_date:'2020-10-10',reason:'man kar rha tha'});
    this.allLeaves.push({leave_type:'AK',from_date:'2020-10-10',to_date:'2020-10-10',reason:'man kar rha test'});
    this.datasource = new MatTableDataSource(this.allLeaves);
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }
  submit(){
    console.log(this.obj);
    this.snackBar.open("Submitted Successfully", 'Success', {
      duration: 5000,
    });
  } */
  ngAfterViewInit() {
    this._script.load('./assets/js/scripts/form-plugins.js');
  }
  applyFilter(filterValue: string) {
    
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  filename
  async view(element) {
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['upload_id'] = element.document_id
    obj['filename'] = element.document_name;
    this.filename = element.document_name
    console.log(obj)
    this.spinner.show()
    const res = await this.applyLeaveService.getUploadedFileData(obj);
    console.log(res)
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

