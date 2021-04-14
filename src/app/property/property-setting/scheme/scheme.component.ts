import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SchemeService } from '../../service/scheme.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var $: any;

@Component({
  selector: 'app-scheme',
  templateUrl: './scheme.component.html',
  styleUrls: ['./scheme.component.css']
})
export class SchemeComponent implements OnInit {

  displayedColumns = ['scheme_code', 'scheme_name', 'action'];
  obj = {}
  erpUser;
  b_acct_id
  data;
  dataSource
  user_id
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private schemeService: SchemeService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }


  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    await this.getAllSchemes();
  }
  async getAllSchemes() {
    this.spinner.show();
    var resp = await this.schemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.data = resp.data;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }

  async addNewRow() {
    var obj = Object.assign({}, this.obj);

    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.user_id
    this.spinner.show();
    var resp = await this.schemeService.createScheme(obj);
    if (resp['error'] == false) {

      await this.getAllSchemes();

      this.spinner.hide();
      this.snackBar.open("Scheme Added Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }


  }

  async edit(element, i) {
    this.obj = element;
    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }
  async update() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id'] = this.user_id
    this.spinner.show();

    var resp = await this.schemeService.updatescheme(obj);
    if (resp['error'] == false) {

      await this.getAllSchemes();

      this.spinner.hide();
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.snackBar.open("Scheme Updated Successfully", 'Success!', {
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
  // async deleteScheme(element, i) {
  //   this.spinner.show();
  //   var obj = new Object();
  //   obj['b_acct_id'] = this.b_acct_id;
  //   obj['scheme_code'] = element.scheme_code;
  //   var resp = await this.schemeService.deleteScheme(obj);
  //   if (resp['error'] == false) {

  //     this.getAllSchemes()
  //     this.spinner.hide();
  //     this.snackBar.open("Scheme Deleted Successfully", 'Success!', {
  //       duration: 5000,
  //     });
  //   } else {
  //     this.spinner.hide();
  //     this.snackBar.open("Request Failed", 'Error', {
  //       duration: 5000,
  //     });
  //   }
  //   this.spinner.hide();
  // }
  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
