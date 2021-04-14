import swal from 'sweetalert2';
import { Component, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../../_services/script-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MainService } from '../../service/main.service';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { VerificationService } from '../../service/verification.service';

import { element } from 'protractor';
declare var $: any

@Component({
  selector: 'app-status-and-renewal',
  templateUrl: './status-and-renewal.component.html',
  styleUrls: ['./status-and-renewal.component.css']
})
export class StatusAndRenewalComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  status = [{ value: 'ACTIVE' }, { value: 'INCOMPLETE' }, { value: 'APPLIED' }, { value: 'CANCELLED' }, { value: 'EXPIRED' }]
  selectedStatus = ''
  displayedColumns = ['s_no', 'name', 'status', 'modication_dt', 'expire_dt', 'reminder_dt', 'action'];
  datasource;
  allApp = []
  httpUrl;
  month
  year
  fileURL;
  erpUser;
  b_acct_id;
  systemDate
  constructor(private verificationService: VerificationService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  async ngOnInit() {
    var resp = await this.verificationService.getSystemDate();
    this.systemDate = resp.data
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    await this.getApplications()
  }

  async changeStatus() {
    let arr = []
    if (this.selectedStatus == 'EXPIRED') {
      let todayDate = new Date(this.systemDate)
      for (let i = 0; i < this.allApp.length; i++) {
        if(this.allApp[i]['expiry_dt']!=null){
        let expdate = new Date(this.allApp[i]['expiry_dt'])
        if (todayDate.getTime() > expdate.getTime()) {

          arr.push(this.allApp[i])
        }}
      }
    } else {
      for (let i = 0; i < this.allApp.length; i++) {
        if (this.selectedStatus == this.allApp[i]['status']) {
          arr.push(this.allApp[i])
        }
      }
    }
    this.datasource = new MatTableDataSource(arr);
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;
  }
  async changeyear() {
    let arr = []
    var datearray = this.systemDate.split('-')
    if(this.year == undefined){
      this.year = datearray[0] 
    }
    if (this.selectedStatus == 'EXPIRED') {
      let todayDate = new Date(this.systemDate)
      for (let i = 0; i < this.allApp.length; i++) {
        if(this.allApp[i]['expiry_dt']!=null){
        let expdate = new Date(this.allApp[i]['expiry_dt'])
        if (todayDate.getTime() > expdate.getTime()) {

          arr.push(this.allApp[i])
        }}
      }
    } else {
      for (let i = 0; i < this.allApp.length; i++) {
        if (this.selectedStatus == this.allApp[i]['status']) {
          arr.push(this.allApp[i])
        }
      }
    }
    
    let datearr = []
      for (let i = 0; i < arr.length; i++) {
        
        let expdate = arr[i]['expiry_dt'].split('-')

        if (this.month == expdate[1] && this.year == expdate[0] ) {

          datearr.push(arr[i])
        }
      }
    this.datasource = new MatTableDataSource(datearr);
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;
  }
  async getApplications() {
    this.spinner.show()
    let obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.verificationService.getApplications(JSON.stringify(obj));
    if (resp['error'] == false) {

      this.allApp = resp['data']

      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Applications !');
    }


  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async delete(element) {
    let obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element.id

    var resp = await this.verificationService.deleteApplication(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getApplications()
      await this.changeStatus()
      swal.fire('Success', 'Deleted Successfully!');


      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Deleting Application !');
    }

  }
}
