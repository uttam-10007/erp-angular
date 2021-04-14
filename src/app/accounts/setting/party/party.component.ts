import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { MainService } from '../../service/main.service';
import { SettingService } from '../../service/setting.service';
import { IpService } from '../../service/ip.service';

declare var $: any

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class AccountsPartyComponent implements OnInit {

  constructor(private ipService: IpService, private settingService: SettingService, public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = [];
  datasource;
  partyObj = {};

  erpUser;
  user_id;
  b_acct_id;
  allParty = [];
  techToBusNameObj={};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllParties();
    await this.getallFields();
    await this.getIpDetails();
    await this.getmaxlclno();
  }

  openUpdate(element) {
    this.partyObj = Object.assign({}, element);
    var date = this.partyObj['effective_date'].split("T")
    this.partyObj['effective_date'] = date[0]
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }


  allFields = [];
  async getallFields() {

    var obj = new Object();
    obj['table_name'] = 'field_info';
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ipService.getFields(obj);
    this.allFields = [];
    if (resp['error'] == false) {
     
      this.allFields = resp.data;
     
    } else {
      this.snackBar.open("Error while getting Fields", "Error", {
        duration: 5000,
      });
    }


  }
  maxlocalno
  async getmaxlclno() {

    var obj = new Object();
   
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ipService.getmaxlclno(this.b_acct_id);
    this.allFields = [];
    if (resp['error'] == false) {
      this.maxlocalno = resp.obj[0]['MAX(local_no)'];
      if(this.maxlocalno==null){
        this.maxlocalno=0;
      }
     
    } else {
      this.snackBar.open("Error while getting Fields", "Error", {
        duration: 5000,
      });
    }


  }
  field_code = [];
  displayedColumns_temp=[];
  async getIpDetails() {
    var resp = await this.ipService.getipdata(this.b_acct_id);
    if (resp['error'] == false) {
      var ip_dtl = resp.data[0];
      this.displayedColumns_temp=[];
      this.displayedColumns = [];
      this.techToBusNameObj={};
      var ip_fields_code = ip_dtl.field_code.split(",");
      this.field_code = [];
      for (let i = 0; i < ip_fields_code.length; i++) {
        for (let j = 0; j < this.allFields.length; j++) {
          if (ip_fields_code[i] == this.allFields[j]['field_code']) {
            if (this.allFields[j]['field_technical_name'] == 'create_timestamp' ||
             this.allFields[j]['field_technical_name'] == 'create_user_id' || 
             this.allFields[j]['field_technical_name'] == 'update_timestamp' || 
             this.allFields[j]['field_technical_name'] == 'update_user_id') {
            } else {
              this.displayedColumns.push(this.allFields[j]['field_technical_name']);
              this.displayedColumns_temp.push(this.allFields[j]['field_technical_name']);
              this.techToBusNameObj[this.allFields[j]['field_technical_name']]=this.allFields[j]['field_business_name'];


              var datatype = this.allFields[j]['datatype_code'];
              var temp_type;
              if (datatype == 'bigint(20)' || datatype == 'double' || datatype == 'int(11)') {
                temp_type = 'number';
              } else if (datatype == 'date') {
                temp_type = 'date';
              } else if (datatype == 'varchar(200)' || datatype == 'varchar(50)' || datatype == 'text') {
                temp_type = 'text';
              }else{
                temp_type='text'
              }
              this.field_code.push({ field_business_name: this.allFields[j]['field_business_name'], 
              field_technical_name: this.allFields[j]['field_technical_name'],
               field_code: ip_fields_code[i] ,type:temp_type})
            }
          }
        }
      }
      this.displayedColumns.push('action');

    } else {
      this.snackBar.open("Error while getting ip Records", "Error", {
        duration: 5000,
      });
    }
  }

  refresh() {
    this.partyObj = {};
  }

  async getAllParties() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getPartyInfoNew(this.b_acct_id);
    if (resp['error'] == false) {
      this.allParty = resp.data;
      this.datasource = new MatTableDataSource(this.allParty)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all party list!",'error');

    }
  }

  async save() {
    this.spinner.show();
    this.partyObj['create_user_id'] = this.erpUser.user_id;
    //this.partyObj['party_id'] = 'ACC' + this.partyObj['party_local_no'];
    this.partyObj['local_no']= this.maxlocalno+1
    this.partyObj['party_id']='ACC'+ this.partyObj['local_no']
    var obj1 = new Object();
    obj1['data'] = this.partyObj;
    obj1['b_acct_id'] = this.b_acct_id;

    var resp = await this.settingService.createPartyNew(obj1);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllParties();
      await this.getmaxlclno();
      swal.fire("Success", "...Party Added Successfully!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while Adding Party!",'error');
    }
  }

  async update() {
    this.spinner.show();
    this.partyObj['update_user_id'] = this.erpUser.user_id;

    var obj1=new Object();
    for(let i=0;i<this.displayedColumns_temp.length;i++){
      obj1[this.displayedColumns_temp[i]]=this.partyObj[this.displayedColumns_temp[i]];
    }
    obj1['update_user_id'] = this.erpUser.user_id;
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id;
    obj['data']=obj1;
    var resp = await this.settingService.updatePartyNew(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllParties();
      swal.fire("Success", "...Party Update Successfully!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating Party!",'error');
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
