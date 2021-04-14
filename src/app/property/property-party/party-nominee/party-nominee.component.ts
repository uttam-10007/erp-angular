import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import {MainService} from '../../service/main.service';
declare var $: any;

@Component({
  selector: 'app-party-nominee',
  templateUrl: './party-nominee.component.html',
  styleUrls: ['./party-nominee.component.css']
})
export class PartyNomineeComponent implements OnInit {

  displayedColumns = ['party_id','party_name', 'nominee_name','relation_code', 'nominee_phone_no','nominee_email', 'action'];
  obj={}
  partyArr;
  partyObj={}
  erpUser;
  b_acct_id
  data;
  dataSource
  user_id
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(public mainService: MainService,private service: PartyService,private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }

  
  async  ngOnInit() {
      this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
      this.b_acct_id =this.erpUser.b_acct_id;
      this.user_id =this.erpUser.user_id;
      await this.getAllParties();
      await this.getAllNominees()
    }
async getAllParties(){
  this.spinner.show()
  var resp = await this.service.getPartyShortdetails(this.b_acct_id);
  if (resp['error'] == false) {
    this.spinner.hide()
    this.partyArr = resp.data;
    for(let i=0;i<this.partyArr.length;i++){
      this.partyObj[this.partyArr[i]['party_id']]=this.partyArr[i]['party_name']
    }

  } else {
    //this.toastr.errorToastr('Some Error Occurred')
    this.spinner.hide();
    this.snackBar.open("Error occured while getting Parties", 'Error', {
      duration: 5000,
    });
  }
}

async getAllNominees(){
  this.spinner.show()
  var resp = await this.service.getNomineedetail(this.b_acct_id);
  if (resp['error'] == false) {
    this.spinner.hide()
    this.data = resp.data;
    

    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.sort = this.sort;
    
    this.dataSource.paginator = this.paginator;
  } else {
    //this.toastr.errorToastr('Some Error Occurred')
    this.spinner.hide();
    this.snackBar.open("Error occured while getting Nominees", 'Error', {
      duration: 5000,
    });
  }
}


    async addNewRow(){
      var obj=Object.assign({},this.obj);
      obj['b_acct_id']=this.b_acct_id
      obj['create_user_id']=this.user_id

      this.spinner.show();
      var resp = await this.service.createNomineeDetail(obj);
      if (resp['error'] == false) {
  
        await this.getAllNominees();
        
        this.spinner.hide();
        this.snackBar.open("Nominee Added Successfully", 'Success!', {
          duration: 5000,
        });
        //this.toastr.successToastr('Added Successfully')
      } else {
        this.spinner.hide();
        this.snackBar.open("Request Failed", 'Error', {
          duration: 5000,
        });
        //this.toastr.errorToastr(resp['data']);
      }
    
  
    }

    async openUpdate(element, i) {
      this.obj=element;
      this.obj['party_name']=this.partyObj[element.party_id]
    $('.nav-tabs a[href="#tab-3"]').tab('show')

    }
    async update(){
      var obj=Object.assign({},this.obj);
      obj['b_acct_id']=this.b_acct_id
      obj['update_user_id']=this.user_id
       this.spinner.show();
     
      var resp = await this.service.updateNomineeDetail(obj);
      if (resp['error'] == false) {
  
        await this.getAllNominees();
        
        this.spinner.hide();
       $('.nav-tabs a[href="#tab-1"]').tab('show')
       this.snackBar.open("Nominee Updated Successfully", 'Success!', {
        duration: 5000,
      });
        //this.toastr.successToastr('Updated Successfully')
      } else {
        this.spinner.hide();
        this.snackBar.open("Request Failed", 'Error', {
          duration: 5000,
        });
        //this.toastr.errorToastr(resp['data']);
      }
    }
    refressadd(){
      this.obj=Object.assign({},{})
    }
    async deleteAccount(element, i) {
      this.spinner.show();
      var obj = new Object();
      obj['b_acct_id'] = this.b_acct_id;
      obj['nominee_id'] = element.nominee_id;
      var resp = await this.service.deleteNominee(obj);
      if (resp['error'] == false) {
      
        this.getAllNominees()
        this.spinner.hide();
        this.snackBar.open("Nominee Deleted Successfully", 'Success!', {
          duration: 5000,
        });
        //this.toastr.successToastr('Deleted Successfully')
      } else {
        this.spinner.hide();
        this.snackBar.open("Request Failed", 'Error', {
          duration: 5000,
        });
        //this.toastr.errorToastr(resp['data'])
      }
      this.spinner.hide();
    }
    applyFilter(filterValue: string) {

      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}



