import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetadataService } from '../../service/metadata.service';
import {MainService} from '../../service/main.service';

declare var $: any;


@Component({
  selector: 'app-party-info',
  templateUrl: './party-info.component.html',
  styleUrls: ['./party-info.component.css']
})

export class PartyInfoComponent implements OnInit {
  
  displayedColumns = ['party_id', 'party_name', 'party_father_name', 'party_phone_no', 'action'];
  obj = {};
  erpUser;
  b_acct_id;
  data;
  dataSource;
  user_id;
  resarr;
  resObject = {}
  schemeArr;
  selectedrescode;
  resh;
  resv;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(public mainService: MainService,private services: MetadataService, private service: PartyService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }


  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllParties();
    await this.getAllschemes();
  }

  async getAllschemes() {
    this.spinner.show()
    var resp = await this.services.getAllResvations(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.resarr = resp.data;
      var resh = [];
      var resv = [];
      for (let i = 0; i < this.resarr.length; i++) {
        if (this.resarr[i]['reservation_type'] == 'HORIZONTAL') {
          resh.push(this.resarr[i])
          this.resObject[this.resarr[i]['reservation_category_code']] = this.resarr[i]['reservation_category_name']
          this.resh = resh
        }
        else {
          resv.push(this.resarr[i])
          this.resObject[this.resarr[i]['reservation_category_code']] = this.resarr[i]['reservation_category_name']
          this.resv = resv
        }
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error occured while getting Reservation Informations", 'Error', {
        duration: 5000,
      });
    }
  }



  async getAllParties() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.service.getPartydetail(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.data = resp.data;


      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;

      this.dataSource.paginator = this.paginator;
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Parties", 'Error', {
        duration: 5000,
      });
    }
  }

  async addNewRow() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.user_id
    this.spinner.show();
    var resp = await this.service.createParty(obj);
    if (resp['error'] == false) {
      await this.getAllParties();
      this.spinner.hide();
      this.snackBar.open("Party Added Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }


  }

  async openUpdate(element, i) {
    this.obj = element;
    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }
  async update() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id'] = this.user_id
    this.spinner.show();

    var resp = await this.service.updateParty(obj);
    if (resp['error'] == false) {

      await this.getAllParties();

      this.spinner.hide();
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.snackBar.open("Party Updated Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }
  }
  refressadd() {
    this.obj = Object.assign({}, {})
  }
  async deleteParty(element, i) {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['party_id'] = element.party_id;
    var resp = await this.service.deleteParty(obj);
    if (resp['error'] == false) {

      this.getAllParties()
      this.spinner.hide();
      this.snackBar.open("Party Deleted Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }
    this.spinner.hide();
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}


