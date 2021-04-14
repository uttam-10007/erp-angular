import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service'
import { EstablishmentService } from '../../service/establishment.service';
declare var $: any

@Component({
  selector: 'app-setting-pension-contribution',
  templateUrl: './setting-pension-contribution.component.html',
  styleUrls: ['./setting-pension-contribution.component.css']
})
export class SettingPensionContributionComponent implements OnInit {

  constructor(private establishmentService: EstablishmentService, private mainService: MainService, private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService) { }
  erpUser;
  b_acct_id;
  select = [{value:'YES',code:1},{value:'NO',code:0}]
statusarr = ['NO','YES']
  allFields = [];
  obj = {};

  selectField;
  allCodeValue = [];
  selectedCodeValue = []
  codeValueObj = {};
  codeValueShowObj = {};
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'code', 'value','designation','status', 'action'];
  datasource;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    
    await this.getcontribution();
    await this.getAllCurrentArrangements()
  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }

  allArr = []
  async getAllCurrentArrangements() {
    this.spinner.show();   
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ['ACTIVE']

    var resp = await this.establishmentService.getAllCurrentArrangements(obj);
    if (resp['error'] == false) {
      this.allArr = resp.data;

      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all fields!",'error');
    }
  }
  async getcontribution() {
this.spinner.show()
    var resp = await this.settingService.getcontribution(this.b_acct_id);
    if (resp['error'] == false) {
      this.allCodeValue = resp.data;
      
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      swal.fire("Oops", "...Error while getting all values!",'error');

    }
  }

 

  refresh() {
    this.obj = {};
  }


 

 
  async delete(element){
   
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id;

    this.spinner.show();
    var resp = await this.settingService.deletecontribution(JSON.stringify(obj));
   
    if(resp['error']==false){
      await this.getcontribution();
     
      this.spinner.hide();
      swal.fire("Yaaay", "...Successfully Deleted!",'success');
    }else{
      this.spinner.hide();
      swal.fire("Oops", "... not deleted!",'error');
    }
  }
   

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async save() {
    this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['designation'] = []
    this.obj['emp_name'] = []
   
    for (let i = 0; i < this.allArr.length; i++) {
      for (let j = 0; j < this.obj['emp_id'].length; j++) {
      
      if(this.obj['emp_id'][j] == this.allArr[i]['emp_id']){
        this.obj['designation'].push(this.allArr[i]['designation_code'])
        this.obj['emp_name'].push(this.allArr[i]['emp_name'])
        
      }
    }
    }
    
    this.obj['b_acct_id'] = this.b_acct_id;
    this.obj['status'] = 1;
    var resp = await this.settingService.addcontribution(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getcontribution();
      //await this.getCodeValueForService();

      swal.fire("Yaaay", "... added Sucessfully!",'success');


    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while adding !",'error');

    }
  }

 
}
