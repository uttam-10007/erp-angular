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
  selector: 'app-party-accounts',
  templateUrl: './party-accounts.component.html',
  styleUrls: ['./party-accounts.component.css']
})
export class PartyAccountsComponent implements OnInit {
  displayedColumns = ['party_id','party_name', 'party_account_no','party_bank_name', 'party_branch_name','party_ifsc_code', 'action'];
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
      await this.getAllAccounts()
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
    this.spinner.hide()
    //this.toastr.errorToastr('Some Error Occurred')
    this.spinner.hide();
    this.snackBar.open("Error occured while getting Parties", 'Error', {
      duration: 5000,
    });
  }
}

async getAllAccounts(){
  this.spinner.show()
  var resp = await this.service.getAccountdetail(this.b_acct_id);
  if (resp['error'] == false) {
    this.spinner.hide()
    this.data = resp.data;  

    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.sort = this.sort;
    
    this.dataSource.paginator = this.paginator;
  } else {
    this.spinner.hide()
    //this.toastr.errorToastr('Some Error Occurred')
    this.spinner.hide();
    this.snackBar.open("Error occured while getting Accounts", 'Error', {
      duration: 5000,
    });
  }
}


    async addNewRow(){
      var obj=Object.assign({},this.obj);
      obj['b_acct_id']=this.b_acct_id
      obj['create_user_id']=this.user_id
      this.spinner.show();
      var resp = await this.service.createAccountDetail(obj);
      if (resp['error'] == false) {
  
        await this.getAllAccounts();
        
        this.spinner.hide();
        this.snackBar.open("Account Added Successfully", 'Success!', {
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
     
      var resp = await this.service.updateAccountDetail(obj);
      if (resp['error'] == false) {
  
        await this.getAllAccounts();
        
        this.spinner.hide();
       $('.nav-tabs a[href="#tab-1"]').tab('show')
       this.snackBar.open("Account Updated Successfully", 'Success!', {
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
   
    applyFilter(filterValue: string) {

      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}



