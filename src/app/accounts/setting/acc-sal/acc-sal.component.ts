import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { MainService } from '../../service/main.service';
import { SettingService } from '../../service/setting.service';
import { SalService } from '../../service/sal.service';

declare var $: any

@Component({
  selector: 'app-acc-sal',
  templateUrl: './acc-sal.component.html',
  styleUrls: ['./acc-sal.component.css']
})
export class AccSalComponent implements OnInit {


  constructor(private salService: SalService, private settingService: SettingService, public mainService: MainService, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  seletedparty
  maxlocalno
  displayedColumns = [];
  datasource;
  salObj = {};
  allParty
  erpUser;
  user_id;
  b_acct_id;
  allSal = [];
  techToBusNameObj = {};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllSal();
    await this.getallFields();
    await this.getSalDetails();
    await this.getAllParties();
    await this.getmaxlclno();
  }

  openUpdate(element) {
   
    this.salObj = Object.assign({}, element);
    var date = this.salObj['arr_eff_dt'].split("T")
    this.salObj['arr_eff_dt'] = date[0]

    $('.nav-tabs a[href="#tab-3"]').tab('show')
    for (let i = 0; i < this.allParty.length; i++) {
      if(this.allParty[i]['party_id']== this.salObj['party_id']){
        
      
       this.seletedparty = this.allParty[i]['id']
      
      }
    }
  }


  allFields = [];
  async getAllParties() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getPartyInfoNew(this.b_acct_id);
    if (resp['error'] == false) {
      this.allParty = resp.data;
      
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all party list!",'error');

    }
  }
  changeparty(){
    for (let i = 0; i < this.allParty.length; i++) {
     if(this.allParty[i]['id']== this.seletedparty){
       
      this.salObj['party_name']= this.allParty[i]['party_name']
      this.salObj['party_id']= this.allParty[i]['party_id']
     }
      
    }
  }
  async getmaxlclno() {

    var obj = new Object();
   
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.salService.getmaxlclno(this.b_acct_id);
    this.allFields = [];
    if (resp['error'] == false) {
      this.maxlocalno = resp.data[0]['MAX(arr_local_no)'];
      if(this.maxlocalno == null){
        this.maxlocalno = 0
       
      }     
    } else {
      this.snackBar.open("Error while getting Fields", "Error", {
        duration: 5000,
      });
    }


  }
  async getallFields() {

    var obj = new Object();
    obj['table_name'] = 'field_info';
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.salService.getFields(obj);
    this.allFields = [];
    if (resp['error'] == false) {
      this.allFields = resp.data;

    } else {
      this.snackBar.open("Error while getting Fields", "Error", {
        duration: 5000,
      });
    }


  }
  field_code = [];
  displayedColumns_temp = [];
  async getSalDetails() {
    var resp = await this.salService.getSal(this.b_acct_id);
    if (resp['error'] == false) {
      var sal_dtl = resp.data[0];
      this.displayedColumns_temp = [];
      this.displayedColumns = [];
      this.techToBusNameObj = {};
      var sal_fields_code = sal_dtl.field_code.split(",");
      this.field_code = [];
      for (let i = 0; i < sal_fields_code.length; i++) {
        for (let j = 0; j < this.allFields.length; j++) {
          if (sal_fields_code[i] == this.allFields[j]['field_code']) {
            if (this.allFields[j]['field_technical_name'] == 'create_timestamp' 
            || this.allFields[j]['field_technical_name'] == 'create_user_id' 
            || this.allFields[j]['field_technical_name'] == 'update_timestamp' 
            || this.allFields[j]['field_technical_name'] == 'update_user_id') {
            } else {
              this.displayedColumns.push(this.allFields[j]['field_technical_name']);
              this.displayedColumns_temp.push(this.allFields[j]['field_technical_name']);
              this.techToBusNameObj[this.allFields[j]['field_technical_name']] = this.allFields[j]['field_business_name'];


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
               field_code: sal_fields_code[i],type: temp_type
               })
            }
          }
        }
      }
      this.displayedColumns.push('action');

    } else {
      this.snackBar.open("Error while getting sal Records", "Error", {
        duration: 5000,
      });
    }
  }

  refresh() {
    this.salObj = {};
  }

  async getAllSal() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.getSalInfoNew(this.b_acct_id);
    if (resp['error'] == false) {
      this.allSal = resp.data;
      this.datasource = new MatTableDataSource(this.allSal)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while getting  all sal list!",'error');

    }
  }

  async save() {
    this.spinner.show();
   
    this.salObj['arr_local_no']= this.maxlocalno+1
    this.salObj['arr_id']='ACC'+ this.salObj['arr_local_no']
    var obj1 = new Object();
    obj1['data'] = this.salObj;
    obj1['b_acct_id'] = this.b_acct_id;    
    var resp = await this.settingService.createSalNew(obj1);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllSal();
      await this.getmaxlclno();
      swal.fire("Success", "...Sal Added Successfully!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while Adding Sal!",'error');
    }
  }

  async update() {
    this.spinner.show();
    

    var obj1 = new Object();
    for (let i = 0; i < this.displayedColumns_temp.length; i++) {
      obj1[this.displayedColumns_temp[i]] = this.salObj[this.displayedColumns_temp[i]];
    }
    
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['data'] = obj1;
    var resp = await this.settingService.updateSalNew(obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllSal();
      swal.fire("Success", "...Sal Update Successfully!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Error while updating Sal!",'error');
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

}
