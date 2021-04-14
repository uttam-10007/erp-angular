import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { MainService } from '../../service/main.service';

declare var $: any
@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.css']
})
export class EnquiryComponent implements OnInit {


  constructor(public mainService: MainService,private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private establishmentService: EstablishmentService) { }
  erpUser;
  b_acct_id;
  allComplaint = [];
  selectCompObj = {};
  enquiryObj = {};


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'en_type_code', 'en_desc', 'en_dt'];
  datasource;
  codeValueTechObj={};

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllComplaint();
  }



  async getAllComplaint() {
    this.spinner.show()
    var resp = await this.establishmentService.getAllComplaints(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allComplaint = resp.data;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all complaint list", 'Error', {
        duration: 5000
      });
    }
  }

  async getEnquiry() {

    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['complaint_id'] = this.selectCompObj['complaint_id'];
    var resp = await this.establishmentService.getEnquiryForComplaint(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting Enquiry For Complaint list", 'Error', {
        duration: 5000
      });
    }
  }




  async submitEnquiry() {

    this.enquiryObj['b_acct_id'] = this.b_acct_id;
    this.enquiryObj['create_user_id']=this.erpUser.user_id;
    
    this.spinner.show();
    var resp = await this.establishmentService.setupEnquiry(this.enquiryObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getEnquiry();
      this.snackBar.open("Enquiry Added Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Enquiry  Of Complaint", 'Error', {
        duration: 5000
      });
    }
  }


  applyFilter(filterValue: string) {
    
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
