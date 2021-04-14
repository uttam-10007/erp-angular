import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { MainService } from '../../service/main.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploader } from 'ng2-file-upload';
import { getLocalePluralCase } from '@angular/common';
declare var $: any
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;
  monthEnd={'1': 31,'2': 28,'3':31,'4': 30,'5': 31,'6':30,'7':31,'8':31,'9':30,'10':31,'11':30,'12':31}

  constructor(private sanitizer: DomSanitizer,public mainService: MainService,private spinner: NgxSpinnerService,private snackBar: MatSnackBar,private establishmentService : EstablishmentService) { }
 
  erpUser;
  b_acct_id;
  allEmplyees=[];
  idToNameObj={};
  codeValueTechObj={};
  allAttendance=[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
 
  displayedColumns = ['emp_id', 'emp_name','total_days','working_days','present_days','absent_days','leave_days','action'];
  
  datasource;
  attendanceObj={};
  getObj={};
  updateObj={};
  newallEmplyees = []
  async ngOnInit() {
    this.httpUrl = this.mainService.httpUrl;

    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'attendanceFile' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    //await this.getAllAttendance();
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    var resp = await this.establishmentService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      arr = resp.data;
       for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        this.allEmplyees.push(obj)
      } 
      this.newallEmplyees = []
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      for(var i=0;i<this.allEmplyees.length;i++){
        this.idToNameObj[this.allEmplyees[i]['emp_id']] = this.allEmplyees[i]['emp_name'];
      }
      
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list" ,'Error',{
        duration:5000
      });
    }
  }
  async getAllAttendance() {
    this.spinner.show()
    var arr = []
    var Attendance = []
    this.getObj['b_acct_id'] = this.b_acct_id;
    var resp = await this.establishmentService.gatAllAttendance(JSON.stringify(this.getObj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allAttendance = resp.data;
      arr = resp.data;
       for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
       Attendance.push(obj)
      }
      this.datasource = new MatTableDataSource(Attendance)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting attendance list" ,'Error',{
        duration:5000
      });
    }
  }
  getLeap(year){
    //var year = this.attendanceObj['year'];
    var leap =false;
    if(year % 4 == 0)
    {
            if( year % 100 == 0)
            {
                // year is divisible by 400, hence the year is a leap year
                if ( year % 400 == 0)
                    leap = true;
                else
                    leap = false;
            }
            else
                leap = true;
    }
    else
      leap = false;
    if(leap ==true){
      this.monthEnd[2] = 29;
    }


  }
  async submitAttendanceInfo(){
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    this.getLeap(parseInt(this.attendanceObj['year']));
    this.attendanceObj['total_days'] = this.monthEnd[this.attendanceObj['month']];
    this.attendanceObj['b_acct_id'] = this.b_acct_id;
    this.attendanceObj['create_user_id'] = this.erpUser.user_id;
    //this.attendanceObj['party_name'] = this.idToNameObj[this.attendanceObj['party_id']];
    obj['attendance_detail'] =[];
    obj['attendance_detail'].push(this.attendanceObj);
    var resp = await this.establishmentService.addAttendanceInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      //await this.getAllAttendance();
      this.snackBar.open("Attendance Info Added" ,'Success',{
        duration:5000
      });
      
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Attendance Info Of Employee" ,'Error',{
        duration:5000
      });
    }
  }
  openUpdate(element){
    this.updateObj = Object.assign({},element);
    this.updateObj['year'] = parseInt(this.updateObj['year'])
    this.updateObj['month'] = parseInt(this.updateObj['month'])

    $('.nav-tabs a[href="#tab-3"]').tab('show');
  }
  async updateAttendanceInfo(){
    this.spinner.show()
    this.updateObj['b_acct_id'] = this.b_acct_id;
    this.updateObj['total_days'] = this.monthEnd[this.updateObj['month']];

    this.updateObj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.establishmentService.updateAttendanceInfo(this.updateObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllAttendance();
      this.snackBar.open("Attendance Info Updated" ,'Success',{
        duration:5000
      });
      
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Updating Attendance Info Of Employee" ,'Error',{
        duration:5000
      });
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async upload() {
this.spinner.show()
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['file_name'] = this.uploader.queue[0].some.name;
    obj['is_header_present'] = 1;
    obj['create_user_id'] = this.erpUser.user_id;
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/hr/establishment_info/attendance/processAttendanceFile' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      if (!response.error) {
        this.spinner.hide()
        this.snackBar.open("Data Imported Successfully" ,'Success',{
          duration:5000
        });
        

      } else {
        this.spinner.hide()
        this.snackBar.open(response.data ,'Error',{
          duration:5000
        });

      }
    };
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


 
}

