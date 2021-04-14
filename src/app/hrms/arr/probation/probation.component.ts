import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../../service/establishment.service';
import { MainService } from '../../service/main.service';
declare var $: any

@Component({
  selector: 'app-probation',
  templateUrl: './probation.component.html',
  styleUrls: ['./probation.component.css']
})
export class ProbationComponent implements OnInit {


  constructor(public mainService: MainService,private router:Router,private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private establishmentService: EstablishmentService) { }
  erpUser;
  b_acct_id;

  codeValueTechObj={};

  allEmplyees = [];
  selectEmpObj = {};
  probationObj = {};
  update_probationObj={}

  emp_id;


  empIdToName={};
  newallEmplyees = []
  

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'emp_id', 'probation_days', 'probation_status_code', 'action'];
  datasource;

  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
   
  }
  openUpdate(element) {
    this.update_probationObj=Object.assign({},element);
    $('.nav-tabs a[href="#tab-3"]').tab('show');

  }
  async getAllProbation() {
    this.spinner.show()
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    obj['emp_id']=this.selectEmpObj['emp_id']
    var resp = await this.establishmentService.getPartyProbationInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all Probation list", 'Error', {
        duration: 5000
      });
    }
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj=new Object();
     obj['b_acct_id']=this.b_acct_id;
     
    var resp = await this.establishmentService.getEmployeeMasterData(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmplyees = resp.data;
      
      this.newallEmplyees = []
      for(let i=0;i<this.allEmplyees.length;i++){
        var obj=new Object();
        obj=Object.assign({},this.allEmplyees[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.newallEmplyees.push(obj)
      }
      for(let i=0;i<this.allEmplyees.length;i++){
        this.empIdToName[this.allEmplyees[i].emp_id]=this.allEmplyees[i].emp_name;
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }
  async changeEmployee() {
    // var obj = new Object();
    // obj['b_acct_id'] = this.b_acct_id;
    // obj['emp_id'] = this.selectEmpObj['emp_id'];

    // var resp = await this.establishmentService.getCurrentArrangement(obj);
    // if (resp['error'] == false) {
    //   this.emp_id = resp.data[0]['emp_id'];
    // } else {
    //   this.snackBar.open("Error while getting current arrangment ", 'Error', {
    //     duration: 5000
    //   });
    // }

    await this.getAllProbation();
  }






  async submitProbation() {
    this.probationObj['b_acct_id'] = this.b_acct_id;
    this.probationObj['emp_id'] = this.selectEmpObj['emp_id'];
    this.probationObj['create_user_id']=this.erpUser.user_id;
    this.probationObj['probation_status_code']='ACTIVE';

    this.spinner.show();
    var resp = await this.establishmentService.addPartyProbation(this.probationObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllProbation();
      this.snackBar.open("Probation Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Probation  Of Employee", 'Error', {
        duration: 5000
      });
    }
  }







  async updateProbation(){

    this.spinner.show();
    this.update_probationObj['b_acct_id']=this.b_acct_id;
    this.update_probationObj['update_user_id']=this.erpUser.user_id;

    var resp = await this.establishmentService.updateProbation(this.update_probationObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllProbation();
      this.snackBar.open("Probation Updated Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while updating Probation  Of Employee", 'Error', {
        duration: 5000
      });
    }

  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }



}
