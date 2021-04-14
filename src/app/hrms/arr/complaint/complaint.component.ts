import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { MainService } from '../../service/main.service';

declare var $: any
@Component({
  selector: 'app-complaint',
  templateUrl: './complaint.component.html',
  styleUrls: ['./complaint.component.css']
})
export class ComplaintComponent implements OnInit {


  constructor(public mainService: MainService,private router:Router,private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private establishmentService: EstablishmentService) { }
  erpUser;
  b_acct_id;

  codeValueTechObj={};
emp_name
  allEmplyees = [];
  selectEmpObj = {};
  complaintObj = {};
  updateComplaintObj={};
  arr_id;
  newallEmplyees = []
  empIdToName={}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'complaint_type_code', 'complaint_desc', 'complaint_dt', 'complaint_status','action'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getAllComplaint();
  }

  enquiry(element) {
    this.establishmentService.complaint_detail=element;
    this.router.navigate(['/hrms/arr/enq']);
  }
  openUpdate(element){
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    for (let i = 0; i < this.allEmplyees.length; i++) {
      
      
   
    if(this.allEmplyees[i]['emp_id'] == element['emp_id'] ){
      this.emp_name = this.allEmplyees[i]['emp_name']
     
    }
  }
  this.updateComplaintObj=Object.assign({},element);

  }

  async getAllComplaint() {
    this.spinner.show()
    var resp = await this.establishmentService.getAllComplaints(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all complaint list", 'Error', {
        duration: 5000
      });
    }
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    var obj=new Object();
     obj['b_acct_id']=this.b_acct_id;
     obj['emp_status_code'] = ['JOINING','JOINED','LEFT']
    var resp = await this.establishmentService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allEmplyees = resp.data;
      this.newallEmplyees = []
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      for(let i=0;i<this.allEmplyees.length;i++){
        this.empIdToName[this.allEmplyees[i].emp_id]=this.allEmplyees[i].emp_name;
      }
      
    } else {
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  async changeEmployee() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id']
    
  }




  async submitComplaint() {
    this.complaintObj['b_acct_id'] = this.b_acct_id;
    this.complaintObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.complaintObj['complaint_status']='REGISTERED';
    this.complaintObj['create_user_id']=this.erpUser.user_id;

    this.spinner.show();
    var resp = await this.establishmentService.createComplaint(this.complaintObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllComplaint();
      this.snackBar.open("Complaint Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Complaint  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  async updateComplaint(){
    this.updateComplaintObj['b_acct_id'] = this.b_acct_id;
    
    this.updateComplaintObj['update_user_id']=this.erpUser.user_id;

    this.spinner.show();
    var resp = await this.establishmentService.updateComplaintDetail(this.updateComplaintObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllComplaint();
      this.snackBar.open("Complaint Updated Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Complaint  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  async changeStatus(element){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    obj['complaint_status'] = "UNDER ENQUIRY";
  

    this.spinner.show();
    var resp = await this.establishmentService.changeComplaintStatus(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllComplaint();
      this.snackBar.open("Complaint Updated Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Complaint  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}
