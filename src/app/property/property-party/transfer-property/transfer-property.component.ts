import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import { TransferPropertyService } from '../../service/transfer-property.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetadataService } from '../../service/metadata.service';
declare var $: any;

@Component({
  selector: 'app-transfer-property',
  templateUrl: './transfer-property.component.html',
  styleUrls: ['./transfer-property.component.css']
})
export class TransferPropertyComponent implements OnInit {
  displayedColumns = ['arr_id', 'party_id', 'party_name', 'property_code', 'arr_effective_date'];
  obj = {}

  erpUser;
  b_acct_id
  data;
  schemeArr;
  selectedSchemeCode = ''
  dataSource
  schemeObject = {}
  arr_id = ''
  costCodeArr = []
  scheduleArr = [];
  partyArr;
  partyObj = {}
  subschemeArr;
  subschemeObject = {}
  subselectedSchemeCode;
  user_id
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private transferService: TransferPropertyService, private service: PartyService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService, private settingService: MetadataService) { }



  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllSchemes();
    await this.getAllParties();
  }
  async getAllParties() {
    this.spinner.show()
    var resp = await this.service.getPartyShortdetails(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.partyArr = resp.data;
      for (let i = 0; i < this.partyArr.length; i++) {
        this.partyObj[this.partyArr[i]['party_id']] = this.partyArr[i]['party_name']
      }

    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Parties", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllSchemes() {
    this.spinner.show()
    var resp = await this.settingService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.schemeArr = resp.data;

      for (let i = 0; i < this.schemeArr.length; i++) {
        this.schemeObject[this.schemeArr[i]['scheme_code']] = this.schemeArr[i]['scheme_name']
      }

    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllSubschemes() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.selectedSchemeCode;
    var resp = await this.settingService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.subschemeArr = resp.data;

      for (let i = 0; i < this.subschemeArr.length; i++) {
        this.subschemeObject[this.subschemeArr[i]['sub_scheme_code']] = this.subschemeArr[i]['sub_scheme_name']
      }

    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async changeScheme() {
    var obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['scheme_code'] = this.selectedSchemeCode
    obj['sub_scheme_code'] = this.subselectedSchemeCode
    var resp = await this.transferService.getTransferedProperty(obj);
    if (resp['error'] == false) {
      this.data = resp.data;


      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;

      this.dataSource.paginator = this.paginator;
    } else {
      //this.toastr.errorToastr('Some Error Occurred')
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Information", 'Error', {
        duration: 5000,
      });
    }
  }
  async  fetch() {
    if (this.arr_id != '') {
      this.obj = Object.assign({}, { data: [] })

      this.costCodeArr = []
      var obj = new Object;
      obj['b_acct_id'] = this.b_acct_id
      obj['arr_id'] = this.arr_id
      this.spinner.show()
      var resp = await this.transferService.getdetailsForTransfer(obj);
      if (resp['error'] == false) {
        if (resp.data.length > 0) {
          this.obj = resp.data[0];
          this.obj['b_acct_id'] = this.b_acct_id
          this.obj['create_user_id'] = this.user_id
          this.obj['party_id'] = ""


          this.spinner.hide()

        } else {
          this.spinner.hide();
          this.snackBar.open("No Record Found", 'Error', {
            duration: 5000,
          });

        }


      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Information", 'Error', {
          duration: 5000,
        });
      }

    }
  }
  async addNew() {
    this.spinner.show();
    var resp = await this.transferService.createtransfer(this.obj);
    if (resp['error'] == false) {

      this.obj = Object.assign({}, { data: [] })
      this.arr_id = ''
      this.spinner.hide();
      this.snackBar.open("Transferred Successfully", 'Success!', {
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

  refressadd() {
    this.obj = Object.assign({}, {})

  }

  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
