import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { EventsService } from '../../service/events.service';

import { ThrowStmt } from '@angular/compiler';
declare var $: any

@Component({
  selector: 'app-event-layouts',
  templateUrl: './event-layouts.component.html',
  styleUrls: ['./event-layouts.component.css']
})
export class EventLayoutsComponent implements OnInit {
record={data:[]}
erpUser;
b_acct_id;

allEventLayouts=[]

allFields = [];
displayedColumns = ['s_no','record_code', 'record_business_name', 'action'];
datasource;
@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
@ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private eventService: EventsService,private settingService: SettingService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }

 async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllFields();
    await this.getAllEventLayouts();

  }

  async getAllFields() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
  //  obj['domain_code'] = 'ACCOUNT';
    var resp = await this.settingService.getFields(JSON.stringify(obj));
    if (resp['error'] == false) {
      var arr = resp.data;
     this.allFields=[]
     for(let i=0;i<arr.length;i++){
       var label=arr[i]['field_code']+" - "+arr[i]['field_business_name']+" - "+arr[i]['field_technical_name']
       this.allFields.push(Object.assign({},{'value':label,'code':arr[i]['field_code']}))
     }

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all fields list", 'Error', {
        duration: 5000
      });
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async getAllEventLayouts() {
     
  //  obj['domain_code'] = 'ACCOUNT';
    this.spinner.show()
    var resp = await this.eventService.getEventLayoutss(this.b_acct_id);
    if (resp['error'] == false) {
      this.allEventLayouts = resp.data;
     this.datasource = new MatTableDataSource(this.allEventLayouts)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting Event Records", 'Error', {
        duration: 5000
      });
    }
  }
  add(){
    
    var obj=new Object
    obj['field_code']=''
    this.record.data.push(obj)
  }
  delete(i){
    this.record.data.splice(i,i)
  }
  refresh(){
    this.record={data:[]}
  }

async  save(){
    let obj=Object.assign(this.record)
    obj['record_technical_name']=this.record['record_code']
    obj['b_acct_id']=this.b_acct_id
    obj['domain_code']='ACCOUNT'
    obj['record_type']='EVENTLAYOUT'
    this.spinner.show()

    var resp = await this.eventService.createEventLayout(obj);
    if (resp['error'] == false) {
    await this.getAllEventLayouts();
     
      this.spinner.hide()
      this.snackBar.open("Event Record Created Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide()
      this.snackBar.open("Error While Creating Event Record.", 'Error', {
        duration: 5000
      });
    }
  }

  open_update(element) {
    this.record = Object.assign({}, element);
    this.record['data']=[]
var arr=element['field_code'].split(",")
for(let i=0;i<arr.length;i++){
  var obj=new Object
  obj['field_code']=arr[i]
  this.record['data'].push(obj)
}

    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
  async deleteLayout(element){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['record_code']=element['record_code']
    this.spinner.show()
    var resp = await this.eventService.deleteEventLayout(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllEventLayouts();
      this.spinner.hide()
      this.snackBar.open("Event Record Deleted Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide()
      this.snackBar.open("Error While Deleting Event Record", 'Error', {
        duration: 5000
      });
    }
  }
 async update(){
    let obj=Object.assign(this.record)
    obj['record_technical_name']=this.record['record_code']
    obj['b_acct_id']=this.b_acct_id
    obj['domain_code']='ACCOUNT'
    obj['record_type']='EVENTLAYOUT'
    this.spinner.show()

    var resp = await this.eventService.updateeventlayout(obj);
    if (resp['error'] == false) {
      await this.getAllEventLayouts();
     
      this.spinner.hide()
      this.snackBar.open("Event Record Updated Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide()
      this.snackBar.open("Error While Updating Event Record.", 'Error', {
        duration: 5000
      });
    }
  }
}
